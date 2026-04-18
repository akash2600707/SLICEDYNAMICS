import { useState, useEffect } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Material } from '@/lib/types'

export default function Pricing() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [note, setNote] = useState('Prices shown are estimates. All orders undergo expert review for final pricing.')

  useEffect(() => {
    supabase.from('materials').select('*').eq('active', true).then(({ data }) => {
      if (data) setMaterials(data as Material[])
    })
    supabase.from('site_content').select('value').eq('key', 'pricing_note').single().then(({ data }) => {
      if (data) setNote(data.value as string)
    })
  }, [])

  return (
    <PublicLayout>
      <section style={{ padding: '80px 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Transparent Pricing</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 16 }}>
              Simple, Honest Pricing
            </h1>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              No hidden fees. Material cost + machine time = your price. Upload your model for an instant estimate.
            </p>
          </div>

          {/* Pricing formula */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            marginBottom: 40,
            maxWidth: 700,
            margin: '0 auto 40px',
          }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              How Your Price Is Calculated
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
              <span style={{ padding: '8px 16px', background: 'rgba(249,115,22,0.1)', borderRadius: 8, color: 'var(--color-accent)' }}>
                Material Weight × Rate
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>+</span>
              <span style={{ padding: '8px 16px', background: 'rgba(59,130,246,0.1)', borderRadius: 8, color: '#3b82f6' }}>
                Print Hours × $3.50/hr
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>=</span>
              <span style={{ color: 'var(--color-text)' }}>Your Price</span>
            </div>
          </div>

          {/* Materials table */}
          <div style={{ maxWidth: 700, margin: '0 auto 48px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 20, textAlign: 'center' }}>
              Material Rates
            </h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cost per Gram</th>
                    <th>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                          <strong>{m.name}</strong>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>
                        ${m.cost_per_gram.toFixed(3)}/g
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{m.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            maxWidth: 500,
            margin: '0 auto 40px',
            padding: '12px 20px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
          }}>
            ⚠️ {note}
          </p>

          <div style={{ textAlign: 'center' }}>
            <Link to="/dashboard/orders/new" className="btn btn-primary btn-lg">
              Get an Instant Estimate
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
