import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEstimate } from "@/lib/quote";
import { z } from "zod";

// ─── GET /api/orders ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where =
    session.user.role === "ADMIN"
      ? status ? { status: status as never } : {}
      : { customerId: session.user.id, ...(status ? { status: status as never } : {}) };

  const orders = await prisma.order.findMany({
    where,
    include: { quote: true, files: { orderBy: { uploadedAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
const createSchema = z.object({
  material: z.enum(["PLA", "ABS", "PETG", "RESIN", "SLS_NYLON", "MJF_NYLON"]),
  colour: z.string().default("White"),
  finish: z.enum(["RAW", "SANDED", "PAINTED", "POLISHED"]),
  infillPercent: z.number().min(10).max(100).default(20),
  quantity: z.number().min(1).max(500).default(1),
  notes: z.string().optional(),
  volumeCm3: z.number().positive(), // From Three.js STL parser on client
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Calculate instant estimate
    const estimate = calculateEstimate({
      volumeCm3: data.volumeCm3,
      material: data.material as never,
      finish: data.finish as never,
      infillPercent: data.infillPercent,
      quantity: data.quantity,
    });

    // Create order + estimate quote in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          customerId: session.user.id,
          material: data.material as never,
          colour: data.colour,
          finish: data.finish as never,
          infillPercent: data.infillPercent,
          quantity: data.quantity,
          notes: data.notes,
          status: "SUBMITTED",
        },
      });

      await tx.quote.create({
        data: {
          orderId: o.id,
          estimateAmount: estimate.estimateAmount,
          estimateBreakdown: estimate.breakdown as never,
          status: "ESTIMATE",
        },
      });

      return o;
    });

    return NextResponse.json(
      { order, estimate },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[CREATE_ORDER]", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
