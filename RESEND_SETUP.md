# إعداد Resend مع Supabase Auth

## نظرة عامة
هذا الدليل يشرح كيفية ربط **Resend** كخادم SMTP مخصص داخل **Supabase Auth** لإرسال رسائل تأكيد الحساب وإعادة تعيين كلمة المرور.

---

## المتطلبات

✅ **المتغيرات المضافة إلى Vercel:**
- `RESEND_API_KEY`: `re_bssExb6u_JFYNoBXqaaWBybpSrQLgQWpT`

✅ **Supabase Project URL**: `https://mbgqdivaheeftjtvgkzs.supabase.co`

✅ **قيد التطبيق**: وضع اختبار - الرسائل ترسل إلى البريد المسجل في Resend فقط

---

## الخطوات

### الخطوة 1: تسجيل الدخول إلى Supabase Console

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com/)
2. اختر مشروعك: `mbgqdivaheeftjtvgkzs`

---

### الخطوة 2: الانتقال إلى إعدادات المصادقة

1. من القائمة اليسرى، انقر على **Authentication**
2. اختر **Providers** من التبويبات العلوية
3. ابحث عن **Email** وانقر على الأيقونة المرتبطة به

---

### الخطوة 3: تفعيل SMTP مخصص

1. في صفحة البريد الإلكتروني (Email provider):
   - ستجد قسم **SMTP Settings**
   - اختر **Custom SMTP** بدلاً من الخيار الافتراضي

2. ملء بيانات Resend SMTP:

```
Host:        smtp.resend.com
Port:        587
Username:    resend
Password:    re_bssExb6u_JFYNoBXqaaWBybpSrQLgQWpT
From Email:  onboarding@resend.dev  (مؤقتاً - استخدم بريدك لاحقاً)
From Name:   Diyafa Hotel
```

3. اختياري - تحسين البيانات:
   - **From Email**: `no-reply@diyafahotel.com` (عند توثيق الدومين)
   - **Reply-To**: `support@diyafahotel.com`

---

### الخطوة 4: اختبار الاتصال

1. بعد حفظ البيانات، سيظهر زر **"Test Connection"**
2. انقر عليه للتحقق من صحة الاتصال
3. يجب أن تتلقى رسالة اختبار على بريدك

---

### الخطوة 5: تخصيص قوالب البريد (اختياري)

في نفس صفحة **Email** في Supabase:

1. ابحث عن قسم **Email Templates**
2. يمكنك تخصيص:
   - **Confirmation Email** - رسالة تأكيد إنشاء الحساب
   - **Password Reset Email** - رسالة إعادة تعيين كلمة المرور
   - **Magic Link Email** - رسالة الرابط السحري

---

## المتغيرات المستخدمة

### في Supabase SMTP:
```
SMTP Host:     smtp.resend.com
SMTP Port:     587 (TLS)
SMTP Username: resend
SMTP Password: re_bssExb6u_JFYNoBXqaaWBybpSrQLgQWpT
```

### في Vercel (بيئة الإنتاج):
```
RESEND_API_KEY=re_bssExb6u_JFYNoBXqaaWBybpSrQLgQWpT
```

---

## الحالة الحالية

### 🟡 وضع الاختبار (الآن)
- المرسِل: `onboarding@resend.dev`
- الرسائل تُرسل إلى: **البريد المسجل في Resend فقط** (بريدك الشخصي)
- مناسب لـ: الاختبار الداخلي والتطوير

### 🟢 الإنتاج (عند توثيق الدومين)
بعد إضافة دومين حقيقي وتوثيقه في Resend:
1. قم بتسجيل دومينك في لوحة Resend
2. أضف سجلات DNS المطلوبة (SPF/DKIM)
3. غيّر **From Email** إلى: `no-reply@diyafahotel.com`
4. الآن ستتمكن من الإرسال إلى أي بريد إلكتروني

---

## اختبر الميزة

### تسجيل حساب جديد:
1. اذهب إلى: https://hotel-phi-weld.vercel.app/login
2. انقر على "إنشاء حساب جديد"
3. أدخل بريدك المسجل في Resend
4. يجب أن تتلقى رسالة تأكيد من `onboarding@resend.dev`
5. انقر على الرابط لتأكيد حسابك

### إعادة تعيين كلمة المرور:
1. في صفحة الدخول، انقر على "هل نسيت كلمة المرور؟"
2. أدخل بريدك
3. يجب أن تتلقى رسالة إعادة التعيين من `onboarding@resend.dev`

---

## الخطوات التالية

### عند توفر الدومين:
1. ادخل إلى لوحة Resend: https://resend.com/domains
2. أضف دومينك الجديد
3. أضف سجلات DNS في مزود استضافة الدومين (Vercel/Freenom)
4. انتظر توثيق الدومين (عادة 15-30 دقيقة)
5. حدّث **From Email** في Supabase إلى `no-reply@diyafahotel.com`
6. الآن ستتمكن من الإرسال بدون قيود

---

## استكشاف الأخطاء

### الرسائل لا تصل:
- ✅ تحقق من أن البريد مسجل في Resend
- ✅ تأكد من أن SMTP مفعّل في Supabase
- ✅ راجع سجلات Supabase: **Auth → Logs**

### البيانات غير صحيحة:
- اتصل بـ Resend Support: support@resend.com
- أو تحقق من Dashboard الخاص بك

### مشاكل في Supabase:
- اذهب إلى: **Project Settings → Email Settings**
- تحقق من أن SMTP مفعّل ومحفوظ

---

## ملاحظات أمنية

⚠️ **أبداً لا تشارك مفتاح Resend في:**
- أكواد جافاسكريبت من جهة العميل
- ملفات config عام
- Commits على GitHub

✅ **المفتاح آمن عندما:**
- يُخزَّن في Vercel Environment Variables فقط
- يُستخدم في Supabase Backend فقط
- لا يظهر في المشروع نفسه

---

## الدعم

- **Resend Docs**: https://resend.com/docs
- **Supabase Email**: https://supabase.com/docs/guides/auth/auth-smtp
- **API Key**: تم إضافته إلى Vercel بنجاح ✅

---

**آخر تحديث**: 21 يوليو 2026
**الحالة**: جاهز للاختبار 🚀
