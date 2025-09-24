import { Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Dashboard from './Dashboard'
import EmployerDashboard from './EmployerDashboard'

export default function DashboardRouter() {
  const auth = useAuth()
  
  // Ensure user is authenticated
  if (!auth?.user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Suspense
      fallback={
        <div className="text-center py-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          Loading dashboard...
        </div>
      }
    >
      {auth.user.is_supervisor ? <EmployerDashboard /> : <Dashboard />}
    </Suspense>
  )
}