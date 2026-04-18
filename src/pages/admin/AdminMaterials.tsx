import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import type { Material } from '@/lib/types'
import toast from 'react-hot-toast'

type EditState = {
  name: string
  cost_per_gram: string
  description: string
  color: string
  active: boolean
}

const DEFAULT_EDIT: EditState = {
  name: '',
  cost_per_gram: '',
  description: '',
  color: '#6366f1',
  active: true,
}

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [editState, setEditState] = useState<EditState>(DEFAULT_EDIT)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('materials').select('*').order('name')
    if (data) setMaterials(data as Material[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(m: Material) {
    setEditingId(m.id)
    setEditState({
      name: m.name,
      cost_per_gram: m.cost_per_gram.toString(),
      description: m.description ?? '',
      color: m.color,
      active: m.active,
    })
  }

  function startNew() {
    setEditingId('new')
    setEditState(DEFAULT_EDIT)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(DEFAULT_EDIT)
  }

  async function save() {
    const cost = parseFloat(editState.cost_per_gram)
    if (!editState.name.trim()) { toast.error('Name is required'); return }
    if (isNaN(cost) || cost <= 0) { toast.error('Enter a valid cost per gram'); return }

    setSaving(true)
    try {
      if (editingId === 'new') {
        const { error } = await supabase.from('materials').insert({
          name: editState.name.trim(),
          cost_per_gram: cost,
          description: editState.description || null,
          color: editState.color,
          active: editState.active,
        })
        if (error) throw error
        toast.success('Material created')
      } else {
        const { error } = await supabase.from('materials').update({
          name: editState.name.trim(),
          cost_per_gram: cost,
          description: editState.description || null,
          color: editState.color,
          active: editState.active,
        }).eq('id', editingId!)
        if (error) throw error
        toast.success('Material updated')
      }
      cancelEdit()
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(m: Material) {
    const { error } = await supabase.from('materials').update({ active: !m.active }).eq('id', m.id)
    if (error) { toast.error('Update failed'); return }
    toast.success(m.active ? 'Material deactivated' : 'Material activated')
    await load()
  }

  async function deleteMaterial(m: Material) {
    if (!window.confirm(`Delete "${m.name}"? This cannot be undone and may affect existing orders.`)) return
    const { error } = await supabase.from('materials').delete().eq('id', m.id)
    if (error) { toast.error('Delete failed — material may have linked orders'); return }
    toast.success('Material deleted')
    await load()
  }

  return (
    <DashboardLayout
      title="Materials & Pricing"
      subtitle="Manage filament materials and their per-gram rates"
      action={
        <button className="btn btn-primary" onClick={startNew} disabled={editingId !== null}>
          <Plus size={16} /> Add Material
        </button>
      }
    >
      {/* New material form */}
      {editingId === 'new' && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(249,115,22,0.3)' }}>
          <div className="card-header">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-accent)' }}>
              New Material
            </h2>
          </div>
          <MaterialForm state={editState} onChange={setEditState} onSave={save} onCancel={cancelEdit} saving={saving} />
        </div>
      )}

      {/* Materials list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {materials.map(m => (
            <div key={m.id}>
              {editingId === m.id ? (
                <div className="card" style={{ borderColor: `${m.color}40` }}>
                  <div className="card-header">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Editing — {m.name}</h2>
                  </div>
                  <MaterialForm state={editState} onChange={setEditState} onSave={save} onCancel={cancelEdit} saving={saving} />
                </div>
              ) : (
                <div className="card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  opacity: m.active ? 1 : 0.55,
                  borderLeft: `4px solid ${m.color}`,
                  paddingLeft: 20,
                }}>
                  {/* Left: info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `${m.color}20`,
                      border: `2px solid ${m.color}`,
                      flexShrink: 0,
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontWeight: 700, fontSize: '1rem' }}>{m.name}</p>
                        {!m.active && (
                          <span style={{
                            padding: '1px 8px',
                            background: 'var(--color-surface-2)',
                            color: 'var(--color-text-subtle)',
                            borderRadius: 4,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            Inactive
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {m.description ?? 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Center: rate */}
                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Rate</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: m.color }}>
                      ${m.cost_per_gram.toFixed(3)}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/g</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleActive(m)}
                      style={{ color: m.active ? 'var(--color-text-muted)' : 'var(--color-success)' }}
                    >
                      {m.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(m)} disabled={editingId !== null}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteMaterial(m)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

// ─── Reusable Form ────────────────────────────────────────────
function MaterialForm({
  state,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  state: EditState
  onChange: (s: EditState) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  const set = (key: keyof EditState, value: string | boolean) =>
    onChange({ ...state, [key]: value })

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" placeholder="e.g. PLA" value={state.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Cost per Gram (USD) *</label>
          <input className="form-input" type="number" min="0.001" step="0.001" placeholder="0.025" value={state.cost_per_gram} onChange={e => set('cost_per_gram', e.target.value)} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Description</label>
          <input className="form-input" placeholder="Brief description for customers" value={state.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Color (hex)</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="color" value={state.color} onChange={e => set('color', e.target.value)} style={{ width: 44, height: 36, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 2 }} />
            <input className="form-input" value={state.color} onChange={e => set('color', e.target.value)} style={{ fontFamily: 'monospace', flex: 1 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42 }}>
            <input type="checkbox" id="mat-active" checked={state.active} onChange={e => set('active', e.target.checked)} style={{ accentColor: 'var(--color-accent)', width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="mat-active" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
              {state.active ? 'Active — visible to customers' : 'Inactive — hidden from customers'}
            </label>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={onSave} disabled={saving}>
          {saving ? <span className="loading-spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Material'}
        </button>
        <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  )
}
