import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import FuturisticLoader from '@/components/ui/FuturisticLoader'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <FuturisticLoader overlay text="Authenticating..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
