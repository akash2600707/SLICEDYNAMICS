import { Link, useLocation } from 'react-router-dom'
import {
  Layers, LayoutDashboard, Package, Plus, LogOut,
  Users, FileText, Settings, Palette, BarChart2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
}

const USER_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'My Orders', icon: Package },
  { href: '/dashboard/orders/new', label: 'New Order', icon: Plus },
]

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin/orders', label: 'All Orders', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/materials', label: 'Materials', icon: Palette },
  { href: '/admin/content', label: 'Site Content', icon: FileText },
]

export default function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.1rem',
          color: 'var(--color-text)',
          letterSpacing: '-0.03em',
        }}>
          <div style={{ background: 'var(--color-accent)', borderRadius: 7, padding: '4px 6px', display: 'flex' }}>
            <Layers size={16} color="white" />
          </div>
          Slice<span style={{ color: 'var(--color-accent)' }}>Dynamics</span>
        </Link>
        {isAdmin && (
          <span style={{
            display: 'inline-block',
            marginTop: 8,
            padding: '2px 8px',
            background: 'var(--color-accent-bg)',
            color: 'var(--color-accent)',
            borderRadius: 4,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Admin Panel
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--color-text-subtle)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '0 8px 8px',
        }}>
          {isAdmin ? 'Administration' : 'Navigation'}
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 'var(--radius)',
                marginBottom: 2,
                fontSize: '0.9rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
                border: active ? '1px solid rgba(249,115,22,0.15)' : '1px solid transparent',
                transition: 'all 0.12s',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}

        {/* Settings divider */}
        {!isAdmin && (
          <>
            <p style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--color-text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '16px 8px 8px',
            }}>
              Account
            </p>
            <Link
              to="/dashboard/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                border: '1px solid transparent',
              }}
            >
              <Settings size={17} />
              Settings
            </Link>
          </>
        )}
      </nav>

      {/* User info + sign out */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--color-border-subtle)',
      }}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>
            {profile?.full_name || 'User'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {profile?.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
