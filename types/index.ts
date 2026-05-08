export type UserRole = 'CUSTOMER' | 'ADMIN'

export type OrderStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUOTE_SENT'
  | 'PAID'
  | 'PRINTING'
  | 'QC'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type Material = 'PLA' | 'ABS' | 'RESIN' | 'PETG' | 'TPU' | 'NYLON'
export type Finish = 'STANDARD' | 'SMOOTH' | 'PAINTED' | 'POLISHED'
export type QuoteStatus = 'ESTIMATE' | 'CONFIRMED' | 'PAID'

export interface OrderConfig {
  material: Material
  color: string
  finish: Finish
  infill: number
  quantity: number
  notes?: string
}
