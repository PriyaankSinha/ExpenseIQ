import { useEffect } from 'react'

export default function LeadGenAssistant() {
  useEffect(() => {
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
  }, [])

  return null
}
