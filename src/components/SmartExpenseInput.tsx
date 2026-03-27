import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { parseExpense } from '@/lib/ai'
import { useCategories, findCategoryByName } from '@/hooks/useCategories'
import { useAddExpense } from '@/hooks/useExpenses'
import { useProfile } from '@/hooks/useProfile'
import { useAppDispatch } from '@/store'
import { openCategoryModal, setSmartInputLoading } from '@/store/slices/uiSlice'
import type { ParsedExpense } from '@/types/database'

interface SmartExpenseInputProps {
  onNeedCategory: (parsed: ParsedExpense) => void
}

export default function SmartExpenseInput({ onNeedCategory }: SmartExpenseInputProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ParsedExpense | null>(null)
  const { data: categories } = useCategories()
  const { data: profile } = useProfile()
  const addExpense = useAddExpense()
  const dispatch = useAppDispatch()
  const inputRef = useRef<HTMLInputElement>(null)

  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || loading) return

    setLoading(true)
    dispatch(setSmartInputLoading(true))

    try {
      const parsed = await parseExpense(text, currency)
      setPreview(parsed)

      const existingCategory = categories
        ? findCategoryByName(categories, parsed.category_name)
        : undefined

      if (existingCategory) {
        await addExpense.mutateAsync({
          amount: parsed.amount,
          category_id: existingCategory.id,
          merchant: parsed.merchant,
          date: parsed.date,
          note: parsed.note,
        })
        setText('')
        setPreview(null)
      } else {
        onNeedCategory(parsed)
        dispatch(
          openCategoryModal({
            categoryName: parsed.category_name,
          })
        )
      }
    } catch (err) {
      console.error('Smart parse failed:', err)
    } finally {
      setLoading(false)
      dispatch(setSmartInputLoading(false))
    }
  }, [text, loading, categories, addExpense, dispatch, onNeedCategory, currency])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={`Try "Spent 42 ${currency} at Whole Foods on groceries"`}
          className="input-dark pl-10 pr-12 py-3 text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {preview && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 text-xs"
        >
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {fmt(preview.amount)}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {preview.category_name}
          </span>
          {preview.merchant && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {preview.merchant}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {preview.date}
          </span>
        </motion.div>
      )}
    </div>
  )
}
