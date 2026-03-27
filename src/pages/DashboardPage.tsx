import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
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
import CategoryConfirmModal from '@/components/modals/CategoryConfirmModal'
import { useExpenses, useAddExpense } from '@/hooks/useExpenses'
import { useCategories, findCategoryByName } from '@/hooks/useCategories'
import { useSavingsGoals } from '@/hooks/useGoals'
import { useProfile } from '@/hooks/useProfile'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import type { ParsedExpense } from '@/types/database'
import SavingsTrendChart from '@/components/charts/SavingsTrendChart'

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

  const { data: expenses = [] } = useExpenses({ from: monthStart, to: monthEnd })
  const { data: allExpenses = [] } = useExpenses()
  const { data: categories = [] } = useCategories()
  const { data: goals = [] } = useSavingsGoals()
  const { data: profile } = useProfile()
  const addExpense = useAddExpense()

  const [pendingParsed, setPendingParsed] = useState<ParsedExpense | null>(null)

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const monthlyIncome = profile?.monthly_income || 0
  const monthlySavingGoal = useMemo(() => {
    const defaultGoal = goals.find(g => g.is_default)
    return defaultGoal ? defaultGoal.target_amount : 0
  }, [goals])

  const budgetRemaining = monthlyIncome - monthlySavingGoal - totalSpent

  const totalSavings = useMemo(
    () => goals.reduce((sum, g) => sum + g.current_amount, 0),
    [goals]
  )

  const totalSavingsTarget = useMemo(
    () => goals.reduce((sum, g) => sum + g.target_amount, 0),
    [goals]
  )

  const recentExpenses = useMemo(
    () => allExpenses.slice(0, 5),
    [allExpenses]
  )

  const savingsData = useMemo(() => {
    if (!monthlyIncome) return []
    const data = []
    
    // Last 6 months (including current)
    for (let i = 0; i < 6; i++) {
        const d = subMonths(today, i)
        const dStart = new Date(d.getFullYear(), d.getMonth(), 1)
        const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
        
        let monthExpenses = 0
        allExpenses.forEach(exp => {
            // Need to parse date without timezone shifting issues
            const parts = exp.date.split('-')
            const y = parseInt(parts[0] || '0', 10)
            const m = parseInt(parts[1] || '0', 10)
            const day = parseInt(parts[2] || '0', 10)
            const ed = new Date(y, m - 1, day)
            if (ed >= dStart && ed <= dEnd) {
                monthExpenses += exp.amount
            }
        })
        
        const savings = monthlyIncome - monthExpenses
        data.push({
            monthStr: format(d, 'MMM'),
            savings
        })
    }
    return data
  }, [allExpenses, monthlyIncome, today])

  const avgMonthlySavings = useMemo(() => {
      if (savingsData.length === 0) return 0;
      const sum = savingsData.reduce((acc, curr) => acc + curr.savings, 0);
      return sum / savingsData.length;
  }, [savingsData])

  const remainingMonths = 12 - today.getMonth()
  const projectedYearEndSavings = totalSavings + (avgMonthlySavings * remainingMonths)

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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
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

      {/* Charts & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Spending Trend */}
        <motion.div variants={item} className="xl:col-span-2">
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Spending Trend</h3>
            <SpendingArea expenses={allExpenses} />
          </BentoCard>
        </motion.div>

        {/* AI Coach */}
        <motion.div variants={item}>
          <AISavingsCoach 
            monthlyIncome={monthlyIncome}
            monthlySavingGoal={monthlySavingGoal}
            projectedSavings={projectedYearEndSavings}
            goals={goals}
          />
        </motion.div>
      </div>

      {/* Savings Trend */}
      <motion.div variants={item}>
        <BentoCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Savings Rate (6 Mo)</h3>
            <p className="text-xs text-slate-400">
              Avg: <span className="font-semibold text-slate-200">{fmt(avgMonthlySavings)}</span> / mo
            </p>
          </div>
          <SavingsTrendChart savingsData={savingsData} />
        </BentoCard>
      </motion.div>

      {/* Recent & Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Expenses */}
        <motion.div variants={item} className="lg:col-span-2">
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent Expenses</h3>
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-slate-500">
                No expenses yet. Try the smart input above!
              </p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0"
                  >
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
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {expense.merchant || expense.category?.name || 'Expense'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {expense.category?.name} • {format(new Date(expense.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      -{fmt(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </BentoCard>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div variants={item}>
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4">By Category</h3>
            <CategoryDonut expenses={expenses} />
          </BentoCard>
        </motion.div>
      </div>

      {/* Category Modal */}
      <CategoryConfirmModal onCategoryCreated={handleCategoryCreated} />
    </motion.div>
  )
}
