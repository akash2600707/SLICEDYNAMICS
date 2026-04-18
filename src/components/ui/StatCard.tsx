import type { ElementType } from 'react'

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon: ElementType
  iconColor?: string
  trend?: { value: number; label: string }
}

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'var(--color-accent)', trend }: Props) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `${iconColor}10`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {title}
          </p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            lineHeight: 1,
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p style={{
              fontSize: '0.8rem',
              color: trend.value >= 0 ? 'var(--color-success)' : 'var(--color-error)',
              marginTop: 6,
            }}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>

        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius)',
          background: `${iconColor}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={iconColor} />
        </div>
      </div>
    </div>
  )
}
