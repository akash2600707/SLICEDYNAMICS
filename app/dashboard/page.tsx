import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: { quote: true, files: { take: 1, orderBy: { uploadedAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };

  return (
    <div className="min-h-screen bg-[#0e0e12] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🖨️</span>
              <span className="font-bold text-xl">SliceDynamics</span>
            </div>
            <p className="text-gray-500 text-sm">Welcome back, {session.user.name}</p>
          </div>
          <Link
            href="/dashboard/new-order"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + New Order
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, color: "text-white" },
            { label: "Active", value: stats.active, color: "text-sky-400" },
            { label: "Delivered", value: stats.delivered, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#16161d] border border-[#2a2a38] rounded-2xl p-5">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="bg-[#16161d] border border-[#2a2a38] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a38] flex items-center justify-between">
            <h2 className="font-semibold">Your Orders</h2>
            <Link href="/dashboard/orders" className="text-violet-400 text-sm hover:text-violet-300">
              View all →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-500 mb-4">No orders yet</p>
              <Link
                href="/dashboard/new-order"
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Place Your First Order
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a38]">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#1e1e28] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {order.files[0]?.originalName ?? "Order #" + order.orderNumber.slice(-8)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {order.material} · {order.finish} · Qty {order.quantity} · {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {order.quote?.confirmedAmount ? (
                      <div className="font-semibold text-emerald-400 text-sm">
                        {formatCurrency(order.quote.confirmedAmount)}
                      </div>
                    ) : order.quote?.estimateAmount ? (
                      <div className="text-sm text-gray-500">
                        ~{formatCurrency(order.quote.estimateAmount)}
                        <span className="text-xs ml-1">(est.)</span>
                      </div>
                    ) : null}
                    <span className={`badge text-white text-xs mt-1 ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
