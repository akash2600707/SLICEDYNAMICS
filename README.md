# 🖨️ SliceDynamics — Custom 3D Printing Platform

> Design, prototype, and manufacture custom products using advanced 3D printing technology.

---

## 🚀 30-Day Build Plan

| Week | Focus | Status |
|------|-------|--------|
| Week 1 | Foundation — Auth, File Upload, DB Schema | ✅ In Progress |
| Week 2 | Quote & Payment Flow — Estimate → Admin Confirm → Stripe | 🔜 |
| Week 3 | Ops & Tracking — Admin Dashboard, Order Pipeline | 🔜 |
| Week 4 | Polish & Launch | 🔜 |

---

## 📋 Order Lifecycle

```
Upload File → Instant Estimate → Admin Review → Quote Confirmed → Customer Pays → Production → Ship
```

> ⚡ **Instant Estimate** is auto-calculated and shown immediately — it is **not binding**.  
> ✅ **Final price** is set manually by admin after reviewing printability & complexity.  
> 💳 **Customer pays only after** receiving the confirmed quote via email.  
> 🤖 **Future (Month 2+):** ML model replaces manual admin review entirely.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials — email/password) |
| File Storage | AWS S3 / Cloudflare R2 (presigned URLs) |
| Payments | Stripe (Week 2) |
| Deployment | Vercel (frontend) + Railway (DB) |

---

## ⚙️ Local Setup

### 1. Clone & install
```bash
git clone https://github.com/akash2600707/SLICEDYNAMICS.git
cd SLICEDYNAMICS
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
# Fill in your DATABASE_URL, NEXTAUTH_SECRET, AWS keys, Stripe keys
```

### 3. Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run dev server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
SLICEDYNAMICS/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Sign in
│   ├── register/                 # Sign up
│   ├── dashboard/                # Customer area
│   │   └── new-order/            # Upload + configure + estimate
│   ├── admin/                    # Admin area
│   └── api/
│       ├── auth/                 # NextAuth + Register
│       ├── orders/               # Order CRUD + estimate
│       ├── upload/               # S3 presigned URLs
│       └── quotes/[id]/confirm   # Admin quote confirmation
├── lib/
│   ├── prisma.ts                 # DB client
│   ├── auth.ts                   # NextAuth config
│   ├── s3.ts                     # S3/R2 helpers
│   ├── quote.ts                  # Instant estimate engine
│   └── utils.ts                  # Helpers
└── prisma/
    └── schema.prisma             # DB models: User, Order, File, Quote
```

---

## 🔑 User Roles

| Role | Access |
|------|--------|
| `CUSTOMER` | Upload files, view estimate, track orders, pay confirmed quotes |
| `ADMIN` | Review all orders, edit & confirm quotes, manage pipeline |

---

## 🧠 Quote Engine Logic

```
estimateAmount = volume_cm3 × material_rate × finish_multiplier × infill_surcharge × quantity + setup_fee
```

| Material | Rate (₹/cm³) |
|----------|--------------|
| PLA | ₹3.5 |
| ABS | ₹4.0 |
| PETG | ₹4.5 |
| Resin | ₹8.0 |
| SLS Nylon | ₹12.0 |
| MJF Nylon | ₹14.0 |

> Admin can override the estimate amount when confirming the quote.

---

Built with ❤️ using Claude + Next.js
