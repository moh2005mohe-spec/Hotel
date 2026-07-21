# تفعيل التحقق من البريد الإلكتروني - Email Verification Setup

## المشكلة التي تم حلها

المستخدمون الجدد لا يتلقون رسائل تأكيد البريد الإلكتروني، مما يسمح لهم بتسجيل الدخول دون التحقق من البريد.

## الحل

تفعيل **Email Verification** في Supabase Auth مع إضافة رسالة تعليمية في الواجهة الأمامية.

---

## الخطوات المطلوبة

### 1. تسجيل الدخول إلى Supabase Console
```
https://app.supabase.com/
```

### 2. اختر مشروعك (Hotel)

### 3. توجه إلى Authentication → Providers

![Navigate to Providers](https://user-images.githubusercontent.com/...)

### 4. ابحث عن قسم **Email Configuration**

### 5. قسم **Email Templates**
- انقر على **Email Templates**
- ستجد template: **Confirm signup**

### 6. تفعيل Confirm Signup Email
```
⚙️ Settings → Authentication → Email Templates
```

**تأكد من وجود هذه الخيارات:**

#### أ) Enable Confirm Signup
- ابحث عن: **Confirm signup email**
- تأكد أن الزر **Enabled** (أخضر)

#### ب) إعدادات البريد الافتراضي
إذا لم تكن لديك SMTP مخصص (Resend)، استخدم البريد الافتراضي:
- المرسِل: `noreply@supabaseauth.com`
- النوع: Transactional email

### 7. إعدادات الجلسة (Session)
```
Settings → Authentication → Session Management
```

تأكد من:
- **Enable Email Confirmation** ✅
- **Auto confirm new users** ❌ (معطّل - لأننا نريد التحقق من البريد)

### 8. URL للإعادة (Redirect URL)
```
Settings → Authentication → Redirect URLs
```

أضف:
```
https://hotel-phi-weld.vercel.app/
https://hotel-phi-weld.vercel.app/dashboard
http://localhost:5173/
```

---

## كيفية عمل العملية

### سيناريو تسجيل مستخدم جديد:

1. **المستخدم يملأ نموذج التسجيل**
   ```
   - البريد: user@example.com
   - الاسم: Ahmed
   - كلمة المرور: ****
   ```

2. **ينقر زر "S'inscrire" (التسجيل)**

3. **الواجهة تعرض رسالة**
   ```
   ✅ تم إرسال رابط التأكيد إلى بريدك الإلكتروني
   📧 user@example.com
   ⏳ الرابط ينتهي في 24 ساعة
   ```

4. **يستقبل المستخدم رسالة بريد**
   - الموضوع: "Confirm your signup"
   - الرسالة: تحتوي على رابط التأكيد

5. **ينقر المستخدم الرابط**

6. **يتم توجيهه إلى الموقع** (redirect)

7. **الآن المستخدم يمكنه تسجيل الدخول**

---

## الخطوات العملية في Supabase

### ✅ الخطوة 1: تفعيل Confirm Email

1. افتح: `https://app.supabase.com/project/[PROJECT_ID]/auth/providers`

2. ابحث عن **Email** (الخيار الأول)

3. انقر على قسم **Email Confirmation**

4. تأكد من:
   - ✅ Enable Email Confirmations (موصل)
   - ❌ Auto Confirm New Users (معطّل)

5. انقر **Save**

### ✅ الخطوة 2: تفعيل Email Template

1. من نفس الصفحة، ابحث عن **Email Templates**

2. انقر على **Confirm signup**

3. تأكد من الرسالة:
   ```
   Subject: Confirm your signup
   
   Body:
   Follow this link to confirm your user:
   {{ .ConfirmationURL }}
   ```

4. انقر **Save**

### ✅ الخطوة 3: إضافة Redirect URLs

1. توجه إلى: `Authentication → Redirect URLs`

2. أضف:
   ```
   https://hotel-phi-weld.vercel.app
   https://hotel-phi-weld.vercel.app/dashboard
   http://localhost:5173
   ```

3. انقر **Save**

---

## التحقق من أن كل شيء يعمل

### اختبر التسجيل:

1. **افتح الموقع:**
   ```
   https://hotel-phi-weld.vercel.app/register
   ```

2. **أملأ النموذج:**
   - الاسم: Test User
   - البريد: **your-email@example.com**
   - الهاتف: +213 123456789
   - كلمة المرور: Test@123
   - الدور: Client

3. **انقر "S'inscrire"**

4. **تحقق من رسائلك:**
   - ابحث في صندوق الوارد
   - ابحث في spam أيضاً
   - انقر على الرابط في الرسالة

5. **ستعود إلى الموقع وتسجيل الدخول الآن يعمل ✅**

---

## الرسائل المعروضة للمستخدم

### عند النجاح ✅
```
تم إرسال رابط التأكيد إلى بريدك الإلكتروني
احجز على البريد الإلكتروني الخاص بك والنقر على الرابط لتأكيد حسابك
⏳ الرابط ينتهي في 24 ساعة
📧 your-email@example.com
```

### عند الخطأ ❌
```
[رسالة الخطأ من Supabase]
مثال: "User already registered"
```

---

## المشاكل الشائعة والحلول

### ❌ المستخدم لا يستقبل البريد

**السبب 1:** لم يتم تفعيل Email Confirmation
```
الحل: اتبع الخطوات أعلاه للتفعيل
```

**السبب 2:** البريد ذهب إلى Spam
```
الحل: تحقق من مجلد Spam وأضفه إلى جهات الاتصال
```

**السبب 3:** البريد غير صحيح
```
الحل: تأكد من كتابة البريد بشكل صحيح (بدون مسافات)
```

### ❌ المستخدم يستطيع تسجيل الدخول بدون تأكيد

**السبب:** "Auto Confirm New Users" مفعّل
```
الحل: عطّله في Settings → Authentication
```

### ❌ الرابط في البريد لا يعمل

**السبب 1:** Redirect URLs غير مضافة
```
الحل: أضفها في Settings → Redirect URLs
```

**السبب 2:** الرابط انتهت صلاحيته
```
الحل: اطلب البريد مجدداً (بعد 24 ساعة ينتهي الرابط)
```

---

## الملفات المعدلة

✅ `src/pages/Register.tsx`
- إضافة رسالة تأكيد نجاح
- عرض البريد المدخل
- منع إعادة التوجيه فوراً

✅ `src/lib/i18n.ts`
- إضافة الترجمات الفرنسية
- إضافة الترجمات العربية
- رسائل تأكيد البريد

---

## الحالة الحالية

| الميزة | الحالة |
|--------|---------|
| نموذج التسجيل | ✅ يعمل |
| رسالة التأكيد | ✅ تظهر |
| التوجيه | ✅ صحيح |
| الترجمات | ✅ كاملة |
| Supabase Config | ⏳ تحتاج تفعيل |

---

## الخطوة التالية

1. اتبع الخطوات العملية أعلاه
2. اختبر التسجيل
3. تحقق من البريد
4. استمتع! 🎉

---

## المراجع

- [Supabase Auth Email](https://supabase.com/docs/guides/auth/auth-email)
- [Email Templates](https://supabase.com/docs/guides/auth/email-templates)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
