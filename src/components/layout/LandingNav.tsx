import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function LandingNav() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3 border-white/5 bg-slate-900/40 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-lg md:text-xl font-bold gradient-text">
            SpendSmart<span className="hidden sm:inline"> AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">How it Works</a>
          <a href="#testimonials" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Testimonials</a>
        </div>

        <div className="flex items-center gap-3 md:gap-4 font-semibold">
          <Link to="/login" className="text-xs md:text-sm text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="btn-primary py-1.5 px-3 md:py-2 md:px-5 text-xs md:text-sm whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
