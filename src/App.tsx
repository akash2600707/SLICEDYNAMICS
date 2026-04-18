import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

// Public pages
import Home from '@/pages/public/Home'
import About from '@/pages/public/About'
import Services from '@/pages/public/Services'
import Pricing from '@/pages/public/Pricing'
import Contact from '@/pages/public/Contact'
import Auth from '@/pages/public/Auth'

// User pages
import UserDashboard from '@/pages/user/Dashboard'
import NewOrder from '@/pages/user/NewOrder'
import Orders from '@/pages/user/Orders'
import OrderDetail from '@/pages/user/OrderDetail'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminContent from '@/pages/admin/AdminContent'
import AdminMaterials from '@/pages/admin/AdminMaterials'

// ============================================================
// Route Guards
// ============================================================
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--color-bg)',
    }}>
      <div className="loading-spinner" style={{ width: 40, height: 40 }} />
    </div>
  )
}

// ============================================================
// App Router
// ============================================================
function AppRoutes() {
  const { user, isAdmin } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/auth"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Auth />}
      />

      {/* User Dashboard */}
      <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
      <Route path="/dashboard/orders" element={<RequireAuth><Orders /></RequireAuth>} />
      <Route path="/dashboard/orders/new" element={<RequireAuth><NewOrder /></RequireAuth>} />
      <Route path="/dashboard/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
      <Route path="/admin/orders/:id" element={<RequireAdmin><AdminOrderDetail /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
      <Route path="/admin/content" element={<RequireAdmin><AdminContent /></RequireAdmin>} />
      <Route path="/admin/materials" element={<RequireAdmin><AdminMaterials /></RequireAdmin>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
