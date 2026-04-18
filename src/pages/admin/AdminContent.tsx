import { useState, useEffect } from 'react'
import { Save, Eye } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────
type HeroContent = { headline: string; subheadline: string; cta_primary: string; cta_secondary: string }
type Announcement = { active: boolean; text: string }
type Feature = { icon: string; title: string; desc: string }

const ICON_OPTIONS = ['Zap', 'Shield', 'Package', 'Settings', 'Star', 'Clock', 'Truck', 'Heart', 'Award', 'Box']

export default function AdminContent() {
  const { user } = useAuth()

  // Hero
  const [hero, setHero] = useState<HeroContent>({ headline: '', subheadline: '', cta_primary: '', cta_secondary: '' })
  const [heroSaving, setHeroSaving] = useState(false)

  // Features
  const [features, setFeatures] = useState<Feature[]>([])
  const [featuresSaving, setFeaturesSaving] = useState(false)

  // Announcement
  const [announcement, setAnnouncement] = useState<Announcement>({ active: false, text: '' })
  const [announcementSaving, setAnnouncementSaving] = useState(false)

  // Misc
  const [pricingNote, setPricingNote] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [miscSaving, setMiscSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('key, value')
      .in('key', ['homepage_hero', 'homepage_features', 'homepage_announcement', 'pricing_note', 'contact_email', 'contact_phone', 'contact_address'])
      .then(({ data }) => {
        if (!data) return
        data.forEach(row => {
          if (row.key === 'homepage_hero') setHero(row.value as HeroContent)
          if (row.key === 'homepage_features') setFeatures(row.value as Feature[])
          if (row.key === 'homepage_announcement') setAnnouncement(row.value as Announcement)
          if (row.key === 'pricing_note') setPricingNote(row.value as string)
          if (row.key === 'contact_email') setContactEmail(row.value as string)
          if (row.key === 'contact_phone') setContactPhone(row.value as string)
          if (row.key === 'contact_address') setContactAddress(row.value as string)
        })
      })
  }, [])

  async function upsert(key: string, value: unknown) {
    const { error } = await supabase.from('site_content').upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    if (error) throw error
  }

  async function saveHero() {
    setHeroSaving(true)
    try {
      await upsert('homepage_hero', hero)
      toast.success('Hero section saved!')
    } catch { toast.error('Save failed') }
    setHeroSaving(false)
  }

  async function saveFeatures() {
    setFeaturesSaving(true)
    try {
      await upsert('homepage_features', features)
      toast.success('Features saved!')
    } catch { toast.error('Save failed') }
    setFeaturesSaving(false)
  }

  async function saveAnnouncement() {
    setAnnouncementSaving(true)
    try {
      await upsert('homepage_announcement', announcement)
      toast.success('Announcement saved!')
    } catch { toast.error('Save failed') }
    setAnnouncementSaving(false)
  }

  async function saveMisc() {
    setMiscSaving(true)
    try {
      await Promise.all([
        upsert('pricing_note', pricingNote),
        upsert('contact_email', contactEmail),
        upsert('contact_phone', contactPhone),
        upsert('contact_address', contactAddress),
      ])
      toast.success('Contact & pricing info saved!')
    } catch { toast.error('Save failed') }
    setMiscSaving(false)
  }

  function updateFeature(idx: number, key: keyof Feature, val: string) {
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f))
  }

  function addFeature() {
    setFeatures(prev => [...prev, { icon: 'Star', title: 'New Feature', desc: 'Describe this feature.' }])
  }

  function removeFeature(idx: number) {
    setFeatures(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <DashboardLayout
      title="Site Content"
      subtitle="Edit public-facing content without touching code"
      action={
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
          <Eye size={15} /> Preview Site
        </a>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ─── Announcement Banner ─── */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Announcement Banner</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Shown at the top of the homepage when active</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: '0.72rem',
                fontWeight: 700,
                background: announcement.active ? 'rgba(34,197,94,0.1)' : 'var(--color-surface-2)',
                color: announcement.active ? 'var(--color-success)' : 'var(--color-text-subtle)',
                border: `1px solid ${announcement.active ? 'rgba(34,197,94,0.25)' : 'var(--color-border)'}`,
              }}>
                {announcement.active ? 'Live' : 'Hidden'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="ann-active"
                checked={announcement.active}
                onChange={e => setAnnouncement(a => ({ ...a, active: e.target.checked }))}
                style={{ accentColor: 'var(--color-accent)', width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="ann-active" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                Show announcement banner on homepage
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">Banner Text</label>
              <input
                className="form-input"
                placeholder="e.g. Free shipping on orders over $150 this month!"
                value={announcement.text}
                onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={saveAnnouncement} disabled={announcementSaving}>
              {announcementSaving ? <span className="loading-spinner" style={{ width: 12, height: 12 }} /> : <Save size={13} />}
              Save
            </button>
          </div>
        </div>

        {/* ─── Hero Section ─── */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Homepage Hero</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>The main headline and CTAs above the fold</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Headline</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Manufacturing Dreams,\nOne Layer at a Time"
                value={hero.headline}
                onChange={e => setHero(h => ({ ...h, headline: e.target.value }))}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>Use \n for a line break</p>
            </div>
            <div className="form-group">
              <label className="form-label">Subheadline</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={hero.subheadline}
                onChange={e => setHero(h => ({ ...h, subheadline: e.target.value }))}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Primary CTA Button</label>
                <input className="form-input" placeholder="Upload Your Model" value={hero.cta_primary} onChange={e => setHero(h => ({ ...h, cta_primary: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Secondary CTA Button</label>
                <input className="form-input" placeholder="View Services" value={hero.cta_secondary} onChange={e => setHero(h => ({ ...h, cta_secondary: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={saveHero} disabled={heroSaving}>
              {heroSaving ? <span className="loading-spinner" style={{ width: 12, height: 12 }} /> : <Save size={13} />}
              Save Hero
            </button>
          </div>
        </div>

        {/* ─── Feature Cards ─── */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Feature Cards</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>The 4 feature highlights below the hero</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addFeature}>
              + Add Card
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map((f, idx) => (
              <div key={idx} style={{
                padding: 16,
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Feature {idx + 1}</p>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeFeature(idx)}
                    style={{ color: 'var(--color-error)' }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <select className="form-select" value={f.icon} onChange={e => updateFeature(idx, 'icon', e.target.value)}>
                      {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={f.title} onChange={e => updateFeature(idx, 'title', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <input className="form-input" value={f.desc} onChange={e => updateFeature(idx, 'desc', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={saveFeatures} disabled={featuresSaving}>
              {featuresSaving ? <span className="loading-spinner" style={{ width: 12, height: 12 }} /> : <Save size={13} />}
              Save Features
            </button>
          </div>
        </div>

        {/* ─── Pricing Note + Contact Info ─── */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Pricing & Contact Info</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Shown on the pricing and contact pages</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Pricing Disclaimer Note</label>
              <textarea className="form-textarea" rows={2} value={pricingNote} onChange={e => setPricingNote(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input className="form-input" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Address</label>
                <input className="form-input" value={contactAddress} onChange={e => setContactAddress(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={saveMisc} disabled={miscSaving}>
              {miscSaving ? <span className="loading-spinner" style={{ width: 12, height: 12 }} /> : <Save size={13} />}
              Save Info
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
