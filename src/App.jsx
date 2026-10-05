import React from 'react'
import { BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ToastProvider } from './context/ToastContext'
import GeoGuard from './components/guards/GeoGuard'
import PublicRoutes from './routes/PublicRoutes'
import CandidateRoutes from './routes/CandidateRoutes'
import CompanyRoutes from './routes/CompanyRoutes'
import AdminRoutes from './routes/AdminRoutes'

export default function App() {
  return (
    <LanguageProvider>
      <GeoGuard>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {PublicRoutes()}
                {CandidateRoutes()}
                {CompanyRoutes()}
                {AdminRoutes()}
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </GeoGuard>
    </LanguageProvider>
  )
}
