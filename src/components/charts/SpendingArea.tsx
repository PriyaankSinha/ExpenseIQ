import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns'
import type { Expense } from '@/types/database'
import { useProfile } from '@/hooks/useProfile'
import { safeFormat, safeNum } from '@/lib/ui-utils'

interface SpendingAreaProps {
  expenses: Expense[]
  days?: number
}

export default function SpendingArea({ expenses, days = 30 }: SpendingAreaProps) {
  const { data: profile } = useProfile()
  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const end = startOfDay(new Date())
  const start = subDays(end, days - 1)

  const dailyMap = new Map<string, number>()
  const interval = eachDayOfInterval({ start, end })

  interval.forEach((d) => {
    dailyMap.set(format(d, 'yyyy-MM-dd'), 0)
  })

  expenses.forEach((e) => {
    const dateStr = e.date || ''
    if (dailyMap.has(dateStr)) {
      const current = safeNum(dailyMap.get(dateStr))
      dailyMap.set(dateStr, current + safeNum(e.amount))
    }
  })

  const data = Array.from(dailyMap.entries()).map(([date, amount]) => ({
    date,
    amount: safeNum(amount),
    label: safeFormat(date, 'MMM dd'),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => fmt(v)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: '0.75rem',
            color: '#f1f5f9',
            fontSize: '0.875rem',
          }}
          itemStyle={{ color: '#f8fafc' }}
          formatter={(value: number) => [fmt(value), 'Spent']}
          labelFormatter={(label) => `${label}`}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#emeraldGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
