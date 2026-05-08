'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { MATERIAL_RATES, FINISH_MULTIPLIERS, calculateEstimate, formatCurrency } from '@/lib/utils'
import type { Material, Finish } from '@/types'

const MATERIALS: { value: Material; label: string; desc: string }[] = [
  { value: 'PLA', label: 'PLA', desc: 'General purpose, biodegradable' },
  { value: 'ABS', label: 'ABS', desc: 'Strong & heat resistant' },
  { value: 'RESIN', label: 'Resin', desc: 'Ultra-high detail' },
  { value: 'PETG', label: 'PETG', desc: 'Food-safe, flexible' },
  { value: 'TPU', label: 'TPU', desc: 'Rubber-like, flexible' },
  { value: 'NYLON', label: 'Nylon', desc: 'Industrial strength' },
]

const FINISHES: { value: Finish; label: string; desc: string }[] = [
  { value: 'STANDARD', label: 'Standard', desc: 'As-printed surface' },
  { value: 'SMOOTH', label: 'Smooth', desc: 'Sanded & polished' },
  { value: 'PAINTED', label: 'Painted', desc: 'Custom colour coat' },
  { value: 'POLISHED', label: 'Polished', desc: 'Mirror finish' },
]

const COLORS = ['#ffffff', '#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function NewOrderPage() {
  const [file, setFile] = useState<File | null>(null)
  const [material, setMaterial] = useState<Material>('PLA')
  const [finish, setFinish] = useState<Finish>('STANDARD')
  const [color, setColor] = useState('#ffffff')
  const [infill, setInfill] = useState(20)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0])
      setStep(2)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.stl', '.obj', '.step', '.stp'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const estimate = calculateEstimate({
    materialRate: MATERIAL_RATES[material],
    finishMultiplier: FINISH_MULTIPLIERS[finish],
    quantity,
  })

  async function handleSubmit() {
    if (!file) return
    setSubmitting(true)
    // TODO: Week 2 — upload file to Supabase Storage + create order in DB
    setTimeout(() => {
      alert('Order submitted! Our team will review and send you a confirmed quote shortly.')
      setSubmitting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Dashboard
          </Link>
          <span className="font-bold tracking-tight">SLICE<span className="text-primary">DYNAMICS</span></span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">New Order</h1>
          <p className="text-muted-foreground mt-1">Upload your 3D file and configure your print</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-10">
          {[
            { n: 1, label: 'Upload File' },
            { n: 2, label: 'Configure' },
            { n: 3, label: 'Review & Submit' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step >= s.n ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${step >= s.n ? 'border-primary bg-primary/20 text-primary' : 'border-border'}`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < 2 && <div className={`h-px w-8 transition-colors ${step > s.n ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-5xl mb-4">📤</div>
            <h3 className="text-lg font-semibold mb-2">Drop your 3D file here</h3>
            <p className="text-muted-foreground text-sm mb-4">STL, OBJ, or STEP files up to 100MB</p>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-sm text-primary">
              Browse Files
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="space-y-8">
            {/* File info */}
            <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">📄</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{file?.name}</div>
                <div className="text-xs text-muted-foreground">{file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</div>
              </div>
              <button onClick={() => { setFile(null); setStep(1) }} className="text-muted-foreground hover:text-foreground text-sm">Change</button>
            </div>

            {/* Material */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Material</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MATERIALS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMaterial(m.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      material === m.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="font-semibold text-sm">{m.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                    <div className="text-xs text-primary mt-1">₹{MATERIAL_RATES[m.value]}/unit base</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Finish */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Surface Finish</label>
              <div className="grid grid-cols-2 gap-3">
                {FINISHES.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFinish(f.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      finish === f.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="font-semibold text-sm">{f.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                    <div className="text-xs text-primary mt-1">×{FINISH_MULTIPLIERS[f.value]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colour */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Colour</label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-primary scale-125' : 'border-transparent hover:scale-110'}`}
                  />
                ))}
              </div>
            </div>

            {/* Infill + Quantity */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold mb-3 block">Infill: {infill}%</label>
                <input
                  type="range" min={10} max={100} step={5}
                  value={infill} onChange={e => setInfill(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10% Light</span><span>100% Solid</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-3 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center">−</button>
                  <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center">+</button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Tolerance requirements, special instructions, reference images..."
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <button onClick={() => setStep(3)} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Continue to Review →
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold">Order Summary</h3>
              {[
                { label: 'File', value: file?.name },
                { label: 'Material', value: material },
                { label: 'Finish', value: finish },
                { label: 'Infill', value: `${infill}%` },
                { label: 'Quantity', value: quantity },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Estimate box */}
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-primary mb-1">⚡ Instant Estimate</div>
                  <div className="text-3xl font-bold">{formatCurrency(estimate)}</div>
                  <div className="text-xs text-muted-foreground mt-2 max-w-xs">
                    This is an auto-calculated estimate and <strong>not the final price</strong>. Our team will review your file for printability and complexity, then send you the confirmed quote.
                  </div>
                </div>
                <div className="text-3xl">⚡</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-border py-3 rounded-xl font-semibold text-sm hover:border-primary/50 transition-colors">
                ← Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-2 flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit for Review →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
