import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Layers, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Tab = 'login' | 'register' | 'forgot'

// Password strength checker
function getStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '', color: 'transparent' }
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' }
  return { score, label: 'Strong', color: '#22c55e' }
}

export default function Auth() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>(
    params.get('tab') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset fields on tab switch
  function switchTab(t: Tab) {
    setTab(t)
    setPassword('')
    setConfirmPassword('')
    setShowPass(false)
    setShowConfirmPass(false)
  }

  const strength = getStrength(password)
  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')

      } else if (tab === 'register') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match')
          setLoading(false)
          return
        }
        if (password.length < 8) {
          toast.error('Password must be at least 8 characters')
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        toast.success('Account created! Check your email to confirm.')

      } else if (tab === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?tab=login`,
        })
        if (error) throw error
        setForgotSent(true)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Animated background ── */}
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.15; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(45deg); opacity: 0.1; }
          50% { transform: translateY(20px) rotate(225deg); opacity: 0.25; }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.08; }
          33% { transform: translateY(-15px) rotate(120deg) scale(1.1); opacity: 0.2; }
          66% { transform: translateY(10px) rotate(240deg) scale(0.9); opacity: 0.12; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(180deg) translateX(80px) rotate(-180deg); }
          to { transform: rotate(540deg) translateX(80px) rotate(-540deg); }
        }
        .auth-card-inner {
          animation: slideUp 0.5s ease forwards;
        }
        .layer-tag:hover {
          background: rgba(249,115,22,0.15) !important;
          border-color: rgba(249,115,22,0.4) !important;
        }
      `}</style>

      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Floating geometric shapes */}
      {[
        { size: 120, top: '8%', left: '5%', anim: 'floatA 8s ease-in-out infinite', color: '#f97316' },
        { size: 80, top: '15%', right: '8%', anim: 'floatB 6s ease-in-out infinite', color: '#f97316' },
        { size: 60, bottom: '20%', left: '8%', anim: 'floatC 10s ease-in-out infinite', color: '#f97316' },
        { size: 100, bottom: '10%', right: '5%', anim: 'floatA 7s ease-in-out infinite 2s', color: '#f97316' },
        { size: 40, top: '45%', left: '3%', anim: 'floatB 9s ease-in-out infinite 1s', color: '#f97316' },
        { size: 50, top: '40%', right: '3%', anim: 'floatC 11s ease-in-out infinite 3s', color: '#f97316' },
      ].map((s, i) => (
        <svg key={i} width={s.size} height={s.size} viewBox="0 0 100 100"
          style={{ position: 'fixed', top: s.top, left: s.left, right: (s as any).right, bottom: (s as any).bottom, animation: s.anim, pointerEvents: 'none' }}>
          {i % 3 === 0 && (
            // Hexagon (layer shape)
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none" stroke={s.color} strokeWidth="2" />
          )}
          {i % 3 === 1 && (
            // Diamond
            <polygon points="50,5 95,50 50,95 5,50"
              fill="none" stroke={s.color} strokeWidth="2" />
          )}
          {i % 3 === 2 && (
            // Triangle
            <polygon points="50,5 95,90 5,90"
              fill="none" stroke={s.color} strokeWidth="2" />
          )}
        </svg>
      ))}

      {/* Central glow */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'pulse-glow 4s ease-in-out infinite',
      }} />

      {/* Orbiting dots */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        width: 0, height: 0,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          animation: 'orbit 12s linear infinite',
          opacity: 0.4,
        }} />
        <div style={{
          position: 'absolute',
          width: 5, height: 5,
          borderRadius: '50%',
          background: '#fb923c',
          animation: 'orbit2 8s linear infinite',
          opacity: 0.3,
        }} />
      </div>

      {/* ── Main card ── */}
      <div className="auth-card-inner" style={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
        opacity: mounted ? 1 : 0,
      }}>

        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, marginBottom: 28,
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem',
          color: 'var(--color-text)', letterSpacing: '-0.03em', textDecoration: 'none',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: 10, padding: '7px 9px', display: 'flex',
            boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
          }}>
            <Layers size={22} color="white" />
          </div>
          Slice<span style={{ color: 'var(--color-accent)' }}>Dynamics</span>
        </Link>

        {/* Card */}
        <div style={{
          background: 'rgba(17,17,24,0.9)',
          border: '1px solid rgba(249,115,22,0.15)',
          borderRadius: 20,
          padding: 32,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>

          {/* Tabs (not shown on forgot) */}
          {tab !== 'forgot' && (
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              padding: 4,
              marginBottom: 28,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {(['login', 'register'] as const).map(t => (
                <button key={t} onClick={() => switchTab(t)} style={{
                  flex: 1, padding: '9px 0',
                  borderRadius: 7, border: 'none',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: tab === t
                    ? 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.1))'
                    : 'transparent',
                  color: tab === t ? '#f97316' : 'var(--color-text-muted)',
                  boxShadow: tab === t ? 'inset 0 0 0 1px rgba(249,115,22,0.25)' : 'none',
                }}>
                  {t === 'login' ? '🔑 Sign In' : '✨ Register'}
                </button>
              ))}
            </div>
          )}

          {/* ── Forgot password sent state ── */}
          {tab === 'forgot' && forgotSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle2 size={30} color="#22c55e" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 10 }}>Check your email</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
                We sent a password reset link to <strong style={{ color: 'var(--color-text)' }}>{email}</strong>
              </p>
              <button onClick={() => { switchTab('login'); setForgotSent(false) }}
                className="btn btn-ghost btn-sm" style={{ margin: '0 auto' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>

          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Forgot header */}
              {tab === 'forgot' && (
                <div style={{ marginBottom: 4 }}>
                  <button type="button" onClick={() => switchTab('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: 0, marginBottom: 16 }}>
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 6 }}>Reset Password</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    Enter your email and we'll send a reset link.
                  </p>
                </div>
              )}

              {/* Full Name (register only) */}
              {tab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text"
                    placeholder="Enter your full name"
                    value={fullName} onChange={e => setFullName(e.target.value)} required
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email"
                  placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Password (not on forgot) */}
              {tab !== 'forgot' && (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Password</label>
                    {tab === 'login' && (
                      <button type="button" onClick={() => switchTab('forgot')}
                        style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password} onChange={e => setPassword(e.target.value)}
                      required minLength={8}
                      style={{ paddingRight: 44, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 0 }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength (register only) */}
                  {tab === 'register' && password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: i <= strength.score ? strength.color : 'var(--color-border)',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: strength.color }}>{strength.label}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (register only) */}
              {tab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input"
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      required
                      style={{
                        paddingRight: 44,
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${!passwordsMatch && confirmPassword ? '#ef4444' : confirmPassword && passwordsMatch ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 0 }}>
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {confirmPassword && (
                      <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }}>
                        {passwordsMatch
                          ? <CheckCircle2 size={16} color="#22c55e" />
                          : <XCircle size={16} color="#ef4444" />
                        }
                      </div>
                    )}
                  </div>
                  {!passwordsMatch && confirmPassword && (
                    <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4 }}>Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading || (tab === 'register' && !passwordsMatch)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 10, border: 'none',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 4,
                  background: loading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: 'white',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(249,115,22,0.4)',
                  transition: 'all 0.2s',
                  opacity: (tab === 'register' && !passwordsMatch && confirmPassword) ? 0.5 : 1,
                }}>
                {loading && <span className="loading-spinner" style={{ width: 16, height: 16 }} />}
                {tab === 'login' && 'Sign In'}
                {tab === 'register' && 'Create Account'}
                {tab === 'forgot' && 'Send Reset Link'}
              </button>

              {/* Bottom links */}
              {tab === 'login' && (
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Don't have an account?{' '}
                  <button onClick={() => switchTab('register')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                    Register free
                  </button>
                </p>
              )}
              {tab === 'register' && (
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Already have an account?{' '}
                  <button onClick={() => switchTab('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                    Sign in
                  </button>
                </p>
              )}
            </form>
          )}
        </div>

        {/* Feature tags below card */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['🔒 Secure Auth', '⚡ Instant Estimates', '📦 Order Tracking'].map(tag => (
            <span key={tag} className="layer-tag" style={{
              padding: '5px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 999,
              fontSize: '0.75rem',
              color: 'var(--color-text-subtle)',
              transition: 'all 0.2s',
              cursor: 'default',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
