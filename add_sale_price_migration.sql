-- Add sale_price column to products table
-- This allows products to have both an original price and a sale price

ALTER TABLE products
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10, 2);

-- Add a comment to explain the column
COMMENT ON COLUMN products.sale_price IS 'Discounted/sale price for the product. NULL means no sale. Should be less than price.';

-- Optional: Add a check constraint to ensure sale_price is less than price when set
ALTER TABLE products
ADD CONSTRAINT check_sale_price_less_than_price
CHECK (sale_price IS NULL OR sale_price < price);
