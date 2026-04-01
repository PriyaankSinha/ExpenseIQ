import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  format, 
  parse, 
  startOfMonth, 
  addYears, 
  subYears, 
  isSameMonth,
  isValid,
  isAfter,
  startOfYear
} from 'date-fns'
import { getFixedPos } from '../../lib/ui-utils'

interface MonthYearPickerProps {
  value: string // YYYY-MM
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function MonthYearPicker({ value, onChange, placeholder = 'Select Month', className = '' }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, placement: 'bottom' as 'top' | 'bottom' })
  
  // Year view state
  const [viewYear, setViewYear] = useState(() => {
    const d = parse(value, 'yyyy-MM', new Date())
    return isValid(d) ? d : new Date()
  })
  
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const updatePos = () => {
    if (buttonRef.current && isOpen) {
        setPos(getFixedPos(buttonRef.current, 260)) // Month grid is roughly 260px high
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const selectedDate = parse(value, 'yyyy-MM', new Date())
  const selectedDateValid = value && isValid(selectedDate)

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(viewYear.getFullYear(), i, 1)
    return d
  })

  const nextYear = () => {
    // Check if next year is future year
    const nextY = addYears(viewYear, 1)
    if (nextY.getFullYear() <= new Date().getFullYear()) {
        setViewYear(nextY)
    }
  }
  
  const prevYear = () => {
     // Based on user comment "Start from current year"
     // But we allow navigating to current year.
     // If current year is 2026, then we show 2026.
     // If they meant only THIS year, we can disable navigation.
     const prevY = subYears(viewYear, 1)
     if (prevY.getFullYear() >= new Date().getFullYear()) {
        setViewYear(prevY)
     }
  }

  const isMonthDisabled = (month: Date) => {
    return isAfter(startOfMonth(month), startOfMonth(new Date()))
  }

  const handleMonthClick = (month: Date) => {
    if (isMonthDisabled(month)) return
    onChange(format(month, 'yyyy-MM'))
    setIsOpen(false)
  }

  // Determine if we can go to next/prev year based on "current year" constraint
  const canGoPrev = viewYear.getFullYear() > new Date().getFullYear()
  const canGoNext = viewYear.getFullYear() < new Date().getFullYear()

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-dark w-full flex items-center justify-between text-slate-100 bg-slate-900/40 cursor-pointer min-h-[42px] relative pl-9"
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <Calendar className="w-4 h-4" />
        </span>
        <span className={selectedDateValid ? 'text-slate-100 truncate' : 'text-slate-500 truncate'}>
          {selectedDateValid ? format(selectedDate, 'MMMM yyyy') : placeholder}
        </span>
        <ChevronLeft className={`w-3 h-3 text-slate-500 ml-2 transition-transform duration-300 ${isOpen ? '-rotate-90' : ''}`} />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-100 bg-slate-950/20 backdrop-blur-[0.5px]" 
                onClick={() => setIsOpen(false)} 
              />
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, scaleY: 0.95, y: pos.placement === 'bottom' ? -10 : 10 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.95, y: pos.placement === 'bottom' ? -10 : 10 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  position: 'fixed', 
                  top: pos.top + (pos.placement === 'bottom' ? 8 : 0), 
                  left: pos.left, 
                  width: pos.width,
                  zIndex: 101,
                  minWidth: '220px'
                }}
                className="p-3 bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl origin-top"
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <button 
                    type="button" 
                    onClick={prevYear} 
                    disabled={!canGoPrev}
                    className={`p-1 rounded-lg transition-colors ${!canGoPrev ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h4 className="text-slate-200 font-semibold text-sm">
                    {format(viewYear, 'yyyy')}
                  </h4>
                  <button 
                    type="button" 
                    onClick={nextYear} 
                    disabled={!canGoNext}
                    className={`p-1 rounded-lg transition-colors ${!canGoNext ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {months.map((month) => {
                    const isDisabled = isMonthDisabled(month)
                    const isSelected = selectedDateValid && isSameMonth(month, selectedDate)
                    const isCurrent = isSameMonth(month, new Date())

                    return (
                      <button
                        key={month.getMonth()}
                        type="button"
                        onClick={() => handleMonthClick(month)}
                        disabled={isDisabled}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-all
                          ${isDisabled 
                            ? 'text-slate-600 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' 
                              : isCurrent 
                                ? 'border border-emerald-500/50 text-emerald-400 hover:bg-slate-700' 
                                : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                          }
                        `}
                      >
                        {format(month, 'MMM')}
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
