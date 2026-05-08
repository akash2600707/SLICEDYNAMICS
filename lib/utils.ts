import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Instant estimate calculation
// Price = (volume_cm3 × material_rate × finish_multiplier × quantity) + base_fee
export function calculateEstimate({
  materialRate,
  finishMultiplier,
  quantity,
  baseFee = 50,
}: {
  materialRate: number
  finishMultiplier: number
  quantity: number
  baseFee?: number
}) {
  // volume is unknown until slicer — we use a base calculation for now
  const basePrice = materialRate * finishMultiplier * quantity + baseFee
  return Math.round(basePrice)
}

export const MATERIAL_RATES: Record<string, number> = {
  PLA: 150,
  ABS: 180,
  RESIN: 300,
  PETG: 220,
  TPU: 350,
  NYLON: 400,
}

export const FINISH_MULTIPLIERS: Record<string, number> = {
  STANDARD: 1.0,
  SMOOTH: 1.3,
  PAINTED: 1.8,
  POLISHED: 2.0,
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  QUOTE_SENT: 'Quote Sent',
  PAID: 'Paid',
  PRINTING: 'Printing',
  QC: 'Quality Check',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  UNDER_REVIEW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  QUOTE_SENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
  PRINTING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  QC: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  SHIPPED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
}
