-- Supabase Schema for Bills and Payment Processing
-- Run this SQL in your Supabase SQL Editor

-- Users table (lightweight, we rely on Supabase Auth or your existing auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  stripe_customer_id TEXT,
  role TEXT, -- landlord/tenant
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT, -- electricity/gas/water/rent/other
  provider_name TEXT,
  amount NUMERIC(10,2),
  due_date DATE,
  status TEXT DEFAULT 'pending', -- pending/paid/failed/requires_action
  qr_raw TEXT,
  meta JSONB,
  stripe_pi_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  amount NUMERIC(10,2),
  provider TEXT,
  status TEXT, -- pending/paid/failed/requires_action
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods table (vaulted in Stripe; we store refs)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE,
  brand TEXT,
  last4 TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER set_updated_at_bills
  BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own bills" ON bills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bill_id ON transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);

