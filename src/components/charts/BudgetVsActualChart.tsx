import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'
import type { Expense, Category } from '@/types/database'
import { useProfile } from '@/hooks/useProfile'
import { safeNum } from '@/lib/ui-utils'

interface BudgetVsActualChartProps {
  expenses: Expense[]
  categories: Category[]
}

const CustomTooltip = ({ active, payload, label, fmt }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-xl">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 text-sm mb-1 last:mb-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}</span>
            </div>
            <span className="font-semibold text-slate-100">{fmt(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function BudgetVsActualChart({ expenses, categories }: BudgetVsActualChartProps) {
  const { data: profile } = useProfile()
  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

  // Only consider categories that have a monthly budget set
  const data = useMemo(() => {
    const budgetedCategories = categories.filter(c => (c.monthly_budget || 0) > 0)
    
    const aggregated = budgetedCategories.map(cat => {
      const budget = safeNum(cat.monthly_budget)
      const spent = expenses
        .filter(e => e.category_id === cat.id)
        .reduce((sum, e) => sum + safeNum(e.amount), 0)
        
      const ratio = safeNum(budget > 0 ? (spent / budget) * 100 : 0)
      
      return {
        id: cat.id,
        name: cat.name,
        budget,
        spent,
        ratio,
        color: cat.color || '#3b82f6'
      }
    })

    // Sort heavily spent categories highest? Or maybe by ratio
    return aggregated.sort((a, b) => b.budget - a.budget)
  }, [categories, expenses])

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
        <p className="mb-2">No category budgets defined.</p>
        <p className="text-xs">Go to your Categories dashboard and set monthly limits to unlock this chart.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Dynamic customized legend rendered physically above or below */}
      <div className="flex justify-between items-center px-1 mb-2">
        <h3 className="text-base font-semibold text-slate-100">Budget vs Actual</h3>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            Budget
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Spent
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => {
                if (value === 0) return '0'
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                return `${value}`
              }}
            />
            <Tooltip 
              content={<CustomTooltip fmt={fmt} />}
              cursor={{ fill: '#334155', opacity: 0.2 }}
            />
            
            {/* Darker Baseline Budget Bars */}
            <Bar dataKey="budget" name="Budget" fill="#334155" radius={[2, 2, 0, 0]} barSize={16} />
            
            {/* Dynamic Spilled spent bars */}
            <Bar dataKey="spent" name="Spent" radius={[2, 2, 0, 0]} barSize={16}>
              {data.map((entry) => (
                <Cell 
                   key={`cell-${entry.name}`} 
                   fill={entry.color} 
                   opacity={entry.ratio > 100 ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-column Custom Grid Legend matching Screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-2 mt-2 px-1 text-xs">
        {data.map(item => {
          const isOver = item.ratio >= 100
          const colorClass = isOver ? 'text-rose-400' : item.ratio >= 80 ? 'text-amber-400' : 'text-slate-400'
          
          return (
            <div key={item.name} className="flex items-center gap-2">
              <span 
                className="w-1.5 h-4 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-slate-400 truncate w-20 shrink-0">{item.name}</span>
              <span className={`font-bold ml-auto ${colorClass}`}>
                {item.ratio.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
