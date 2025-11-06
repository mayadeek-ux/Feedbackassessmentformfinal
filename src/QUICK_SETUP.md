# ⚡ Quick Setup Guide

Get your Assessment System up and running in **15 minutes**!

---

## 🎯 Overview

This guide will help you:

1. ✅ Set up a new Supabase project
2. ✅ Deploy the backend
3. ✅ Deploy the frontend
4. ✅ Create your admin account

**Total time: ~15 minutes** ⏱️

---

## Step 1: Create Supabase Project (3 min)

1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click **"New Project"**
3. Fill in:
   - **Organization:** Create or select existing
   - **Name:** `assessment-system`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to you
4. Click **"Create new project"** (wait ~2 min)

✅ **Save these from Settings → API:**

- Project URL: `https://xxxxx.supabase.co`
- Anon key: `eyJ...` (public)
- Service role key: `eyJ...` (secret!)

---

## Step 2: Set Up Database (4 min)

### Option A: Via Supabase Dashboard (Easiest)

1. Open **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Copy the entire content of `/supabase/migrations/20240101000000_initial_schema.sql`
4. Paste and click **"Run"**
5. Create another new query
6. Copy content of `/supabase/migrations/20240101000001_demo_data.sql`
7. Paste and click **"Run"**

✅ Done! Your database is ready.

### Option B: Via Supabase CLI (Recommended for developers)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

---

## Step 3: Deploy Backend (3 min)

### Via Supabase CLI:

1. Navigate to your project folder
2. Deploy the edge function:

```bash
supabase functions deploy make-server
```

3. Set environment variables:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="your_anon_key"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

✅ Test it: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server/health`

Should return: `{"status":"ok"}`

---

## Step 4: Deploy Frontend (5 min)

### Option A: Deploy to Vercel (Fastest)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **"New Project"**
3. Import your code or deploy from CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL` = Your project URL
   - `VITE_SUPABASE_ANON_KEY` = Your anon key

5. Redeploy:

```bash
vercel --prod
```

✅ Your site is live!

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Add environment variables in Netlify dashboard.

---

## Step 5: Create Admin Account (2 min)

### Method 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter your email and password
4. Go to **SQL Editor**
5. Run this query:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Method 2: Via Your App

1. Visit your deployed site
2. Click **"Sign Up"**
3. Create account
4. Go to Supabase Dashboard → SQL Editor
5. Run:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

✅ Done! You're now an admin.

---

## ✅ Verification Checklist

Test your deployment:

- [ ] Can access your website URL
- [ ] Can login with admin account
- [ ] See "Admin Panel" in navigation
- [ ] Can view demo event "Future Ready Leadership 2024"
- [ ] Can see 4 case studies in dropdown menus
- [ ] Can create a test candidate
- [ ] Can create a test assignment
- [ ] Edge function health check returns `{"status":"ok"}`

---

## 🎯 Next Steps

### 1. Customize Your Event

1. Login as admin
2. Go to Admin Panel
3. Update the demo event or create a new one
4. Add your real case studies

### 2. Invite Assessors

1. Create assessor accounts (they sign up)
2. Or create via Authentication panel
3. Leave role as 'assessor' (default)

### 3. Add Candidates

1. Go to Admin Panel → Candidate Management
2. Click "Add Candidate"
3. Or bulk import (coming soon)

### 4. Create Assignments

1. Go to Admin Panel → Judge & Assignment Management
2. Select Assignment Management tab
3. Click "Create Assignment"
4. Choose:
   - Assessor
   - Candidate or Group
   - **Case Study** ← This is what you asked about!
   - Due date

### 5. Start Assessing

1. Assessors login
2. See their assignments on dashboard
3. Click to start assessment
4. Complete scoring and submit

---

## 🆘 Common Issues

### "Failed to fetch" error

**Cause:** Edge function not deployed or CORS issue

**Fix:**

```bash
# Redeploy function
supabase functions deploy make-server

# Check logs
supabase functions logs make-server
```

### Can't login

**Cause:** User not in database or wrong credentials

**Fix:**

1. Check Authentication → Users in Supabase
2. Verify email confirmation (disable if testing)
3. Check user has profile in `users` table

### "Unauthorized" errors

**Cause:** Environment variables not set

**Fix:**

1. Check `.env.local` has correct values
2. Verify Vercel/Netlify environment variables
3. Redeploy after adding variables

### No assignments showing

**Cause:** No assignments created or wrong user

**Fix:**

1. Admin must create assignments first
2. Assignments must be assigned to the logged-in assessor
3. Check assignments table in Supabase

---

## 📊 Understanding the System

```
┌─────────────────────────────────────────────────┐
│                  Admin Creates                   │
├─────────────────────────────────────────────────┤
│  Events → Candidates → Assignments (with         │
│           Case Studies)                          │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│               Assessor Receives                  │
├─────────────────────────────────────────────────┤
│  Assignment with specific:                       │
│  • Candidate/Group                               │
│  • Case Study (pre-selected by admin)            │
│  • Due Date                                      │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│              Assessor Completes                  │
├─────────────────────────────────────────────────┤
│  • Opens assignment                              │
│  • Scores across 10 criteria                     │
│  • Adds notes                                    │
│  • Submits assessment                            │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│               Admin Reviews                      │
├─────────────────────────────────────────────────┤
│  • Views all assessments                         │
│  • Exports reports                               │
│  • Analyzes results                              │
└─────────────────────────────────────────────────┘
```

### Case Study Selection

**Key Point:** Case studies are selected **by the admin** when creating assignments, not by the assessor when doing the assessment.

**Why?** This ensures:

- Standardization across assessments
- Fair comparison of candidates
- Proper assignment distribution
- Strategic case study selection

**Where to select:**

1. Admin Panel
2. Judge & Assignment Management
3. Assignment Management tab
4. Create Assignment button
5. **Case Study dropdown** ← Here!

---

## 🎉 You're Ready!

Your Assessment System is now:

✅ Fully deployed  
✅ Database configured  
✅ Backend running  
✅ Frontend live  
✅ Admin account created

**Start creating assignments and assessing! 🚀**

Need help? Check:

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Admin Manual](./ADMIN_USER_MANUAL.md)
- [Assessor Manual](./ASSESSOR_USER_MANUAL.md)

---

## 💡 Pro Tips

### Tip 1: Backup Your Data

```bash
supabase db dump -f backup-$(date +%Y%m%d).sql
```

### Tip 2: Monitor Usage

- Check Supabase Dashboard → Database
- Monitor edge function invocations
- Set up alerts for errors

### Tip 3: Custom Domain

1. Add domain in Vercel/Netlify
2. Update DNS records
3. SSL automatically configured

### Tip 4: Email Templates

- Customize in Supabase → Authentication → Email Templates
- Brand with your logo/colors
- Set up SMTP for production

### Tip 5: Regular Updates

```bash
# Pull latest migrations
git pull

# Apply to your database
supabase db push
```

---

**Happy Assessing! 🎯**