import { useMemo } from 'react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useExpenses } from './useExpenses'
import { useCategories } from './useCategories'

export interface BudgetNotification {
  id: string
  type: 'warning' | 'critical'
  title: string
  message: string
  timestamp: string
  categoryName: string
  percentage: number
}

export function useBudgetNotifications() {
  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd = endOfMonth(now).toISOString()

  const { data: expenses, isLoading: loadingExpenses } = useExpenses({
    from: monthStart,
    to: monthEnd,
  })
  const { data: categories, isLoading: loadingCategories } = useCategories()

  const notifications = useMemo(() => {
    if (!expenses || !categories) return []

    // Calculate total spent per category
    const categorySpending: Record<string, number> = {}
    expenses.forEach((expense) => {
      categorySpending[expense.category_id] = (categorySpending[expense.category_id] || 0) + expense.amount
    })

    const alerts: BudgetNotification[] = []

    categories.forEach((category) => {
      const budget = category.monthly_budget
      if (!budget || budget <= 0) return

      const spent = categorySpending[category.id] || 0
      const percentage = (spent / budget) * 100

      if (percentage >= 100) {
        alerts.push({
          id: `critical-${category.id}-${format(now, 'yyyy-MM')}`,
          type: 'critical',
          title: 'Budget Exceeded',
          message: `You've spent ₹${spent.toLocaleString()} in ${category.name}, exceeding your ₹${budget.toLocaleString()} budget.`,
          timestamp: format(now, 'MMM d, h:mm a'),
          categoryName: category.name,
          percentage,
        })
      } else if (percentage >= 80) {
        alerts.push({
          id: `warning-${category.id}-${format(now, 'yyyy-MM')}`,
          type: 'warning',
          title: 'Budget Warning',
          message: `You've reached ${Math.round(percentage)}% of your ₹${budget.toLocaleString()} budget for ${category.name}.`,
          timestamp: format(now, 'MMM d, h:mm a'),
          categoryName: category.name,
          percentage,
        })
      }
    })

    // Sort by importance (critical first)
    return alerts.sort((a, b) => (a.type === 'critical' ? -1 : 1))
  }, [expenses, categories])

  return {
    notifications,
    count: notifications.length,
    isLoading: loadingExpenses || loadingCategories,
  }
}
