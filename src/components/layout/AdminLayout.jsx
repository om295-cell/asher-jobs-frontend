import React from 'react'
import Navbar from './Navbar'

/**
 * Admin layout shell: Navbar only (no Footer).
 */
export default function AdminLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  )
}
