-- ===================================================================
-- Promotional Banners Table Migration
-- ===================================================================
-- This creates a table to store promotional banners with countdown timers

-- Drop existing table if it exists
DROP TABLE IF EXISTS promo_banners CASCADE;

-- Create promo_banners table
CREATE TABLE promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  discount_text TEXT,
  button_text TEXT DEFAULT 'Buy Now',
  button_url TEXT,
  image_url TEXT,
  countdown_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active banners
CREATE INDEX idx_promo_banners_active ON promo_banners(is_active, display_order);

-- Enable Row Level Security
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- RLS POLICIES
-- ===================================================================

-- 1. SELECT: Anyone can view active banners
CREATE POLICY "Anyone can view active promo banners" ON promo_banners
  FOR SELECT USING (is_active = true);

-- 2. SELECT: Super admins can view all banners
CREATE POLICY "Super admins can view all promo banners" ON promo_banners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 3. INSERT: Only super admins can create banners
CREATE POLICY "Super admins can create promo banners" ON promo_banners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 4. UPDATE: Only super admins can update banners
CREATE POLICY "Super admins can update promo banners" ON promo_banners
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 5. DELETE: Only super admins can delete banners
CREATE POLICY "Super admins can delete promo banners" ON promo_banners
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
CREATE OR REPLACE FUNCTION update_promo_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promo_banners_timestamp
  BEFORE UPDATE ON promo_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_banners_updated_at();

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
-- This creates a table to store promotional banners with:
-- - Title, subtitle, description
-- - Discount text (e.g., "UP TO 30% OFF")
-- - Button text and URL
-- - Image URL (uploaded via Cloudinary)
-- - Countdown timer end date/time
-- - Active status and display order
