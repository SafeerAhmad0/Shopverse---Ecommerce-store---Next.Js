-- ===================================================================
-- Reviews Table Migration - Updated for Review System
-- ===================================================================
-- This migration aligns the reviews table with the ReviewForm, ReviewList, and ReviewManagement components

-- Drop existing reviews table and recreate with correct schema
DROP TABLE IF EXISTS reviews CASCADE;

-- Create reviews table with is_hidden column
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_is_hidden ON reviews(is_hidden);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- RLS POLICIES
-- ===================================================================

-- 1. SELECT: Anyone can view non-hidden reviews
CREATE POLICY "Anyone can view visible reviews" ON reviews
  FOR SELECT USING (is_hidden = false);

-- 2. SELECT: Super admins can view all reviews (including hidden ones)
CREATE POLICY "Super admins can view all reviews" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 3. INSERT: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. UPDATE: Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. UPDATE: Super admins can update any review (for hiding/showing)
CREATE POLICY "Super admins can update any review" ON reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 6. DELETE: Super admins can delete any review
CREATE POLICY "Super admins can delete reviews" ON reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- ===================================================================
-- TRIGGERS
-- ===================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_timestamp
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Trigger to update product rating when review is added/updated
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's average rating and total reviews count
  -- Only count non-hidden reviews
  UPDATE products
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE product_id = NEW.product_id AND is_hidden = false
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = NEW.product_id AND is_hidden = false
    )
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- ===================================================================
-- ADDITIONAL COLUMNS FOR PRODUCTS TABLE
-- ===================================================================
-- Add rating columns to products table if they don't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- ===================================================================
-- NOTES
-- ===================================================================
-- To run this migration:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
--
-- This will:
-- - Create the reviews table with the correct schema
-- - Set up proper RLS policies for security
-- - Create indexes for performance
-- - Set up triggers for automatic updates
-- - Add rating columns to products table
