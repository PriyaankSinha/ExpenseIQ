import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PiggyBank, Settings, Repeat, Tags, Plus } from 'lucide-react'

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/recurring', icon: Repeat, label: 'Recurring' },
  { to: '/goals', icon: PiggyBank, label: 'Goals' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/60 h-[72px] pb-[env(safe-area-inset-bottom)] flex items-center justify-around px-2">
      {mobileNavItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}`} />
              <span className="text-[10px] font-medium tracking-wide">
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
