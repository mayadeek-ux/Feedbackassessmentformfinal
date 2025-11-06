# ⚡ Quick Start Summary - Your New Supabase Setup

## 🎯 What You're Setting Up

A complete assessment system with:
- ✅ **Database** (PostgreSQL with 7 tables)
- ✅ **Demo Event** ("Assessment Event 2024")
- ✅ **4 Simple Case Studies** (Case Study 1, 2, 3, 4) - **Customize these!**
- ✅ **Admin Panel** (for managing everything)
- ✅ **Assessor Dashboard** (for doing assessments)

---

## 📋 5-Minute Setup (Copy-Paste This!)

### 1️⃣ Run SQL Setup (2 min)

In Supabase SQL Editor, paste this file's contents:
**→ `/supabase/migrations/20240101000000_initial_schema.sql`**

Click **RUN** ✅

### 2️⃣ Configure Your App (2 min)

**A. Get your credentials:**
- Project URL: `https://xxxxx.supabase.co`
- Project Ref: `xxxxx` (from the URL)
- Anon Key: `eyJ...` (Settings → API)

**B. Update `/utils/supabase/info.tsx`:**
```typescript
export const projectId = 'YOUR_PROJECT_REF';  // ← Put your ref here
```

**C. Set environment variables:**
```
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3️⃣ Create Admin (1 min)

**Sign up** in your app, then in SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## ✏️ Customize Your Case Studies (Optional)

Your database has **4 numbered placeholders**:
- Case Study 1
- Case Study 2
- Case Study 3
- Case Study 4

### Quick Customize:

Open **`/CUSTOMIZE_CASE_STUDIES.sql`** and copy the SQL to rename them!

**Example:**
```sql
UPDATE case_studies 
SET 
  name = 'Strategic Leadership',
  description = 'Your detailed scenario here'
WHERE id = '10000000-0000-0000-0000-000000000001';
```

**OR** customize through **Admin Panel → Case Study Management** (after logging in)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] **Database:** 7 tables exist (users, events, case_studies, candidates, groups, assignments, assessments)
- [ ] **Demo Data:** 1 event + 4 case studies visible in Table Editor
- [ ] **Login:** Can sign in to your app
- [ ] **Admin Access:** See "Admin Panel" in navigation
- [ ] **Case Studies:** See all 4 in Case Study Management

---

## 🎯 What You Get Out-of-the-Box

### 1 Demo Event:
- **Name:** Assessment Event 2024
- **Status:** Active
- **Duration:** 30 days from today

### 4 Placeholder Case Studies:
- **Case Study 1** - Empty (add your content!)
- **Case Study 2** - Empty (add your content!)
- **Case Study 3** - Empty (add your content!)
- **Case Study 4** - Empty (add your content!)

### Why numbered?
✅ Flexible - name them anything  
✅ Easy to customize  
✅ Won't be outdated  
✅ Change anytime  

---

## 🚀 Next Steps After Setup

### 1. Customize Case Studies
   - Admin Panel → Case Study Management
   - Edit each case study name and description
   - Or use SQL: `/CUSTOMIZE_CASE_STUDIES.sql`

### 2. Add Your First Candidate
   - Admin Panel → Candidate Management
   - Click "Add Candidate"
   - Fill in details

### 3. Create First Assignment
   - Admin Panel → Assignment Management
   - Click "Create Assignment"
   - Select assessor, candidate, and **case study**

### 4. Do Test Assessment
   - Log in as assessor
   - Open assignment
   - Complete scoring
   - Submit

---

## 📚 Key Documentation

| File | Purpose |
|------|---------|
| **`NEW_SUPABASE_SETUP_INSTRUCTIONS.md`** | Step-by-step setup |
| **`CUSTOMIZE_CASE_STUDIES.sql`** | SQL to rename case studies |
| **`CASE_STUDY_SETUP.md`** | Complete case study guide |
| **`ADMIN_USER_MANUAL.md`** | How to use admin panel |
| **`ASSESSOR_USER_MANUAL.md`** | How to do assessments |

---

## 💡 Pro Tips

### Tip 1: Start Simple
- Keep the numbered case study names initially
- Test the system end-to-end
- Customize once you understand the flow

### Tip 2: Use the Admin Panel
- Easier than SQL for most tasks
- Visual interface for case studies
- Real-time updates

### Tip 3: Plan Your Case Studies
- 4-6 is a good starting number
- Make them specific to your needs
- Update them based on feedback

### Tip 4: Test Before Real Use
- Create a test candidate
- Do a practice assessment
- Verify everything works

---

## 🔧 Common Customizations

### Rename Demo Event:
```sql
UPDATE events 
SET name = 'Your Event Name',
    description = 'Your description'
WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Add More Case Studies:
```sql
INSERT INTO case_studies (name, description) 
VALUES ('Case Study 5', 'Your description');
```

### Create More Admins:
```sql
UPDATE users SET role = 'admin' WHERE email = 'another-admin@example.com';
```

---

## 🆘 Quick Troubleshooting

### "No tables showing"
→ Run the full SQL script from Step 1 again

### "Cannot login"
→ Check environment variables are set correctly

### "Don't see Admin Panel"
→ Run the admin promotion SQL query, then logout/login

### "Case studies not showing"
→ Check Table Editor → case_studies table has 4 rows

---

## 🎉 You're Done When...

✅ All 7 tables exist  
✅ Can login as admin  
✅ See 4 case studies  
✅ Can create a candidate  
✅ Can create an assignment  
✅ Can do an assessment  

**Time to complete: ~10 minutes**

---

## 📞 Need Help?

- **Quick Setup:** `NEW_SUPABASE_SETUP_INSTRUCTIONS.md`
- **Full Guide:** `SUPABASE_COMPLETE_SETUP.md`
- **Case Studies:** `CASE_STUDY_SETUP.md`
- **Checklist:** `SETUP_CHECKLIST.md`

---

**Now go customize those case studies and start assessing! 🚀**
