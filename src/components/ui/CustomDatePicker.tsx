import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isValid
} from 'date-fns'

interface CustomDatePickerProps {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function CustomDatePicker({ value, onChange, placeholder = 'Select date', className = '' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = parseISO(value)
    return isValid(d) ? d : new Date()
  })
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto update calendar view if bound value drastically changes outside
  useEffect(() => {
    if (value && isOpen) {
        const d = parseISO(value)
        if (isValid(d)) setCurrentMonth(d)
    }
  }, [value, isOpen])

  const selectedDate = value ? parseISO(value) : null
  const selectedDateValid = selectedDate && isValid(selectedDate)

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const dateFormat = "d"
  const dateInterval = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const handleDateClick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-dark w-full flex items-center justify-between text-slate-100 bg-slate-900/40 cursor-pointer min-h-[42px]"
      >
        <span className={selectedDateValid ? 'text-slate-100' : 'text-slate-500'}>
          {selectedDateValid ? format(selectedDate, 'MMM dd, yyyy') : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95, y: -10 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 min-w-[280px] w-full mt-2 p-3 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl origin-top"
          >
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={prevMonth} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="text-slate-200 font-semibold text-sm">
                {format(currentMonth, 'MMMM yyyy')}
              </h4>
              <button type="button" onClick={nextMonth} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-slate-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dateInterval.map((day, idx) => {
                 const isSelected = selectedDateValid && isSameDay(day, selectedDate)
                 const representsCurrentMonth = day >= monthStart && day <= monthEnd
                 const isCurrentDay = isToday(day)

                 return (
                   <button
                     key={idx}
                     type="button"
                     onClick={() => handleDateClick(day)}
                     className={`w-8 h-8 mx-auto rounded-lg text-xs transition-colors flex items-center justify-center
                       ${!representsCurrentMonth ? 'text-slate-600' : 'text-slate-300'}
                       ${isSelected ? '!bg-emerald-500 !text-white font-bold shadow-md shadow-emerald-500/20' : 'hover:bg-slate-700'}
                       ${isCurrentDay && !isSelected ? 'border border-emerald-500/50 text-emerald-400' : ''}
                     `}
                   >
                     {format(day, dateFormat)}
                   </button>
                 )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
