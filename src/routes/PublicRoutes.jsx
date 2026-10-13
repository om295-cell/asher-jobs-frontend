import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import GuestRoute from '../components/guards/GuestRoute'
import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import HowItWorksPage from '../pages/public/HowItWorksPage'
import LoginPage from '../pages/public/LoginPage'
import RecommendationPage from '../pages/public/RecommendationPage'
import NotFoundPage from '../pages/public/NotFoundPage'

export default function PublicRoutes() {
  return (
    <>
      <Route path="/"                   element={<Layout><HomePage /></Layout>} />
      <Route path="/about"              element={<Layout><AboutPage /></Layout>} />
      <Route path="/how-it-works"       element={<Layout><HowItWorksPage /></Layout>} />
      <Route path="/recommend"          element={<Layout><RecommendationPage /></Layout>} />
      <Route path="/recommendations"    element={<Layout><RecommendationPage /></Layout>} />
      <Route path="/login"              element={<Layout><GuestRoute><LoginPage /></GuestRoute></Layout>} />
      {/* Registration disabled — accounts created by admin only */}
      <Route path="/register/*"         element={<Navigate to="/login" replace />} />
      <Route path="*"                   element={<Layout><NotFoundPage /></Layout>} />
    </>
  )
}
