import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Expense } from '@/types/database'
import { useProfile } from '@/hooks/useProfile'

interface CategoryDonutProps {
  expenses: Expense[]
}

const COLORS = [
  '#10b981', '#34d399', '#6ee7b7', '#059669',
  '#0ea5e9', '#38bdf8', '#a855f7', '#c084fc',
  '#f59e0b', '#fbbf24', '#f43f5e', '#fb7185',
]

export default function CategoryDonut({ expenses }: CategoryDonutProps) {
  const { data: profile } = useProfile()
  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const categoryMap = new Map<string, { name: string; total: number; color: string }>()

  expenses.forEach((e) => {
    const cat = e.category
    const key = cat?.name || 'Uncategorized'
    const existing = categoryMap.get(key)
    if (existing) {
      existing.total += e.amount
    } else {
      categoryMap.set(key, {
        name: key,
        total: e.amount,
        color: cat?.color || '#64748b',
      })
    }
  })

  const data = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        No expenses to display
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="total"
            nameKey="name"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]!} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: '0.75rem',
              color: '#f1f5f9',
              fontSize: '0.875rem',
            }}
            formatter={(value: number) => [fmt(value), 'Amount']}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-2 justify-center">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color || COLORS[i % COLORS.length] }}
            />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}
