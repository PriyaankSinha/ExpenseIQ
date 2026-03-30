/**
 * Calculate the position for a portal-based dropdown
 */
export function calcDropdownPos(trigger: HTMLElement | null, dropdownHeight: number = 250) {
  if (!trigger) return { top: 0, left: 0, width: 0, placement: 'bottom' as const }

  const rect = trigger.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  
  // Default to bottom, but flip if no space and more space above
  const placement = spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'
  
  return {
    top: placement === 'bottom' ? rect.bottom + window.scrollY : rect.top + window.scrollY - dropdownHeight - 8,
    left: rect.left + window.scrollX,
    width: rect.width,
    placement
  }
}

/**
 * Get fixed position relative to viewport (better for overlay/portals)
 */
export function getFixedPos(trigger: HTMLElement | null, dropdownHeight: number = 250) {
    if (!trigger) return { top: 0, left: 0, width: 0, placement: 'bottom' as const }
  
    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    
    // Check if we should flip
    const placement: 'top' | 'bottom' = spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'
    
    return {
      top: placement === 'bottom' ? rect.bottom : rect.top - dropdownHeight - 8,
      left: rect.left,
      width: rect.width,
      placement
    }
}

import { format as fnsFormat } from 'date-fns'

/**
 * Safely parse a date string into a Date object or return a fallback
 */
export function safeParseDate(dateStr: any): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

/**
 * Safely format a date using date-fns without throwing on Invalid Date
 */
export function safeFormat(date: any, formatStr: string, fallback: string = '—'): string {
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d?.getTime())) return fallback
    return fnsFormat(d, formatStr)
  } catch (e) {
    return fallback
  }
}

/**
 * Clamp a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  if (isNaN(val)) return min
  return Math.max(min, Math.min(max, val))
}

/**
 * Ensure a value is a finite number, or return 0
 */
export function safeNum(val: any): number {
  if (val === null || val === undefined) return 0
  const n = typeof val === 'number' ? val : parseFloat(val)
  return isFinite(n) ? n : 0
}
