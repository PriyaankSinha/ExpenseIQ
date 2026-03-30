import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-200">
          <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">Neural Link Interrupted</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              An unexpected anomaly occurred while processing your data. 
              Our AI core is recalibrating. Your data remains encrypted and secure.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
              >
                <RefreshCcw className="w-5 h-5" />
                Recalibrate System
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 border border-slate-700"
              >
                <Home className="w-5 h-5" />
                Return to Surface
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-12 p-4 bg-black/40 rounded-xl text-left">
                <p className="text-[10px] font-mono text-rose-400/80 break-all overflow-auto max-h-32">
                  {this.state.error?.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
