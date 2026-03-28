import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Tags, Settings, Activity, Trash2, Edit2, X } from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { useCategories, useAddCategory, useUpdateCategoryBudget, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories'
import { useExpenses } from '@/hooks/useExpenses'
import { useProfile } from '@/hooks/useProfile'
import { suggestCategoryMeta } from '@/lib/ai'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const { data: profile } = useProfile()
  
  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
  const { data: expenses = [] } = useExpenses({ from: monthStart, to: monthEnd })

  const addCategory = useAddCategory()
  const updateBudget = useUpdateCategoryBudget()
  const deleteCategory = useDeleteCategory()
  const updateCategory = useUpdateCategory()

  const [showAdd, setShowAdd] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3b82f6')
  const [addingAI, setAddingAI] = useState(false)

  // Edit states
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', budget: '', color: '' })

  const [confirmDeleteCat, setConfirmDeleteCat] = useState<{ id: string, name: string } | null>(null)

  const currencyCode = profile?.currency || 'USD'
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(n)

  const handleAddCustom = async () => {
    if (!newCatName) return
    setAddingAI(true)
    try {
      const meta = await suggestCategoryMeta(newCatName)
      await addCategory.mutateAsync({
        name: newCatName,
        icon: meta.icon,
        color: newCatColor
      })
      setNewCatName('')
      setNewCatColor('#3b82f6')
      setShowAdd(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAddingAI(false)
    }
  }

  const handleSaveEdit = async (cat: any) => {
    const val = parseFloat(editForm.budget)
    const newBudget = isNaN(val) || val <= 0 ? null : val
    
    if (cat.user_id && (editForm.name !== cat.name || editForm.color !== cat.color)) {
      await updateCategory.mutateAsync({ id: cat.id, name: editForm.name, icon: cat.icon, color: editForm.color })
    }
    
    await updateBudget.mutateAsync({ id: cat.id, monthly_budget: newBudget })
    setEditingCatId(null)
  }

  const calculateSpent = (catId: string) => {
    return expenses.filter(e => e.category_id === catId).reduce((sum, e) => sum + e.amount, 0)
  }

  if (isLoading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Categories & Budgets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage where your money goes</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Create Custom Category
            </h3>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={newCatColor} 
                onChange={(e) => setNewCatColor(e.target.value)} 
                className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 bg-transparent p-0"
              />
              <input
                type="text"
                placeholder="E.g., Dog Toys, Subscription, Hobby..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="input-dark flex-1"
                disabled={addingAI}
              />
              <button type="button" onClick={() => setShowAdd(false)} disabled={addingAI} className="px-4 text-slate-400 hover:text-slate-200">
                Cancel
              </button>
              <button disabled={addingAI} onClick={handleAddCustom} className="btn-primary">
                {addingAI ? 'Creating...' : 'Create'}
              </button>
            </div>
          </BentoCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const spent = calculateSpent(cat.id)
          const isOver = cat.monthly_budget ? spent > cat.monthly_budget : false
          const progress = cat.monthly_budget ? Math.min((spent / cat.monthly_budget) * 100, 100) : 0
          const isEditing = editingCatId === cat.id

          return (
            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <BentoCard className="flex flex-col h-full border border-slate-800/50 hover:border-slate-700/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 shrink-0 h-10 rounded-xl flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      {cat.name.charAt(0)}
                    </div>
                    
                    {isEditing && cat.user_id ? (
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                        className="input-dark py-1 px-2 text-sm w-full"
                      />
                    ) : (
                      <div className="truncate">
                        <h3 className="font-semibold text-slate-200 truncate pr-2">{cat.name}</h3>
                        <p className="text-xs text-slate-500">
                          {cat.user_id ? 'Custom' : 'Default'}
                        </p>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => {
                            setEditingCatId(cat.id)
                            setEditForm({ name: cat.name, budget: cat.monthly_budget?.toString() || '', color: cat.color })
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {cat.user_id && (
                        <button
                          onClick={() => setConfirmDeleteCat({ id: cat.id, name: cat.name })}
                          className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-auto space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex gap-3">
                      {cat.user_id && (
                        <div className="shrink-0">
                          <label className="text-xs text-slate-400 block mb-1">Color</label>
                          <input
                            type="color"
                            value={editForm.color}
                            onChange={(e) => setEditForm(prev => ({...prev, color: e.target.value}))}
                            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                          <label className="text-xs text-slate-400 block mb-1">Monthly Budget Limit</label>
                          <input
                          type="number"
                          placeholder="E.g., 500"
                          value={editForm.budget}
                          onChange={(e) => setEditForm(prev => ({...prev, budget: e.target.value}))}
                          className="input-dark py-1 text-sm w-full"
                          />
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setEditingCatId(null)} className="flex-1 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200">
                          Cancel
                        </button>
                        <button onClick={() => handleSaveEdit(cat)} className="btn-primary flex-1 py-1.5 text-sm">
                          Save
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t border-slate-800/60">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Spent this month</span>
                      <span className={`font-medium ${isOver ? 'text-rose-400' : 'text-slate-200'}`}>
                        {fmt(spent)}
                      </span>
                    </div>
                    {cat.monthly_budget ? (
                      <>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{progress.toFixed(0)}%</span>
                          <span>Budget: {fmt(cat.monthly_budget)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">No budget set</p>
                    )}
                  </div>
                )}
              </BentoCard>
            </motion.div>
          )
        })}
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteCat}
        title="Delete Category"
        message={`Are you sure you want to delete '${confirmDeleteCat?.name}'? Any related expenses will be permanently disconnected from this category.`}
        confirmText="Delete Category"
        onCancel={() => setConfirmDeleteCat(null)}
        onConfirm={() => {
          if (confirmDeleteCat) deleteCategory.mutate(confirmDeleteCat.id)
        }}
      />
    </motion.div>
  )
}
