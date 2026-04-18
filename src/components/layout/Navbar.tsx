import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Layers } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, isAdmin } = useAuth()

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 'var(--nav-height)',
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      <div className="container" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: 'var(--color-text)',
          letterSpacing: '-0.03em',
        }}>
          <div style={{
            background: 'var(--color-accent)',
            borderRadius: 8,
            padding: '5px 7px',
            display: 'flex',
          }}>
            <Layers size={18} color="white" />
          </div>
          Slice<span style={{ color: 'var(--color-accent)' }}>Dynamics</span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              to={href}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem',
                color: location.pathname === href ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontWeight: location.pathname === href ? 600 : 400,
                transition: 'color 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="btn btn-primary btn-sm"
            >
              {isAdmin ? 'Admin Panel' : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/auth?tab=register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--color-text)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '16px 24px',
        }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '10px 0',
                color: location.pathname === href ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              {label}
            </Link>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Link to="/auth" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Sign In</Link>
              <Link to="/auth?tab=register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
