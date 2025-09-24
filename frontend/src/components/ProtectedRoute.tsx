import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PageLoader } from './ui/PageLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth()
  const isLoading = auth?.isLoading || false
  const isAuthenticated = auth?.isAuthenticated && auth?.user

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
