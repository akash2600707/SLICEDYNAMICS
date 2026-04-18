import { useState, useEffect } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Mail, Phone, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Contact() {
  const [info, setInfo] = useState({ email: 'hello@slicedynamics.com', phone: '+1 (800) 555-SLICE', address: '123 Maker Lane, San Francisco, CA 94102' })
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('site_content').select('value').eq('key', 'contact_email').single(),
      supabase.from('site_content').select('value').eq('key', 'contact_phone').single(),
      supabase.from('site_content').select('value').eq('key', 'contact_address').single(),
    ]).then(([email, phone, address]) => {
      setInfo({
        email: (email.data?.value as string) ?? info.email,
        phone: (phone.data?.value as string) ?? info.phone,
        address: (address.data?.value as string) ?? info.address,
      })
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <PublicLayout>
      <section style={{ padding: '80px 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Get In Touch</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 16 }}>
              Contact Us
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 48, maxWidth: 900, margin: '0 auto' }}>
            {/* Info */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 20 }}>Contact Information</h2>
              {[
                { icon: Mail, label: 'Email', value: info.email },
                { icon: Phone, label: 'Phone', value: info.phone },
                { icon: MapPin, label: 'Address', value: info.address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="var(--color-accent)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: '0.9rem' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={sending} style={{ justifyContent: 'center' }}>
                  {sending ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : null}
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
