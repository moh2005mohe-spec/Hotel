# قوالب البريد الإلكتروني المخصصة

هذه القوالب يمكن استخدامها في **Supabase Auth → Email Templates** بعد تفعيل SMTP مخصص.

---

## 1. رسالة تأكيد البريد الإلكتروني (Confirmation Email)

استخدم هذا القالب في Supabase عند تخصيص **Confirm Signup Email**:

### HTML:

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد حسابك في ضيافة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 20px;
            color: #333;
            line-height: 1.6;
        }
        .content h2 {
            color: #1f2937;
            font-size: 20px;
            margin-top: 0;
        }
        .content p {
            color: #666;
            margin: 15px 0;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: opacity 0.3s;
        }
        .button:hover {
            opacity: 0.9;
        }
        .code-container {
            background-color: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            direction: ltr;
        }
        .code {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            letter-spacing: 2px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
        }
        .warning {
            background-color: #fef3c7;
            border-right: 4px solid #f59e0b;
            padding: 10px;
            margin: 15px 0;
            border-radius: 4px;
            color: #92400e;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🏨 ضيافة</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Diyafa Hotel Reservation</p>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>مرحباً بك في ضيافة! 👋</h2>
            
            <p>شكراً لتسجيلك معنا. لقد استقبلنا طلب إنشاء حساب بهذا البريد الإلكتروني.</p>
            
            <p>لتأكيد حسابك والبدء في الحجز، يرجى الضغط على الزر أدناه:</p>
            
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="button">تأكيد حسابي</a>
            </div>

            <p style="color: #999; font-size: 13px;">أو انسخ الرابط:</p>
            <div class="code-container">
                <code style="word-break: break-all; direction: ltr; text-align: left; display: block;">{{ .ConfirmationURL }}</code>
            </div>

            <div class="warning">
                ⏰ <strong>ملاحظة:</strong> رابط التأكيد ينتهي الصلاحية بعد 24 ساعة
            </div>

            <p>إذا لم تقم بهذا الطلب، يرجى تجاهل هذا البريد.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>ضيافة - Diyafa Hotel</strong></p>
            <p>هذا البريد من نظام المصادقة الآمن</p>
            <p>© 2026 جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>
```

---

## 2. رسالة إعادة تعيين كلمة المرور (Password Reset Email)

استخدم هذا القالب في **Confirm password reset email**:

### HTML:

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 20px;
            color: #333;
            line-height: 1.6;
        }
        .content h2 {
            color: #1f2937;
            font-size: 20px;
            margin-top: 0;
        }
        .content p {
            color: #666;
            margin: 15px 0;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
        }
        .warning-box {
            background-color: #fee2e2;
            border-right: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #7f1d1d;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 إعادة تعيين كلمة المرور</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>طلب إعادة تعيين كلمة المرور</h2>
            
            <p>لقد استقبلنا طلب إعادة تعيين كلمة المرور لحسابك.</p>
            
            <div class="warning-box">
                <strong>⚠️ تنبيه أمني:</strong> إذا لم تطلب هذا، يرجى تجاهل هذا البريد فوراً.
            </div>

            <p>لإعادة تعيين كلمة المرور، يرجى الضغط على الزر أدناه:</p>
            
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="button">إعادة تعيين كلمة المرور</a>
            </div>

            <p style="color: #999; font-size: 13px;">أو انسخ الرابط:</p>
            <div style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; direction: ltr; word-break: break-all;">
                {{ .ConfirmationURL }}
            </div>

            <p style="margin-top: 20px; color: #999; font-size: 12px;">⏰ هذا الرابط صالح لمدة 1 ساعة فقط</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>ضيافة - Diyafa Hotel</strong></p>
            <p>تم إرسال هذا البريد من نظام الأمان</p>
        </div>
    </div>
</body>
</html>
```

---

## 3. رسالة الرابط السحري (Magic Link Email - اختياري)

إذا فعّلت Magic Link في Supabase:

### HTML:

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رابط الدخول السحري</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .content {
            padding: 40px 20px;
            color: #333;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🪄 دخول سريع</h1>
        </div>
        <div class="content">
            <h2>مرحباً بعودتك!</h2>
            <p>استخدم الرابط أدناه للدخول الفوري إلى حسابك (بدون كلمة مرور):</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">دخول آمن</a>
            </div>
            <p style="color: #999; font-size: 12px;">⏰ الرابط صالح لمدة 24 ساعة</p>
        </div>
    </div>
</body>
</html>
```

---

## كيفية استخدام هذه القوالب

### في Supabase:

1. اذهب إلى **Authentication** → **Email**
2. اختر **Custom SMTP** (الذي أعددناه سابقاً)
3. في قسم **Email Templates**:
   - **Confirm Signup Email**: انسخ القالب رقم 1
   - **Confirm Password Reset Email**: انسخ القالب رقم 2
4. انقر **Save**

### المتغيرات المتاحة:

- `{{ .ConfirmationURL }}` - رابط التأكيد
- `{{ .Email }}` - بريد المستخدم
- `{{ .SiteURL }}` - رابط الموقع
- `{{ .Data.name }}` - اسم المستخدم (إذا كان محفوظاً)

---

## ملاحظات

- تأكد من استخدام **HTML** وليس Text في الحقول
- اختبر الرسالة بإرسال تأكيد حساب جديد
- يمكنك تعديل الألوان والنصوص حسب علامتك التجارية
- الرسائل ستُرسل من: `onboarding@resend.dev` (مؤقتاً)

---

**آخر تحديث**: 21 يوليو 2026 ✅
