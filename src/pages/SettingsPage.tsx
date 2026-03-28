import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, User, DollarSign, Bell, Check, Clock } from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import CustomSelect from '@/components/ui/CustomSelect'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { getFixedPos } from '@/lib/ui-utils'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY']
const CURRENCY_OPTIONS = CURRENCIES.map(c => ({ label: c, value: c }))

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Seoul', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Karachi', 'Asia/Dhaka',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Australia/Sydney', 'Pacific/Auckland', 'UTC'
]
const TIMEZONE_OPTIONS = TIMEZONES.map(t => ({ label: t, value: t }))

// ── Custom Time Picker ─────────────────────────────────────────────
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, placement: 'bottom' as 'top' | 'bottom' })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const parts = value.split(':').map(Number)
  const selH = parts[0] ?? 0
  const selM = parts[1] ?? 0
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const updatePos = () => {
    if (buttonRef.current && isOpen) {
      setPos(getFixedPos(buttonRef.current, 260))
    }
  }

  useEffect(() => {
    if (isOpen) {
      updatePos()
      window.addEventListener('scroll', updatePos, true)
      window.addEventListener('resize', updatePos)
    }
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [isOpen])

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (!buttonRef.current?.contains(e.target as Node) && !panelRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [isOpen])

  const pick = (h: number, m: number) => {
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-dark w-full flex items-center justify-between text-slate-100 bg-slate-900/40 cursor-pointer min-h-[42px]"
      >
        <span className="font-mono text-base tracking-widest">{value ? value.slice(0, 5) : '00:00'}</span>
        <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-100 bg-slate-950/20 backdrop-blur-[0.5px] cursor-pointer" 
                onClick={() => setIsOpen(false)} 
              />
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, scaleY: 0.95, y: pos.placement === 'bottom' ? -10 : 10 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.95, y: pos.placement === 'bottom' ? -10 : 10 }}
                style={{ 
                  position: 'fixed', 
                  top: pos.top + (pos.placement === 'bottom' ? 8 : 0), 
                  left: pos.left, 
                  width: pos.width, 
                  zIndex: 101 
                }}
                className="bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden origin-top"
              >
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-slate-700/60">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200 font-mono tracking-widest">
                    {String(selH).padStart(2, '0')}:{String(selM).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex">
                  <div className="flex-1 overflow-y-auto max-h-48 border-r border-slate-700/40 custom-scrollbar">
                    <p className="text-center text-xs text-slate-500 py-1.5 sticky top-0 bg-slate-800">HH</p>
                    {hours.map(h => (
                      <button key={h} type="button" onClick={() => pick(h, selM)}
                        className={`w-full text-center py-2 text-sm transition-colors font-mono ${
                          h === selH ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50'
                        }`}>
                        {String(h).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar">
                    <p className="text-center text-xs text-slate-500 py-1.5 sticky top-0 bg-slate-800">MM</p>
                    {minutes.map(m => (
                      <button key={m} type="button" onClick={() => { pick(selH, m); setIsOpen(false) }}
                        className={`w-full text-center py-2 text-sm transition-colors font-mono ${
                          m === selM ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50'
                        }`}>
                        {String(m).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    monthly_income: '',
    currency: 'USD',
    notification_time: '20:00',
    timezone: 'Asia/Kolkata',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        monthly_income: profile.monthly_income?.toString() || '',
        currency: profile.currency || 'USD',
        notification_time: profile.notification_time || '20:00',
        timezone: profile.timezone || 'Asia/Kolkata',
      })
    }
  }, [profile])

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      full_name: form.full_name,
      monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
      currency: form.currency,
      notification_time: form.notification_time,
      timezone: form.timezone,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your profile and preferences</p>
        </div>

        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : updateProfile.isPending ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BentoCard hover={false} className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-200">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-dark opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your full name"
                className="input-dark"
              />
            </div>
          </div>
        </BentoCard>

        <BentoCard hover={false} className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-200">Financial</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5">Monthly Income</label>
              <input
                type="number"
                value={form.monthly_income}
                onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                placeholder="5000"
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5">Currency</label>
              <CustomSelect
                value={form.currency}
                options={CURRENCY_OPTIONS}
                onChange={(v) => setForm({ ...form, currency: v })}
              />
            </div>
          </div>
        </BentoCard>
      </div>

      <BentoCard hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-200">Notifications</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1.5">Daily Reminder Time</label>
            <TimePicker
              value={form.notification_time}
              onChange={(v) => setForm({ ...form, notification_time: v })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1.5">Your Timezone</label>
            <CustomSelect
              value={form.timezone}
              options={TIMEZONE_OPTIONS}
              onChange={(v) => setForm({ ...form, timezone: v })}
            />
            <p className="text-xs text-slate-600 mt-1.5">
              Reminders will be sent at exactly the time you select in your local timezone.
            </p>
          </div>
        </div>
      </BentoCard>
    </motion.div>
  )
}
