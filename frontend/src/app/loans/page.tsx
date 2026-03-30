'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loanService } from '@/services/loanService'
import { Loan } from '@/types/loan'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { BadgeCheck, Clock, XCircle, AlertCircle, TrendingUp, DollarSign, CreditCard, Plus } from 'lucide-react'

export default function LoansPage() {
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await loanService.getAll()
        setLoans(response.data)
      } catch (error) {
        console.error('Error fetching loans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Active':
        return { 
          label: 'Activo', 
          color: 'bg-primary/10 text-primary uppercase text-[10px] tracking-wider font-bold', 
          icon: <BadgeCheck className="w-4 h-4" /> 
        }
      case 'Pending':
        return { 
          label: 'Pendiente', 
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', 
          icon: <Clock className="w-4 h-4" /> 
        }
      case 'Rejected':
        return { 
          label: 'Rechazado', 
          color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', 
          icon: <XCircle className="w-4 h-4" /> 
        }
      case 'Approved':
        return { 
          label: 'Aprobado', 
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', 
          icon: <AlertCircle className="w-4 h-4" /> 
        }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: null }
    }
  }

  const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0)
  const activeLoans = loans.filter(l => l.status === 'Active')
  const totalMonthlyPayment = activeLoans.reduce((sum, l) => sum + l.monthlyPayment, 0)

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Mis Préstamos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y visualiza el estado de tus solicitudes de crédito.
          </p>
        </div>
        <Link
          href="/loans/simulate"
          className={cn(
            buttonVariants(),
            'gap-2 shadow-lg shadow-primary/20 bg-primary transition-all hover:shadow-xl hover:scale-105'
          )}
        >
          <Plus className="h-4 w-4" />
          Nueva Solicitud
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préstamos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeLoans.length} activos actualmente
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Capital solicitado en total</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuota Mensual Total</CardTitle>
            <CreditCard className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyPayment)}</div>
            <p className="text-xs text-muted-foreground mt-1">De préstamos activos</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
            <BadgeCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loans.length > 0
                ? `${Math.round(
                    (loans.filter(l => l.status !== 'Rejected').length / loans.length) * 100
                  )}%`
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loans.filter(l => l.status === 'Rejected').length} rechazados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">Monto</TableHead>
                <TableHead className="font-semibold">Plazo</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Cuota Mensual</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <p>No se encontraron préstamos registrados.</p>
                      <Link
                        href="/loans/simulate"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-2')}
                      >
                        Simula tu primer préstamo
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => {
                  const statusInfo = getStatusInfo(loan.status)
                  return (
                    <TableRow
                      key={loan.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => router.push(`/loans/${loan.id}`)}
                    >
                      <TableCell className="font-bold text-primary">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell>{loan.term} meses</TableCell>
                      <TableCell>{loan.loanType === 'Fixed' ? 'Cuota Fija' : 'Decreciente'}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(loan.monthlyPayment)}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(loan.createdAt).toLocaleDateString('es-ES')}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
