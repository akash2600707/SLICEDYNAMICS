// ============================================================
// Database Types — matches Supabase schema
// ============================================================

export type Role = 'user' | 'admin'

export type OrderStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'confirmed'
  | 'in_production'
  | 'quality_check'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: Role
  created_at: string
  updated_at: string
}

export type Material = {
  id: string
  name: string
  cost_per_gram: number
  description: string | null
  color: string
  active: boolean
  created_at: string
}

export type Order = {
  id: string
  user_id: string
  file_url: string
  file_name: string
  material_id: string
  infill: number
  layer_height: number
  quantity: number
  estimated_weight_grams: number | null
  estimated_print_hours: number | null
  estimated_price: number | null
  final_price: number | null
  admin_notes: string | null
  status: OrderStatus
  tracking_number: string | null
  created_at: string
  updated_at: string
  // Joined
  material?: Material
  profile?: Profile
}

export type OrderStatusHistory = {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  changed_by: string | null
  created_at: string
}

export type Invoice = {
  id: string
  order_id: string
  user_id: string
  invoice_number: string
  amount: number
  issued_at: string
  due_date: string | null
  paid: boolean
}

export type SiteContent = {
  key: string
  value: unknown
  updated_at: string
  updated_by: string | null
}

// ============================================================
// Supabase Database type for createClient generic
// ============================================================
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      materials: {
        Row: Material
        Insert: Omit<Material, 'id' | 'created_at'>
        Update: Partial<Omit<Material, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'material' | 'profile'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'material' | 'profile'>>
      }
      order_status_history: {
        Row: OrderStatusHistory
        Insert: Omit<OrderStatusHistory, 'id' | 'created_at'>
        Update: never
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id'>
        Update: Partial<Omit<Invoice, 'id'>>
      }
      site_content: {
        Row: SiteContent
        Insert: SiteContent
        Update: Partial<SiteContent>
      }
    }
  }
}

// ============================================================
// Price Estimation
// ============================================================
export type PriceEstimate = {
  weightGrams: number
  printHours: number
  materialCost: number
  timeCost: number
  subtotal: number
  rangeLow: number
  rangeHigh: number
  deliveryDays: number
}

// ============================================================
// New Order Form
// ============================================================
export type NewOrderForm = {
  file: File | null
  materialId: string
  infill: number
  layerHeight: number
  quantity: number
}
