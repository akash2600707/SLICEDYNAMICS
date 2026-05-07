import Link from "next/link";

const MATERIALS = ["PLA", "ABS", "PETG", "Resin", "SLS Nylon", "MJF Nylon"];
const STEPS = [
  { icon: "📤", title: "Upload Your File", desc: "STL, OBJ, STEP — drag and drop your 3D design" },
  { icon: "⚡", title: "Get an Instant Estimate", desc: "Auto-calculated price based on material, finish & volume" },
  { icon: "🔍", title: "We Review & Confirm", desc: "Our team checks printability and confirms your final price" },
  { icon: "💳", title: "Pay & Track", desc: "Pay securely, then track every stage from print to doorstep" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0e0e12] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a38] max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖨️</span>
          <span className="font-bold text-xl tracking-tight">SliceDynamics</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8">
          <span>✨</span> Advanced 3D Printing & Custom Manufacturing
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
          From Your Design<br />To Your Hands
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Upload a 3D file, configure your material and finish, get an instant estimate,
          and let our team manufacture it with precision. Individuals & businesses welcome.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-7 py-3 rounded-xl text-base transition-colors"
          >
            Start Your Order
          </Link>
          <Link
            href="/login"
            className="bg-[#1e1e28] hover:bg-[#2a2a38] border border-[#2a2a38] text-white font-semibold px-7 py-3 rounded-xl text-base transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-12 text-gray-200">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="bg-[#16161d] border border-[#2a2a38] rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="font-semibold mb-2 text-sm">{s.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-200">Supported Materials</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {MATERIALS.map((m) => (
            <span key={m} className="bg-[#1e1e28] border border-[#2a2a38] text-gray-300 text-sm font-medium px-4 py-2 rounded-full">
              {m}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a38] py-8 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} SliceDynamics. Designed, prototyped & manufactured with precision.
      </footer>
    </main>
  );
}
