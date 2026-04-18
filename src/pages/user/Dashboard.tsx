import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { formatPrice, formatDate } from '@/lib/utils'

export default function UserDashboard() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, material:materials(*)')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setOrders(data as Order[])
        setLoading(false)
      })
  }, [])

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const completed = orders.filter(o => o.status === 'delivered')

  return (
    <DashboardLayout
      title={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? 'there'}!`}
      subtitle="Here's a summary of your print activity."
      action={
        <Link to="/dashboard/orders/new" className="btn btn-primary">
          <Plus size={16} /> New Order
        </Link>
      }
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard title="Total Orders" value={orders.length} icon={Package} />
        <StatCard title="Active" value={activeOrders.length} icon={Clock} iconColor="var(--color-warning)" />
        <StatCard title="Delivered" value={completed.length} icon={CheckCircle} iconColor="var(--color-success)" />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Recent Orders</h2>
          <Link to="/dashboard/orders" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="loading-spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>No orders yet. Start your first print!</p>
            <Link to="/dashboard/orders/new" className="btn btn-primary btn-sm">Upload Model</Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Material</th>
                  <th>Status</th>
                  <th>Estimated</th>
                  <th>Final</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {order.file_name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      {order.material?.name ?? '—'}
                    </td>
                    <td><StatusBadge status={order.status} size="sm" /></td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {order.estimated_price ? formatPrice(order.estimated_price) : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: order.final_price ? 600 : 400, color: order.final_price ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                      {order.final_price ? formatPrice(order.final_price) : '—'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(order.created_at)}</td>
                    <td>
                      <Link to={`/dashboard/orders/${order.id}`} className="btn btn-ghost btn-sm">
                        View
                      </Link>
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
