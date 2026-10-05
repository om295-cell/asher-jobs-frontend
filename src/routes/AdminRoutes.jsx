import React from 'react'
import { Route } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import ProtectedRoute from '../components/guards/ProtectedRoute'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminCandidates from '../pages/admin/AdminCandidates'
import AdminCandidateDetail from '../pages/admin/AdminCandidateDetail'
import AdminCompanies from '../pages/admin/AdminCompanies'
import AdminCompanyDetail from '../pages/admin/AdminCompanyDetail'
import AdminJobs from '../pages/admin/AdminJobs'
import AdminCategories from '../pages/admin/AdminCategories'
import AdminReports from '../pages/admin/AdminReports'
import AdminActivity from '../pages/admin/AdminActivity'
import AdminSettings from '../pages/admin/AdminSettings'
import AdminRequests from '../pages/admin/AdminRequests'
import AdminRecommendations from '../pages/admin/AdminRecommendations'

const AR = ({ children }) => (
  <ProtectedRoute roles={['admin']}>{children}</ProtectedRoute>
)

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin/dashboard"             element={<AdminLayout><AR><AdminDashboard /></AR></AdminLayout>} />
      <Route path="/admin/candidates"            element={<AdminLayout><AR><AdminCandidates /></AR></AdminLayout>} />
      <Route path="/admin/candidates/:id"        element={<AdminLayout><AR><AdminCandidateDetail /></AR></AdminLayout>} />
      <Route path="/admin/companies"             element={<AdminLayout><AR><AdminCompanies /></AR></AdminLayout>} />
      <Route path="/admin/companies/:id"         element={<AdminLayout><AR><AdminCompanyDetail /></AR></AdminLayout>} />
      <Route path="/admin/jobs"                  element={<AdminLayout><AR><AdminJobs /></AR></AdminLayout>} />
      <Route path="/admin/categories"            element={<AdminLayout><AR><AdminCategories /></AR></AdminLayout>} />
      <Route path="/admin/reports"               element={<AdminLayout><AR><AdminReports /></AR></AdminLayout>} />
      <Route path="/admin/recruitment-requests"  element={<AdminLayout><AR><AdminRequests /></AR></AdminLayout>} />
      <Route path="/admin/recommendations"       element={<AdminLayout><AR><AdminRecommendations /></AR></AdminLayout>} />
      <Route path="/admin/activity"              element={<AdminLayout><AR><AdminActivity /></AR></AdminLayout>} />
      <Route path="/admin/settings"              element={<AdminLayout><AR><AdminSettings /></AR></AdminLayout>} />
    </>
  )
}
