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
