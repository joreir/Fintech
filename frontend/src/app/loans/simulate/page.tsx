'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

// ── Schema ────────────────────────────────────────────────────────────────────
const simulateSchema = z.object({
  amount: z
    .number({ message: 'Ingresa un monto válido.' })
    .min(500, 'El monto mínimo es $500.')
    .max(50_000, 'El monto máximo es $50,000.'),
  termMonths: z
    .number({ message: 'Ingresa un plazo válido.' })
    .int('El plazo debe ser un número entero.')
    .min(6, 'El plazo mínimo es 6 meses.')
    .max(60, 'El plazo máximo es 60 meses.'),
  loanType: z.enum(['Fixed', 'Decreasing'] as const),
  monthlyIncome: z
    .number({ message: 'Ingresa un ingreso válido.' })
    .positive('Los ingresos deben ser mayores a 0.')
    .optional()
    .or(z.literal(undefined)),
})

type SimulateFormValues = z.infer<typeof simulateSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(value)

const formatRate = (value: number) => `${(value * 100).toFixed(4)}%`

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SimulateLoanPage() {
  const router = useRouter()

  const [simulation, setSimulation] = useState<SimulateResponse | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SimulateFormValues>({
    resolver: zodResolver(simulateSchema),
    defaultValues: {
      loanType: 'Fixed',
    },
  })

  const selectedLoanType = watch('loanType')

  // ── Handlers ───────────────────────────────────────────────────────────────
  const onSimulate = async (data: SimulateFormValues) => {
    setApiError(null)
    setSuccess(null)
    setSimulation(null)
    setSimulating(true)
    try {
      const response = await loanService.simulate({
        amount: data.amount,
        termMonths: data.termMonths,
        loanType: data.loanType as LoanType,
      })
      setSimulation(response.data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setApiError(axiosErr.response?.data?.error || 'Error al simular el préstamo.')
    } finally {
      setSimulating(false)
    }
  }

  const handleRequestLoan = async () => {
    const data = getValues()
    if (!data.monthlyIncome) {
      setApiError('Por favor, ingresa tu ingreso mensual para solicitar el préstamo.')
      return
    }
    setApiError(null)
    setSuccess(null)
    setRequesting(true)
    try {
      await loanService.create({
        amount: data.amount,
        termMonths: data.termMonths,
        loanType: data.loanType as LoanType,
        monthlyIncome: data.monthlyIncome,
      })
      setSuccess('¡Solicitud enviada exitosamente! Redirigiendo...')
      setTimeout(() => router.push('/loans'), 2000)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setApiError(axiosErr.response?.data?.error || 'Error al solicitar el préstamo.')
    } finally {
      setRequesting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
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
      {apiError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400 animate-in slide-in-from-top-2 duration-300">
          {apiError}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary animate-in slide-in-from-top-2 duration-300">
          {success}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <Card className="lg:col-span-1 border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader>
            <CardTitle className="text-lg">Datos del Préstamo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSimulate)} noValidate className="space-y-5">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Monto <span className="text-muted-foreground font-normal">(500 – 50,000)</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="10000"
                  className="h-11"
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-xs text-rose-600">{errors.amount.message}</p>
                )}
              </div>

              {/* Term */}
              <div className="space-y-2">
                <Label htmlFor="termMonths" className="text-sm font-medium">
                  Plazo <span className="text-muted-foreground font-normal">(6 – 60 meses)</span>
                </Label>
                <Input
                  id="termMonths"
                  type="number"
                  placeholder="12"
                  className="h-11"
                  {...register('termMonths', { valueAsNumber: true })}
                />
                {errors.termMonths && (
                  <p className="text-xs text-rose-600">{errors.termMonths.message}</p>
                )}
              </div>

              {/* Loan Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Préstamo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Fixed'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('loanType', type)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        selectedLoanType === type
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/60'
                      }`}
                    >
                      Cuota Fija
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Income */}
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome" className="text-sm font-medium">
                  Ingreso Mensual
                </Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="3000"
                  className="h-11"
                  {...register('monthlyIncome', { valueAsNumber: true })}
                />
                {errors.monthlyIncome && (
                  <p className="text-xs text-rose-600">{errors.monthlyIncome.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Requerido para solicitar el préstamo.
                </p>
              </div>

              <Button
                type="submit"
                disabled={simulating}
                className="w-full h-11 bg-primary shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:scale-[1.01]"
              >
                {simulating ? 'Calculando...' : 'Calcular'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Empty state */}
          {!simulation && !simulating && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Completa los datos y presiona Calcular
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                El cronograma de pagos aparecerá aquí.
              </p>
            </div>
          )}

          {/* Loading state */}
          {simulating && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
              <p className="text-muted-foreground">Calculando simulación...</p>
            </div>
          )}

          {simulation && (
            <>
              {/* Summary cards */}
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

              {/* Rate info */}
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

              {/* Schedule table */}
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
                          <TableRow
                            key={item.paymentNumber}
                            className="transition-colors hover:bg-muted/30"
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Request button */}
              <div className="flex justify-end animate-in slide-in-from-bottom-4 duration-500 delay-300">
                <Button
                  onClick={handleRequestLoan}
                  disabled={requesting}
                  size="lg"
                  className="h-12 px-8 bg-primary shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  {requesting ? 'Solicitando...' : 'Solicitar Préstamo'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
