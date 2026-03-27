export interface Profile {
  id: string
  full_name: string | null
  monthly_income: number | null
  currency: string
  notification_time: string | null
  last_notified_at: string | null
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  user_id: string | null
  monthly_budget: number | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  category_id: string
  merchant: string | null
  date: string
  note: string | null
  created_at: string
  category?: Category
}

export interface RecurringExpense {
  id: string
  user_id: string
  amount: number
  category_id: string
  merchant: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  next_due_date: string
  active: boolean
  created_at: string
  category?: Category
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  is_default: boolean
  created_at: string
}

export interface ParsedExpense {
  amount: number
  currency: string
  category_name: string
  merchant: string | null
  note: string | null
  date: string
}

export interface CategorySuggestion {
  icon: string
  color: string
}
