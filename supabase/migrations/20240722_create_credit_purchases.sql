-- Create credit_purchases table for one-time credit purchases
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount paid in cents (CLP)
  credits INTEGER NOT NULL, -- Number of credits purchased
  currency VARCHAR(3) NOT NULL DEFAULT 'CLP',
  provider VARCHAR(50) NOT NULL DEFAULT 'flow',
  flow_token VARCHAR(255), -- Flow payment token
  flow_order BIGINT, -- Flow order number
  commerce_order VARCHAR(100), -- Our internal order reference
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  payment_date TIMESTAMPTZ, -- When payment was confirmed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_flow_token ON credit_purchases(flow_token);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_commerce_order ON credit_purchases(commerce_order);

-- Enable RLS (Row Level Security)
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own credit purchases" ON credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit purchases" ON credit_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can manage all credit purchases (for webhooks)
CREATE POLICY "Service role can manage all credit purchases" ON credit_purchases
  FOR ALL USING (auth.role() = 'service_role');

-- Create user_credits table to track current credit balance
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  used_credits INTEGER NOT NULL DEFAULT 0,
  available_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for user_credits
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Enable RLS for user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_credits
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all user credits" ON user_credits
  FOR ALL USING (auth.role() = 'service_role');

-- Function to add credits to user account when purchase is completed
CREATE OR REPLACE FUNCTION add_credits_to_user(p_user_id UUID, p_credits INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Insert or update user credits
  INSERT INTO user_credits (user_id, total_credits)
  VALUES (p_user_id, p_credits)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_credits = user_credits.total_credits + p_credits,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use credits (for AI features)
CREATE OR REPLACE FUNCTION use_credits(p_user_id UUID, p_credits_to_use INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  current_available INTEGER;
BEGIN
  -- Get current available credits
  SELECT available_credits INTO current_available
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist in credits table, they have 0 credits
  IF current_available IS NULL THEN
    current_available := 0;
  END IF;
  
  -- Check if user has enough credits
  IF current_available >= p_credits_to_use THEN
    -- Update used credits
    INSERT INTO user_credits (user_id, used_credits)
    VALUES (p_user_id, p_credits_to_use)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      used_credits = user_credits.used_credits + p_credits_to_use,
      updated_at = NOW();
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON credit_purchases TO anon, authenticated;
GRANT ALL ON user_credits TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_credits_to_user TO anon, authenticated;
GRANT EXECUTE ON FUNCTION use_credits TO anon, authenticated;
