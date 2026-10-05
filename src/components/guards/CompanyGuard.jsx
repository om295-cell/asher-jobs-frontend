import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Guards company-only routes that additionally require the company to be Approved.
 * Unapproved companies are sent to the pending page.
 */
export default function CompanyGuard({ children }) {
  const { isAuthenticated, role, profile, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role !== 'company') return <Navigate to="/" replace />
  if (profile && profile.verificationStatus !== 'Approved') {
    return <Navigate to="/company/pending" replace />
  }
  return children
}
