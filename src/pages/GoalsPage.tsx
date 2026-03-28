import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Trash2, TrendingUp, Edit2, X } from 'lucide-react'
import BentoCard from '@/components/ui/BentoCard'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { useSavingsGoals, useAddGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useGoals'
import { useProfile } from '@/hooks/useProfile'
import { format } from 'date-fns'

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useSavingsGoals()
  const addGoal = useAddGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const { data: profile } = useProfile()

  const [showAddForm, setShowAddForm] = useState(false)
  const defaultForm = { name: '', target_amount: '', deadline: '' }
  const [newGoal, setNewGoal] = useState(defaultForm)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(defaultForm)

  const [addAmount, setAddAmount] = useState<Record<string, string>>({})
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const currency = profile?.currency || 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount) return
    await addGoal.mutateAsync({
      name: newGoal.name,
      target_amount: parseFloat(newGoal.target_amount),
      deadline: newGoal.deadline || null,
    })
    cancelForms()
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.name || !editForm.target_amount) return
    await updateGoal.mutateAsync({
      id: editingId,
      name: editForm.name,
      target_amount: parseFloat(editForm.target_amount),
      deadline: editForm.deadline || null,
    })
    cancelForms()
  }

  const cancelForms = () => {
    setNewGoal(defaultForm)
    setEditForm(defaultForm)
    setEditingId(null)
    setShowAddForm(false)
  }

  const startEdit = (goal: any) => {
    setShowAddForm(false)
    setEditingId(goal.id)
    setEditForm({
      name: goal.name,
      target_amount: goal.target_amount?.toString() || '',
      deadline: goal.deadline || ''
    })
  }

  const handleAddToGoal = async (goalId: string, currentAmount: number) => {
    const amt = parseFloat(addAmount[goalId] || '0')
    if (!amt) return
    await updateGoal.mutateAsync({
      id: goalId,
      current_amount: currentAmount + amt,
    })
    setAddAmount((prev) => ({ ...prev, [goalId]: '' }))
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
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
          <h1 className="text-2xl font-bold text-slate-100">Savings Goals</h1>
          <p className="text-sm text-slate-500 mt-1">
            {goals.length} active goals
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) cancelForms()
            else { cancelForms(); setShowAddForm(true) }
          }}
          className="btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'New Goal'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative z-50">
          <BentoCard>
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Create Goal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Goal name"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="input-dark"
              />
              <input
                type="number"
                placeholder="Target amount"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                className="input-dark"
              />
              <CustomDatePicker
                value={newGoal.deadline}
                onChange={(v) => setNewGoal({ ...newGoal, deadline: v })}
                placeholder="Deadline"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
               <button onClick={cancelForms} className="px-4 text-sm text-slate-400 hover:text-slate-200">
                 Cancel
               </button>
               <button onClick={handleAddGoal} disabled={addGoal.isPending || !newGoal.name || !newGoal.target_amount} className="btn-primary">
                 {addGoal.isPending ? 'Creating...' : 'Create Goal'}
               </button>
            </div>
          </BentoCard>
        </motion.div>
      )}

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : goals.length === 0 && !showAddForm ? (
        <BentoCard hover={false}>
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No savings goals yet</p>
            <p className="text-sm text-slate-600 mt-1">Create one to start tracking your savings!</p>
          </div>
        </BentoCard>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {goals.map((goal, index) => {
            const isEditing = editingId === goal.id
            const progress =
              goal.target_amount > 0
                ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                : 0

            return (
              <motion.div key={goal.id} variants={item} className="relative" style={{ zIndex: 40 - index }}>
                {isEditing ? (
                  <BentoCard className="border border-emerald-500/30 bg-slate-900/60 h-full flex flex-col justify-between">
                     <div>
                        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex justify-between">
                          Edit Goal
                        </h3>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Goal name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className={`input-dark w-full ${goal.is_default ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={goal.is_default}
                          />
                          <input
                            type="number"
                            placeholder="Target amount"
                            value={editForm.target_amount}
                            onChange={(e) => setEditForm({ ...editForm, target_amount: e.target.value })}
                            className="input-dark w-full"
                          />
                          <CustomDatePicker
                            value={editForm.deadline}
                            onChange={(v) => setEditForm({ ...editForm, deadline: v })}
                            placeholder="Deadline"
                          />
                        </div>
                     </div>
                     <div className="flex justify-end gap-2 mt-6">
                        <button disabled={updateGoal.isPending} onClick={cancelForms} className="px-4 text-sm text-slate-400 hover:text-slate-200">
                          Cancel
                        </button>
                        <button disabled={updateGoal.isPending || !editForm.name || !editForm.target_amount} onClick={handleSaveEdit} className="btn-primary">
                          Save Changes
                        </button>
                     </div>
                  </BentoCard>
                ) : (
                  <BentoCard className="relative overflow-hidden h-full flex flex-col justify-between group">
                    {/* Progress bg */}
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />

                    <div>
                        <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-slate-200">{goal.name}</h3>
                              {goal.is_default && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Default
                                </span>
                              )}
                            </div>
                            {goal.deadline && (
                            <p className="text-xs text-slate-500 mt-0.5">
                                Due {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                            </p>
                            )}
                        </div>
                        <div className="flex gap-1.5 transition-opacity">
                            <button
                            onClick={() => startEdit(goal)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                            >
                            <Edit2 className="w-4 h-4" />
                            </button>
                            {!goal.is_default && (
                              <button
                              onClick={() => setConfirmDeleteId(goal.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                              <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-5">
                        <div className="flex justify-between items-baseline mb-1.5">
                            <span className="text-lg font-bold text-slate-100">
                            {fmt(goal.current_amount)}
                            </span>
                            <span className="text-sm text-slate-500">
                            of {fmt(goal.target_amount)}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {progress.toFixed(0)}% complete
                        </p>
                        </div>
                    </div>

                    {/* Add funds */}
                    <div className="flex gap-2 relative z-0">
                      <input
                        type="number"
                        placeholder="Add funds today"
                        value={addAmount[goal.id] || ''}
                        onChange={(e) =>
                          setAddAmount((prev) => ({ ...prev, [goal.id]: e.target.value }))
                        }
                        className="input-dark py-1.5 text-sm flex-1 bg-slate-900/40"
                      />
                      <button
                        onClick={() => handleAddToGoal(goal.id, goal.current_amount)}
                        disabled={!addAmount[goal.id]}
                        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </BentoCard>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Goal"
        message="Are you sure you want to delete this savings goal? This will permanently remove its tracking history."
        confirmText="Delete Goal"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteGoal.mutate(confirmDeleteId)
        }}
      />
    </motion.div>
  )
}
