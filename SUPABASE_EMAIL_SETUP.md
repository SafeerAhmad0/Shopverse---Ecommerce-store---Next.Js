# Supabase Email Setup Guide

This guide explains how to configure email settings in Supabase for the Forgot Password feature.

## 📧 Overview

Supabase needs to be configured to send password reset emails. By default, Supabase uses their own email service for development, but for production, you should configure your own SMTP provider.

---

## 🚀 Quick Setup (Development)

For development, Supabase's built-in email service works out of the box! No additional configuration needed.

### How it Works:
1. User clicks "Forgot Password"
2. Enters their email address
3. Supabase sends a reset link to their email
4. User clicks the link and is redirected to `/admin/reset-password`
5. User creates a new password

### Testing in Development:
1. Go to: `http://localhost:3000/admin/login`
2. Click "Forgot Password?"
3. Enter a valid admin email from your database
4. Check your email inbox for the reset link
5. Click the link and create a new password

---

## 🔧 Supabase Dashboard Configuration

### 1. **Configure Email Templates**

Go to: **Supabase Dashboard → Authentication → Email Templates**

#### Reset Password Template:
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password for Shopverse Ecommerce Admin:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>This link expires in 1 hour.</p>
```

### 2. **Configure Redirect URLs**

Go to: **Supabase Dashboard → Authentication → URL Configuration**

Add these redirect URLs:
- **Development:** `http://localhost:3000/admin/reset-password`
- **Production:** `https://yourdomain.com/admin/reset-password`

### 3. **Site URL Configuration**

Go to: **Supabase Dashboard → Authentication → URL Configuration**

Set:
- **Site URL (Development):** `http://localhost:3000`
- **Site URL (Production):** `https://yourdomain.com`

---

## 📮 Production Email Setup (SMTP)

For production, configure your own SMTP provider for better deliverability.

### Supported Providers:
- SendGrid
- Mailgun
- AWS SES
- Postmark
- Custom SMTP

### Configuration Steps:

1. Go to: **Supabase Dashboard → Project Settings → Auth**

2. Scroll to **SMTP Settings**

3. Enable **Custom SMTP**

4. Fill in your provider details:

#### Example: SendGrid
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: YOUR_SENDGRID_API_KEY
Sender Email: noreply@yourdomain.com
Sender Name: Shopverse Ecommerce
```

#### Example: Gmail (for testing only)
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: your-app-specific-password
Sender Email: your-email@gmail.com
Sender Name: Shopverse Ecommerce
```

**Note:** For Gmail, you need to create an [App-Specific Password](https://support.google.com/accounts/answer/185833).

---

## 🔐 Security Best Practices

### 1. **Password Reset Link Expiry**
- Default: 1 hour
- Configure in: **Supabase Dashboard → Authentication → Auth Settings**
- Recommended: Keep at 1 hour for security

### 2. **Rate Limiting**
Supabase automatically rate limits password reset requests to prevent abuse:
- Max 4 requests per hour per email
- Returns success even if email doesn't exist (prevents enumeration)

### 3. **Email Verification**
Ensure only verified emails can reset passwords:
- Go to: **Supabase Dashboard → Authentication → Providers**
- Enable "Email Confirmations"

---

## 🧪 Testing the Flow

### Test Forgot Password:
```bash
# 1. Start your dev server
npm run dev

# 2. Go to login page
http://localhost:3000/admin/login

# 3. Click "Forgot Password?"

# 4. Enter a test admin email

# 5. Check your email for reset link

# 6. Click link → Should redirect to reset password page

# 7. Enter new password (must meet requirements):
   - 12+ characters
   - 1 uppercase letter
   - 1 lowercase letter
   - 1 number
   - 1 special character

# 8. Submit → Should redirect to login

# 9. Login with new password
```

---

## 🐛 Troubleshooting

### Issue: Not receiving reset emails

**Possible causes:**

1. **Email not in database**
   - Check: Query your users table
   - Solution: User must exist in database

2. **SMTP not configured (production)**
   - Check: Supabase Dashboard → SMTP Settings
   - Solution: Configure custom SMTP

3. **Spam folder**
   - Check: Email spam/junk folder
   - Solution: Add noreply@supabase.io to contacts

4. **Rate limited**
   - Check: Supabase logs
   - Solution: Wait 1 hour before retrying

5. **Invalid redirect URL**
   - Check: Supabase Dashboard → URL Configuration
   - Solution: Add your reset URL to allowed redirects

### Issue: Reset link not working

**Possible causes:**

1. **Link expired**
   - Solution: Request a new reset link
   - Default expiry: 1 hour

2. **Link already used**
   - Solution: Each link is single-use only
   - Request a new one

3. **Invalid session**
   - Solution: Clear browser cache and try again

### Issue: Password validation failing

**Check requirements:**
- Minimum 12 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

---

## 📝 Environment Variables

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🔗 Related Files

- **Forgot Password Page:** `src/app/admin/forgot-password/page.tsx`
- **Reset Password Page:** `src/app/admin/reset-password/page.tsx`
- **Login Page:** `src/app/admin/login/page.tsx`
- **Password Validation:** `src/lib/utils/password-validation.ts`

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Password Reset Flow](https://supabase.com/docs/guides/auth/passwords)

---

## ✅ Checklist

Before deploying to production:

- [ ] Configure custom SMTP provider
- [ ] Update email templates with your branding
- [ ] Set production redirect URLs
- [ ] Set production site URL
- [ ] Test password reset flow end-to-end
- [ ] Enable email confirmations
- [ ] Review rate limiting settings
- [ ] Test from different email providers (Gmail, Outlook, etc.)
- [ ] Verify emails not landing in spam

---

**Need Help?** Check the [Supabase Discord](https://discord.supabase.com/) or [GitHub Issues](https://github.com/supabase/supabase/issues).
