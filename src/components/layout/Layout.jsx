import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

/**
 * Default layout shell: Navbar + optional Footer.
 * Used by public pages and authenticated role pages.
 */
export default function Layout({ children, showFooter = true }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}
