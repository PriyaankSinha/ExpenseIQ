import { useEffect, useState } from 'react'

export default function LeadGenAssistant() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      // Cleanup any existing widget if we transition to mobile
      const existingScript = document.querySelector('script[src*="leadgenaiassistant"]')
      if (existingScript) existingScript.remove()
      document.querySelectorAll('iframe[src*="leadgenaiassistant"]').forEach((el) => el.remove())
      return
    }

    const script = document.createElement('script')
    script.src = 'https://leadgenaiassistant.vercel.app/widget.js'
    script.async = true
    script.setAttribute('data-project', 'f437c5ee-3e5e-415c-9590-47275d3bd812')

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
      document.querySelectorAll(
        'iframe[src*="leadgenaiassistant"]'
      ).forEach((el) => el.remove())
    }
  }, [isMobile])

  return null
}
