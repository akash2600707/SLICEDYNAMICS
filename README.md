# 🖨️ SLICEDYNAMICS

> Custom 3D Printing Platform — Design, Prototype, Manufacture, Deliver.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments | Stripe |
| Email | Resend |
| 3D Preview | Three.js |
| Deployment | Vercel |

## Order Lifecycle

```
Upload File → Instant Estimate → Admin Review → Quote Confirmed → Customer Pays → Production → Delivered
```

> **Note:** The "Admin Review" step will be replaced by ML in Month 2.

## Getting Started

### 1. Clone & install
```bash
git clone https://github.com/akash2600707/SLICEDYNAMICS
cd SLICEDYNAMICS
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in all values from Supabase, Stripe, Resend dashboards
```

### 3. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── (auth)/          # Login, Register
├── (customer)/      # Customer dashboard, new-order, order tracking
├── (admin)/         # Admin dashboard, order management, quote editor
├── api/             # REST API routes
└── page.tsx         # Landing page

lib/
├── supabase/        # Supabase client (browser + server)
├── prisma.ts        # Prisma client singleton
├── stripe.ts        # Stripe client
├── resend.ts        # Resend email client
└── utils.ts         # Helpers, formatters, estimate calculator

prisma/
└── schema.prisma    # Database schema (User, Order, File, Quote)

types/
└── index.ts         # Shared TypeScript types
```

## Week-by-Week Build Plan

- **Week 1** ✅ Foundation — Auth, file upload, DB schema
- **Week 2** 🔜 Quote & Payment — Configurator, estimate engine, Stripe
- **Week 3** 🔜 Ops & Tracking — Admin pipeline, revision flow, notifications
- **Week 4** 🔜 Polish & Launch — QA, deploy, soft launch

## Environment Variables

See `.env.example` for all required variables.
