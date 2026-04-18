import { Link } from 'react-router-dom'
import { Layers, Twitter, Linkedin, Github } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border-subtle)',
      padding: '64px 0 32px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 48,
          marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
              marginBottom: 16,
            }}>
              <div style={{ background: 'var(--color-accent)', borderRadius: 8, padding: '5px 7px', display: 'flex' }}>
                <Layers size={16} color="white" />
              </div>
              Slice<span style={{ color: 'var(--color-accent)' }}>Dynamics</span>
            </Link>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 280 }}>
              Professional 3D printing services for creators, engineers, and businesses. From prototype to production.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.15s',
                }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              Services
            </p>
            {['FDM Printing', 'SLA Resin', 'Prototyping', 'Small Batch', 'Custom Parts'].map(item => (
              <Link key={item} to="/services" style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 10 }}>
                {item}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              Company
            </p>
            {[['About Us', '/about'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={label} to={href} style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 10 }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              Account
            </p>
            {[['Sign In', '/auth'], ['Register', '/auth?tab=register'], ['Dashboard', '/dashboard']].map(([label, href]) => (
              <Link key={label} to={href} style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 10 }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>
            © {year} SliceDynamics. All rights reserved.
          </p>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>
            Built for makers who demand precision.
          </p>
        </div>
      </div>
    </footer>
  )
}
