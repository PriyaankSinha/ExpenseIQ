import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { useProfile } from '@/hooks/useProfile'

interface SavingsTrendChartProps {
  savingsData: {
    monthStr: string
    savings: number
  }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { data: profile } = useProfile()
  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  if (active && payload && payload.length) {
    const isPositive = payload[0].value >= 0
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 text-sm mb-1">{label}</p>
        <p className={`text-base font-bold ${isPositive ? 'text-sky-400' : 'text-rose-400'}`}>
          {isPositive ? '+' : ''}{fmt(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function SavingsTrendChart({ savingsData }: SavingsTrendChartProps) {
  const chartData = useMemo(() => {
    return [...savingsData].reverse()
  }, [savingsData])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Not enough logging history to show trends.
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="monthStr" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            width={50}
            tickFormatter={(value) => {
              if (value === 0) return '0'
              const absVal = Math.abs(value)
              const formatted = absVal >= 1000 ? `${(absVal / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${absVal}`
              return value > 0 ? `+${formatted}` : `-${formatted}`
            }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: '#334155', opacity: 0.4 }} 
          />
          <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.savings >= 0 ? 'url(#colorSavings)' : 'url(#colorDeficit)'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
