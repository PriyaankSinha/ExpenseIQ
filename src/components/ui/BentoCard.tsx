import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export default function BentoCard({
  children,
  className = '',
  hover = true,
  glow = false,
}: BentoCardProps) {
  return (
    <div
      className={clsx(
        'glass-card p-5',
        hover && 'glass-card-hover',
        glow && 'glow-emerald',
        className
      )}
    >
      {children}
    </div>
  )
}
