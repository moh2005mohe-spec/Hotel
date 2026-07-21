/*
# Diyafa - Politiques RLS + Admin + Trigger profiles
*/

-- ============ Fonction is_admin ============
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============ profiles ============
DROP POLICY IF EXISTS "user_select_own_profile" ON profiles;
CREATE POLICY "user_select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_update_own_profile" ON profiles;
CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============ Trigger: auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'client');
  IF v_role NOT IN ('client', 'partner', 'admin') THEN
    v_role := 'client';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    v_role
  );

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', v_role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ establishments ============
DROP POLICY IF EXISTS "public_read_active_establishments" ON establishments;
CREATE POLICY "public_read_active_establishments" ON establishments
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "partner_select_own_establishments" ON establishments;
CREATE POLICY "partner_select_own_establishments" ON establishments
  FOR SELECT TO authenticated
  USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "partner_insert_own_establishments" ON establishments;
CREATE POLICY "partner_insert_own_establishments" ON establishments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = partner_id);

DROP POLICY IF EXISTS "partner_update_own_establishments" ON establishments;
CREATE POLICY "partner_update_own_establishments" ON establishments
  FOR UPDATE TO authenticated
  USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

DROP POLICY IF EXISTS "partner_delete_own_establishments" ON establishments;
CREATE POLICY "partner_delete_own_establishments" ON establishments
  FOR DELETE TO authenticated
  USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "admin_select_establishments" ON establishments;
CREATE POLICY "admin_select_establishments" ON establishments
  FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_update_establishments" ON establishments;
CREATE POLICY "admin_update_establishments" ON establishments
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_establishments" ON establishments;
CREATE POLICY "admin_delete_establishments" ON establishments
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============ rooms ============
DROP POLICY IF EXISTS "public_read_rooms" ON rooms;
CREATE POLICY "public_read_rooms" ON rooms
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = rooms.establishment_id
      AND establishments.status = 'active'
    )
  );

DROP POLICY IF EXISTS "partner_manage_own_rooms" ON rooms;
CREATE POLICY "partner_manage_own_rooms" ON rooms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = rooms.establishment_id
      AND establishments.partner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = rooms.establishment_id
      AND establishments.partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_manage_rooms" ON rooms;
CREATE POLICY "admin_manage_rooms" ON rooms
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============ reservations ============
DROP POLICY IF EXISTS "client_select_own_reservations" ON reservations;
CREATE POLICY "client_select_own_reservations" ON reservations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "client_insert_own_reservations" ON reservations;
CREATE POLICY "client_insert_own_reservations" ON reservations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "client_update_own_reservations" ON reservations;
CREATE POLICY "client_update_own_reservations" ON reservations
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "partner_select_reservations" ON reservations;
CREATE POLICY "partner_select_reservations" ON reservations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = reservations.establishment_id
      AND establishments.partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "partner_update_reservations" ON reservations;
CREATE POLICY "partner_update_reservations" ON reservations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = reservations.establishment_id
      AND establishments.partner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = reservations.establishment_id
      AND establishments.partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_select_reservations" ON reservations;
CREATE POLICY "admin_select_reservations" ON reservations
  FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_update_reservations" ON reservations;
CREATE POLICY "admin_update_reservations" ON reservations
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============ reviews ============
DROP POLICY IF EXISTS "public_read_visible_reviews" ON reviews;
CREATE POLICY "public_read_visible_reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (status = 'visible');

DROP POLICY IF EXISTS "client_insert_own_reviews" ON reviews;
CREATE POLICY "client_insert_own_reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "client_update_own_reviews" ON reviews;
CREATE POLICY "client_update_own_reviews" ON reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "client_delete_own_reviews" ON reviews;
CREATE POLICY "client_delete_own_reviews" ON reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "partner_respond_reviews" ON reviews;
CREATE POLICY "partner_respond_reviews" ON reviews
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = reviews.establishment_id
      AND establishments.partner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE establishments.id = reviews.establishment_id
      AND establishments.partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_manage_reviews" ON reviews;
CREATE POLICY "admin_manage_reviews" ON reviews
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============ favorites ============
DROP POLICY IF EXISTS "user_manage_own_favorites" ON favorites;
CREATE POLICY "user_manage_own_favorites" ON favorites
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============ notifications ============
DROP POLICY IF EXISTS "user_manage_own_notifications" ON notifications;
CREATE POLICY "user_manage_own_notifications" ON notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
