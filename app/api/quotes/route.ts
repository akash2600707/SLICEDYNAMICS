import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'

// PATCH /api/quotes - admin confirms a quote
export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = user.user_metadata?.role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { quoteId, confirmedPrice, adminNotes } = await req.json()

  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      confirmedPrice,
      adminNotes,
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      confirmedBy: user.id,
    },
    include: { order: { include: { user: true } } },
  })

  // Update order status
  await prisma.order.update({
    where: { id: quote.orderId },
    data: { status: 'QUOTE_SENT' },
  })

  // TODO: Send confirmed quote email via Resend
  // await resend.emails.send({ ... })

  return NextResponse.json(quote)
}
