import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Search, Filter, Calendar, Receipt } from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import CustomSelect from '@/components/ui/CustomSelect'
import { useExpenses, useAddExpense, useDeleteExpense } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { format } from 'date-fns'
import { useProfile } from '@/hooks/useProfile'

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses()
  const { data: categories = [] } = useCategories()
  const deleteExpense = useDeleteExpense()
  const addExpense = useAddExpense()
  const { data: profile } = useProfile()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category_id: '',
    merchant: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  })

  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = !categoryFilter || e.category_id === categoryFilter
      return matchSearch && matchCategory
    })
  }, [expenses, searchQuery, categoryFilter])

  const handleAdd = async () => {
    if (!newExpense.amount || !newExpense.category_id) return
    await addExpense.mutateAsync({
      amount: parseFloat(newExpense.amount),
      category_id: newExpense.category_id,
      merchant: newExpense.merchant || null,
      date: newExpense.date,
      note: newExpense.note || null,
    })
    setNewExpense({ amount: '', category_id: '', merchant: '', date: format(new Date(), 'yyyy-MM-dd'), note: '' })
    setShowAddForm(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">
            {expenses.length} total expenses • {fmt(expenses.reduce((s, e) => s + e.amount, 0))} spent
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="relative z-50"
        >
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4">New Expense</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="input-dark"
              />
              <CustomSelect
                value={newExpense.category_id}
                onChange={(v) => setNewExpense({ ...newExpense, category_id: v })}
                options={categories.map((c) => ({ label: c.name, value: c.id, color: c.color }))}
                placeholder="Category"
              />
              <input
                type="text"
                placeholder="Merchant"
                value={newExpense.merchant}
                onChange={(e) => setNewExpense({ ...newExpense, merchant: e.target.value })}
                className="input-dark"
              />
              <CustomDatePicker
                value={newExpense.date}
                onChange={(v) => setNewExpense({ ...newExpense, date: v })}
                placeholder="Date"
              />
              <button onClick={handleAdd} disabled={addExpense.isPending} className="btn-primary">
                {addExpense.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
            <input
              type="text"
              placeholder="Note (optional)"
              value={newExpense.note}
              onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
              className="input-dark mt-3"
            />
          </BentoCard>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-3 relative z-40">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark pl-10 py-2 text-sm"
          />
        </div>
        <CustomSelect
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v)}
          options={[{ label: 'All Categories', value: '' }, ...categories.map((c) => ({ label: c.name, value: c.id, color: c.color }))]}
          className="w-48"
          icon={<Filter className="w-4 h-4" />}
        />
      </div>

      {/* Expense List */}
      <BentoCard hover={false}>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
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
                className="flex items-center justify-between py-3 group"
              >
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
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-200">
                    -{fmt(expense.amount)}
                  </span>
                  <button
                    onClick={() => deleteExpense.mutate(expense.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </BentoCard>
    </motion.div>
  )
}
