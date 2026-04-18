import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, ExternalLink, Download } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import OrderTimeline from '@/components/orders/OrderTimeline'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Order, OrderStatus, OrderStatusHistory, Invoice } from '@/lib/types'
import { formatPrice, formatDateTime, STATUS_LABELS, ORDER_STATUS_FLOW, generateInvoiceNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

const MANAGEABLE_STATUSES: OrderStatus[] = [
  'submitted', 'under_review', 'approved', 'confirmed',
  'in_production', 'quality_check', 'shipped', 'delivered', 'cancelled',
]

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [newStatus, setNewStatus] = useState<OrderStatus>('submitted')
  const [finalPrice, setFinalPrice] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  async function loadOrder() {
    if (!id) return
    const [orderRes, histRes, invRes] = await Promise.all([
      supabase.from('orders').select('*, material:materials(*), profile:profiles(email, full_name)').eq('id', id).single(),
      supabase.from('order_status_history').select('*').eq('order_id', id).order('created_at', { ascending: true }),
      supabase.from('invoices').select('*').eq('order_id', id).maybeSingle(),
    ])
    if (orderRes.data) {
      const o = orderRes.data as Order
      setOrder(o)
      setNewStatus(o.status)
      setFinalPrice(o.final_price?.toString() ?? '')
      setAdminNotes(o.admin_notes ?? '')
      setTrackingNumber(o.tracking_number ?? '')
    }
    if (histRes.data) setHistory(histRes.data as OrderStatusHistory[])
    if (invRes.data) setInvoice(invRes.data as Invoice)
    setLoading(false)
  }

  useEffect(() => { loadOrder() }, [id])

  async function handleSave() {
    if (!order || !user) return
    setSaving(true)

    try {
      const updates: Partial<Order> = {
        status: newStatus,
        admin_notes: adminNotes || null,
        tracking_number: trackingNumber || null,
      }

      if (finalPrice) {
        const price = parseFloat(finalPrice)
        if (isNaN(price) || price <= 0) throw new Error('Invalid final price')
        updates.final_price = price
      }

      const { error } = await supabase.from('orders').update(updates).eq('id', order.id)
      if (error) throw error

      // Auto-create invoice when status is set to approved and final price is set
      if (newStatus === 'approved' && updates.final_price && !invoice) {
        const { error: invErr } = await supabase.from('invoices').insert({
          order_id: order.id,
          user_id: order.user_id,
          invoice_number: generateInvoiceNumber(),
          amount: updates.final_price,
          due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        })
        if (invErr) console.warn('Invoice creation error:', invErr)
      }

      toast.success('Order updated successfully')
      await loadOrder()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  async function quickStatus(status: OrderStatus) {
    if (!order) return
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (error) { toast.error('Failed'); return }
    toast.success(`Status updated to "${STATUS_LABELS[status]}"`)
    setNewStatus(status)
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
        <Link to="/admin/orders" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>← Back</Link>
      </div>
    </DashboardLayout>
  )

  const currentStatusIdx = ORDER_STATUS_FLOW.indexOf(order.status)

  return (
    <DashboardLayout
      title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
      subtitle={`Submitted ${formatDateTime(order.created_at)}`}
      action={
        <div style={{ display: 'flex', gap: 10 }}>
          {invoice && (
            <span className="btn btn-secondary btn-sm">
              <Download size={14} /> Invoice {invoice.invoice_number}
            </span>
          )}
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> All Orders
          </Link>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        {/* ─── Left Column ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Customer + File Info */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Order Information</h2>
              <StatusBadge status={order.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {[
                { label: 'Customer', value: (order.profile as any)?.full_name ?? 'Unknown' },
                { label: 'Email', value: (order.profile as any)?.email ?? '—' },
                { label: 'File Name', value: order.file_name },
                { label: 'Material', value: order.material?.name ?? '—' },
                { label: 'Infill', value: `${order.infill}%` },
                { label: 'Layer Height', value: `${order.layer_height}mm` },
                { label: 'Quantity', value: order.quantity },
                { label: 'Est. Weight', value: order.estimated_weight_grams ? `${order.estimated_weight_grams}g` : '—' },
                { label: 'Est. Print Time', value: order.estimated_print_hours ? `${order.estimated_print_hours.toFixed(1)}h` : '—' },
                { label: 'Estimated Price', value: order.estimated_price ? formatPrice(order.estimated_price) : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
                  <p style={{ fontWeight: 500, wordBreak: 'break-all', fontSize: '0.9rem' }}>{String(value)}</p>
                </div>
              ))}
            </div>

            <a href={order.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
              <ExternalLink size={13} /> Open STL File
            </a>
          </div>

          {/* ─── Admin Controls ─── */}
          <div className="card">
            <div style={{ paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid var(--color-border-subtle)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 4 }}>Admin Controls</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Update order status, set final price, and add notes. Setting status to <strong>Approved</strong> with a final price will notify the customer for confirmation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Status */}
              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                >
                  {MANAGEABLE_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* Quick status buttons */}
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Quick Actions
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ORDER_STATUS_FLOW.filter((_, i) => i > currentStatusIdx && i <= currentStatusIdx + 2).map(s => (
                    <button
                      key={s}
                      className="btn btn-secondary btn-sm"
                      onClick={() => quickStatus(s)}
                    >
                      → {STATUS_LABELS[s]}
                    </button>
                  ))}
                  {order.status !== 'cancelled' && (
                    <button className="btn btn-danger btn-sm" onClick={() => quickStatus('cancelled')}>
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Final Price */}
              <div className="form-group">
                <label className="form-label">
                  Final Price (USD)
                  <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 400, textTransform: 'none' }}>
                    — overrides estimate; required for Approved status
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.9rem',
                    pointerEvents: 'none',
                  }}>$</span>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={order.estimated_price?.toFixed(2) ?? '0.00'}
                    value={finalPrice}
                    onChange={e => setFinalPrice(e.target.value)}
                    style={{ paddingLeft: 28 }}
                  />
                </div>
                {order.estimated_price && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Automated estimate was {formatPrice(order.estimated_price)}
                  </p>
                )}
              </div>

              {/* Tracking Number */}
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input
                  className="form-input"
                  placeholder="e.g. 1Z999AA10123456784"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                />
              </div>

              {/* Admin Notes */}
              <div className="form-group">
                <label className="form-label">Notes to Customer</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain any changes to price, design recommendations, material substitutions, etc."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Save */}
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ alignSelf: 'flex-start', minWidth: 140 }}
              >
                {saving
                  ? <><span className="loading-spinner" style={{ width: 14, height: 14 }} /> Saving…</>
                  : <><Save size={15} /> Save Changes</>
                }
              </button>
            </div>
          </div>

          {/* Invoice Info */}
          {invoice && (
            <div className="card" style={{ borderColor: 'rgba(34,197,94,0.25)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Invoice Generated
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Invoice #', value: invoice.invoice_number },
                  { label: 'Amount', value: formatPrice(invoice.amount) },
                  { label: 'Status', value: invoice.paid ? '✅ Paid' : '⏳ Unpaid' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    <p style={{ fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>
              {!invoice.paid && (
                <button
                  className="btn btn-sm"
                  style={{ marginTop: 12, background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', border: '1px solid rgba(34,197,94,0.3)' }}
                  onClick={async () => {
                    await supabase.from('invoices').update({ paid: true }).eq('id', invoice.id)
                    toast.success('Invoice marked as paid')
                    await loadOrder()
                  }}
                >
                  Mark as Paid
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Right Column: Timeline ─── */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Order Timeline</h2>
            </div>
            <OrderTimeline
              currentStatus={order.status}
              history={history.map(h => ({ status: h.status as OrderStatus, created_at: h.created_at }))}
            />
          </div>

          {/* History log */}
          {history.length > 0 && (
            <div className="card">
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Status History
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...history].reverse().map(h => (
                  <div key={h.id} style={{
                    padding: '8px 12px',
                    background: 'var(--color-surface-2)',
                    borderRadius: 6,
                    borderLeft: '3px solid var(--color-border)',
                  }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{STATUS_LABELS[h.status as OrderStatus]}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {formatDateTime(h.created_at)}
                    </p>
                    {h.note && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{h.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
