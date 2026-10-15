import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/guards/ProtectedRoute'
import CompanyGuard from '../components/guards/CompanyGuard'
import CompanySearch from '../pages/company/CompanySearch'
import CompanyReports from '../pages/company/CompanyReports'
import CompanyProfile from '../pages/company/CompanyProfile'
import CompanySubscription from '../pages/company/CompanySubscription'
import CompanyPending from '../pages/company/CompanyPending'
import CompanyCart from '../pages/company/CompanyCart'
import CompanyBrowse from '../pages/company/CompanyBrowse'

// Shorthand for company-approved guard
const CG = ({ children }) => <CompanyGuard>{children}</CompanyGuard>
// Shorthand for basic company auth (no approval check)
const PR = ({ children }) => (
  <ProtectedRoute roles={['company']}>{children}</ProtectedRoute>
)

export default function CompanyRoutes() {
  return (
    <>
      {/* Pending page accessible before approval */}
      <Route path="/company/pending"       element={<Layout showFooter={false}><PR><CompanyPending /></PR></Layout>} />

      {/* Redirect removed dashboard & requests pages to search */}
      <Route path="/company/dashboard"     element={<Navigate to="/company/search" replace />} />
      <Route path="/company/requests"      element={<Navigate to="/company/search" replace />} />
      <Route path="/company/requests/:id"  element={<Navigate to="/company/search" replace />} />

      <Route path="/company/profile"       element={<Layout showFooter={false}><PR><CompanyProfile /></PR></Layout>} />
      <Route path="/company/subscription"  element={<Layout showFooter={false}><PR><CompanySubscription /></PR></Layout>} />

      {/* Pages that require Approved status */}
      <Route path="/company/search"        element={<Layout showFooter={false}><CG><CompanySearch /></CG></Layout>} />
      <Route path="/company/cart"          element={<Layout showFooter={false}><CG><CompanyCart /></CG></Layout>} />
      <Route path="/company/browse"        element={<Layout showFooter={false}><CG><CompanyBrowse /></CG></Layout>} />
      <Route path="/company/reports"       element={<Layout showFooter={false}><CG><CompanyReports /></CG></Layout>} />
    </>
  )
}
