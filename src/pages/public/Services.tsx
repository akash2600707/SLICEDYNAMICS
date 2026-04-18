import PublicLayout from '@/components/layout/PublicLayout'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const SERVICES = [
  {
    title: 'FDM Printing',
    subtitle: 'Fused Deposition Modeling',
    desc: 'Our workhorse technology. Ideal for functional prototypes, jigs, fixtures, and everyday parts. Supports PLA, PETG, ABS, and TPU.',
    materials: ['PLA', 'PETG', 'ABS', 'TPU'],
    layerRes: '0.1 – 0.4mm',
    color: '#f97316',
  },
  {
    title: 'SLA Resin',
    subtitle: 'Stereolithography',
    desc: 'Ultra-high resolution printing for miniatures, dental models, jewelry masters, and highly detailed prototypes. Smooth surface finish.',
    materials: ['Standard Resin', 'ABS-Like Resin'],
    layerRes: '0.025 – 0.1mm',
    color: '#8b5cf6',
  },
  {
    title: 'Rapid Prototyping',
    subtitle: 'Fast-Track Service',
    desc: 'Need it yesterday? Our rapid service prioritizes your order in the queue. Ideal for tight deadlines and iterative design cycles.',
    materials: ['PLA', 'PETG', 'Resin'],
    layerRes: '0.2mm standard',
    color: '#22c55e',
  },
  {
    title: 'Small Batch Production',
    subtitle: '5 – 500 Units',
    desc: 'When you need more than a prototype but aren\'t ready for injection molding. Consistent quality across every unit in your run.',
    materials: ['PLA', 'PETG', 'ABS'],
    layerRes: '0.2mm standard',
    color: '#3b82f6',
  },
]

export default function Services() {
  return (
    <PublicLayout>
      <section style={{ padding: '80px 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>What We Do</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 16 }}>
              Our Services
            </h1>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              From rapid iteration to production runs, we have the capability to bring your designs to life.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {SERVICES.map(s => (
              <div key={s.title} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  width: 10,
                  height: 3,
                  borderRadius: 2,
                  background: s.color,
                  marginBottom: 20,
                }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 4 }}>{s.title}</h3>
                <p style={{ color: s.color, fontSize: '0.8rem', fontWeight: 600, marginBottom: 12 }}>{s.subtitle}</p>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.9rem', flex: 1, marginBottom: 20 }}>{s.desc}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {s.materials.map(m => (
                    <span key={m} style={{
                      padding: '3px 10px',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 999,
                      fontSize: '0.78rem',
                      color: 'var(--color-text-muted)',
                    }}>{m}</span>
                  ))}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                  Layer resolution: <strong style={{ color: 'var(--color-text)' }}>{s.layerRes}</strong>
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <Link to="/dashboard/orders/new" className="btn btn-primary btn-lg">
              Start a Print Order <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
