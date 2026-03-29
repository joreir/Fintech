'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loanService } from '@/services/loanService'
import { Loan, PaymentScheduleItem } from '@/types/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  BadgeCheck,
  Clock,
  XCircle,
  AlertCircle,
  Percent,
  CreditCard,
  Loader2,
} from 'lucide-react'

export default function LoanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loan, setLoan] = useState<Loan | null>(null)
  const [schedule, setSchedule] = useState<PaymentScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loanRes, scheduleRes] = await Promise.all([
          loanService.getById(id),
          loanService.getSchedule(id),
        ])
        setLoan(loanRes.data)
        setSchedule(scheduleRes.data)
      } catch {
        setError('No se pudo cargar la información del préstamo.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          label: 'Activo',
          color: 'bg-primary/10 text-primary uppercase text-[10px] tracking-wider font-bold',
          icon: <BadgeCheck className="w-4 h-4" />,
        }
      case 'Pending':
        return {
          label: 'Pendiente',
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
          icon: <Clock className="w-4 h-4" />,
        }
      case 'Rejected':
        return {
          label: 'Rechazado',
          color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
          icon: <XCircle className="w-4 h-4" />,
        }
      case 'Approved':
        return {
          label: 'Aprobado',
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
          icon: <AlertCircle className="w-4 h-4" />,
        }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: null }
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-16 text-center">
          <XCircle className="mb-4 h-12 w-12 text-rose-400" />
          <p className="text-lg font-medium text-muted-foreground">
            {error || 'Préstamo no encontrado.'}
          </p>
          <Button
            variant="outline"
            className="mt-6 gap-2"
            onClick={() => router.push('/loans')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Mis Préstamos
          </Button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(loan.status)
  const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0)
  const totalPaid = schedule.filter(s => s.status === 'Paid').reduce((sum, s) => sum + s.totalPayment, 0)
  const paidCount = schedule.filter(s => s.status === 'Paid').length

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">
      {/* Back + Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => router.push('/loans')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Detalle del Préstamo
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-mono">
              ID: {loan.id}
            </p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.label}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(loan.amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Capital solicitado</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuota Mensual</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(loan.monthlyPayment)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {loan.loanType === 'Fixed' ? 'Cuota Fija' : 'Cuota Decreciente'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plazo</CardTitle>
            <Calendar className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.term} <span className="text-base font-normal text-muted-foreground">meses</span></div>
            <p className="text-xs text-muted-foreground mt-1">{paidCount} cuotas pagadas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Interés</CardTitle>
            <Percent className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(loan.interestRate * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">TEA</p>
          </CardContent>
        </Card>
      </div>

      {/* Loan Meta Info */}
      <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Intereses</p>
              <p className="text-lg font-semibold">{formatCurrency(totalInterest)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pagado</p>
              <p className="text-lg font-semibold text-primary">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ingreso Mensual</p>
              <p className="text-lg font-semibold">{formatCurrency(loan.monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Solicitud</p>
              <p className="text-lg font-semibold">
                {new Date(loan.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Cronograma de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold text-right">Cuota</TableHead>
                  <TableHead className="font-semibold text-right">Capital</TableHead>
                  <TableHead className="font-semibold text-right">Interés</TableHead>
                  <TableHead className="font-semibold text-right">Saldo</TableHead>
                  <TableHead className="font-semibold text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No hay cronograma disponible para este préstamo.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedule.map((item) => (
                    <TableRow
                      key={item.paymentNumber}
                      className={`transition-colors ${
                        item.status === 'Paid'
                          ? 'bg-primary/5'
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {item.paymentNumber}
                      </TableCell>
                      <TableCell>
                        {new Date(item.dueDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(item.totalPayment)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.principal)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(item.interest)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.remainingBalance)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.status === 'Paid'
                              ? 'bg-primary/10 text-primary uppercase text-[10px] tracking-wider font-bold'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {item.status === 'Paid' ? (
                            <BadgeCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          {item.status === 'Paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
