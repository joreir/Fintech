'use client'

import Link from 'next/link'
import { Calculator, FileText, Shield, TrendingUp, Clock, BarChart3, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Calculator,
    title: 'Simulación Instantánea',
    description: 'Calcula tus cuotas y cronograma de pagos antes de comprometerte con un préstamo.',
    color: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-500/20',
  },
  {
    icon: Shield,
    title: 'Aprobación Inteligente',
    description: 'Evaluación automática basada en tu capacidad de pago y perfil crediticio.',
    color: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/20',
  },
  {
    icon: BarChart3,
    title: 'Cronograma Detallado',
    description: 'Visualiza cada cuota con desglose de capital, interés y saldo restante.',
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/20',
  },
  {
    icon: Clock,
    title: 'Seguimiento en Tiempo Real',
    description: 'Monitorea el estado de tus préstamos y pagos desde un solo lugar.',
    color: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/20',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-background dark:from-primary/10 dark:via-primary/5 dark:to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent dark:from-primary/5" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gestiona tus{' '}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                préstamos
              </span>{' '}
              y <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                transacciones
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Simula, solicita y realiza seguimiento de tus créditos con un cronograma detallado
              de pagos basado en el sistema de amortización francés.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/loans/simulate"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-12 gap-2 bg-primary px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]'
                )}
              >
                <Calculator className="h-5 w-5" />
                Simular Préstamo
              </Link>
              <Link
                href="/loans"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-12 gap-2 px-8 text-base transition-all hover:scale-[1.02]'
                )}
              >
                <FileText className="h-5 w-5" />
                Mis Préstamos
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
