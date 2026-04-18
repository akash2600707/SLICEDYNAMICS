import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { OrderStatus } from '@/lib/types'

type Props = {
  status: OrderStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const colors = STATUS_COLORS[status]
  const label = STATUS_LABELS[status]

  return (
    <span
      className="badge"
      style={{
        background: colors.bg,
        color: colors.text,
        borderColor: colors.border,
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
      }}
    >
      <span style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: colors.text,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {label}
    </span>
  )
}
