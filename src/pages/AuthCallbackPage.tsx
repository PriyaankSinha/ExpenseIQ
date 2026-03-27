import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Sparkles, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically picks up the tokens from the URL hash
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setErrorMsg(error.message)
          setStatus('error')
          return
        }

        if (data.session) {
          setStatus('success')
          setTimeout(() => navigate('/login'), 2000)
        } else {
          // Try exchanging the hash params
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (sessionError) {
              setErrorMsg(sessionError.message)
              setStatus('error')
            } else {
              setStatus('success')
              setTimeout(() => navigate('/login'), 2000)
            }
          } else {
            setErrorMsg('Invalid verification link. Please try signing up again.')
            setStatus('error')
          }
        }
      } catch (err) {
        setErrorMsg('Something went wrong during verification.')
        setStatus('error')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      <div className="blob w-[600px] h-[600px] bg-emerald-600 top-[-200px] right-[-200px]" />

      <div className="glass-card p-8 w-full max-w-md relative z-10 text-center">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold gradient-text">SpendSmart AI</h1>
            <p className="text-xs text-slate-500">Intelligent expense tracking</p>
          </div>
        </div>

        {status === 'verifying' && (
          <div className="py-8">
            <div className="spinner mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Verifying your email...</h2>
            <p className="text-sm text-slate-400">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Email verified!</h2>
            <p className="text-sm text-slate-400">Redirecting you to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Verification failed</h2>
            <p className="text-sm text-slate-400 mb-4">{errorMsg}</p>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
