-- ============================================================
-- SliceDynamics Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MATERIALS TABLE
-- ============================================================
CREATE TABLE public.materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,           -- PLA, PETG, ABS, TPU, Resin
  cost_per_gram NUMERIC(8,4) NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.materials (name, cost_per_gram, description, color) VALUES
  ('PLA',   0.025, 'Standard biodegradable filament. Great for prototypes and decorative parts.', '#22c55e'),
  ('PETG',  0.032, 'Durable, food-safe, and slightly flexible. Excellent for functional parts.', '#3b82f6'),
  ('ABS',   0.028, 'Strong and heat-resistant. Ideal for mechanical components.', '#f59e0b'),
  ('TPU',   0.055, 'Flexible rubber-like material. Perfect for grips and gaskets.', '#ec4899'),
  ('Resin', 0.080, 'Ultra-high detail. Best for miniatures and detailed prototypes.', '#8b5cf6');

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  material_id UUID REFERENCES public.materials(id) NOT NULL,
  infill INTEGER NOT NULL DEFAULT 20 CHECK (infill BETWEEN 5 AND 100),
  layer_height NUMERIC(4,2) NOT NULL DEFAULT 0.2,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  -- Estimates (from STL analysis)
  estimated_weight_grams NUMERIC(8,2),
  estimated_print_hours NUMERIC(8,2),
  estimated_price NUMERIC(10,2),
  -- Final (set by admin after review)
  final_price NUMERIC(10,2),
  admin_notes TEXT,
  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted','under_review','approved','confirmed','in_production','quality_check','shipped','delivered','cancelled')
  ),
  -- Tracking
  tracking_number TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDER STATUS HISTORY (timeline)
-- ============================================================
CREATE TABLE public.order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
CREATE TABLE public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid BOOLEAN DEFAULT false
);

-- ============================================================
-- SITE CONTENT TABLE (CMS for admin)
-- ============================================================
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Default homepage content
INSERT INTO public.site_content (key, value) VALUES
('homepage_hero', '{"headline": "Manufacturing Dreams,\nOne Layer at a Time", "subheadline": "Professional 3D printing for creators, engineers, and businesses. Upload your model, get an instant estimate, and track every step.", "cta_primary": "Upload Your Model", "cta_secondary": "View Services"}'),
('homepage_features', '[{"icon": "Zap", "title": "Instant Estimates", "desc": "Upload your STL and get an immediate price and delivery estimate."}, {"icon": "Shield", "title": "Expert Review", "desc": "Every order is manually reviewed by our engineers before production."}, {"icon": "Package", "title": "Order Tracking", "desc": "Real-time visibility into every stage of your production lifecycle."}, {"icon": "Settings", "title": "5 Materials", "desc": "PLA, PETG, ABS, TPU, and Resin — optimized for every application."}]'),
('homepage_announcement', '{"active": false, "text": "Free shipping on orders over $150 this month!"}'),
('pricing_note', '"Prices shown are estimates. All orders undergo expert review for final pricing."'),
('contact_email', '"hello@slicedynamics.com"'),
('contact_phone', '"+1 (800) 555-SLICE"'),
('contact_address', '"123 Maker Lane, San Francisco, CA 94102"');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- ORDERS policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (public.get_user_role() = 'admin');

-- ORDER STATUS HISTORY policies
CREATE POLICY "Users can view own order history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );
CREATE POLICY "Admins can manage all history" ON public.order_status_history
  FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Users can insert history for own orders" ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

-- INVOICES policies
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all invoices" ON public.invoices
  FOR ALL USING (public.get_user_role() = 'admin');

-- MATERIALS policies (public read, admin write)
CREATE POLICY "Anyone can view active materials" ON public.materials
  FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage materials" ON public.materials
  FOR ALL USING (public.get_user_role() = 'admin');

-- SITE CONTENT policies (public read, admin write)
CREATE POLICY "Anyone can read site content" ON public.site_content
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage site content" ON public.site_content
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- STORAGE: Create STL files bucket
-- Run separately or via Supabase dashboard:
-- Bucket name: stl-files
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: application/octet-stream, model/stl
-- ============================================================

-- ============================================================
-- FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- FUNCTION: Auto-insert status history on order status change
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();
