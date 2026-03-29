'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { transactionService } from '@/services/transactionService'
import { Transaction, TransactionType, TransactionStatus } from '@/types/transaction'
import { 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'All'>('All')

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const res = await transactionService.getAll(
            typeFilter !== 'All' ? typeFilter : undefined
        )
        setTransactions(res.data)
      } catch (err) {
        setError('No se pudieron cargar las transacciones. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [typeFilter])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: TransactionStatus) => {
    switch (status) {
      case 'Completed':
        return {
          label: 'Completado',
          color: 'bg-primary/10 text-primary uppercase text-[10px] tracking-wider font-bold',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        }
      case 'Pending':
        return {
          label: 'Pendiente',
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 uppercase text-[10px] tracking-wider font-bold',
          icon: <Clock className="w-3.5 h-3.5" />,
        }
      case 'Failed':
        return {
          label: 'Fallido',
          color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 uppercase text-[10px] tracking-wider font-bold',
          icon: <XCircle className="w-3.5 h-3.5" />,
        }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: null }
    }
  }

  const getTypeInfo = (type: TransactionType) => {
    switch (type) {
      case 'Disbursement':
        return {
          label: 'Desembolso',
          icon: <ArrowDownRight className="w-4 h-4 text-emerald-600" />,
        }
      case 'Payment':
        return {
          label: 'Pago',
          icon: <ArrowUpRight className="w-4 h-4 text-blue-600" />,
        }
      case 'Transfer':
        return {
          label: 'Transferencia',
          icon: <ArrowRightLeft className="w-4 h-4 text-primary" />,
        }
      default:
        return { label: type, icon: null }
    }
  }

  // Local filtering for status
  const filteredTransactions = transactions.filter(t => {
    if (statusFilter === 'All') return true
    return t.status === statusFilter
  })

  // Calculations for summary cards
  const totalAmount = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0)
  const completedCount = filteredTransactions.filter(t => t.status === 'Completed').length

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-16 text-center">
          <XCircle className="mb-4 h-12 w-12 text-rose-400" />
          <p className="text-lg font-medium text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">
      {/* Header section with filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Historial de Transacciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Revisa todos los movimientos y pagos de tus préstamos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'All')}
              className="h-10 w-full sm:w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="All">Todas</option>
              <option value="Disbursement">Desembolso</option>
              <option value="Payment">Pago</option>
              <option value="Transfer">Transferencia</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'All')}
              className="h-10 w-full sm:w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="All">Todos</option>
              <option value="Completed">Completado</option>
              <option value="Pending">Pendiente</option>
              <option value="Failed">Fallido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sumatoria de transacciones visibles
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Exitosas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De un total de {filteredTransactions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Cargando transacciones...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ArrowRightLeft className="w-8 h-8 opacity-20" />
                      <p className="text-muted-foreground">No hay transacciones registradas.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => {
                  const status = getStatusInfo(tx.status)
                  const type = getTypeInfo(tx.type)
                  
                  return (
                    <TableRow key={tx.id} className="transition-colors hover:bg-muted/30">
                      <TableCell className="font-medium whitespace-nowrap text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{tx.description}</span>
                        {tx.loanId && (
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            ID Préstamo: {tx.loanId.split('-')[0]}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-muted/50 border">
                            {type.icon}
                          </div>
                          <span className="font-medium text-sm">{type.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
