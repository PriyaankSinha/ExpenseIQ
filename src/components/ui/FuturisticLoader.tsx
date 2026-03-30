import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

interface FuturisticLoaderProps {
  fullPage?: boolean
  overlay?: boolean
  text?: string
}

export default function FuturisticLoader({ fullPage = false, overlay = false, text }: FuturisticLoaderProps) {
  return (
    <div 
      className={clsx(
        "flex flex-col items-center justify-center p-8 z-50",
        overlay && "fixed inset-0 bg-slate-950 z-100",
        fullPage && "absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      )}
    >
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Rotating Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-emerald-500/20 rounded-full"
        />
        
        {/* Outer Rotating Ring 2 (Counter) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border border-emerald-500/40 rounded-full"
        />

        {/* Glow Effect */}
        <div className="absolute inset-4 bg-emerald-500/10 blur-xl rounded-full animate-pulse" />

        {/* Central Core */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative bg-linear-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            style={{
              top: `${20 + i * 15}%`,
              left: `${15 + (i * 20) % 70}%`
            }}
          />
        ))}
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-sm font-medium text-emerald-400/80 tracking-widest uppercase font-mono animate-pulse"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
