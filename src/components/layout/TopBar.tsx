import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Sparkles, LogOut, User as UserIcon, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { useBudgetNotifications, BudgetNotification } from '@/hooks/useBudgetNotifications'

export default function TopBar() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const { notifications, count, isLoading } = useBudgetNotifications()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    
    if (isMenuOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen, isNotificationsOpen])

  return (
    <header className="h-16 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Logo - Mobile Only */}
      <div className="flex md:hidden items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg gradient-text whitespace-nowrap">
          SpendSmart
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen)
              setIsMenuOpen(false)
            }}
            className={`relative p-2 rounded-xl transition-colors ${
              isNotificationsOpen 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-[1.5px] border-slate-900 shadow-md">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {/* Notifications Portal */}
          {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="fixed inset-0 z-100 bg-slate-950/20 backdrop-blur-sm"
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed top-16 right-6 w-80 max-w-[calc(100vw-48px)] bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-101"
                  >
                    <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Notifications</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Current Month
                      </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        <div className="p-2 space-y-1">
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              className="p-3 rounded-xl hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-700/50"
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  notif.type === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                  {notif.type === 'critical' ? (
                                    <AlertCircle className="w-4 h-4" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-slate-200">{notif.title}</p>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{notif.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-200">Everything looks good!</p>
                            <p className="text-xs text-slate-500">You haven't exceeded any category budgets this month.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-slate-800/60 bg-slate-900/50 text-center">
                      <p className="text-[10px] text-slate-500">
                        Monthly alerts reset on the 1st
                      </p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
              setIsNotificationsOpen(false)
            }}
            className="flex items-center gap-3 group"
          >
            <div className={`w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform ${
              isMenuOpen ? 'ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-slate-950' : ''
            }`}>
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-300 hidden sm:block group-hover:text-slate-100 transition-colors">
              {displayName}
            </span>
          </button>

          {/* Mobile Profile Popup (Portal to Body) */}
          {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Global Backdrop with blur */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 z-100 bg-slate-950/40 backdrop-blur-md md:hidden"
                  />
                  
                  {/* Popup Container (Floating) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed top-16 right-6 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden md:hidden z-101"
                  >
                    <div className="p-4 border-b border-slate-800/60 bg-slate-900/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                          {initials}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-200 truncate">{displayName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          signOut()
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>

                    <div className="px-4 py-3 bg-slate-950/30 border-t border-slate-800/60">
                       <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                         © 2026 All rights reserved<br />
                         <span className="text-emerald-500/70 font-medium">@Priyaank Sinha</span>
                       </p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>
      </div>
    </header>
  )
}
