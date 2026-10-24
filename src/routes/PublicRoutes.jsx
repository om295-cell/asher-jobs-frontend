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
import ContactPage from '../pages/public/ContactPage'
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage'
import RefundPolicyPage from '../pages/public/RefundPolicyPage'
import DeliveryPolicyPage from '../pages/public/DeliveryPolicyPage'

export default function PublicRoutes() {
  return (
    <>
      <Route path="/"                   element={<Layout><HomePage /></Layout>} />
      <Route path="/about"              element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact"            element={<Layout><ContactPage /></Layout>} />
      <Route path="/privacy-policy"     element={<Layout><PrivacyPolicyPage /></Layout>} />
      <Route path="/refund-policy"      element={<Layout><RefundPolicyPage /></Layout>} />
      <Route path="/delivery-policy"    element={<Layout><DeliveryPolicyPage /></Layout>} />
      <Route path="/shipping-policy"    element={<Layout><DeliveryPolicyPage /></Layout>} />
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
