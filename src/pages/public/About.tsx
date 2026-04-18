import PublicLayout from '@/components/layout/PublicLayout'

export default function About() {
  return (
    <PublicLayout>
      <section style={{ padding: '80px 0', background: 'var(--color-bg)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <p style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>About Us</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 24 }}>
            Built for Makers Who Demand Precision
          </h1>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
            SliceDynamics was founded by engineers tired of slow, opaque, and unreliable 3D printing services. We built the platform we always wanted — transparent pricing, expert review, and real-time tracking.
          </p>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 40 }}>
            Whether you're prototyping a new product, manufacturing small batches, or creating custom components, we treat every order with the precision it deserves. Our team reviews every file before printing — because a 15-minute check saves hours of failed prints.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {[
              { label: 'Founded', value: '2022' },
              { label: 'Orders Shipped', value: '500+' },
              { label: 'Materials', value: '5' },
              { label: 'Expert Engineers', value: '4' },
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-accent)', marginBottom: 4 }}>{value}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
