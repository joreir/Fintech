'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Landmark, Home, Calculator, FileText, ArrowRightLeft } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/loans/simulate', label: 'Simulador', icon: Calculator },
  { href: '/loans', label: 'Mis Préstamos', icon: FileText },
  { href: '/transactions', label: 'Transacciones', icon: ArrowRightLeft },
]

export function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Fin<span className="text-primary">Tech</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200
                  ${active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}

        </div>
      </div>
    </nav>
  )
}
