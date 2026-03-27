import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string
  color?: string
}

interface CustomSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  icon?: ReactNode
}

export default function CustomSelect({ value, options, onChange, placeholder = 'Select...', className = '', icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`input-dark w-full flex items-center justify-between text-slate-100 bg-slate-900/40 cursor-pointer min-h-[42px] ${icon ? 'pl-9' : ''}`}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-[52%] text-slate-500 pointer-events-none">{icon}</span>}
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
            {selectedOption.color && (
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedOption.color }} />
            )}
            {selectedOption.label}
            </span>
          ) : (
            <span className="text-slate-500 truncate">{placeholder}</span>
          )}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95, y: -10 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 py-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl origin-top overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-slate-700/50 transition-colors ${
                  value === option.value ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-200'
                }`}
              >
                {option.color && (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: option.color }} />
                )}
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
