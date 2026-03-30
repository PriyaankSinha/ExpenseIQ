import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Search, Filter, Calendar, Receipt, Edit2, X } from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import CustomSelect from '@/components/ui/CustomSelect'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { useExpenses, useAddExpense, useDeleteExpense, useUpdateExpense } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { format } from 'date-fns'
import { useProfile } from '@/hooks/useProfile'
import FuturisticLoader from '@/components/ui/FuturisticLoader'
import { safeFormat } from '@/lib/ui-utils'

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses()
  const { data: categories = [] } = useCategories()
  const deleteExpense = useDeleteExpense()
  const addExpense = useAddExpense()
  const { data: profile } = useProfile()

  const updateExpense = useUpdateExpense()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  
  const defaultForm = {
    amount: '',
    category_id: '',
    merchant: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  }
  
  const [form, setForm] = useState(defaultForm)

  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set<string>()
    expenses.forEach(e => {
        if (e.date) uniqueMonths.add(e.date.slice(0, 7))
    })
    
    return Array.from(uniqueMonths)
      .sort((a, b) => b.localeCompare(a)) // Sort desc (recent first)
      .map(monthStr => {
        const parts = monthStr.split('-')
        const d = new Date(parseInt(parts[0] || '0', 10), parseInt(parts[1] || '0', 10) - 1, 1)
        return {
           label: format(d, 'MMMM yyyy'),
           value: monthStr
        }
      })
  }, [expenses])

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = !categoryFilter || e.category_id === categoryFilter
      const matchMonth = !monthFilter || (e.date && e.date.startsWith(monthFilter))
      return matchSearch && matchCategory && matchMonth
    })
  }, [expenses, searchQuery, categoryFilter, monthFilter])

  const handleSave = async () => {
    if (!form.amount || !form.category_id) return
    
    if (editingId) {
      await updateExpense.mutateAsync({
        id: editingId,
        amount: parseFloat(form.amount),
        category_id: form.category_id,
        merchant: form.merchant || null,
        date: form.date,
        note: form.note || null,
      })
      setEditingId(null)
    } else {
      await addExpense.mutateAsync({
        amount: parseFloat(form.amount),
        category_id: form.category_id,
        merchant: form.merchant || null,
        date: form.date,
        note: form.note || null,
      })
      setShowAddForm(false)
    }
    setForm(defaultForm)
  }

  const startEdit = (e: any) => {
    setForm({
      amount: e.amount.toString(),
      category_id: e.category_id,
      merchant: e.merchant || '',
      date: e.date,
      note: e.note || '',
    })
    setEditingId(e.id)
    setShowAddForm(false)
  }

  const cancelAddOrEdit = () => {
    setShowAddForm(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">
            {expenses.length} total expenses • {fmt(expenses.reduce((s, e) => s + e.amount, 0))} spent
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm || editingId) cancelAddOrEdit()
            else setShowAddForm(true)
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {showAddForm || editingId ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4" />}
          {showAddForm || editingId ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="relative z-50"
        >
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex justify-between">
              {editingId ? 'Edit Expense' : 'New Expense'}
              {editingId && (
                <button onClick={cancelAddOrEdit} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-dark"
              />
              <CustomSelect
                value={form.category_id}
                onChange={(v) => setForm({ ...form, category_id: v })}
                options={categories.map((c) => ({ label: c.name, value: c.id, color: c.color }))}
                placeholder="Category"
              />
              <input
                type="text"
                placeholder="Merchant"
                value={form.merchant}
                onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                className="input-dark"
              />
              <CustomDatePicker
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                placeholder="Date"
              />
              <button 
                onClick={handleSave} 
                disabled={addExpense.isPending || updateExpense.isPending} 
                className="btn-primary"
              >
                {editingId 
                  ? (updateExpense.isPending ? 'Saving...' : 'Save') 
                  : (addExpense.isPending ? 'Adding...' : 'Add')}
              </button>
            </div>
            <input
              type="text"
              placeholder="Note (optional)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input-dark mt-3"
            />
          </BentoCard>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-3 relative z-40 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark pl-10 py-2 text-sm w-full"
          />
        </div>
        <CustomSelect
          value={monthFilter}
          onChange={(v) => setMonthFilter(v)}
          options={[{ label: 'All Time', value: '' }, ...monthOptions]}
          className="w-full sm:w-40 shrink-0"
          icon={<Calendar className="w-4 h-4" />}
        />
        <CustomSelect
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v)}
          options={[{ label: 'All Categories', value: '' }, ...categories.map((c) => ({ label: c.name, value: c.id, color: c.color }))]}
          className="w-full sm:w-48 shrink-0"
          icon={<Filter className="w-4 h-4" />}
        />
      </div>

      {/* Expense List */}
      <BentoCard hover={false}>
        {isLoading ? (
          <FuturisticLoader fullPage text="Syncing expenses..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No expenses found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {filtered.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-3 group"
              >
                {/* Desktop Version */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: `${expense.category?.color || '#64748b'}20`,
                        color: expense.category?.color || '#64748b',
                      }}
                    >
                      {expense.category?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {expense.merchant || expense.category?.name || 'Expense'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{expense.category?.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </span>
                        {expense.note && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{expense.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-200 mr-2">
                      -{fmt(expense.amount)}
                    </span>
                    <button
                      onClick={() => {
                        startEdit(expense)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(expense.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Version (Card Style) */}
                <div className="flex sm:hidden flex-col gap-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                          style={{
                            backgroundColor: `${expense.category?.color || '#64748b'}20`,
                            color: expense.category?.color || '#64748b',
                          }}
                        >
                          {expense.category?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-slate-100">
                            {expense.merchant || expense.category?.name || 'Expense'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {expense.category?.name}
                          </p>
                        </div>
                     </div>
                     <span className="text-base font-bold text-slate-100">
                        -{fmt(expense.amount)}
                     </span>
                   </div>

                   <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </span>
                        {expense.note && (
                          <p className="text-xs text-slate-400 italic line-clamp-1">{expense.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            startEdit(expense)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 active:text-sky-400 active:bg-sky-500/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(expense.id)}
                          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 active:text-rose-400 active:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </BentoCard>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteExpense.mutate(confirmDeleteId)
          setConfirmDeleteId(null)
        }}
      />
    </motion.div>
  )
}
