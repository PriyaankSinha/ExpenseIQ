import { useState } from 'react'
import { motion } from 'framer-motion'
import { Repeat, Plus, Trash2, Calendar, X, Edit2 } from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import CustomSelect from '@/components/ui/CustomSelect'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { useCategories } from '@/hooks/useCategories'
import { useProfile } from '@/hooks/useProfile'
import { useRecurringExpenses, useAddRecurring, useToggleRecurring, useDeleteRecurring, useUpdateRecurring } from '@/hooks/useRecurring'
import { format, parseISO } from 'date-fns'

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const

export default function RecurringPage() {
  const { data: recurring = [], isLoading } = useRecurringExpenses()
  const { data: categories = [] } = useCategories()
  const { data: profile } = useProfile()
  
  const addRecurring = useAddRecurring()
  const toggleRecurring = useToggleRecurring()
  const deleteRecurring = useDeleteRecurring()
  const updateRecurring = useUpdateRecurring()

  const [showAdd, setShowAdd] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  
  const defaultForm = {
    amount: '',
    merchant: '',
    category_id: categories[0]?.id || '',
    frequency: 'monthly' as any,
    next_due_date: format(new Date(), 'yyyy-MM-dd')
  }
  
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const currencyCode = profile?.currency || 'USD'
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(n)

  const handleSave = async () => {
    if (!form.amount || !form.category_id) return
    
    if (editingId) {
      await updateRecurring.mutateAsync({
        id: editingId,
        amount: parseFloat(form.amount),
        merchant: form.merchant || null,
        category_id: form.category_id,
        frequency: form.frequency,
        next_due_date: form.next_due_date,
      })
      setEditingId(null)
    } else {
      await addRecurring.mutateAsync({
        amount: parseFloat(form.amount),
        merchant: form.merchant || null,
        category_id: form.category_id,
        frequency: form.frequency,
        next_due_date: form.next_due_date,
        active: true
      })
      setShowAdd(false)
    }
    setForm(defaultForm)
  }

  const startEdit = (item: any) => {
    setForm({
      amount: item.amount.toString(),
      merchant: item.merchant || '',
      category_id: item.category_id,
      frequency: item.frequency as any,
      next_due_date: item.next_due_date
    })
    setEditingId(item.id)
    setShowAdd(false)
  }

  const cancelAddOrEdit = () => {
    setShowAdd(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  if (isLoading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Recurring Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Manage subscriptions & repeating bills</p>
        </div>
        <button
          onClick={() => {
            if (showAdd) cancelAddOrEdit()
            else { setEditingId(null); setForm(defaultForm); setShowAdd(true) }
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {showAdd ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative z-50">
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex justify-between">
              Add Recurring Expense
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-dark" />
              <input type="text" placeholder="Merchant (Netflix, Rent...)" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} className="input-dark" />
              <CustomSelect 
                value={form.category_id} 
                onChange={(v) => setForm({ ...form, category_id: v })}
                options={categories.map(c => ({ label: c.name, value: c.id, color: c.color }))}
               />
              <CustomSelect 
                value={form.frequency} 
                onChange={(v) => setForm({ ...form, frequency: v as any })}
                options={FREQUENCIES.map(f => ({ label: f.charAt(0).toUpperCase() + f.slice(1), value: f }))}
               />
              <CustomDatePicker 
                value={form.next_due_date} 
                onChange={(v) => setForm({ ...form, next_due_date: v })} 
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button disabled={addRecurring.isPending} onClick={cancelAddOrEdit} className="px-4 text-sm text-slate-400 hover:text-slate-200">
                Cancel
              </button>
              <button disabled={addRecurring.isPending || !form.amount} onClick={handleSave} className="btn-primary">
                Save Rule
              </button>
            </div>
          </BentoCard>
        </motion.div>
      )}

      {recurring.length === 0 && !showAdd ? (
        <BentoCard>
          <div className="text-center py-12">
            <Repeat className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No recurring expenses set</p>
            <p className="text-sm text-slate-600 mt-1">Add your subscriptions to auto-track them!</p>
          </div>
        </BentoCard>
      ) : (
        <div className="space-y-3">
          {recurring.map((item, index) => (
            <div key={item.id} className="relative" style={{ zIndex: 50 - index }}>
              {editingId === item.id ? (
              <BentoCard key={`edit-${item.id}`} className="border border-emerald-500/30 bg-slate-900/60">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex justify-between">
                  Edit Recurring Expense
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-dark" />
                  <input type="text" placeholder="Merchant (Netflix, Rent...)" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} className="input-dark" />
                  <CustomSelect 
                    value={form.category_id} 
                    onChange={(v) => setForm({ ...form, category_id: v })}
                    options={categories.map(c => ({ label: c.name, value: c.id, color: c.color }))}
                  />
                  <CustomSelect 
                    value={form.frequency} 
                    onChange={(v) => setForm({ ...form, frequency: v as any })}
                    options={FREQUENCIES.map(f => ({ label: f.charAt(0).toUpperCase() + f.slice(1), value: f }))}
                  />
                  <CustomDatePicker 
                    value={form.next_due_date} 
                    onChange={(v) => setForm({ ...form, next_due_date: v })} 
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button disabled={updateRecurring.isPending} onClick={cancelAddOrEdit} className="px-4 text-sm text-slate-400 hover:text-slate-200">
                    Cancel
                  </button>
                  <button disabled={updateRecurring.isPending || !form.amount} onClick={handleSave} className="btn-primary">
                    Update Rule
                  </button>
                </div>
              </BentoCard>
            ) : (
              <BentoCard className={`transition-opacity ${!item.active ? 'opacity-50' : ''}`}>
                 {/* Desktop View */}
                 <div className="hidden sm:flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${item.category?.color || '#fff'}20`, color: item.category?.color }}
                     >
                       {item.merchant?.charAt(0) || item.category?.name.charAt(0) || '?'}
                     </div>
                     <div>
                       <h3 className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">{item.merchant || 'Subscription'}</h3>
                       <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                         <Repeat className="w-3 h-3" /> {item.frequency} • {item.category?.name}
                       </p>
                     </div>
                   </div>

                   <div className="flex flex-col items-end gap-1">
                     <span className="text-lg font-bold text-slate-100">{fmt(item.amount)}</span>
                     <span className="text-xs text-slate-500 flex items-center gap-1">
                       <Calendar className="w-3 h-3" /> Due: {format(parseISO(item.next_due_date), 'MMM dd')}
                     </span>
                   </div>
                   
                   <div className="flex items-center gap-1.5 ml-4">
                     <button
                       onClick={() => toggleRecurring.mutate({ id: item.id, active: !item.active })}
                       className="px-2 py-1.5 rounded-lg text-sm font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                     >
                       {item.active ? 'Pause' : 'Play'}
                     </button>
                     <button
                       onClick={() => startEdit(item)}
                       className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                     >
                       <Edit2 className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => setConfirmDeleteId(item.id)}
                       className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>

                 {/* Mobile View */}
                 <div className="flex sm:hidden flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                           style={{ backgroundColor: `${item.category?.color || '#fff'}20`, color: item.category?.color }}
                        >
                          {item.merchant?.charAt(0) || item.category?.name.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-slate-100">{item.merchant || 'Subscription'}</h3>
                          <p className="text-xs text-slate-500 capitalize">{item.frequency} • {item.category?.name}</p>
                        </div>
                      </div>
                      <span className="text-base font-bold text-slate-100">{fmt(item.amount)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Next Due: {format(parseISO(item.next_due_date), 'MMM dd, yyyy')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRecurring.mutate({ id: item.id, active: !item.active })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            item.active 
                              ? 'border-slate-700 text-slate-300 active:bg-slate-800' 
                              : 'border-emerald-500/30 text-emerald-400 active:bg-emerald-500/10'
                          }`}
                        >
                          {item.active ? 'Pause' : 'Play'}
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 active:text-sky-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 active:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                 </div>
              </BentoCard>
            )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Rule"
        message="Are you sure you want to delete this recurring expense?"
        confirmText="Delete"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteRecurring.mutate(confirmDeleteId)
        }}
      />
    </motion.div>
  )
}
