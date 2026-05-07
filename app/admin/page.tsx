import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [orders, stats] = await Promise.all([
    prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        quote: true,
        files: { take: 1, orderBy: { uploadedAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const statusMap = Object.fromEntries(stats.map((s) => [s.status, s._count.status]));
  const pendingReview = statusMap["SUBMITTED"] ?? 0;
  const underReview = statusMap["UNDER_REVIEW"] ?? 0;
  const quoteConfirmed = statusMap["QUOTE_CONFIRMED"] ?? 0;
  const inProduction = (statusMap["PAID"] ?? 0) + (statusMap["PRINTING"] ?? 0) + (statusMap["QC"] ?? 0);

  return (
    <div className="min-h-screen bg-[#0e0e12] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🖨️</span>
              <span className="font-bold text-xl">SliceDynamics Admin</span>
            </div>
            <p className="text-gray-500 text-sm">{session.user.name} · Admin</p>
          </div>
        </div>

        {/* Alert for pending */}
        {pendingReview > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
            <span className="text-yellow-400 text-lg">🔔</span>
            <span className="text-yellow-300 text-sm font-medium">
              {pendingReview} order{pendingReview > 1 ? "s" : ""} waiting for your review
            </span>
            <Link href="/admin/orders?status=SUBMITTED" className="ml-auto text-yellow-400 text-sm font-semibold hover:text-yellow-300">
              Review now →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Awaiting Review", value: pendingReview, color: "text-yellow-400", border: "border-yellow-500/20" },
            { label: "Under Review", value: underReview, color: "text-sky-400", border: "border-sky-500/20" },
            { label: "Quote Sent", value: quoteConfirmed, color: "text-violet-400", border: "border-violet-500/20" },
            { label: "In Production", value: inProduction, color: "text-emerald-400", border: "border-emerald-500/20" },
          ].map((s) => (
            <div key={s.label} className={`bg-[#16161d] border ${s.border} rounded-2xl p-5`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-[#16161d] border border-[#2a2a38] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a38]">
            <h2 className="font-semibold">All Orders</h2>
          </div>
          <div className="divide-y divide-[#2a2a38]">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#1e1e28] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {order.files[0]?.originalName ?? "Order #" + order.orderNumber.slice(-8)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {order.customer.name} · {order.customer.email} · {formatDate(order.createdAt)}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {order.material} · {order.finish} · Qty {order.quantity}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {order.quote?.confirmedAmount ? (
                    <div className="font-semibold text-emerald-400 text-sm">{formatCurrency(order.quote.confirmedAmount)}</div>
                  ) : order.quote?.estimateAmount ? (
                    <div className="text-sm text-gray-500">~{formatCurrency(order.quote.estimateAmount)} <span className="text-xs">(est.)</span></div>
                  ) : null}
                  <span className={`badge text-white text-xs mt-1 ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
