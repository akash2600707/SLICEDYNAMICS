import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import OrderTimeline from '@/components/orders/OrderTimeline'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Order, OrderStatusHistory, Invoice } from '@/lib/types'
import { formatPrice, formatDateTime, generateInvoiceNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  async function loadOrder() {
    if (!id) return
    const [orderRes, histRes, invRes] = await Promise.all([
      supabase.from('orders').select('*, material:materials(*)').eq('id', id).single(),
      supabase.from('order_status_history').select('*').eq('order_id', id).order('created_at', { ascending: true }),
      supabase.from('invoices').select('*').eq('order_id', id).single(),
    ])
    if (orderRes.data) setOrder(orderRes.data as Order)
    if (histRes.data) setHistory(histRes.data as OrderStatusHistory[])
    if (invRes.data) setInvoice(invRes.data as Invoice)
    setLoading(false)
  }

  useEffect(() => { loadOrder() }, [id])

  async function confirmOrder() {
    if (!order || !user) return
    setConfirming(true)
    try {
      // Update status to confirmed
      const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', order.id)
      if (error) throw error

      // Create invoice
      const { error: invError } = await supabase.from('invoices').insert({
        order_id: order.id,
        user_id: user.id,
        invoice_number: generateInvoiceNumber(),
        amount: order.final_price ?? order.estimated_price ?? 0,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      if (invError) console.warn('Invoice error:', invError)

      toast.success('Order confirmed! Production will begin shortly.')
      await loadOrder()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm order')
    } finally {
      setConfirming(false)
    }
  }

  async function cancelOrder() {
    if (!order) return
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id)
    if (error) { toast.error('Failed to cancel'); return }
    toast.success('Order cancelled.')
    await loadOrder()
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="loading-spinner" style={{ width: 36, height: 36 }} />
      </div>
    </DashboardLayout>
  )

  if (!order) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Order not found.</p>
        <Link to="/dashboard/orders" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>Back to orders</Link>
      </div>
    </DashboardLayout>
  )

  const needsConfirmation = order.status === 'approved' && order.final_price !== null

  return (
    <DashboardLayout
      title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
      subtitle={formatDateTime(order.created_at)}
      action={
        <div style={{ display: 'flex', gap: 10 }}>
          {invoice && (
            <button className="btn btn-secondary btn-sm">
              <Download size={14} /> Invoice #{invoice.invoice_number}
            </button>
          )}
          <Link to="/dashboard/orders" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      }
    >
      {/* Approval Banner */}
      {needsConfirmation && (
        <div style={{
          padding: '20px 24px',
          marginBottom: 24,
          background: 'rgba(249,115,22,0.08)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
              Your order has been reviewed! 🎉
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Final price: <strong style={{ color: 'var(--color-accent)', fontSize: '1.1rem' }}>{formatPrice(order.final_price!)}</strong>
              {order.estimated_price && ` (estimated: ${formatPrice(order.estimated_price)})`}
            </p>
            {order.admin_notes && (
              <p style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '8px 12px', borderRadius: 6, borderLeft: '3px solid var(--color-accent)' }}>
                <strong>Admin note:</strong> {order.admin_notes}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-danger btn-sm" onClick={cancelOrder}>
              <XCircle size={15} /> Reject
            </button>
            <button className="btn btn-primary" disabled={confirming} onClick={confirmOrder}>
              {confirming ? <span className="loading-spinner" style={{ width: 14, height: 14 }} /> : <CheckCircle size={15} />}
              Approve & Confirm
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left: details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Info */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Order Details</h2>
              <StatusBadge status={order.status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'File Name', value: order.file_name },
                { label: 'Material', value: order.material?.name ?? '—' },
                { label: 'Infill', value: `${order.infill}%` },
                { label: 'Layer Height', value: `${order.layer_height}mm` },
                { label: 'Quantity', value: order.quantity },
                { label: 'Est. Weight', value: order.estimated_weight_grams ? `${order.estimated_weight_grams}g` : '—' },
                { label: 'Est. Print Time', value: order.estimated_print_hours ? `${order.estimated_print_hours.toFixed(1)}h` : '—' },
                { label: 'Tracking', value: order.tracking_number ?? 'Not shipped yet' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontWeight: 500, wordBreak: 'break-all' }}>{String(value)}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)', display: 'flex', gap: 12 }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginBottom: 2 }}>Estimated Price</p>
                <p style={{ fontWeight: 600 }}>{order.estimated_price ? formatPrice(order.estimated_price) : '—'}</p>
              </div>
              <div style={{ width: 1, background: 'var(--color-border)' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginBottom: 2 }}>Final Price</p>
                <p style={{ fontWeight: 700, color: order.final_price ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '1.05rem' }}>
                  {order.final_price ? formatPrice(order.final_price) : 'Pending review'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <a href={order.file_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <ExternalLink size={13} /> View STL File
              </a>
            </div>
          </div>

          {/* Admin Notes */}
          {order.admin_notes && (
            <div className="card" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Note from our team
              </p>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{order.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Right: timeline */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Order Progress</h2>
          </div>
          <OrderTimeline
            currentStatus={order.status}
            history={history.map(h => ({ status: h.status as any, created_at: h.created_at }))}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
