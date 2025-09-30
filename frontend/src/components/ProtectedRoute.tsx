import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PageLoader } from './ui/PageLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth()
  const isLoading = auth?.isLoading
  const token = auth?.token
  const user = auth?.user
  const isAuthenticated = auth?.isAuthenticated

  if (isLoading) {
    // Show loading state while we check the token
    return <PageLoader />
  }

  // If we're not loading and either have no token or aren't authenticated, redirect
  if (!token || !isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
