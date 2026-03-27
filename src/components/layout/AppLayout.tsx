import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import { useAppSelector } from '@/store'

export default function AppLayout() {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen)

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="blob w-[500px] h-[500px] bg-emerald-600 top-[-150px] right-[-100px]" />
      <div className="blob w-[400px] h-[400px] bg-sky-600 bottom-[-100px] left-[-100px]" />

      <Sidebar />
      <MobileNav />

      <div
        className={`relative z-10 min-h-screen flex flex-col transition-all duration-300 ml-0 ${
          sidebarOpen ? 'md:ml-[240px]' : 'md:ml-[72px]'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <TopBar />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
