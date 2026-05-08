import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background grid-bg">
      {/* Navbar */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">SD</span>
            </div>
            <span className="font-bold text-lg tracking-tight">SLICE<span className="text-primary">DYNAMICS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow"></span>
          Advanced 3D Manufacturing Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Design. Prototype.<br />
          <span className="text-primary glow-text">Manufacture.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Upload your 3D file, get an instant estimate, and receive a confirmed quote from our engineering team. Built for individuals and businesses.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary/90 transition-all hover:scale-105 glow-primary">
            Start Your Order →
          </Link>
          <Link href="#how-it-works" className="border border-border px-8 py-3.5 rounded-xl font-semibold text-base hover:border-primary/50 transition-colors">
            How It Works
          </Link>
        </div>
      </section>

      {/* Order Flow */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-muted-foreground text-center mb-14">From file to finished product in days</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: '📤', step: '01', title: 'Upload File', desc: 'STL, OBJ, or STEP' },
            { icon: '⚡', step: '02', title: 'Instant Estimate', desc: 'Auto-calculated price' },
            { icon: '🔍', step: '03', title: 'Expert Review', desc: 'Printability check' },
            { icon: '✅', step: '04', title: 'Quote Confirmed', desc: 'Final price locked' },
            { icon: '💳', step: '05', title: 'Secure Payment', desc: 'Pay with confidence' },
            { icon: '📦', step: '06', title: 'Delivered', desc: 'Print → QC → Ship' },
          ].map((item) => (
            <div key={item.step} className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-colors">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-xs text-primary font-bold mb-1">{item.step}</div>
              <div className="font-semibold text-sm mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Materials We Support</h2>
        <p className="text-muted-foreground text-center mb-14">Professional-grade materials for every application</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'PLA', desc: 'General purpose', color: 'text-green-400' },
            { name: 'ABS', desc: 'Impact resistant', color: 'text-blue-400' },
            { name: 'Resin', desc: 'High detail', color: 'text-purple-400' },
            { name: 'PETG', desc: 'Food safe', color: 'text-yellow-400' },
            { name: 'TPU', desc: 'Flexible', color: 'text-pink-400' },
            { name: 'Nylon', desc: 'Industrial', color: 'text-cyan-400' },
          ].map((m) => (
            <div key={m.name} className="bg-card border border-border rounded-xl p-5 text-center">
              <div className={`text-2xl font-bold mb-1 ${m.color}`}>{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-card border border-primary/20 rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 rounded-2xl"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">Ready to print your idea?</h2>
            <p className="text-muted-foreground mb-8">Upload your file and get an instant quote in seconds.</p>
            <Link href="/register" className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-all inline-block glow-primary">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 SLICEDYNAMICS. All rights reserved.</p>
      </footer>
    </main>
  )
}
