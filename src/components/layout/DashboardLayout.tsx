import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

type Props = {
  children: ReactNode
  title?: string
  subtitle?: string
  action?: ReactNode
}

export default function DashboardLayout({ children, title, subtitle, action }: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {(title || action) && (
          <div style={{
            padding: '28px 32px 0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              {title && (
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.03em',
                }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: '0.9rem' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}

        <div style={{ padding: '24px 32px 48px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
