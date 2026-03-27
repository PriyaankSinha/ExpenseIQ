import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format, parseISO, addDays, addWeeks, addMonths, addYears } from 'date-fns'

export default function RecurringProcessor() {
  const { user } = useAuth()
  const processed = useRef(false)

  useEffect(() => {
    if (!user || processed.current) return

    const processRecurring = async () => {
      processed.current = true
      const today = format(new Date(), 'yyyy-MM-dd')
      
      const { data: dueItems, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .lte('next_due_date', today)

      if (error || !dueItems || dueItems.length === 0) return

      for (const item of dueItems) {
        let nextDate = parseISO(item.next_due_date)
        const newExpenses = []
        
        while (format(nextDate, 'yyyy-MM-dd') <= today) {
          newExpenses.push({
            user_id: user.id,
            amount: item.amount,
            category_id: item.category_id,
            merchant: item.merchant,
            date: format(nextDate, 'yyyy-MM-dd'),
            note: 'Auto-logged from recurring'
          })

          if (item.frequency === 'daily') nextDate = addDays(nextDate, 1)
          else if (item.frequency === 'weekly') nextDate = addWeeks(nextDate, 1)
          else if (item.frequency === 'monthly') nextDate = addMonths(nextDate, 1)
          else if (item.frequency === 'yearly') nextDate = addYears(nextDate, 1)
        }

        if (newExpenses.length > 0) {
          const { error: insertErr } = await supabase.from('expenses').insert(newExpenses)
          if (!insertErr) {
            await supabase
              .from('recurring_expenses')
              .update({ next_due_date: format(nextDate, 'yyyy-MM-dd') })
              .eq('id', item.id)
          }
        }
      }
    }

    processRecurring()
  }, [user])

  return null
}
