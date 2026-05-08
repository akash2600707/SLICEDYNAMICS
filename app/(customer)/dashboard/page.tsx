import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency, formatDate } from '@/lib/utils'

export default async function CustomerDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">SD</span>
            </div>
            <span className="font-bold tracking-tight">SLICE<span className="text-primary">DYNAMICS</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your orders and manage your prints</p>
          </div>
          <Link
            href="/new-order"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all glow-primary"
          >
            + New Order
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: '0', icon: '📦' },
            { label: 'Pending Payment', value: '0', icon: '💳' },
            { label: 'In Production', value: '0', icon: '🖨️' },
            { label: 'Delivered', value: '0', icon: '✅' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6">Your Orders</h2>
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-medium mb-2">No orders yet</p>
            <p className="text-sm mb-6">Upload your first 3D file to get started</p>
            <Link href="/new-order" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
              Place Your First Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
