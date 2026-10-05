import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Blocks authenticated users from accessing guest-only pages (login, register).
 * Authenticated users are redirected to their role's dashboard.
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (role === 'company') return <Navigate to="/company/dashboard" replace />
    return <Navigate to="/candidate/dashboard" replace />
  }
  return children
}
