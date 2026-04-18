import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/types'
import { formatPrice, formatDate, STATUS_LABELS } from '@/lib/utils'

const STATUS_FILTERS = ['all', 'submitted', 'under_review', 'approved', 'in_production', 'shipped', 'delivered'] as const

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<typeof STATUS_FILTERS[number]>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, material:materials(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as Order[])
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <DashboardLayout
      title="My Orders"
      subtitle={`${orders.length} total orders`}
      action={
        <Link to="/dashboard/orders/new" className="btn btn-primary">
          <Plus size={16} /> New Order
        </Link>
      }
    >
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: s === 'all' ? 'capitalize' : undefined }}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s as OrderStatus]}
            <span style={{
              marginLeft: 4,
              padding: '0 6px',
              background: filter === s ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-2)',
              borderRadius: 999,
              fontSize: '0.7rem',
            }}>
              {s === 'all' ? orders.length : orders.filter(o => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
              {filter === 'all' ? 'No orders yet.' : `No ${STATUS_LABELS[filter as OrderStatus]} orders.`}
            </p>
            <Link to="/dashboard/orders/new" className="btn btn-primary btn-sm">Start New Order</Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>File</th>
                  <th>Material</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Estimate</th>
                  <th>Final Price</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontWeight: 500 }}>
                        {order.file_name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{order.material?.name}</td>
                    <td>{order.quantity}</td>
                    <td><StatusBadge status={order.status} size="sm" /></td>
                    <td>{order.estimated_price ? formatPrice(order.estimated_price) : '—'}</td>
                    <td style={{ fontWeight: order.final_price ? 600 : 400, color: order.final_price ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                      {order.final_price ? formatPrice(order.final_price) : '—'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(order.created_at)}</td>
                    <td>
                      <Link to={`/dashboard/orders/${order.id}`} className="btn btn-ghost btn-sm">Details</Link>
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
