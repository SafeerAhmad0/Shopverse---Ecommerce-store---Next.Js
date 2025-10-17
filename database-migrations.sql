-- ===================================================================
-- Database Migrations for ShopverseEcommerce
-- ===================================================================

-- -------------------------------------------------------------------
-- 1. REVIEWS TABLE
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can do everything with reviews" ON reviews
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- -------------------------------------------------------------------
-- 2. FLASH SALES TABLE
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  original_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  stock_limit INTEGER,
  stock_sold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_prices CHECK (sale_price < original_price),
  CONSTRAINT valid_stock CHECK (stock_sold <= stock_limit)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flash_sales_product_id ON flash_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_flash_sales_dates ON flash_sales(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_flash_sales_is_active ON flash_sales(is_active);

-- Enable RLS
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flash sales
CREATE POLICY "Anyone can view active flash sales" ON flash_sales
  FOR SELECT USING (
    is_active = true
    AND NOW() BETWEEN start_date AND end_date
    AND (stock_limit IS NULL OR stock_sold < stock_limit)
  );

CREATE POLICY "Admins can manage flash sales" ON flash_sales
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- -------------------------------------------------------------------
-- 3. SPECIAL REQUESTS/ORDERS TABLE
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS special_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  request_type VARCHAR(50) NOT NULL DEFAULT 'custom_order', -- custom_order, bulk_order, special_design
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  specifications JSONB, -- Custom specifications in JSON format
  reference_images TEXT[], -- Array of image URLs
  budget_range VARCHAR(100),
  quantity INTEGER,
  deadline_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, reviewing, quoted, approved, in_progress, completed, rejected
  admin_notes TEXT,
  quote_amount DECIMAL(10, 2),
  quote_details TEXT,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_special_requests_user_id ON special_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_special_requests_status ON special_requests(status);
CREATE INDEX IF NOT EXISTS idx_special_requests_created_at ON special_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_special_requests_priority ON special_requests(priority);

-- Enable RLS
ALTER TABLE special_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for special requests
CREATE POLICY "Users can view their own special requests" ON special_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create special requests" ON special_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own pending requests" ON special_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all special requests" ON special_requests
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- -------------------------------------------------------------------
-- 4. UPDATE PRODUCTS TABLE (add flash sale indicator)
-- -------------------------------------------------------------------
ALTER TABLE products
ADD COLUMN IF NOT EXISTS has_flash_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- -------------------------------------------------------------------
-- 5. TRIGGERS FOR AUTOMATIC UPDATES
-- -------------------------------------------------------------------

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flash_sales_updated_at BEFORE UPDATE ON flash_sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_requests_updated_at BEFORE UPDATE ON special_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update product rating when review is added/updated
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Trigger to calculate discount percentage for flash sales
CREATE OR REPLACE FUNCTION calculate_discount_percentage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.discount_percentage = ROUND(((NEW.original_price - NEW.sale_price) / NEW.original_price * 100)::numeric);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_flash_sale_discount BEFORE INSERT OR UPDATE ON flash_sales
  FOR EACH ROW EXECUTE FUNCTION calculate_discount_percentage();

-- -------------------------------------------------------------------
-- SAMPLE DATA (Optional - for testing)
-- -------------------------------------------------------------------

-- Uncomment to insert sample reviews
-- INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, is_approved) VALUES
-- ((SELECT id FROM products LIMIT 1), 'John Doe', 'john@example.com', 5, 'Excellent Quality!', 'This pallet is amazing. Very sturdy and well-made.', true),
-- ((SELECT id FROM products LIMIT 1), 'Jane Smith', 'jane@example.com', 4, 'Good value', 'Nice product for the price. Delivery was fast.', true);

-- Uncomment to insert sample flash sale
-- INSERT INTO flash_sales (product_id, original_price, sale_price, start_date, end_date, stock_limit) VALUES
-- ((SELECT id FROM products LIMIT 1), 100.00, 75.00, NOW(), NOW() + INTERVAL '7 days', 50);
