import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { RecurringExpense } from '@/types/database'

export function useRecurringExpenses() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recurring_expenses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select(`*, category:categories(*)`)
        .eq('user_id', user!.id)
        .order('next_due_date', { ascending: true })

      if (error) throw error
      return data as RecurringExpense[]
    },
    enabled: !!user,
  })
}

export function useAddRecurring() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (expense: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'category'>) => {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert({ ...expense, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data as RecurringExpense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_expenses'] })
    },
  })
}

export function useToggleRecurring() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update({ active })
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data as RecurringExpense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_expenses'] })
    },
  })
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_expenses'] })
    },
  })
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (expense: Omit<RecurringExpense, 'user_id' | 'created_at' | 'category' | 'active'>) => {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update({
          amount: expense.amount,
          merchant: expense.merchant,
          category_id: expense.category_id,
          frequency: expense.frequency,
          next_due_date: expense.next_due_date,
        })
        .eq('id', expense.id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data as RecurringExpense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_expenses'] })
    },
  })
}
