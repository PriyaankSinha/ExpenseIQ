import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Sparkles } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store'
import { closeCategoryModal } from '@/store/slices/uiSlice'
import { useAddCategory } from '@/hooks/useCategories'
import { suggestCategoryMeta } from '@/lib/ai'
import { useState, useEffect } from 'react'

interface CategoryConfirmModalProps {
  onCategoryCreated: (categoryId: string) => void
}

export default function CategoryConfirmModal({ onCategoryCreated }: CategoryConfirmModalProps) {
  const { isOpen, categoryName } = useAppSelector((s) => s.ui.categoryModal)
  const dispatch = useAppDispatch()
  const addCategory = useAddCategory()
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<{ icon: string; color: string } | null>(null)
  const [customColor, setCustomColor] = useState('#3b82f6')

  useEffect(() => {
    if (isOpen) {
      setCustomColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'))
    }
  }, [isOpen])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      let meta = suggestion
      if (!meta) {
        meta = await suggestCategoryMeta(categoryName)
        setSuggestion(meta)
      }
      const result = await addCategory.mutateAsync({
        name: categoryName,
        icon: meta.icon,
        color: customColor,
      })
      onCategoryCreated(result.id)
      dispatch(closeCategoryModal())
      setSuggestion(null)
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    dispatch(closeCategoryModal())
    setSuggestion(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="glass-card p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">New Category</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 mb-6">
              I don't recognize{' '}
              <span className="font-semibold text-amber-400">"{categoryName}"</span>.
              Should I create a new category for this?
            </p>

            {suggestion ? (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">
                  AI suggests icon:{' '}
                  <code className="text-emerald-400">{suggestion.icon}</code>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-sm text-slate-300">Choose category color:</span>
                <input 
                  type="color" 
                  value={customColor} 
                  onChange={(e) => setCustomColor(e.target.value)} 
                  className="w-8 h-8 rounded cursor-pointer shrink-0 border-0 bg-transparent p-0"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleClose} className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="spinner w-5! h-5! border-2!" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Category
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
