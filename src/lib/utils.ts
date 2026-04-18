import type { Material, OrderStatus, PriceEstimate } from './types'

// ============================================================
// STL Mock Slicer — simulates real slicer math
// Real implementation would parse binary STL volume
// ============================================================
export function estimateFromFile(
  fileSizeBytes: number,
  material: Material,
  infillPercent: number,
  layerHeight: number,
  quantity: number
): PriceEstimate {
  // Rough heuristic: 1MB STL ≈ 50g at 20% infill
  const baseWeight = (fileSizeBytes / 1_000_000) * 50
  const infillFactor = 0.4 + (infillPercent / 100) * 0.6
  const layerFactor = 0.2 / layerHeight // thinner layers = more time
  const weightGrams = baseWeight * infillFactor * quantity

  // Print time: base 2h per 100g, modified by layer height and infill
  const printHours = (weightGrams / 100) * 2 * layerFactor

  // Costs
  const materialCost = weightGrams * material.cost_per_gram
  const TIME_RATE_PER_HOUR = 3.5 // $/hr machine time
  const timeCost = printHours * TIME_RATE_PER_HOUR
  const subtotal = materialCost + timeCost

  // ±15% range
  const rangeLow = subtotal * 0.85
  const rangeHigh = subtotal * 1.15

  // Delivery estimate (business days)
  let deliveryDays = 5
  if (printHours > 24) deliveryDays = 10
  else if (printHours > 8) deliveryDays = 7

  return {
    weightGrams: round2(weightGrams),
    printHours: round2(printHours),
    materialCost: round2(materialCost),
    timeCost: round2(timeCost),
    subtotal: round2(subtotal),
    rangeLow: round2(rangeLow),
    rangeHigh: round2(rangeHigh),
    deliveryDays,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

// ============================================================
// Formatting
// ============================================================
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================================
// Order Status Helpers
// ============================================================
export const STATUS_LABELS: Record<OrderStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  submitted:      { bg: '#f0f9ff', text: '#0369a1', border: '#7dd3fc' },
  under_review:   { bg: '#fefce8', text: '#854d0e', border: '#fde047' },
  approved:       { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  confirmed:      { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  in_production:  { bg: '#fdf4ff', text: '#7e22ce', border: '#d8b4fe' },
  quality_check:  { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
  shipped:        { bg: '#f0f9ff', text: '#1d4ed8', border: '#93c5fd' },
  delivered:      { bg: '#052e16', text: '#4ade80', border: '#166534' },
  cancelled:      { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' },
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'submitted',
  'under_review',
  'approved',
  'confirmed',
  'in_production',
  'quality_check',
  'shipped',
  'delivered',
]

export function getStatusIndex(status: OrderStatus): number {
  return ORDER_STATUS_FLOW.indexOf(status)
}

// ============================================================
// Invoice Number Generator
// ============================================================
export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `SD-${year}-${rand}`
}

// ============================================================
// File validation
// ============================================================
export function isValidSTL(file: File): boolean {
  const name = file.name.toLowerCase()
  return name.endsWith('.stl')
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
