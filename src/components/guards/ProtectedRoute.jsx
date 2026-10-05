import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Requires the user to be authenticated with one of the given roles.
 * If not authenticated → /login.
 * If authenticated but wrong role → redirects to that role's dashboard.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (role === 'company') return <Navigate to="/company/dashboard" replace />
    return <Navigate to="/candidate/dashboard" replace />
  }
  return children
}
