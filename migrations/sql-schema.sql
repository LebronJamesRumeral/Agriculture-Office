-- Create users table to extend Supabase auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'farmer', -- farmer, officer, admin
  phone TEXT,
  address TEXT,
  municipality TEXT,
  barangay TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert mock test accounts with actual user creation
-- Only ADMIN and OFFICER can login
-- FARMERS access via QR code scanning (no login needed)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  role
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Dr. Jose Rizal", "role": "admin"}',
  NOW(),
  NOW(),
  NOW(),
  'authenticated'
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'officer@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Maria Santos", "role": "officer"}',
  NOW(),
  NOW(),
  NOW(),
  'authenticated'
)
ON CONFLICT DO NOTHING;

-- Update user profiles with additional details
UPDATE public.users SET
  phone = '09111111111',
  address = '789 Government Center',
  municipality = 'Olongapo',
  barangay = 'Barangay 3'
WHERE email = 'admin@test.com';

UPDATE public.users SET
  phone = '09198765432',
  address = '456 Admin Building',
  municipality = 'Olongapo',
  barangay = 'Barangay 2'
WHERE email = 'officer@test.com';

-- ============================================
-- FARMERS/FISHERFOLKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE NOT NULL, -- Unique QR code for each farmer
  full_name TEXT NOT NULL,
  farmer_type TEXT NOT NULL, -- 'farmer' or 'fisherfolk'
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  municipality TEXT DEFAULT 'Olongapo',
  barangay TEXT NOT NULL,
  crop_type TEXT, -- For farmers: rice, corn, vegetables, etc.
  farm_size DECIMAL, -- In hectares
  fishing_vessel TEXT, -- For fisherfolk: boat type
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active', -- active, inactive
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can insert farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can update farmers" ON public.farmers;

-- Policies for farmers table
CREATE POLICY "Anyone can view farmers"
  ON public.farmers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert farmers"
  ON public.farmers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update farmers"
  ON public.farmers FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_farmers_qr_code ON public.farmers(qr_code);
CREATE INDEX IF NOT EXISTS idx_farmers_barangay ON public.farmers(barangay);
CREATE INDEX IF NOT EXISTS idx_farmers_type ON public.farmers(farmer_type);
CREATE INDEX IF NOT EXISTS idx_farmers_status ON public.farmers(status);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  audience TEXT, -- e.g., "Fisherfolks & Farmers — everyone invited"
  status TEXT DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;

-- Policies for events
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage events"
  ON public.events FOR ALL
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- ============================================
-- EVENT ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  attendance_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE(event_id, farmer_id) -- Prevent duplicate attendance
);

-- Enable RLS
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.event_attendance;
DROP POLICY IF EXISTS "Authenticated users can manage attendance" ON public.event_attendance;

-- Policies for attendance
CREATE POLICY "Anyone can view attendance"
  ON public.event_attendance FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage attendance"
  ON public.event_attendance FOR ALL
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_farmer ON public.event_attendance(farmer_id);

-- ============================================
-- RECORDS/REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- harvest, assistance, training, etc.
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  amount DECIMAL, -- For assistance records
  quantity DECIMAL, -- For harvest records
  unit TEXT, -- kg, tons, sacks, etc.
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view records" ON public.records;
DROP POLICY IF EXISTS "Authenticated users can manage records" ON public.records;

-- Policies for records
CREATE POLICY "Anyone can view records"
  ON public.records FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage records"
  ON public.records FOR ALL
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_records_farmer ON public.records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_records_type ON public.records(record_type);
CREATE INDEX IF NOT EXISTS idx_records_date ON public.records(record_date);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Sample Farmers
INSERT INTO public.farmers (qr_code, full_name, farmer_type, phone, email, address, barangay, crop_type, farm_size, status) VALUES
('QR-FARMER-001', 'Juan Dela Cruz', 'farmer', '09123456789', 'juan@example.com', '123 Agricultural St', 'Barangay 1', 'Rice', 2.5, 'active'),
('QR-FARMER-002', 'Maria Santos', 'farmer', '09198765432', 'maria@example.com', '456 Harvest Rd', 'Barangay 2', 'Corn', 3.0, 'active'),
('QR-FARMER-003', 'Pedro Manalo', 'farmer', '09122222222', 'pedro@example.com', '789 Crop Lane', 'Barangay 3', 'Vegetables', 1.5, 'active'),
('QR-FISHER-001', 'Carlos Reyes', 'fisherfolk', '09111111111', 'carlos@example.com', 'Seaside Community', 'Barangay 4', NULL, NULL, 'active'),
('QR-FISHER-002', 'Ana Lopez', 'fisherfolk', '09133333333', 'ana@example.com', 'Coastal Area', 'Barangay 5', NULL, NULL, 'active'),
('QR-FARMER-004', 'Roberto Cruz', 'farmer', '09144444444', 'roberto@example.com', '234 Farm Rd', 'Barangay 1', 'Rice', 4.0, 'active'),
('QR-FISHER-003', 'Elena Garcia', 'fisherfolk', '09155555555', 'elena@example.com', 'Fishing Village', 'Barangay 4', NULL, NULL, 'inactive')
ON CONFLICT (qr_code) DO NOTHING;

-- Sample Events
INSERT INTO public.events (title, description, event_date, event_time, venue, audience, status) VALUES
('Olongapo Coastal Resource Summit', 'Updates on coastal management, community consultation, and programs supporting local fisherfolks and farmers.', '2026-02-10', '9:00 AM – 3:00 PM', 'Olongapo City Hall Plaza', 'Fisherfolks & Farmers — everyone invited', 'upcoming'),
('Integrated Farming & Aquaculture Fair', 'Hands-on demos, seedling and fingerling distribution, and sign-ups for training opportunities.', '2026-02-17', '8:00 AM – 5:00 PM', 'Barangay Barretto Covered Court, Olongapo City', 'Fisherfolks & Farmers — open to all', 'upcoming'),
('Disaster Preparedness & Livelihood Workshop', 'Community DRR training, emergency aid programs overview, and resilient livelihood planning.', '2026-02-24', '1:00 PM – 4:30 PM', 'Olongapo Convention Center', 'Fisherfolks & Farmers — everyone invited', 'upcoming'),
('Citywide Registry Day: Fisherfolk & Farmer Enrollment', 'On-site registration and updates for city programs and assistance. Bring valid ID.', '2026-03-02', '8:00 AM – 4:00 PM', 'Olongapo City Agriculture Office', 'Open invitation to all fisherfolks and farmers', 'upcoming')
ON CONFLICT DO NOTHING;
