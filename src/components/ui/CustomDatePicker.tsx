import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
import { getFixedPos } from '../../lib/ui-utils'

interface CustomDatePickerProps {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function CustomDatePicker({ value, onChange, placeholder = 'Select date', className = '' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, placement: 'bottom' as 'top' | 'bottom' })
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = parseISO(value)
    return isValid(d) ? d : new Date()
  })
  
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const updatePos = () => {
    if (buttonRef.current && isOpen) {
        setPos(getFixedPos(buttonRef.current, 320)) // Calendar is roughly 320px high
    }
  }

  useEffect(() => {
    if (isOpen) {
      updatePos()
      window.addEventListener('scroll', updatePos, true)
      window.addEventListener('resize', updatePos)
    }
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [isOpen])

  const resetView = () => {
    const d = value ? parseISO(value) : new Date()
    setCurrentMonth(isValid(d) ? d : new Date())
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const isInsideButton = buttonRef.current?.contains(target)
      const isInsideCalendar = containerRef.current?.contains(target)
      
      if (!isInsideButton && !isInsideCalendar) {
        setIsOpen(false)
        resetView()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, value])

  // Auto update calendar view ONLY when value initially loaded or explicitly changed
  useEffect(() => {
    if (value) {
        const d = parseISO(value)
        if (isValid(d)) setCurrentMonth(d)
    }
  }, [value])

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
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (isOpen) resetView()
          setIsOpen(!isOpen)
        }}
        className="input-dark w-full flex items-center justify-between text-slate-100 bg-slate-900/40 cursor-pointer min-h-[42px] relative"
      >
        <span className={selectedDateValid ? 'text-slate-100' : 'text-slate-500'}>
          {selectedDateValid ? format(selectedDate, 'MMM dd, yyyy') : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {isOpen && (
            <>
              {/* Subtle backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 bg-slate-950/20 backdrop-blur-[0.5px] cursor-pointer" 
                onClick={() => { setIsOpen(false); resetView(); }} 
              />
              <motion.div
                ref={containerRef}
                initial={{ opacity: 0, scaleY: 0.95, y: pos.placement === 'bottom' ? -10 : 10 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.95, y: pos.placement === 'bottom' ? -10 : 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{ 
                  position: 'fixed', 
                  top: pos.top + (pos.placement === 'bottom' ? 8 : 0), 
                  left: Math.max(8, pos.left), // Ensure not off screen left
                  width: Math.min(pos.width, window.innerWidth - 16),
                  zIndex: 101,
                  minWidth: '280px'
                }}
                className="p-3 bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl origin-top"
              >
                <div className="flex justify-between items-center mb-4">
                  <button type="button" onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
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
                          ${isSelected ? 'bg-emerald-500! text-white! font-bold shadow-md shadow-emerald-500/20' : 'hover:bg-slate-700'}
                          ${isCurrentDay && !isSelected ? 'border border-emerald-500/50 text-emerald-400' : ''}
                        `}
                      >
                        {format(day, dateFormat)}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
