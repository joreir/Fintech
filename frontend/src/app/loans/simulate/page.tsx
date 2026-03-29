'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loanService } from '@/services/loanService'
import { LoanType, SimulateResponse } from '@/types/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calculator,
  DollarSign,
  Calendar,
  TrendingUp,
  Percent,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default function SimulateLoanPage() {
  const router = useRouter()

  const [amount, setAmount] = useState('')
  const [termMonths, setTermMonths] = useState('')
  const [loanType, setLoanType] = useState<LoanType>('Fixed')
  const [monthlyIncome, setMonthlyIncome] = useState('')

  const [simulation, setSimulation] = useState<SimulateResponse | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const formatRate = (value: number) => `${(value * 100).toFixed(4)}%`

  const handleSimulate = async () => {
    setError(null)
    setSuccess(null)
    setSimulation(null)

    if (!amount || !termMonths) {
      setError('Por favor, completa el monto y el plazo.')
      return
    }

    setSimulating(true)
    try {
      const response = await loanService.simulate({
        amount: parseFloat(amount),
        termMonths: parseInt(termMonths),
        loanType,
      })
      setSimulation(response.data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Error al simular el préstamo.')
    } finally {
      setSimulating(false)
    }
  }

  const handleRequestLoan = async () => {
    setError(null)
    setSuccess(null)

    if (!monthlyIncome) {
      setError('Por favor, ingresa tu ingreso mensual para solicitar el préstamo.')
      return
    }

    setRequesting(true)
    try {
      await loanService.create({
        amount: parseFloat(amount),
        termMonths: parseInt(termMonths),
        loanType,
        monthlyIncome: parseFloat(monthlyIncome),
      })
      setSuccess('¡Solicitud de préstamo enviada exitosamente! Redirigiendo...')
      setTimeout(() => router.push('/loans'), 2000)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Error al solicitar el préstamo.')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Simulador de Préstamos
        </h1>
        <p className="text-muted-foreground mt-1">
          Calcula tus cuotas y visualiza tu cronograma antes de solicitar.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <XCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario */}
        <Card className="lg:col-span-1 border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Datos del Préstamo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-1.5 text-sm font-medium">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                Monto
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termMonths" className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Plazo (meses)
              </Label>
              <Input
                id="termMonths"
                type="number"
                placeholder="12"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                min={1}
                max={360}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                Tipo de Préstamo
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {/* TODO: Decreasing */}
                {(['Fixed'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setLoanType(type)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${loanType === type
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/60'
                      }`}
                  >
                    {type === 'Fixed' ? 'Cuota Fija' : 'Cuota Decreciente'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome" className="flex items-center gap-1.5 text-sm font-medium">
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                Ingreso Mensual
              </Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="3000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                min={0}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Requerido para solicitar el préstamo.</p>
            </div>

            <Button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full h-11 gap-2 bg-primary shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:scale-[1.01]"
            >
              {simulating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              {simulating ? 'Calculando...' : 'Calcular'}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {simulation && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in slide-in-from-right-4 duration-500">
                <Card className="border-none shadow-xl shadow-black/5 bg-primary/5">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-muted-foreground">Cuota Mensual</p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                      {formatCurrency(simulation.monthlyPayment)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-muted-foreground">Total Intereses</p>
                    <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {formatCurrency(simulation.totalInterest)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
                    <p className="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-400">
                      {formatCurrency(simulation.totalPayment)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Rate Info */}
              <div className="flex flex-wrap gap-6 text-sm animate-in slide-in-from-right-4 duration-500 delay-100">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">TEM:</span>
                  <span className="font-semibold">{formatRate(simulation.tem)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">TEA:</span>
                  <span className="font-semibold">{formatRate(simulation.tea)}</span>
                </div>
              </div>

              {/* Schedule Table */}
              <Card className="border-none shadow-xl shadow-black/5 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 delay-200">
                <CardHeader>
                  <CardTitle className="text-lg">Cronograma de Pagos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[420px] overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                          <TableHead className="font-semibold">#</TableHead>
                          <TableHead className="font-semibold">Fecha</TableHead>
                          <TableHead className="font-semibold text-right">Cuota</TableHead>
                          <TableHead className="font-semibold text-right">Capital</TableHead>
                          <TableHead className="font-semibold text-right">Interés</TableHead>
                          <TableHead className="font-semibold text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {simulation.schedule.map((item) => (
                          <TableRow key={item.paymentNumber} className="transition-colors hover:bg-muted/30">
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Request Button */}
              <div className="flex justify-end animate-in slide-in-from-bottom-4 duration-500 delay-300">
                <Button
                  onClick={handleRequestLoan}
                  disabled={requesting}
                  size="lg"
                  className="h-12 gap-2 bg-primary px-8 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  {requesting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {requesting ? 'Solicitando...' : 'Solicitar Préstamo'}
                </Button>
              </div>
            </>
          )}

          {!simulation && !simulating && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center">
              <Calculator className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                Completa los datos y presiona Calcular
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                El cronograma de pagos aparecerá aquí.
              </p>
            </div>
          )}

          {simulating && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Calculando simulación...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
