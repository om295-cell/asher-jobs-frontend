import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Guards company-only routes that additionally require:
 * 1. Company to be Approved
 * 2. Subscription to be active and not expired
 * Unapproved → /company/pending
 * Expired/Inactive → /company/expired
 */
export default function CompanyGuard({ children }) {
  const { isAuthenticated, role, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role !== 'company') return <Navigate to="/" replace />

  if (profile && profile.verificationStatus !== 'Approved') {
    return <Navigate to="/company/pending" replace />
  }

  // Check subscription expiry
  if (profile) {
    const isExpired =
      profile.subscriptionStatus !== 'active' ||
      (profile.subscriptionEndDate && new Date(profile.subscriptionEndDate) < new Date())

    if (isExpired) {
      return <Navigate to="/company/expired" replace state={{ from: location }} />
    }
  }

  return children
}
