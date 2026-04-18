import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileX, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import STLViewer from '@/components/upload/STLViewer'
import PriceEstimateCard from '@/components/orders/PriceEstimateCard'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Material, PriceEstimate } from '@/lib/types'
import { estimateFromFile, isValidSTL, formatFileSize } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function NewOrder() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [materials, setMaterials] = useState<Material[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [materialId, setMaterialId] = useState('')
  const [infill, setInfill] = useState(20)
  const [layerHeight, setLayerHeight] = useState(0.2)
  const [quantity, setQuantity] = useState(1)
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('materials').select('*').eq('active', true).then(({ data }) => {
      if (data) {
        setMaterials(data as Material[])
        if (data.length > 0) setMaterialId(data[0].id)
      }
    })
  }, [])

  // Recalculate estimate whenever params change
  useEffect(() => {
    if (!file || !materialId) { setEstimate(null); return }
    const material = materials.find(m => m.id === materialId)
    if (!material) return
    setEstimate(estimateFromFile(file.size, material, infill, layerHeight, quantity))
  }, [file, materialId, infill, layerHeight, quantity, materials])

  const handleFile = useCallback((f: File) => {
    if (!isValidSTL(f)) {
      toast.error('Only .STL files are supported')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error('File too large. Max 50MB.')
      return
    }
    setFile(f)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  async function handleSubmit() {
    if (!file || !estimate || !user || !materialId) return
    setSubmitting(true)

    try {
      // 1. Upload file to Supabase Storage
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('stl-files')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('stl-files').getPublicUrl(path)

      // 2. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          file_url: publicUrl,
          file_name: file.name,
          material_id: materialId,
          infill,
          layer_height: layerHeight,
          quantity,
          estimated_weight_grams: estimate.weightGrams,
          estimated_print_hours: estimate.printHours,
          estimated_price: estimate.subtotal,
          status: 'submitted',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 3. Log initial status history
      await supabase.from('order_status_history').insert({
        order_id: order.id,
        status: 'submitted',
        note: 'Order placed by customer',
        changed_by: user.id,
      })

      toast.success('Order submitted! We\'ll review your file shortly.')
      navigate(`/dashboard/orders/${order.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit order')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedMaterial = materials.find(m => m.id === materialId)

  return (
    <DashboardLayout title="New Order" subtitle="Upload your STL file and configure print parameters">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        {/* Left: form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Drop Zone */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>Step 1 — Upload STL File</h2>
            </div>

            {!file ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  padding: 40,
                  textAlign: 'center',
                  border: `2px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  margin: 20,
                  borderRadius: 'var(--radius)',
                  background: dragging ? 'rgba(249,115,22,0.04)' : 'transparent',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('stl-input')?.click()}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(249,115,22,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Upload size={24} color="var(--color-accent)" />
                </div>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>Drop your STL file here</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                  or click to browse — max 50MB
                </p>
                <span className="btn btn-secondary btn-sm">Choose File</span>
                <input
                  id="stl-input"
                  type="file"
                  accept=".stl"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                {/* File info bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius)',
                  marginBottom: 16,
                  border: '1px solid var(--color-border)',
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <FileX size={15} /> Remove
                  </button>
                </div>
                <STLViewer file={file} height={280} />
              </div>
            )}
          </div>

          {/* Print Parameters */}
          <div className="card">
            <div style={{ padding: '0 0 16px', borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>Step 2 — Print Parameters</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Material */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Material</label>
                <select
                  className="form-select"
                  value={materialId}
                  onChange={e => setMaterialId(e.target.value)}
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} — ${m.cost_per_gram}/g</option>
                  ))}
                </select>
                {selectedMaterial?.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                    {selectedMaterial.description}
                  </p>
                )}
              </div>

              {/* Infill */}
              <div className="form-group">
                <label className="form-label">Infill — {infill}%</label>
                <input
                  type="range"
                  min={5} max={100} step={5}
                  value={infill}
                  onChange={e => setInfill(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                  <span>5% (light)</span><span>100% (solid)</span>
                </div>
              </div>

              {/* Layer Height */}
              <div className="form-group">
                <label className="form-label">Layer Height</label>
                <select
                  className="form-select"
                  value={layerHeight}
                  onChange={e => setLayerHeight(Number(e.target.value))}
                >
                  <option value={0.1}>0.10mm — Ultra Fine</option>
                  <option value={0.15}>0.15mm — Fine</option>
                  <option value={0.2}>0.20mm — Standard</option>
                  <option value={0.3}>0.30mm — Draft</option>
                  <option value={0.4}>0.40mm — Rough</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  min={1} max={500}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>
          </div>

          {/* Alert: awaiting review */}
          <div style={{
            display: 'flex',
            gap: 12,
            padding: '14px 18px',
            background: 'rgba(249,115,22,0.06)',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 'var(--radius)',
          }}>
            <AlertCircle size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              The estimate shown is automated. After submission, our engineers will review your file and confirm the final price before production begins. You'll have a chance to approve or reject.
            </p>
          </div>
        </div>

        {/* Right: estimate + submit */}
        <div style={{ position: 'sticky', top: 24 }}>
          {estimate && selectedMaterial ? (
            <>
              <PriceEstimateCard estimate={estimate} materialName={selectedMaterial.name} />
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                disabled={!file || submitting}
                onClick={handleSubmit}
              >
                {submitting ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : null}
                {submitting ? 'Submitting…' : 'Submit Order'}
              </button>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Upload a file and select your material to see an instant price estimate.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
