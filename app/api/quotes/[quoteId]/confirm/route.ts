import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const confirmSchema = z.object({
  confirmedAmount: z.number().positive("Price must be a positive number"),
  adminNotes: z.string().optional(),
});

// PATCH /api/quotes/[quoteId]/confirm
export async function PATCH(
  req: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = confirmSchema.parse(body);

    const quote = await prisma.quote.update({
      where: { id: params.quoteId },
      data: {
        confirmedAmount: data.confirmedAmount,
        adminNotes: data.adminNotes,
        confirmedAt: new Date(),
        confirmedById: session.user.id,
        status: "CONFIRMED",
      },
      include: { order: { include: { customer: true } } },
    });

    // Update order status
    await prisma.order.update({
      where: { id: quote.orderId },
      data: { status: "QUOTE_CONFIRMED" },
    });

    // TODO Week 2: Send confirmed quote email to customer with Pay Now link
    // await sendQuoteConfirmedEmail(quote.order.customer.email, quote);

    return NextResponse.json({ quote });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[CONFIRM_QUOTE]", err);
    return NextResponse.json({ error: "Failed to confirm quote" }, { status: 500 });
  }
}
