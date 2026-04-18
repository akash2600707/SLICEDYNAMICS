import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/types'
import { formatPrice, formatDate, STATUS_LABELS } from '@/lib/utils'

const ALL_STATUSES: OrderStatus[] = ['submitted', 'under_review', 'approved', 'confirmed', 'in_production', 'quality_check', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | 'all'>(
    (searchParams.get('filter') as OrderStatus) || 'all'
  )
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, material:materials(*), profile:profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as Order[])
        setLoading(false)
      })
  }, [])

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || o.file_name.toLowerCase().includes(q) || o.id.includes(q) || (o.profile as any)?.email?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <DashboardLayout title="All Orders" subtitle={`${orders.length} total orders across all users`}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          placeholder="Search by file, order ID, or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value as OrderStatus | 'all')} style={{ width: 'auto' }}>
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
            No orders match your filters.
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>File</th>
                  <th>Material</th>
                  <th>Status</th>
                  <th>Estimate</th>
                  <th>Final</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{(o.profile as any)?.full_name ?? '—'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(o.profile as any)?.email}</p>
                    </td>
                    <td style={{ maxWidth: 140 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {o.file_name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{o.material?.name}</td>
                    <td><StatusBadge status={o.status} size="sm" /></td>
                    <td>{o.estimated_price ? formatPrice(o.estimated_price) : '—'}</td>
                    <td style={{ color: o.final_price ? 'var(--color-accent)' : 'inherit', fontWeight: o.final_price ? 600 : 400 }}>
                      {o.final_price ? formatPrice(o.final_price) : '—'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(o.created_at)}</td>
                    <td>
                      <Link to={`/admin/orders/${o.id}`} className="btn btn-primary btn-sm">Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
