import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Expense } from '@/types/database'

export function useExpenses(dateRange?: { from: string; to: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['expenses', user?.id, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })

      if (dateRange?.from) query = query.gte('date', dateRange.from)
      if (dateRange?.to) query = query.lte('date', dateRange.to)

      const { data, error } = await query
      if (error) throw error
      return data as (Expense & { category: NonNullable<Expense['category']> })[]
    },
    enabled: !!user,
  })
}

export function useRecentExpenses(limit: number = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['expenses', 'recent', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as (Expense & { category: NonNullable<Expense['category']> })[]
    },
    enabled: !!user,
  })
}

export function useAddExpense() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (expense: {
      amount: number
      category_id: string
      merchant?: string | null
      date: string
      note?: string | null
    }) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...expense, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
