import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, User, DollarSign, Bell, Check, ChevronDown } from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY']

function CustomSelect({ value, options, onChange }: { value: string, options: string[], onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-dark w-full flex items-center justify-between text-slate-100 bg-slate-900/40 cursor-pointer"
      >
        <span>{value}</span>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95, y: -10 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 py-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl origin-top overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-700/50 transition-colors ${
                  value === option ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-200'
                }`}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        monthly_income: profile.monthly_income?.toString() || '',
        currency: profile.currency || 'USD',
        notification_time: profile.notification_time || '20:00',
      })
    }
  }, [profile])

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      full_name: form.full_name,
      monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
      currency: form.currency,
      notification_time: form.notification_time,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your profile and preferences</p>
        </div>

        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="btn-primary flex items-center gap-2"
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
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile */}
          <BentoCard hover={false}>
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

          {/* Notifications */}
          <BentoCard hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-200">Notifications</h2>
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={form.notification_time}
                onChange={(e) => setForm({ ...form, notification_time: e.target.value })}
                className="input-dark max-w-xs"
              />
              <p className="text-xs text-slate-600 mt-1.5">
                We'll remind you to log expenses if you haven't logged one today.
              </p>
            </div>
          </BentoCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Financial */}
          <BentoCard hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-200">Financial</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  options={CURRENCIES}
                  onChange={(v) => setForm({ ...form, currency: v })}
                />
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </motion.div>
  )
}
