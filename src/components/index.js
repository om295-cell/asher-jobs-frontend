/**
 * components/index.js — Central barrel export
 *
 * Folder structure:
 *   layout/   → Navbar, Footer, Layout, AdminLayout   (structural chrome)
 *   modals/   → *Modal components                     (overlay dialogs)
 *   ui/       → reusable primitives                   (cards, badges, spinners…)
 *   guards/   → GeoGuard, ProtectedRoute, GuestRoute, CompanyGuard
 *
 * Any file may import directly from the subfolder:
 *   import { Navbar, Layout } from '../components/layout'
 *   import { LoadingSpinner } from '../components/ui'
 *
 * Or from the root barrel:
 *   import { Navbar, ProtectedRoute, LoadingSpinner } from '../components'
 */

// ─── Layout ──────────────────────────────────────────────────────────────────
export { default as Navbar }       from './layout/Navbar';
export { default as Footer }       from './layout/Footer';
export { default as Layout }       from './layout/Layout';
export { default as AdminLayout }  from './layout/AdminLayout';

// ─── Modals ──────────────────────────────────────────────────────────────────
export { default as CandidateDetailModal }  from './modals/CandidateDetailModal';
export { default as ConfirmModal }          from './modals/ConfirmModal';
export { default as ReportCandidateModal }  from './modals/ReportCandidateModal';

// ─── UI Primitives ───────────────────────────────────────────────────────────
export { default as CandidateCard }   from './ui/CandidateCard';
export { default as EmptyState }      from './ui/EmptyState';
export { default as LoadingSpinner }  from './ui/LoadingSpinner';
export { default as Pagination }      from './ui/Pagination';
export { default as StatusBadge }     from './ui/StatusBadge';

// ─── Guards ──────────────────────────────────────────────────────────────────
export { default as GeoGuard }        from './guards/GeoGuard';
export { default as ProtectedRoute }  from './guards/ProtectedRoute';
export { default as GuestRoute }      from './guards/GuestRoute';
export { default as CompanyGuard }    from './guards/CompanyGuard';

