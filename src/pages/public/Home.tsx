import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Shield, Package, Settings, ArrowRight, ChevronRight } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { supabase } from '@/lib/supabase'

const ICON_MAP: Record<string, React.ElementType> = { Zap, Shield, Package, Settings }

type HeroContent = { headline: string; subheadline: string; cta_primary: string; cta_secondary: string }
type Feature = { icon: string; title: string; desc: string }

export default function Home() {
  const [hero, setHero] = useState<HeroContent>({
    headline: 'Manufacturing Dreams,\nOne Layer at a Time',
    subheadline: 'Professional 3D printing for creators, engineers, and businesses. Upload your model, get an instant estimate, and track every step.',
    cta_primary: 'Upload Your Model',
    cta_secondary: 'View Services',
  })
  const [features, setFeatures] = useState<Feature[]>([
    { icon: 'Zap', title: 'Instant Estimates', desc: 'Upload your STL and get an immediate price and delivery estimate.' },
    { icon: 'Shield', title: 'Expert Review', desc: 'Every order is manually reviewed by our engineers before production.' },
    { icon: 'Package', title: 'Order Tracking', desc: 'Real-time visibility into every stage of your production lifecycle.' },
    { icon: 'Settings', title: '5 Materials', desc: 'PLA, PETG, ABS, TPU, and Resin — optimized for every application.' },
  ])
  const [announcement, setAnnouncement] = useState<{ active: boolean; text: string } | null>(null)

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase.from('site_content').select('key, value').in('key', ['homepage_hero', 'homepage_features', 'homepage_announcement'])
      if (data) {
        data.forEach(row => {
          if (row.key === 'homepage_hero') setHero(row.value as HeroContent)
          if (row.key === 'homepage_features') setFeatures(row.value as Feature[])
          if (row.key === 'homepage_announcement') setAnnouncement(row.value as { active: boolean; text: string })
        })
      }
    }
    loadContent()
  }, [])

  return (
    <PublicLayout>
      {/* Announcement Banner */}
      {announcement?.active && (
        <div style={{
          background: 'var(--color-accent)',
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'white',
        }}>
          🎉 {announcement.text}
        </div>
      )}

      {/* Hero */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 0 80px',
        background: 'var(--color-bg)',
      }}>
        {/* Grid bg decoration */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 999,
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
              Industrial-Grade 3D Printing Service
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            color: 'var(--color-text)',
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
            maxWidth: 800,
            margin: '0 auto 24px',
            whiteSpace: 'pre-line',
          }}>
            {hero.headline}
          </h1>

          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            {hero.subheadline}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard/orders/new" className="btn btn-primary btn-lg">
              {hero.cta_primary} <ArrowRight size={18} />
            </Link>
            <Link to="/services" className="btn btn-secondary btn-lg">
              {hero.cta_secondary}
            </Link>
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
            marginTop: 64,
            flexWrap: 'wrap',
          }}>
            {[['500+', 'Orders Fulfilled'], ['5', 'Materials Available'], ['48h', 'Avg. Turnaround'], ['99%', 'Customer Satisfaction']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>{val}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', marginBottom: 12 }}>
              Why Choose SliceDynamics?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 500, margin: '0 auto' }}>
              From upload to doorstep — a seamless manufacturing experience.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {features.map((f) => {
              const Icon = ICON_MAP[f.icon] ?? Zap
              return (
                <div key={f.title} className="card" style={{ textAlign: 'left' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(249,115,22,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    border: '1px solid rgba(249,115,22,0.15)',
                  }}>
                    <Icon size={22} color="var(--color-accent)" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', marginBottom: 12 }}>
              How It Works
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Upload STL', desc: 'Upload your 3D model file. We support binary and ASCII STL formats.' },
              { step: '02', title: 'Get Estimate', desc: 'Instantly see cost and delivery estimates based on your specs.' },
              { step: '03', title: 'Expert Review', desc: 'Our engineers review your file and confirm the final price.' },
              { step: '04', title: 'Track & Receive', desc: 'Watch your order progress through each production stage.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ position: 'relative' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, color: 'var(--color-border)', lineHeight: 1, marginBottom: -8 }}>
                  {step}
                </p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8, color: 'var(--color-text)' }}>{title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-surface)', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16, letterSpacing: '-0.03em' }}>
            Ready to start printing?
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 36, fontSize: '1.05rem' }}>
            Create a free account and upload your first model in minutes.
          </p>
          <Link to="/auth?tab=register" className="btn btn-primary btn-lg">
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
