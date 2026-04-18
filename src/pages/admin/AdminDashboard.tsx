import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, DollarSign, Clock, ArrowRight, TrendingUp } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { formatPrice, formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('*, material:materials(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]).then(([ordersRes, usersRes]) => {
      if (ordersRes.data) setOrders(ordersRes.data as Order[])
      setUserCount(usersRes.count ?? 0)
      setLoading(false)
    })
  }, [])

  const needsReview = orders.filter(o => o.status === 'submitted' || o.status === 'under_review')
  const revenue = orders
    .filter(o => o.final_price !== null && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.final_price ?? 0), 0)
  const avgOrderValue = revenue / Math.max(1, orders.filter(o => o.final_price).length)

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Overview of all platform activity">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard title="Total Orders" value={orders.length} icon={Package} />
        <StatCard title="Needs Review" value={needsReview.length} icon={Clock} iconColor="var(--color-warning)" />
        <StatCard title="Total Users" value={userCount} icon={Users} iconColor="var(--color-info)" />
        <StatCard title="Revenue" value={formatPrice(revenue)} icon={DollarSign} iconColor="var(--color-success)" />
        <StatCard title="Avg. Order" value={formatPrice(avgOrderValue)} icon={TrendingUp} iconColor="var(--color-accent)" />
      </div>

      {/* Orders Needing Attention */}
      {needsReview.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(245,158,11,0.3)' }}>
          <div className="card-header">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-warning)' }}>
                ⚠️ Orders Needing Review ({needsReview.length})
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>These orders are waiting for your review</p>
            </div>
            <Link to="/admin/orders?filter=submitted" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {needsReview.slice(0, 5).map(order => (
              <div key={order.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 500 }}>{order.file_name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{order.material?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={order.status} size="sm" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{formatDate(order.created_at)}</span>
                  <Link to={`/admin/orders/${order.id}`} className="btn btn-primary btn-sm">Review</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>File</th>
                  <th>Material</th>
                  <th>Status</th>
                  <th>Estimate</th>
                  <th>Final</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontWeight: 500 }}>
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
                      <Link to={`/admin/orders/${o.id}`} className="btn btn-ghost btn-sm">Open</Link>
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
