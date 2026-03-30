import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Repeat,
  Tags,
  LogOut,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/recurring', icon: Repeat, label: 'Recurring' },
  { to: '/goals', icon: PiggyBank, label: 'Goals' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen)
  const dispatch = useAppDispatch()
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-lg gradient-text whitespace-nowrap"
            >
              SpendSmart
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-4">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 border-t border-slate-800/60"
            >
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                © {new Date().getFullYear()} All rights reserved<br />
                <span className="text-emerald-500/80 font-medium">@Priyaank Sinha</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle Button - Circular & Floating */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 shadow-lg flex items-center justify-center transition-all duration-200 z-50 group"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.aside>
  )
}
