# إصلاح دائم: Redirect URLs في Supabase

## المشكلة
عندما يسجل مستخدم جديد، يستقبل رابط تأكيد بريد يحتوي على `localhost:3000` بدلاً من الدومين الحقيقي.

## السبب
إعدادات Supabase Auth موجهة للتطوير المحلي وليس للإنتاج.

## الحل الدائم (مرة واحدة فقط)

هذا الحل يجب أن يتم **مرة واحدة فقط** وبعدها جميع المستخدمين سيحصلون على الرابط الصحيح تلقائياً.

### الخطوة 1: افتح Supabase Console

```
https://app.supabase.com
```

### الخطوة 2: اختر المشروع
- اضغط على **Hotel** project

### الخطوة 3: انتقل لإعدادات Auth

المسار:
```
Settings → Authentication → Email Provider
```

### الخطوة 4: حدث Redirect URL

ابحث عن:
```
Site URL
```

غيّر من:
```
http://localhost:3000
```

إلى:
```
https://hotel-phi-weld.vercel.app
```

### الخطوة 5: أضف Redirect URLs

اضغط على **Add URL** وأضف جميع هذه الروابط:

```
https://hotel-phi-weld.vercel.app
https://hotel-phi-weld.vercel.app/
https://hotel-phi-weld.vercel.app/login
https://hotel-phi-weld.vercel.app/dashboard
https://hotel-phi-weld.vercel.app/partner
https://hotel-phi-weld.vercel.app/admin
```

### الخطوة 6: اضغط Save

انقر على **Save** في أسفل الصفحة.

---

## ✅ النتيجة

بعد هذا الإصلاح:
- جميع المستخدمين الجدد سيستقبلون رابط تأكيد صحيح
- الرابط سيكون: `https://hotel-phi-weld.vercel.app/#access_token=...`
- وليس: `http://localhost:3000/#access_token=...`
- هذا يحدث **تلقائياً** لجميع المستخدمين

---

## الاختبار

بعد الإصلاح:

1. اذهب إلى: `https://hotel-phi-weld.vercel.app/register`
2. أنشئ حساب بريد إلكتروني جديد
3. تحقق من بريدك
4. يجب أن ترى رابط يبدأ بـ: `hotel-phi-weld.vercel.app`
5. انقر على الرابط
6. يجب أن توجّه إلى التطبيق مباشرة

---

## الخطوات بالصور (وصف)

```
1. Login to https://app.supabase.com
   ↓
2. Select "Hotel" project
   ↓
3. Go to Settings → Authentication
   ↓
4. Click on "Email Provider"
   ↓
5. Find "Site URL" → Change to https://hotel-phi-weld.vercel.app
   ↓
6. Click "Add URL" → Add all the URLs above
   ↓
7. Click "Save"
   ↓
8. Done! ✅
```

---

## ملاحظات مهمة

⚠️ هذا يجب أن يتم مرة واحدة فقط من قبل صاحب المشروع أو Admin

✅ بعد ذلك، لا حاجة لفعل أي شيء آخر

✅ جميع المستخدمين الجدد سيحصلون على الرابط الصحيح تلقائياً

---

## في حالة المشاكل

إذا لم يعمل بعد الإصلاح:

1. امسح ذاكرة المتصفح (Cache)
2. حاول التسجيل مجددا
3. تحقق من بريدك (بما فيه Spam)

---

## التاريخ
- تم الإصلاح: 2026-07-21
- ساري المفعول: دائم (لجميع المستخدمين)
