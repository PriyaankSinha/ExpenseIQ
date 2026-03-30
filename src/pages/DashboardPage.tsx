import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Wallet,
  TrendingDown,
  Target,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import CategoryDonut from '@/components/charts/CategoryDonut'
import SpendingArea from '@/components/charts/SpendingArea'
import SmartExpenseInput from '@/components/SmartExpenseInput'
import AISavingsCoach from '@/components/AISavingsCoach'
import BudgetVsActualChart from '@/components/charts/BudgetVsActualChart'
import MonthEndForecast from '@/components/widgets/MonthEndForecast'
import CategoryConfirmModal from '@/components/modals/CategoryConfirmModal'
import FuturisticLoader from '@/components/ui/FuturisticLoader'
import { useExpenses, useAddExpense } from '@/hooks/useExpenses'
import { useCategories, findCategoryByName } from '@/hooks/useCategories'
import { useSavingsGoals } from '@/hooks/useGoals'
import { useProfile } from '@/hooks/useProfile'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import type { ParsedExpense } from '@/types/database'
import SavingsTrendChart from '@/components/charts/SavingsTrendChart'
import { safeFormat, safeNum } from '@/lib/ui-utils'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')

  const { data: expenses = [], isLoading: loadingExp } = useExpenses({ from: monthStart, to: monthEnd })
  const { data: allExpenses = [], isLoading: loadingAll } = useExpenses()
  const { data: categories = [], isLoading: loadingCat } = useCategories()
  const { data: goals = [], isLoading: loadingGoals } = useSavingsGoals()
  const { data: profile, isLoading: loadingProfile } = useProfile()
  const addExpense = useAddExpense()

  const [pendingParsed, setPendingParsed] = useState<ParsedExpense | null>(null)

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + safeNum(e.amount), 0),
    [expenses]
  )

  const monthlyIncome = profile?.monthly_income || 0
  const monthlySavingGoal = useMemo(() => {
    const defaultGoal = (goals || []).find(g => g.is_default)
    return defaultGoal ? defaultGoal.target_amount : 0
  }, [goals])

  const budgetRemaining = monthlyIncome - monthlySavingGoal - totalSpent

  const totalSavings = useMemo(
    () => (goals || []).reduce((sum, g) => sum + (g.current_amount || 0), 0),
    [goals]
  )

  const totalSavingsTarget = useMemo(
    () => (goals || []).reduce((sum, g) => sum + (g.target_amount || 0), 0),
    [goals]
  )

  const recentExpenses = useMemo(
    () => (allExpenses || []).slice(0, 5),
    [allExpenses]
  )

  const savingsData = useMemo(() => {
    if (!monthlyIncome) return []
    const data = []
    
    // Find earliest active date (first expense)
    let earliestActiveDate = today
    if ((allExpenses || []).length > 0) {
      const dates = allExpenses.map(e => e.date).filter(Boolean)
      if (dates.length > 0) {
        const earliestExpStr = dates.reduce((min, d) => d < min ? d : min, dates[0] as string)
        const parts = (earliestExpStr || '').split('-')
        if (parts.length >= 3) {
           earliestActiveDate = new Date(parseInt(parts[0] || '0', 10), parseInt(parts[1] || '0', 10) - 1, parseInt(parts[2] || '0', 10))
        }
      }
    }
    const isValidDate = earliestActiveDate instanceof Date && !isNaN(earliestActiveDate.getTime())
    const thresholdDate = isValidDate ? earliestActiveDate : today
    const activeThreshold = new Date(thresholdDate.getFullYear(), thresholdDate.getMonth(), 1)
    
    // Last 6 months (including current)
    for (let i = 0; i < 6; i++) {
        const d = subMonths(today, i)
        const dStart = new Date(d.getFullYear(), d.getMonth(), 1)
        const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
        
        // Zero out savings for months prior to the user joining/starting to track
        if (dStart < activeThreshold && i !== 0) {
            data.push({
                monthStr: format(d, 'MMM'),
                savings: 0
            })
            continue
        }

        let monthExpenses = 0
        allExpenses.forEach(exp => {
            if (!exp.date) return
            const parts = exp.date.split('-')
            if (parts.length < 3) return
            const y = parseInt(parts[0] || '0', 10)
            const m = parseInt(parts[1] || '0', 10)
            const day = parseInt(parts[2] || '0', 10)
            const ed = new Date(y, m - 1, day)
            if (ed >= dStart && ed <= dEnd) {
                monthExpenses += (exp.amount || 0)
            }
        })
        
        const savings = monthlyIncome - monthExpenses
        data.push({
            monthStr: format(d, 'MMM'),
            savings
        })
    }
    return data
  }, [allExpenses, monthlyIncome, today, profile])

  const avgMonthlySavings = useMemo(() => {
      const activeMonths = savingsData.filter(d => d.savings !== 0 || d.monthStr === format(today, 'MMM'))
      if (activeMonths.length === 0) return 0;
      const sum = activeMonths.reduce((acc, curr) => acc + safeNum(curr.savings), 0);
      return safeNum(sum / activeMonths.length);
  }, [savingsData, today])

  const remainingMonths = Math.max(0, 12 - today.getMonth())
  const projectedYearEndSavings = safeNum(totalSavings + (avgMonthlySavings * remainingMonths))

  const handleNeedCategory = useCallback((parsed: ParsedExpense) => {
    setPendingParsed(parsed)
  }, [])

  const handleCategoryCreated = useCallback(
    async (categoryId: string) => {
      if (pendingParsed) {
        await addExpense.mutateAsync({
          amount: pendingParsed.amount,
          category_id: categoryId,
          merchant: pendingParsed.merchant,
          date: pendingParsed.date,
          note: pendingParsed.note,
        })
        setPendingParsed(null)
      }
    },
    [pendingParsed, addExpense]
  )

  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const isLoading = loadingExp || loadingAll || loadingCat || loadingGoals || loadingProfile

  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 rounded-3xl overflow-hidden"
          >
            <FuturisticLoader fullPage text="Analyzing your finances..." />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={container} initial="hidden" animate="show" className={`space-y-6 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      {/* Smart Input */}
      <motion.div variants={item}>
        <SmartExpenseInput onNeedCategory={handleNeedCategory} />
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Spent',
            value: fmt(totalSpent),
            icon: Wallet,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            trend: expenses.length > 0 ? `${expenses.length} expenses` : 'No expenses yet',
            trendUp: false,
          },
          {
            label: 'Budget Left',
            value: fmt(budgetRemaining),
            icon: TrendingDown,
            color: budgetRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400',
            bg: budgetRemaining >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
            trend: monthlyIncome > 0
              ? `${((totalSpent / monthlyIncome) * 100).toFixed(0)}% of income`
              : 'Set income in settings',
            trendUp: budgetRemaining >= 0,
          },
          {
            label: 'Total Savings',
            value: fmt(totalSavings),
            icon: Target,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10',
            trend: avgMonthlySavings > 0
              ? `End-of-year Proj: ${fmt(projectedYearEndSavings)}`
              : 'Keep saving to see projections!',
            trendUp: true,
          },
          {
            label: 'Expenses',
            value: String(expenses.length),
            icon: Receipt,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            trend: `This month`,
            trendUp: true,
          },
        ].map((card, i) => (
          <motion.div key={card.label} variants={item}>
            <BentoCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-100">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trendUp ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-rose-400" />
                    )}
                    <span className="text-xs text-slate-500">{card.trend}</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </BentoCard>
          </motion.div>
        ))}
      </div>

      {/* AI Coach (Full Width) */}
      <motion.div variants={item}>
        <AISavingsCoach 
          monthlyIncome={monthlyIncome}
          monthlySavingGoal={monthlySavingGoal}
          projectedSavings={projectedYearEndSavings}
          goals={goals}
        />
      </motion.div>

      {/* Advanced Budget & Forecast Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <BentoCard className="h-full border border-slate-800/60 bg-slate-900/50">
            <BudgetVsActualChart expenses={expenses} categories={categories} />
          </BentoCard>
        </motion.div>

        <motion.div variants={item}>
          <BentoCard className="h-full border border-slate-800/60 bg-slate-900/50">
             <MonthEndForecast totalBudget={monthlyIncome - monthlySavingGoal} currentSpending={totalSpent} />
          </BentoCard>
        </motion.div>
      </div>

      {/* Main Grid: Graphs & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Row 1: Spending Trend + Category Donut */}
        <motion.div variants={item} className="lg:col-span-2">
          <BentoCard className="h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 shrink-0">Spending Trend (30 Days)</h3>
            <div className="flex-1 w-full min-h-[220px]">
              <SpendingArea expenses={allExpenses} />
            </div>
          </BentoCard>
        </motion.div>

        <motion.div variants={item}>
          <BentoCard className="h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 shrink-0">By Category</h3>
            <div className="flex-1 w-full min-h-[220px] flex flex-col">
              <CategoryDonut expenses={expenses} />
            </div>
          </BentoCard>
        </motion.div>

        {/* Row 2: Savings Trend + Recent Expenses */}
        <motion.div variants={item} className="lg:col-span-2">
          <BentoCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-sm font-semibold text-slate-200">Savings Rate (6 Mo)</h3>
              <p className="text-xs text-slate-400">
                Avg: <span className="font-semibold text-slate-200">{fmt(avgMonthlySavings)}</span> / mo
              </p>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
              <SavingsTrendChart savingsData={savingsData} />
            </div>
          </BentoCard>
        </motion.div>

        <motion.div variants={item}>
          <BentoCard className="h-full">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent Expenses</h3>
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-slate-500">
                No expenses yet. Try the smart input above!
              </p>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex flex-col gap-2 py-2 border-b border-slate-800/40 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                          style={{
                            backgroundColor: `${expense.category?.color || '#64748b'}20`,
                            color: expense.category?.color || '#64748b',
                          }}
                        >
                          {expense.category?.name?.charAt(0) || '?'}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {expense.merchant || expense.category?.name || 'Expense'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {expense.category?.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-200 shrink-0 ml-2">
                        -{fmt(expense.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
                      <span>{safeFormat(expense.date, 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BentoCard>
        </motion.div>
      </div>

      {/* Category Modal */}
      <CategoryConfirmModal onCategoryCreated={handleCategoryCreated} />
    </motion.div>
    </div>
  )
}
