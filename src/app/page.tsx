'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth'
import { authEndpoints } from '@/lib/api/endpoints/auth'
import { STORAGE_KEYS } from '@/lib/api/client'
import { toast } from 'sonner'
import { LogoMark, LogoLockup, LogoLockupDark } from '@/components/shared/logo'

const APK_URL = 'https://propertyapi.rohodev.com/downloads/rentwise.apk'

// ─── Install Banner ──────────────────────────────────────────────────────────

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as Event & { prompt: () => void })
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      padding: '16px 20px 28px',
      background: '#ffffff',
      borderTop: '1px solid #e8e7e4',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column', gap: 12,
      animation: 'rw-slideUp 0.35s cubic-bezier(.4,0,.2,1) both',
    }}>
      <style>{`@keyframes rw-slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #c2703e, #a35a2d)',
            display: 'grid', placeItems: 'center',
          }}>
            <LogoMark size={26} color="#ffffff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1f', lineHeight: 1.2 }}>Install RentWise</p>
            <p style={{ fontSize: 12, color: '#9b9ba5', fontWeight: 500, marginTop: 2 }}>Get the full Android experience</p>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#9b9ba5' }}
          aria-label="Dismiss"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Primary CTA — APK */}
      <a
        href={APK_URL}
        onClick={() => setVisible(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          height: 50, borderRadius: 14, textDecoration: 'none',
          background: '#c2703e', color: '#fff', fontWeight: 700, fontSize: 15,
        }}
      >
        <AndroidIcon /> Download APK (Recommended)
      </a>

      {/* Secondary — PWA */}
      {deferredPrompt && (
        <button
          onClick={() => { deferredPrompt.prompt(); setVisible(false) }}
          style={{
            height: 44, borderRadius: 14, border: '1.5px solid #e8e7e4',
            background: 'transparent', color: '#6b6b76', fontWeight: 600,
            fontSize: 13, cursor: 'pointer',
          }}
        >
          Add to Home Screen (web version)
        </button>
      )}
    </div>
  )
}

// ─── Icons ──────────────────────────────────────────────────────────────────

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const AndroidIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.341a.996.996 0 01-.995-.995.996.996 0 01.995-.995.996.996 0 01.995.995.996.996 0 01-.995.995m-11.046 0a.996.996 0 01-.995-.995.996.996 0 01.995-.995.996.996 0 01.995.995.996.996 0 01-.995.995m11.405-6.02l1.98-3.431a.416.416 0 00-.152-.567.416.416 0 00-.567.152l-2.005 3.473C15.381 8.088 13.251 7.6 12 7.6s-3.381.488-5.138 1.348L4.857 5.475a.416.416 0 00-.567-.152.416.416 0 00-.152.567l1.98 3.431C2.688 11.188.343 14.658 0 18.761h24c-.344-4.103-2.688-7.573-6.118-9.44" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
)

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

// ─── Phone Mockup ────────────────────────────────────────────────────────────

function PhoneFrame() {
  return (
    <div className="rw-phone fade-up" style={{ animationDelay: '600ms' }}>
      <div style={{
        width: 220, height: 440, borderRadius: 32, padding: 8,
        background: 'linear-gradient(145deg, #2a2a32, #1a1a1f)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 80, height: 22, borderRadius: '0 0 16px 16px',
          background: '#1a1a1f', zIndex: 3,
        }} />
        <div style={{
          width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden',
          background: 'linear-gradient(160deg, #c2703e, #a35a2d, #1a1a1f)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{
            width: 52, height: 52, borderRadius: 16, marginBottom: 14,
            background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <LogoMark size={30} color="#ffffff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'var(--rw-display)', letterSpacing: '-0.02em' }}>RentWise</span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 4, fontWeight: 500 }}>Your rental hub, in your pocket</span>
          <div style={{ marginTop: 24, width: '82%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Pay Rent', 'My Requests', 'Lease'].map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backdropFilter: 'blur(6px)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 600 }}>{t}</span>
                <div style={{ width: 16, height: 16, borderRadius: 5, background: 'rgba(255,255,255,0.15)' }} />
              </div>
            ))}
          </div>
          <div style={{
            position: 'absolute', bottom: 16, width: '60%', display: 'flex', justifyContent: 'space-around',
          }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === 0 ? '#fff' : 'rgba(255,255,255,0.25)',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps {
  label: string
  type?: string
  placeholder?: string
  icon?: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  autoComplete?: string
}

function RwInput({ label, type = 'text', placeholder, icon, value, onChange, error, autoComplete }: InputProps) {
  const [focused, setFocused] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const isPw = type === 'password'

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--rw-label)',
        marginBottom: 7, letterSpacing: '0.03em',
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 16px', height: 50, borderRadius: 14,
        border: `1.5px solid ${error ? 'var(--rw-danger)' : focused ? 'var(--rw-accent)' : 'var(--rw-input-border)'}`,
        background: 'var(--rw-input-bg)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? '0 0 0 3px var(--rw-accent-glow)' : 'none',
      }}>
        {icon && <span style={{ color: 'var(--rw-text-tertiary)', display: 'grid', flexShrink: 0 }}>{icon}</span>}
        <input
          type={isPw ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, fontWeight: 500, color: 'var(--rw-text)',
            fontFamily: 'var(--rw-body)',
          }}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rw-text-tertiary)', display: 'grid', padding: 0, flexShrink: 0 }}
          >
            <EyeIcon open={showPw} />
          </button>
        )}
      </div>
      {error && <p style={{ color: 'var(--rw-danger)', fontSize: 12, marginTop: 5, fontWeight: 500 }}>{error}</p>}
    </div>
  )
}

// ─── Auth Layout ─────────────────────────────────────────────────────────────

function AuthLayout({
  children,
  title,
  subtitle,
  onBack,
  onSwitchToLogin,
  onSwitchToRegister,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
  onBack: () => void
  onSwitchToLogin?: () => void
  onSwitchToRegister?: () => void
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left branding panel */}
      <div className="rw-auth-panel" style={{
        width: '45%', minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--rw-accent), var(--rw-accent-dark), var(--rw-sidebar))',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', marginBottom: 56, cursor: 'pointer' }}>
            <LogoLockupDark iconSize={40} />
          </div>

          <h2 style={{
            fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--rw-display)',
            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16,
          }}>
            Everything about<br />your rental, in<br />one place.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 360, fontWeight: 500 }}>
            Join thousands of tenants who manage their homes through Rentwise.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Pay rent securely online',
              'Track maintenance in real time',
              'Access lease documents anytime',
              'Get instant invoice notifications',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.1)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <CheckIcon />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* App download mini */}
          <div style={{
            marginTop: 48, padding: '16px 20px', borderRadius: 16,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(8px)',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.7)' }}><AndroidIcon /></div>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Prefer the app?</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Download Rentwise for Android</div>
            </div>
            <a href={APK_URL} style={{
              marginLeft: 'auto', padding: '7px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}>Get APK</a>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: 'var(--rw-bg)', overflowY: 'auto',
      }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: 'var(--rw-text-tertiary)',
            fontFamily: 'var(--rw-body)',
          }}>
            <BackIcon /> Back to home
          </button>

          <h2 style={{
            fontSize: 28, fontWeight: 900, color: 'var(--rw-text)', fontFamily: 'var(--rw-display)',
            letterSpacing: '-0.03em', marginBottom: 6,
          }}>{title}</h2>
          <p style={{ fontSize: 14, color: 'var(--rw-text-secondary)', marginBottom: 32, fontWeight: 500, lineHeight: 1.6 }}>{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

type View = 'landing' | 'login' | 'register'

export default function TenantLanding() {
  const router = useRouter()
  const { isAuthenticated, isHydrated, login, isLoading: authLoading } = useAuth()
  const [view, setView] = useState<View>('landing')

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; root?: string }>({})

  // Register form state
  const [regData, setRegData] = useState({ name: '', email: '', phone: '', password: '', confirm: '', code: '' })
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [regLoading, setRegLoading] = useState(false)
  const [showPwReqs, setShowPwReqs] = useState(false)

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const role = useAuthStore.getState().user?.role
      router.replace(role === 'tenant' ? '/tenant/dashboard' : '/app/dashboard')
    }
  }, [isAuthenticated, isHydrated, router])

  const pwReqs = [
    { label: 'At least 8 characters', met: regData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(regData.password) },
    { label: 'One number', met: /\d/.test(regData.password) },
    { label: 'Passwords match', met: Boolean(regData.password && regData.confirm === regData.password) },
  ]

  // ── Login submit ───────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof loginErrors = {}
    if (!loginData.email) errs.email = 'Email is required'
    if (!loginData.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setLoginErrors(errs); return }
    setLoginErrors({})
    try {
      await login(loginData.email, loginData.password)
      const role = useAuthStore.getState().user?.role
      router.replace(role === 'tenant' ? '/tenant/dashboard' : '/app/dashboard')
    } catch {
      setLoginErrors({ root: 'Invalid email or password. Please try again.' })
    }
  }

  // ── Register submit ────────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!regData.name) errs.name = 'Full name is required'
    if (!regData.email) errs.email = 'Email is required'
    if (!regData.phone) errs.phone = 'Phone is required'
    if (!regData.code) errs.code = 'Invitation code is required'
    if (regData.password.length < 8) errs.password = 'Must be at least 8 characters'
    if (regData.confirm !== regData.password) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setRegErrors(errs); return }
    setRegErrors({})
    setRegLoading(true)
    try {
      const data = await authEndpoints.register({
        auth: {
          full_name: regData.name,
          email: regData.email,
          password: regData.password,
          phone: regData.phone,
          property_code: regData.code,
        },
      })
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      document.cookie = `pm_auth=${encodeURIComponent(
        JSON.stringify({ authenticated: true, role: data.user.role })
      )};path=/;max-age=86400;SameSite=Lax`
      useAuthStore.setState({
        user: data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        access_expires_at: data.access_expires_at,
        is_authenticated: true,
        is_loading: false,
      })
      toast.success('Account created successfully!')
      router.replace('/tenant/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setRegErrors({ root: msg })
    } finally {
      setRegLoading(false)
    }
  }

  // ── Landing view ───────────────────────────────────────────────────────────
  const LandingView = () => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav className="fade-up" style={{
        padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 10,
      }}>
        <LogoLockup iconSize={36} textColor="var(--rw-text)" accentColor="var(--rw-accent)" />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setView('login')} className="rw-btn-ghost">Sign In</button>
          <button onClick={() => setView('register')} className="rw-btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 40px 60px', gap: 80, flexWrap: 'wrap', position: 'relative',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '5%', width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, var(--rw-accent-glow) 0%, transparent 70%)',
          filter: 'blur(60px)', opacity: 0.5, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '10%', width: 350, height: 350,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,112,62,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        {/* Text */}
        <div style={{ maxWidth: 520, position: 'relative', zIndex: 2 }}>
          <div className="fade-up" style={{ animationDelay: '100ms' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px',
              background: 'var(--rw-accent-glow)', borderRadius: 50, marginBottom: 24,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--rw-accent)', display: 'grid', placeItems: 'center' }}>
                <CheckIcon />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--rw-accent)' }}>Trusted by 2,000+ tenants</span>
            </div>
          </div>

          <h1 className="fade-up" style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.08,
            color: 'var(--rw-text)', fontFamily: 'var(--rw-display)',
            letterSpacing: '-0.035em', marginBottom: 20, animationDelay: '200ms',
          }}>
            Your home,<br />
            <span style={{ color: 'var(--rw-accent)' }}>effortlessly</span><br />
            managed.
          </h1>

          <p className="fade-up" style={{
            fontSize: 17, lineHeight: 1.65, color: 'var(--rw-text-secondary)',
            maxWidth: 420, marginBottom: 36, fontWeight: 500, animationDelay: '300ms',
          }}>
            Pay rent, track maintenance requests, access your lease — all from one beautiful dashboard.
          </p>

          <div className="fade-up" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '400ms' }}>
            <button onClick={() => setView('register')} className="rw-btn-primary rw-btn-lg" style={{ gap: 8 }}>
              Create Tenant Account <ArrowIcon />
            </button>
            <a href="#download" className="rw-btn-outline rw-btn-lg" style={{ gap: 8, textDecoration: 'none' }}>
              <AndroidIcon /> Download App
            </a>
          </div>

          <div className="fade-up" style={{ display: 'flex', gap: 28, marginTop: 40, alignItems: 'center', animationDelay: '500ms' }}>
            {[
              { val: '4.8★', label: 'Play Store' },
              { val: '24/7', label: 'Support' },
              { val: '256-bit', label: 'Encrypted' },
            ].map((t, i) => (
              <div key={i}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--rw-text)', fontFamily: 'var(--rw-display)' }}>{t.val}</div>
                <div style={{ fontSize: 12, color: 'var(--rw-text-tertiary)', fontWeight: 500 }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        <PhoneFrame />
      </div>

      {/* Download section */}
      <div id="download" className="fade-up" style={{
        margin: '0 40px 60px', padding: '48px 56px', borderRadius: 28,
        background: 'linear-gradient(135deg, var(--rw-sidebar), #2a2a32)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 40, flexWrap: 'wrap', position: 'relative', overflow: 'hidden',
        animationDelay: '700ms',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(194,112,62,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(194,112,62,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--rw-display)',
            letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 10,
          }}>Get Rentwise on Android</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontWeight: 500 }}>
            Pay rent on the go, get instant notifications for maintenance updates, and manage everything from your phone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          <a href={APK_URL} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px',
            background: 'rgba(255,255,255,0.08)', borderRadius: 16, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff',
          }}>
            <AndroidIcon />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>GET IT ON</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--rw-display)', letterSpacing: '-0.01em' }}>Google Play</div>
            </div>
          </a>
          <a href={APK_URL} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px',
            background: 'var(--rw-accent)', borderRadius: 16, textDecoration: 'none',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            <DownloadIcon /> Download APK
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px', borderTop: '1px solid var(--rw-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontSize: 13, color: 'var(--rw-text-tertiary)', fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} Rentwise &mdash; Tenant Portal
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Privacy', '#'], ['Terms', '#'], ['Support', '#'], ['Admin', '/app/dashboard']].map(([t, href]) => (
            <a key={t} href={href} style={{ fontSize: 13, color: 'var(--rw-text-tertiary)', textDecoration: 'none', fontWeight: 500 }}>{t}</a>
          ))}
        </div>
      </footer>
    </div>
  )

  // ── Login view ─────────────────────────────────────────────────────────────
  const LoginView = () => (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your tenant dashboard, pay rent, and manage your home."
      onBack={() => setView('landing')}
    >
      <form onSubmit={handleLogin} noValidate>
        <RwInput
          label="EMAIL ADDRESS"
          type="email"
          placeholder="you@example.com"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          error={loginErrors.email}
          autoComplete="email"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>}
        />
        <RwInput
          label="PASSWORD"
          type="password"
          placeholder="Enter your password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          error={loginErrors.password}
          autoComplete="current-password"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
        />

        {loginErrors.root && (
          <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontSize: 13, color: 'var(--rw-danger)', fontWeight: 500 }}>{loginErrors.root}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, marginTop: -6 }}>
          <a href={APK_URL} style={{ fontSize: 13, fontWeight: 600, color: 'var(--rw-accent)', textDecoration: 'none' }}>Forgot password?</a>
        </div>

        <button type="submit" className="rw-btn-primary rw-btn-full" style={{ height: 52, fontSize: 15, marginBottom: 20, gap: 8 }} disabled={authLoading}>
          {authLoading ? 'Signing in…' : <><span>Sign In</span><ArrowIcon /></>}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--rw-text-secondary)', marginTop: 8, fontWeight: 500 }}>
        Don&apos;t have an account?{' '}
        <button onClick={() => setView('register')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--rw-accent)', fontWeight: 700, fontSize: 14, fontFamily: 'var(--rw-body)',
        }}>Create one</button>
      </p>
    </AuthLayout>
  )

  // ── Register view ──────────────────────────────────────────────────────────
  const RegisterView = () => (
    <AuthLayout
      title="Create your account"
      subtitle="Register with the invitation code from your property manager to get started."
      onBack={() => setView('landing')}
    >
      <form onSubmit={handleRegister} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <RwInput
            label="FULL NAME"
            placeholder="Kwame Mensah"
            value={regData.name}
            onChange={(e) => setRegData({ ...regData, name: e.target.value })}
            error={regErrors.name}
            autoComplete="name"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          />
          <RwInput
            label="PHONE NUMBER"
            type="tel"
            placeholder="+233 XX XXX XXXX"
            value={regData.phone}
            onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
            error={regErrors.phone}
            autoComplete="tel"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>}
          />
        </div>

        <RwInput
          label="EMAIL ADDRESS"
          type="email"
          placeholder="you@example.com"
          value={regData.email}
          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
          error={regErrors.email}
          autoComplete="email"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>}
        />

        <RwInput
          label="INVITATION CODE"
          placeholder="e.g. PROP-001"
          value={regData.code}
          onChange={(e) => setRegData({ ...regData, code: e.target.value })}
          error={regErrors.code}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>}
        />

        <RwInput
          label="PASSWORD"
          type="password"
          placeholder="Create a strong password"
          value={regData.password}
          onChange={(e) => { setRegData({ ...regData, password: e.target.value }); setShowPwReqs(true) }}
          error={regErrors.password}
          autoComplete="new-password"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
        />

        {showPwReqs && (
          <div style={{
            marginTop: -8, marginBottom: 18, padding: '14px 16px', borderRadius: 12,
            background: 'var(--rw-input-bg)', border: '1px solid var(--rw-input-border)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rw-text-tertiary)', letterSpacing: '0.05em', marginBottom: 8 }}>PASSWORD REQUIREMENTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
              {pwReqs.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 6, display: 'grid', placeItems: 'center',
                    background: r.met ? 'rgba(16,185,129,0.12)' : 'var(--rw-input-border)',
                    transition: 'all 0.2s',
                  }}>
                    {r.met && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <span style={{ fontSize: 12, color: r.met ? '#10b981' : 'var(--rw-text-tertiary)', fontWeight: 500 }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <RwInput
          label="CONFIRM PASSWORD"
          type="password"
          placeholder="Re-enter your password"
          value={regData.confirm}
          onChange={(e) => setRegData({ ...regData, confirm: e.target.value })}
          error={regErrors.confirm}
          autoComplete="new-password"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
        />

        {regErrors.root && (
          <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontSize: 13, color: 'var(--rw-danger)', fontWeight: 500 }}>{regErrors.root}</p>
          </div>
        )}

        <button type="submit" className="rw-btn-primary rw-btn-full" style={{ height: 52, fontSize: 15, marginBottom: 20, gap: 8 }} disabled={regLoading}>
          {regLoading ? 'Creating account…' : <><span>Create Account</span><ArrowIcon /></>}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--rw-text-secondary)', marginTop: 8, fontWeight: 500 }}>
        Already have an account?{' '}
        <button onClick={() => setView('login')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--rw-accent)', fontWeight: 700, fontSize: 14, fontFamily: 'var(--rw-body)',
        }}>Sign in</button>
      </p>
    </AuthLayout>
  )

  return (
    <>
      <style>{`
        :root {
          --rw-display: 'Outfit', sans-serif;
          --rw-body: 'Plus Jakarta Sans', sans-serif;
          --rw-bg: #f6f5f2;
          --rw-sidebar: #1a1a1f;
          --rw-text: #1a1a1f;
          --rw-text-secondary: #6b6b76;
          --rw-text-tertiary: #9b9ba5;
          --rw-border: #e8e7e4;
          --rw-accent: #c2703e;
          --rw-accent-dark: #a35a2d;
          --rw-accent-glow: rgba(194,112,62,0.1);
          --rw-danger: #ef4444;
          --rw-input-bg: #fafaf8;
          --rw-input-border: #e4e3e0;
          --rw-label: #6b6b76;
        }

        @keyframes rw-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: rw-fadeUp 0.6s cubic-bezier(.4,0,.2,1) both; }

        @keyframes rw-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .rw-phone { animation: rw-float 6s ease-in-out infinite; }

        .rw-btn-primary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 22px; border-radius: 12px; border: none; cursor: pointer;
          background: var(--rw-accent); color: #fff; font-weight: 700;
          font-size: 14px; font-family: var(--rw-body);
          transition: all 0.2s;
        }
        .rw-btn-primary:hover:not(:disabled) { background: var(--rw-accent-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(194,112,62,0.35); }
        .rw-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .rw-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 20px; border-radius: 12px; cursor: pointer;
          background: transparent; color: var(--rw-text); font-weight: 600;
          font-size: 14px; font-family: var(--rw-body); border: none; transition: all 0.15s;
        }
        .rw-btn-ghost:hover { background: var(--rw-accent-glow); color: var(--rw-accent); }

        .rw-btn-outline {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 22px; border-radius: 12px; cursor: pointer;
          background: transparent; color: var(--rw-text); font-weight: 700;
          font-size: 14px; font-family: var(--rw-body);
          border: 1.5px solid var(--rw-border); transition: all 0.2s;
        }
        .rw-btn-outline:hover { border-color: var(--rw-accent); color: var(--rw-accent); transform: translateY(-1px); }

        .rw-btn-lg  { padding: 14px 28px; font-size: 15px; border-radius: 14px; }
        .rw-btn-full { width: 100%; }

        @media (max-width: 900px) {
          .rw-auth-panel { display: none !important; }
        }
      `}</style>

      <InstallBanner />
      <div
        key={view}
        style={{ fontFamily: 'var(--rw-body)', background: 'var(--rw-bg)', minHeight: '100vh' }}
      >
        {view === 'landing'  && <LandingView />}
        {view === 'login'    && <LoginView />}
        {view === 'register' && <RegisterView />}
      </div>
    </>
  )
}
