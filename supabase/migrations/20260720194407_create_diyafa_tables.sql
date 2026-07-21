/*
# Diyafa - Tables et structure (Partie 1)

Crée les 7 tables principales avec index, contraintes et triggers.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ TABLE: profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'partner', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============ TABLE: establishments ============
CREATE TABLE IF NOT EXISTS establishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hotel', 'restaurant', 'auberge', 'gîte')),
  city text NOT NULL,
  address text,
  description text,
  amenities text[] DEFAULT '{}',
  price_range text DEFAULT 'mid-range' CHECK (price_range IN ('budget', 'mid-range', 'luxury')),
  phone text,
  email text,
  images text[] DEFAULT '{}',
  cover_image text,
  partner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  average_rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_establishments_status ON establishments(status);
CREATE INDEX IF NOT EXISTS idx_establishments_city ON establishments(city);
CREATE INDEX IF NOT EXISTS idx_establishments_type ON establishments(type);
CREATE INDEX IF NOT EXISTS idx_establishments_partner ON establishments(partner_id);

-- ============ TABLE: rooms ============
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('single', 'double', 'suite', 'table')),
  capacity integer DEFAULT 1,
  price_per_night numeric DEFAULT 0,
  description text,
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  quantity integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_rooms_establishment ON rooms(establishment_id);

-- ============ TABLE: reservations ============
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  special_requests text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_establishment ON reservations(establishment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);

-- ============ TABLE: reviews ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'reported')),
  response text,
  response_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ============ TABLE: favorites ============
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, establishment_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- ============ TABLE: notifications ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('reservation', 'review', 'system', 'message')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_establishments_updated_at ON establishments;
CREATE TRIGGER update_establishments_updated_at
  BEFORE UPDATE ON establishments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_establishment_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE establishments
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) FROM reviews
      WHERE establishment_id = NEW.establishment_id AND status = 'visible'
    ),
    reviews_count = (
      SELECT COUNT(*) FROM reviews
      WHERE establishment_id = NEW.establishment_id AND status = 'visible'
    )
  WHERE id = NEW.establishment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rating_on_review_insert ON reviews;
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT OR DELETE OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_establishment_rating();
