import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role
  if (role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">SD</span>
            </div>
            <span className="font-bold tracking-tight">SLICE<span className="text-primary">DYNAMICS</span></span>
            <span className="ml-3 text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">ADMIN</span>
          </div>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage orders, review files, confirm quotes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Pending Review', value: '0', icon: '🔍', color: 'text-yellow-400' },
            { label: 'Quote Sent', value: '0', icon: '📧', color: 'text-purple-400' },
            { label: 'In Production', value: '0', icon: '🖨️', color: 'text-blue-400' },
            { label: 'Revenue Today', value: '₹0', icon: '💰', color: 'text-green-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Order Pipeline */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Order Pipeline</h2>
            <div className="flex gap-2">
              {['All', 'Under Review', 'Quote Sent', 'Paid', 'Printing'].map(f => (
                <button key={f} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  f === 'All' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                }`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-medium mb-1">No orders yet</p>
            <p className="text-sm">New orders will appear here for review</p>
          </div>
        </div>

        {/* Pipeline status guide */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 text-sm">Order Status Pipeline</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
              { label: '→', color: 'text-muted-foreground bg-transparent border-transparent' },
              { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
              { label: '→', color: 'text-muted-foreground bg-transparent border-transparent' },
              { label: 'Quote Sent', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
              { label: '→', color: 'text-muted-foreground bg-transparent border-transparent' },
              { label: 'Paid', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
              { label: '→', color: 'text-muted-foreground bg-transparent border-transparent' },
              { label: 'Printing', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
              { label: '→', color: 'text-muted-foreground bg-transparent border-transparent' },
              { label: 'QC', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
              { label: '→', color: 'text-muted-foreground bg-transparent border-transparent' },
              { label: 'Shipped', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
            ].map((s, i) => (
              <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
