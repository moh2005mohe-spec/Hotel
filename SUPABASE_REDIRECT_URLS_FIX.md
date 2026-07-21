# إصلاح مشكلة Redirect URLs في Supabase

## المشكلة
رابط تأكيد البريد الإلكتروني يحتوي على `localhost:3000` بدلاً من الدومين الفعلي.

### السبب
Supabase مُعدّ للتطوير المحلي (localhost) وليس للإنتاج.

---

## الحل السريع (5 دقائق)

### 1️⃣ افتح Supabase Console
👉 https://app.supabase.com

### 2️⃣ اختر المشروع
- اختر `Hotel` project

### 3️⃣ انتقل إلى Authentication Settings
```
Authentication → Providers → Email → Site URL & Redirect URLs
```

### 4️⃣ حدّث Site URL
**الحالي:**
```
http://localhost:3000
```

**يجب أن يكون:**
```
https://hotel-phi-weld.vercel.app
```

أو إذا كان لديك دومين فعلي:
```
https://yourdomain.com
```

### 5️⃣ أضف Redirect URLs
في قسم **Redirect URLs**، أضف:

```
https://hotel-phi-weld.vercel.app
https://hotel-phi-weld.vercel.app/
https://hotel-phi-weld.vercel.app/dashboard
https://hotel-phi-weld.vercel.app/login
https://hotel-phi-weld.vercel.app/partner
https://hotel-phi-weld.vercel.app/admin
```

**للتطوير المحلي، أبقِ:**
```
http://localhost:3000
http://localhost:3000/
http://localhost:5173
http://localhost:5173/
```

### 6️⃣ احفظ التغييرات
انقر **Save**

---

## خطوات مفصلة مع الصور

### الخطوة 1: الذهاب إلى Supabase Console
![Step 1]
1. افتح https://app.supabase.com
2. سجّل الدخول
3. اختر مشروع Hotel

### الخطوة 2: المسار الصحيح
```
🏠 Home
→ Authentication
→ Providers
→ Email
→ Site URL
→ Redirect URLs
```

### الخطوة 3: تحديث Site URL

**قبل التعديل:**
```
Authentication Settings
├── Site URL: http://localhost:3000
├── Redirect URLs:
│   ├── http://localhost:3000
│   ├── http://localhost:3000/
│   └── ...
```

**بعد التعديل:**
```
Authentication Settings
├── Site URL: https://hotel-phi-weld.vercel.app
├── Redirect URLs:
│   ├── https://hotel-phi-weld.vercel.app
│   ├── https://hotel-phi-weld.vercel.app/
│   ├── https://hotel-phi-weld.vercel.app/dashboard
│   ├── https://hotel-phi-weld.vercel.app/login
│   ├── https://hotel-phi-weld.vercel.app/partner
│   └── https://hotel-phi-weld.vercel.app/admin
```

---

## ماذا سيحدث بعد الحفظ؟

✅ رسائل البريد الإلكتروني الجديدة ستحتوي على الرابط الصحيح

✅ المستخدمون الجدد سيصلون إلى الموقع الصحيح

✅ سيتمكنون من تأكيد حساباتهم

---

## أمثلة على الروابط

### قبل الإصلاح (❌ خطأ):
```
http://localhost:3000/#access_token=eyJhbGciOiJFUzI1NiIsImtpZCI6IjZkMGYxM...
```

### بعد الإصلاح (✅ صحيح):
```
https://hotel-phi-weld.vercel.app/#access_token=eyJhbGciOiJFUzI1NiIsImtpZCi6IjZkMGYxM...
```

---

## اختبار بعد الإصلاح

### اختبر التسجيل الجديد:

1. اذهب إلى: https://hotel-phi-weld.vercel.app/register
2. أنشئ حساب جديد
3. تحقق من بريدك
4. انقر على الرابط
5. يجب أن توجّه إلى https://hotel-phi-weld.vercel.app (ليس localhost)
6. سيتم تسجيل دخولك تلقائياً
7. ستذهب إلى لوحة التحكم

---

## ملاحظات مهمة

⚠️ **تغيير Site URL يؤثر على:**
- روابط تأكيد البريد
- روابط إعادة تعيين كلمة المرور
- روابط الدعوات
- رسائل الايميل بشكل عام

⚠️ **يجب أن تبقي على localhost للتطوير المحلي:**
- أضف كلا من localhost والدومين الإنتاجي
- Supabase يدعم عدة Redirect URLs

---

## إذا لم تعمل الروابط بعد الحفظ

### الحل:

1. **امسح الـ Cache:**
   - افتح DevTools (F12)
   - انقر بيمين على زر الـ Refresh
   - اختر "Empty cache and hard refresh"

2. **اختبر بـ Email جديد:**
   - استخدم بريد إلكتروني لم تسجل به من قبل
   - رسائل البريد القديمة ستحتوي على الرابط القديم

3. **تحقق من الإعدادات:**
   - تأكد من حفظ التغييرات
   - تأكد من عدم وجود مسافات إضافية
   - تأكد من https (ليس http)

---

## FAQ

**س: هل أحتاج إلى إعادة نشر التطبيق؟**
ج: لا، التغييرات على Supabase تأخذ تأثيرها فوراً

**س: هل ستؤثر على الحسابات الموجودة؟**
ج: لا، فقط رسائل البريد الجديدة

**س: كم وقت يستغرق؟**
ج: 5 دقائق فقط

**س: هل يمكن إضافة دومين آخر لاحقاً؟**
ج: نعم، أضف في Redirect URLs

---

## ملفات ذات صلة

📄 EMAIL_VERIFICATION_SETUP.md - دليل تفعيل التحقق
📄 LOGIN_TROUBLESHOOTING.md - حل مشاكل الدخول
📄 AUTH_FIX_SUMMARY.md - ملخص الإصلاحات

---

## الخطوة التالية

✅ بعد تحديث Redirect URLs:
1. اختبر التسجيل بـ Email جديد
2. تحقق من البريد
3. انقر على الرابط
4. يجب أن تصل إلى التطبيق مباشرة

🎉 بعدها كل شيء يعمل!

---

**آخر تحديث:** 2026-07-21
