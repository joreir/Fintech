'use client'

import { useEffect, useState } from 'react'
import { loanService } from '@/services/loanService'
import { Loan } from '@/types/loan'
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
import { BadgeCheck, Clock, XCircle, AlertCircle, TrendingUp } from 'lucide-react'

export default function LoansPage() {
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
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', 
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

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mis Préstamos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y visualiza el estado de tus solicitudes de crédito.
          </p>
        </div>
        <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
          Nueva Solicitud
        </Button>
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
              {loans.filter(l => l.status === 'Active').length} préstamos activos actualmente.
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
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => {
                  const statusInfo = getStatusInfo(loan.status)
                  return (
                    <TableRow key={loan.id} className="group transition-colors hover:bg-muted/30">
                      <TableCell className="font-bold text-primary">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell>{loan.term} meses</TableCell>
                      <TableCell>{loan.loanType}</TableCell>
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
                        {new Date(loan.createdAt).toLocaleDateString()}
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
