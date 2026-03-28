import { useMemo } from 'react'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { getDaysInMonth } from 'date-fns'
import { useProfile } from '@/hooks/useProfile'

interface MonthEndForecastProps {
  totalBudget: number
  currentSpending: number
}

export default function MonthEndForecast({ totalBudget, currentSpending }: MonthEndForecastProps) {
  const { data: profile } = useProfile()
  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const stats = useMemo(() => {
    const today = new Date()
    const daysElapsed = Math.max(1, today.getDate())
    const totalDays = getDaysInMonth(today)
    const remainingDays = totalDays - daysElapsed

    const dailyBurnRate = currentSpending / daysElapsed
    const projectedTotal = currentSpending + (dailyBurnRate * remainingDays)
    
    // Safety caps
    const rawProgress = totalBudget > 0 ? (currentSpending / totalBudget) * 100 : 0
    const progressPercent = Math.min(100, Math.max(0, rawProgress))
    
    const isOverProjected = projectedTotal > totalBudget
    const excessProjected = Math.max(0, projectedTotal - totalBudget)
    const remainingBudget = Math.max(0, totalBudget - currentSpending)

    let safeDaily = 0
    if (remainingDays > 0) {
      safeDaily = remainingBudget / remainingDays
    }

    return {
      daysElapsed,
      remainingDays,
      projectedTotal,
      progressPercent,
      isOverProjected,
      excessProjected,
      safeDaily,
      rawProgress,
    }
  }, [currentSpending, totalBudget])

  const {
    daysElapsed,
    remainingDays,
    projectedTotal,
    progressPercent,
    isOverProjected,
    excessProjected,
    safeDaily,
  } = stats

  // Determine colors based on thresholds
  const progressColor = progressPercent >= 90 ? 'bg-rose-500' : progressPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
  const textProjectedColor = isOverProjected ? 'text-rose-400' : 'text-slate-100'

  if (totalBudget <= 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <p className="mb-2">No budget defined yet.</p>
        <p className="text-xs">Set your monthly income and savings goals, or define category budgets to activate forecasting.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-slate-100">Month-End Forecast</h3>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isOverProjected ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {isOverProjected ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {isOverProjected ? 'Over budget projected' : 'On track'}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-sm text-slate-400 mb-1">Current Spending</p>
          <p className="text-3xl font-bold text-slate-100 mb-1">{fmt(currentSpending)}</p>
          <p className="text-xs text-slate-500">{daysElapsed} days elapsed</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">Projected Total</p>
          <p className={`text-3xl font-bold mb-1 ${textProjectedColor}`}>{fmt(projectedTotal)}</p>
          <p className="text-xs text-slate-500">by end of month</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">Spend progress</span>
          <span className="text-slate-400">
            <span className="text-slate-200 font-medium">{stats.rawProgress.toFixed(0)}%</span> of {fmt(totalBudget)} budget
          </span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-500`} 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Alerts & Advisories container */}
      <div className="mt-auto">
        {/* Status Box */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4 flex items-start gap-3">
          <ArrowRight className={`w-4 h-4 shrink-0 mt-0.5 ${isOverProjected ? 'text-rose-400' : 'text-emerald-400'}`} />
          <p className="text-sm font-medium text-slate-300">
            {isOverProjected ? (
              <>Projected to exceed budget by <span className="text-rose-400">{fmt(excessProjected)}</span></>
            ) : (
              <>Projected to finish <span className="text-emerald-400">{fmt(totalBudget - projectedTotal)}</span> under budget</>
            )}
          </p>
        </div>

        {/* Safe to Spend Footnote */}
        <p className="text-center text-sm text-slate-400">
          Safe to spend <span className="text-slate-100 font-semibold">{fmt(safeDaily)}/day</span> for the next {remainingDays} days
        </p>
      </div>
    </div>
  )
}
