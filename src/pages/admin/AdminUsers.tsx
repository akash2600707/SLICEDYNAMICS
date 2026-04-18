import { useState, useEffect } from 'react'
import { Shield, User, Search } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Profile } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function loadUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setProfiles(data as Profile[])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function toggleRole(profile: Profile) {
    if (profile.id === currentUser?.id) {
      toast.error('You cannot change your own role.')
      return
    }
    const newRole = profile.role === 'admin' ? 'user' : 'admin'
    setUpdatingId(profile.id)
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id)
    if (error) {
      toast.error('Failed to update role')
    } else {
      toast.success(`${profile.full_name ?? profile.email} is now ${newRole === 'admin' ? 'an Admin' : 'a User'}`)
      await loadUsers()
    }
    setUpdatingId(null)
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    return !q || p.email.toLowerCase().includes(q) || (p.full_name ?? '').toLowerCase().includes(q)
  })

  const adminCount = profiles.filter(p => p.role === 'admin').length
  const userCount = profiles.filter(p => p.role === 'user').length

  return (
    <DashboardLayout
      title="User Management"
      subtitle={`${profiles.length} registered users · ${adminCount} admin${adminCount !== 1 ? 's' : ''} · ${userCount} users`}
    >
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Users', value: profiles.length, color: 'var(--color-info)' },
          { label: 'Admins', value: adminCount, color: 'var(--color-accent)' },
          { label: 'Regular Users', value: userCount, color: 'var(--color-success)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '16px 24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            flex: 1,
            minWidth: 120,
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={15} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
        }} />
        <input
          className="form-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
            No users match your search.
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: p.role === 'admin' ? 'rgba(249,115,22,0.15)' : 'var(--color-surface-2)',
                          border: `1px solid ${p.role === 'admin' ? 'rgba(249,115,22,0.3)' : 'var(--color-border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {p.role === 'admin'
                            ? <Shield size={15} color="var(--color-accent)" />
                            : <User size={15} color="var(--color-text-muted)" />
                          }
                        </div>
                        <div>
                          <p style={{ fontWeight: 500 }}>{p.full_name ?? 'No Name'}</p>
                          {p.id === currentUser?.id && (
                            <p style={{ fontSize: '0.72rem', color: 'var(--color-accent)' }}>You</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>{p.email}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: p.role === 'admin' ? 'rgba(249,115,22,0.1)' : 'var(--color-surface-2)',
                        color: p.role === 'admin' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        border: `1px solid ${p.role === 'admin' ? 'rgba(249,115,22,0.25)' : 'var(--color-border)'}`,
                      }}>
                        {p.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                        {p.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(p.created_at)}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.role === 'admin' ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => toggleRole(p)}
                        disabled={updatingId === p.id || p.id === currentUser?.id}
                        style={{
                          opacity: p.id === currentUser?.id ? 0.4 : 1,
                          color: p.role === 'admin' ? 'var(--color-error)' : 'var(--color-text-muted)',
                          borderColor: p.role === 'admin' ? 'var(--color-error)' : undefined,
                        }}
                        title={p.id === currentUser?.id ? 'Cannot change your own role' : undefined}
                      >
                        {updatingId === p.id
                          ? <span className="loading-spinner" style={{ width: 12, height: 12 }} />
                          : p.role === 'admin' ? 'Revoke Admin' : 'Make Admin'
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{
        marginTop: 20,
        padding: '12px 16px',
        background: 'rgba(249,115,22,0.05)',
        border: '1px solid rgba(249,115,22,0.15)',
        borderRadius: 'var(--radius)',
        fontSize: '0.82rem',
        color: 'var(--color-text-muted)',
      }}>
        ⚠️ Admins have full access to all orders, user data, and site content. Grant admin access carefully.
      </div>
    </DashboardLayout>
  )
}
