import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { MATERIAL_RATES, FINISH_MULTIPLIERS, calculateEstimate } from '@/lib/utils'

// GET /api/orders - list orders for current user
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { files: true, quote: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

// POST /api/orders - create new order
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { material, color, finish, infill, quantity, notes } = body

  const estimatedPrice = calculateEstimate({
    materialRate: MATERIAL_RATES[material] ?? 150,
    finishMultiplier: FINISH_MULTIPLIERS[finish] ?? 1.0,
    quantity: quantity ?? 1,
  })

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      material,
      color,
      finish,
      infill: infill ?? 20,
      quantity: quantity ?? 1,
      notes,
      status: 'SUBMITTED',
      quote: {
        create: {
          estimatedPrice,
          currency: 'INR',
          status: 'ESTIMATE',
        },
      },
    },
    include: { quote: true },
  })

  return NextResponse.json(order, { status: 201 })
}
