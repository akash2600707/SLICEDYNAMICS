import { Clock, Weight, DollarSign, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { PriceEstimate } from '@/lib/types'

type Props = {
  estimate: PriceEstimate
  materialName: string
}

export default function PriceEstimateCard({ estimate, materialName }: Props) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Instant Estimate
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {formatPrice(estimate.rangeLow)}
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>–</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {formatPrice(estimate.rangeHigh)}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
          Estimate only — final price set after expert review
        </p>
      </div>

      {/* Breakdown */}
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Breakdown
        </p>

        {[
          { icon: Weight, label: `${materialName} material`, value: `${estimate.weightGrams}g — ${formatPrice(estimate.materialCost)}` },
          { icon: Clock, label: 'Estimated print time', value: `${estimate.printHours.toFixed(1)}h — ${formatPrice(estimate.timeCost)}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid var(--color-border-subtle)',
            gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'var(--color-surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={14} color="var(--color-text-muted)" />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
          </div>
        ))}

        {/* Subtotal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 0 8px',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: 'rgba(249,115,22,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarSign size={14} color="var(--color-accent)" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>Subtotal</span>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-accent)' }}>
            {formatPrice(estimate.subtotal)}
          </span>
        </div>

        {/* Delivery */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius)',
          marginTop: 8,
          border: '1px solid var(--color-border)',
        }}>
          <Truck size={16} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Estimated delivery: <strong style={{ color: 'var(--color-text)' }}>{estimate.deliveryDays} business days</strong>
          </span>
        </div>

        <p style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-subtle)',
          marginTop: 12,
          lineHeight: 1.5,
        }}>
          ⚠️ This is an automated estimate. Our team will review your file and confirm the final price before production begins.
        </p>
      </div>
    </div>
  )
}
