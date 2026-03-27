import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, RefreshCw } from 'lucide-react'
import { generateSavingsTips } from '@/lib/ai'
import { useRecentExpenses } from '@/hooks/useExpenses'
import { useProfile } from '@/hooks/useProfile'
import BentoCard from '@/components/ui/BentoCard'
interface AISavingsCoachProps {
  monthlyIncome?: number
  monthlySavingGoal?: number
  projectedSavings?: number
  goals?: any[] // Simplified type for prompt mapping
}

export default function AISavingsCoach({ monthlyIncome, monthlySavingGoal, projectedSavings, goals }: AISavingsCoachProps) {
  const { data: expenses } = useRecentExpenses(20)
  const { data: profile } = useProfile()
  const [tip, setTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTip = async () => {
    if (!expenses || expenses.length === 0) {
      setTip("Start tracking expenses and I'll give you personalized saving tips! 💡")
      return
    }

    setLoading(true)
    try {
      const mapped = expenses.map((e) => ({
        amount: e.amount,
        category_name: e.category?.name || 'Unknown',
        merchant: e.merchant,
        date: e.date,
      }))
      const result = await generateSavingsTips(
        mapped, 
        profile?.currency || 'USD',
        {
          monthlyIncome,
          monthlySavingGoal,
          projectedSavings,
          goals: goals?.map(g => ({ name: g.name, target: g.target_amount, current: g.current_amount }))
        }
      )
      setTip(result)
    } catch (err) {
      setTip("I'm having trouble connecting right now. Keep tracking expenses — every dollar counts! 🎯")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (expenses && !tip) {
      fetchTip()
    }
  }, [expenses])

  return (
    <BentoCard className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">AI Savings Coach</h3>
        </div>
        <button
          onClick={fetchTip}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 bg-slate-800/80 rounded shimmer w-full" />
            <div className="h-3 bg-slate-800/80 rounded shimmer w-4/5" />
            <div className="h-3 bg-slate-800/80 rounded shimmer w-3/5" />
          </div>
        ) : (
          <motion.p
            key={tip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-400 leading-relaxed"
          >
            {tip || 'Loading tips...'}
          </motion.p>
        )}
      </div>
    </BentoCard>
  )
}
