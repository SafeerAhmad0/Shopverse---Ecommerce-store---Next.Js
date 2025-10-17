-- Create special_offers table
CREATE TABLE IF NOT EXISTS special_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  original_price DECIMAL(10, 2),
  discounted_price DECIMAL(10, 2),
  image_url TEXT,
  product_ids UUID[],
  category_ids UUID[],
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);

-- Create index on start_date and end_date for date range queries
CREATE INDEX IF NOT EXISTS idx_special_offers_dates ON special_offers(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to read active special offers
CREATE POLICY "Allow public read access to active special offers"
  ON special_offers
  FOR SELECT
  USING (is_active = true);

-- Policy: Allow authenticated super_admins to insert special offers
CREATE POLICY "Allow super_admins to insert special offers"
  ON special_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Policy: Allow authenticated super_admins to update special offers
CREATE POLICY "Allow super_admins to update special offers"
  ON special_offers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Policy: Allow authenticated super_admins to delete special offers
CREATE POLICY "Allow super_admins to delete special offers"
  ON special_offers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Policy: Allow super_admins to view all special offers (including inactive)
CREATE POLICY "Allow super_admins to view all special offers"
  ON special_offers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_special_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER special_offers_updated_at
  BEFORE UPDATE ON special_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_special_offers_updated_at();
