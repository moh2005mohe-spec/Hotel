# تطبيق الـ Migration على Supabase

## خطوات التطبيق:

### 1. الدخول إلى Supabase
- اذهب إلى [https://supabase.com](https://supabase.com)
- سجل الدخول إلى مشروعك

### 2. فتح SQL Editor
- اذهب إلى **SQL Editor** من القائمة الجانبية
- انقر على **New Query**

### 3. نسخ والصق الـ SQL Code
انسخ الكود التالي وألصقه في SQL Editor:

```sql
-- ============ ALTER profiles TABLE: Add status column ============
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- ============ UPDATE trigger: auto-create profile on signup + set status ============
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'client');
  IF v_role NOT IN ('client', 'partner', 'admin') THEN
    v_role := 'client';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    v_role,
    'active'
  );

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', v_role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Prevent banned users from creating reservations ============
CREATE OR REPLACE FUNCTION check_user_not_banned()
RETURNS TRIGGER AS $$
DECLARE
  user_status text;
BEGIN
  SELECT status INTO user_status
  FROM profiles
  WHERE id = NEW.user_id;

  IF user_status = 'banned' THEN
    RAISE EXCEPTION 'User account is banned and cannot make reservations';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_banned_before_reservation ON reservations;
CREATE TRIGGER check_banned_before_reservation
  BEFORE INSERT ON reservations
  FOR EACH ROW EXECUTE FUNCTION check_user_not_banned();

-- ============ Enhanced Notifications Policies ============
-- Allow users to read their own notifications
DROP POLICY IF EXISTS "user_read_own_notifications" ON notifications;
CREATE POLICY "user_read_own_notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own notifications (mark as read)
DROP POLICY IF EXISTS "user_update_own_notifications" ON notifications;
CREATE POLICY "user_update_own_notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own notifications
DROP POLICY IF EXISTS "user_delete_own_notifications" ON notifications;
CREATE POLICY "user_delete_own_notifications" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Allow system/admin to insert notifications for users
DROP POLICY IF EXISTS "system_insert_notifications" ON notifications;
CREATE POLICY "system_insert_notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR auth.uid() = user_id);
```

### 4. تنفيذ الـ Query
- انقر على **RUN** أو اضغط **Ctrl+Enter** (أو **Cmd+Enter** على Mac)
- انتظر حتى ينتهي التنفيذ

### 5. التحقق من النجاح
- إذا رأيت "Success" دون أخطاء، فقد تم التطبيق بنجاح
- إذا حدث خطأ، تحقق من رسالة الخطأ وأعد المحاولة

## ما تم إضافته:

### 1. عمود `status` في جدول `profiles`
- يمكنك الآن حظر المستخدمين أو تعليق حسابهم
- القيم الممكنة: `active` (نشط)، `banned` (محظور)، `suspended` (معلق)

### 2. دالة منع المستخدمين المحظورين من الحجز
- محاولة حجز من قبل مستخدم محظور ستؤدي إلى خطأ

### 3. صفحة الإشعارات الكاملة
- يمكن للمستخدمين عرض جميع الإشعارات
- تعليم الإشعارات كمقروءة/غير مقروءة
- حذف الإشعارات الفردية أو جميعها

### 4. سياسات الوصول المحسّنة (RLS Policies)
- المستخدمون يمكنهم الآن تحديث إشعاراتهم الخاصة
- المستخدمون يمكنهم حذف إشعاراتهم الخاصة
- الإداريون يمكنهم إدراج إشعارات للمستخدمين
