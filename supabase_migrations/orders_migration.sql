-- Orders Management System
-- This migration creates tables for managing customer orders

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Customer Information
  customer_email TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,

  -- Billing Address
  billing_address TEXT NOT NULL,
  billing_address_2 TEXT,
  billing_city TEXT NOT NULL,
  billing_country TEXT NOT NULL,
  billing_postal_code TEXT,

  -- Shipping Address
  shipping_address TEXT,
  shipping_address_2 TEXT,
  shipping_city TEXT,
  shipping_country TEXT,
  shipping_postal_code TEXT,
  shipping_method TEXT,

  -- Order Details
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Payment Information
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',

  -- Order Status
  status TEXT DEFAULT 'pending',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table (products in each order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Product snapshot (in case product is deleted/modified)
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT,

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_price CHECK (price >= 0)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate order number: ORD-YYYYMMDD-XXXXX (e.g., ORD-20250114-12345)
    new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');

    -- Check if order number already exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number) INTO order_exists;

    -- If it doesn't exist, we found a unique number
    EXIT WHEN NOT order_exists;
  END LOOP;

  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view their own order items
CREATE POLICY "Users can view own order items"
  ON order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can do everything with orders
CREATE POLICY "Service can manage orders"
  ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Service role can do everything with order items
CREATE POLICY "Service can manage order items"
  ON order_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can insert orders (for checkout)
CREATE POLICY "Authenticated users can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can insert order items (for checkout)
CREATE POLICY "Authenticated users can create order items"
  ON order_items
  FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON order_items TO service_role;

-- Create view for order summaries (easier querying)
CREATE OR REPLACE VIEW order_summaries AS
SELECT
  o.id,
  o.order_number,
  o.user_id,
  o.customer_email,
  o.customer_first_name || ' ' || o.customer_last_name AS customer_name,
  o.customer_phone,
  o.total,
  o.status,
  o.payment_status,
  o.payment_method,
  o.created_at,
  o.updated_at,
  COUNT(oi.id) AS total_items,
  SUM(oi.quantity) AS total_quantity
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.user_id, o.customer_email,
         o.customer_first_name, o.customer_last_name, o.customer_phone,
         o.total, o.status, o.payment_status, o.payment_method,
         o.created_at, o.updated_at;

-- Grant view permissions
GRANT SELECT ON order_summaries TO authenticated;
GRANT SELECT ON order_summaries TO service_role;

-- Create function to get order details with items
CREATE OR REPLACE FUNCTION get_order_details(order_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'order', row_to_json(o.*),
    'items', COALESCE(
      (
        SELECT json_agg(row_to_json(oi.*))
        FROM order_items oi
        WHERE oi.order_id = order_id_param
      ),
      '[]'::json
    )
  )
  INTO result
  FROM orders o
  WHERE o.id = order_id_param;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
