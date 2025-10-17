-- ===================================================================
-- Add image_url column to categories table
-- ===================================================================
-- This adds support for category images in the Browse by Category section

-- Add image_url column if it doesn't exist
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS image_url TEXT;

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
-- This adds an optional image_url column to store Cloudinary image URLs
-- for each category, which will be displayed in the Browse by Category
-- section on the home page.
