'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import homeSvg from '@/assets/home.svg'



export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
            
            {/* Left Content */}
            <div className="flex-1 text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl leading-[1.1]">
                  Gestiona tus{' '}
                  <span className="text-primary">préstamos</span>
                  <br />
                  <span>y transacciones</span>
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Simula, solicita y realiza seguimiento de tus créditos con un cronograma detallado
                  de pagos basado en el sistema de amortización francés. Todo en un solo lugar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/loans/simulate"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-14 px-10 text-lg font-medium shadow-xl shadow-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02]'
                  )}
                >
                  Simular Préstamo
                </Link>
                <Link
                  href="/loans"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'h-14 px-10 text-lg font-medium transition-all hover:bg-muted/50 hover:scale-[1.02]'
                  )}
                >
                  Mis Préstamos
                </Link>
              </div>
            </div>

            {/* Right Asset */}
            <div className="flex-1 w-full max-w-xl lg:max-w-2xl animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative aspect-[4/3] drop-shadow-2xl">
                <Image
                  src={homeSvg}
                  alt="FinTech Management"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
