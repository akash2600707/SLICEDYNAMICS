import { Check, Clock } from 'lucide-react'
import type { OrderStatus } from '@/lib/types'
import { ORDER_STATUS_FLOW, STATUS_LABELS, getStatusIndex } from '@/lib/utils'

type Props = {
  currentStatus: OrderStatus
  history?: { status: OrderStatus; created_at: string }[]
}

export default function OrderTimeline({ currentStatus, history = [] }: Props) {
  const currentIdx = getStatusIndex(currentStatus)
  const isTerminal = currentStatus === 'cancelled'

  if (isTerminal) {
    return (
      <div style={{
        padding: 20,
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-error)',
        fontWeight: 500,
        textAlign: 'center',
      }}>
        This order has been cancelled.
      </div>
    )
  }

  return (
    <div>
      {ORDER_STATUS_FLOW.map((status, idx) => {
        const isDone = idx < currentIdx
        const isActive = idx === currentIdx
        const isFuture = idx > currentIdx

        const historyEntry = history.find(h => h.status === status)

        return (
          <div
            key={status}
            style={{
              display: 'flex',
              gap: 16,
              position: 'relative',
            }}
          >
            {/* Line */}
            {idx < ORDER_STATUS_FLOW.length - 1 && (
              <div style={{
                position: 'absolute',
                left: 15,
                top: 32,
                bottom: 0,
                width: 2,
                background: isDone ? 'var(--color-accent)' : 'var(--color-border)',
                zIndex: 0,
              }} />
            )}

            {/* Circle */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              zIndex: 1,
              background: isDone ? 'var(--color-accent)' : isActive ? 'var(--color-surface-2)' : 'var(--color-surface-2)',
              border: `2px solid ${isDone ? 'var(--color-accent)' : isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}>
              {isDone ? (
                <Check size={14} color="white" />
              ) : isActive ? (
                <Clock size={14} color="var(--color-accent)" />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-border)' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: 24, flex: 1 }}>
              <p style={{
                fontWeight: isActive ? 600 : 500,
                color: isFuture ? 'var(--color-text-subtle)' : 'var(--color-text)',
                fontSize: '0.9rem',
              }}>
                {STATUS_LABELS[status]}
                {isActive && (
                  <span style={{
                    marginLeft: 8,
                    padding: '1px 8px',
                    background: 'rgba(249,115,22,0.12)',
                    color: 'var(--color-accent)',
                    borderRadius: 4,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Current
                  </span>
                )}
              </p>
              {historyEntry && (
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {new Date(historyEntry.created_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
