import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Category } from '@/types/database'

export function useCategories() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*, category_budgets(amount)')
        .or(`user_id.is.null,user_id.eq.${user!.id}`)
        .order('name')

      if (error) throw error
      return data.map((c: any) => ({
        ...c,
        monthly_budget: c.category_budgets?.[0]?.amount || null
      })) as Category[]
    },
    enabled: !!user,
  })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (category: { name: string; icon: string; color: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...category, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategoryBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, monthly_budget }: { id: string; monthly_budget: number | null }) => {
      if (!monthly_budget) {
        const { error } = await supabase
          .from('category_budgets')
          .delete()
          .eq('category_id', id)
          .eq('user_id', user!.id)
        
        if (error) throw error
        return null
      }

      const { data, error } = await supabase
        .from('category_budgets')
        .upsert(
          { user_id: user!.id, category_id: id, amount: monthly_budget },
          { onConflict: 'user_id, category_id' }
        )
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, name, icon, color }: { id: string; name: string; icon: string; color: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ name, icon, color })
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function findCategoryByName(categories: Category[], name: string): Category | undefined {
  return categories.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  )
}
