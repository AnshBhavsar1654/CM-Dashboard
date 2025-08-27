-- Users table for auth (admin prepopulates users; no signup route)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- store bcrypt hash or strong random temp password
  name TEXT,
  designation TEXT,
  -- allowed values: '1m','3m','6m','1y'
  filter TEXT NOT NULL DEFAULT '1y' CHECK (filter IN ('1m','3m','6m','1y')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example insert (replace with real data and hashed passwords)
-- INSERT INTO users (email, password, name, designation, filter)
-- VALUES ('officer@example.gov.in', '$2b$10$hashedpassword', 'Officer Name', 'Designation', '6m');


-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Insert admin user
-- npm run add-user -- <email> <password> [name] [designation] [filter]
-- Example usage: npm run add-user -- officer@example.gov.in StrongPass "Officer Name" "Joint Secretary" 6m