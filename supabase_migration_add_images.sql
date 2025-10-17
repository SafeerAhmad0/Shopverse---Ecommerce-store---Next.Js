-- Add images column to products table to support multiple images per product
-- This column will store an array of image URLs in JSON format
-- The existing image_url column will be kept for backwards compatibility

ALTER TABLE products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add a comment to document the column
COMMENT ON COLUMN products.images IS 'Array of image URLs for the product. Supports multiple product images.';

-- Add specs, features, and properties columns
ALTER TABLE products
ADD COLUMN IF NOT EXISTS specs TEXT,
ADD COLUMN IF NOT EXISTS features TEXT,
ADD COLUMN IF NOT EXISTS properties TEXT;

-- Add colors and wood types columns (arrays to support multiple selections)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS wood_types TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN products.specs IS 'Product specifications in text format';
COMMENT ON COLUMN products.features IS 'Product features in text format';
COMMENT ON COLUMN products.properties IS 'Product properties in text format';
COMMENT ON COLUMN products.colors IS 'Array of colors available for this product';
COMMENT ON COLUMN products.wood_types IS 'Array of wood types available for this product';
