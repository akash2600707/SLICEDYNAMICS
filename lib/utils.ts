import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  // Simple className merger without external dep
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    SUBMITTED: "bg-gray-500",
    UNDER_REVIEW: "bg-yellow-500",
    QUOTE_CONFIRMED: "bg-blue-500",
    PAID: "bg-green-500",
    PRINTING: "bg-purple-500",
    QC: "bg-orange-500",
    SHIPPED: "bg-teal-500",
    DELIVERED: "bg-green-700",
    CANCELLED: "bg-red-500",
  };
  return map[status] ?? "bg-gray-500";
}

export function getOrderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    QUOTE_CONFIRMED: "Quote Confirmed",
    PAID: "Paid — In Production",
    PRINTING: "Printing",
    QC: "Quality Check",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return map[status] ?? status;
}
