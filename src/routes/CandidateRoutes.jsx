import React from 'react'
import { Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/guards/ProtectedRoute'
import CandidateDashboard from '../pages/candidate/CandidateDashboard'
import CandidateProfile from '../pages/candidate/CandidateProfile'
import CandidateEditProfile from '../pages/candidate/CandidateEditProfile'
import CandidateCv from '../pages/candidate/CandidateCv'
import CandidateReferrals from '../pages/candidate/CandidateReferrals'
import CandidateSettings from '../pages/candidate/CandidateSettings'

const PR = ({ children }) => (
  <ProtectedRoute roles={['candidate']}>{children}</ProtectedRoute>
)

export default function CandidateRoutes() {
  return (
    <>
      <Route path="/candidate/dashboard"    element={<Layout showFooter={false}><PR><CandidateDashboard /></PR></Layout>} />
      <Route path="/candidate/profile"      element={<Layout showFooter={false}><PR><CandidateProfile /></PR></Layout>} />
      <Route path="/candidate/profile/edit" element={<Layout showFooter={false}><PR><CandidateEditProfile /></PR></Layout>} />
      <Route path="/candidate/cv"           element={<Layout showFooter={false}><PR><CandidateCv /></PR></Layout>} />
      <Route path="/candidate/referrals"    element={<Layout showFooter={false}><PR><CandidateReferrals /></PR></Layout>} />
      <Route path="/candidate/settings"     element={<Layout showFooter={false}><PR><CandidateSettings /></PR></Layout>} />
    </>
  )
}
