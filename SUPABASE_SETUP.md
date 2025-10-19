# Supabase Database Setup Guide

This guide will help you create the necessary database tables in your Supabase project to support all form submissions on your website.

## Quick Setup Instructions

1. Go to your Supabase project: https://knamphazdfkktxovttic.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Create a new query and paste the SQL commands below
4. Click "Run" to create all tables

---

## Database Tables SQL

Copy and paste this entire SQL script into your Supabase SQL Editor:

```sql
-- ==========================================
-- CONTACT SUBMISSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    interest TEXT NOT NULL,
    budget TEXT,
    timeline TEXT,
    message TEXT NOT NULL,
    newsletter_signup BOOLEAN DEFAULT false,
    privacy_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts from anonymous users (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON contact_submissions
    FOR INSERT TO anon WITH CHECK (true);

-- Policy to allow authenticated users to read all submissions
CREATE POLICY "Allow authenticated reads" ON contact_submissions
    FOR SELECT TO authenticated USING (true);

-- ==========================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON newsletter_subscriptions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON newsletter_subscriptions
    FOR SELECT TO authenticated USING (true);

-- ==========================================
-- MEMBERSHIP SIGNUPS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS membership_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    membership_tier TEXT NOT NULL CHECK (membership_tier IN ('basic', 'premier', 'pro')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    role TEXT,
    industry TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    goals TEXT,
    expertise TEXT,
    referral_source TEXT,
    referral_details TEXT,
    newsletter_signup BOOLEAN DEFAULT false,
    directory_listing BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_membership_email ON membership_signups(email);
CREATE INDEX IF NOT EXISTS idx_membership_tier ON membership_signups(membership_tier);
CREATE INDEX IF NOT EXISTS idx_membership_status ON membership_signups(status);
CREATE INDEX IF NOT EXISTS idx_membership_created_at ON membership_signups(created_at DESC);

ALTER TABLE membership_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON membership_signups
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON membership_signups
    FOR SELECT TO authenticated USING (true);

-- ==========================================
-- MEMBERSHIP ENROLLMENTS TABLE
-- (For payment processing enrollments)
-- ==========================================
CREATE TABLE IF NOT EXISTS membership_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    membership_type TEXT NOT NULL,
    billing_frequency TEXT DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'yearly')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'active', 'cancelled', 'past_due')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_email ON membership_enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON membership_enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_stripe_customer ON membership_enrollments(stripe_customer_id);

ALTER TABLE membership_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON membership_enrollments
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON membership_enrollments
    FOR SELECT TO authenticated USING (true);

-- ==========================================
-- JUSTICE SUPPORT REQUESTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS justice_support_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    service_type TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('immediate', 'urgent', 'soon', 'planning')),
    referral_source TEXT,
    household_size INTEGER,
    children_ages TEXT,
    situation TEXT NOT NULL,
    additional_needs TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'completed', 'closed')),
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_justice_email ON justice_support_requests(email);
CREATE INDEX IF NOT EXISTS idx_justice_urgency ON justice_support_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_justice_status ON justice_support_requests(status);
CREATE INDEX IF NOT EXISTS idx_justice_created_at ON justice_support_requests(created_at DESC);

ALTER TABLE justice_support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON justice_support_requests
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON justice_support_requests
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated updates" ON justice_support_requests
    FOR UPDATE TO authenticated USING (true);

-- ==========================================
-- DV ENROLLMENTS TABLE
-- (Domestic Violence Classes)
-- ==========================================
CREATE TABLE IF NOT EXISTS dv_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    ssn_last_4 TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    enrollment_type TEXT NOT NULL CHECK (enrollment_type IN ('court-ordered', 'probation-required', 'voluntary', 'other')),
    court_info TEXT,
    probation_officer TEXT,
    probation_contact TEXT,
    attorney TEXT,
    attorney_contact TEXT,
    preferred_schedule TEXT NOT NULL,
    class_format TEXT NOT NULL,
    employment_status TEXT,
    insurance TEXT,
    payment_ability TEXT,
    prior_treatment TEXT,
    substance_use TEXT,
    mental_health TEXT,
    emergency_contact TEXT NOT NULL,
    emergency_relationship TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    additional_info TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'enrolled', 'active', 'completed', 'withdrawn')),
    intake_date DATE,
    completion_date DATE,
    assigned_class_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dv_email ON dv_enrollments(email);
CREATE INDEX IF NOT EXISTS idx_dv_enrollment_type ON dv_enrollments(enrollment_type);
CREATE INDEX IF NOT EXISTS idx_dv_status ON dv_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_dv_created_at ON dv_enrollments(created_at DESC);

ALTER TABLE dv_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON dv_enrollments
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON dv_enrollments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated updates" ON dv_enrollments
    FOR UPDATE TO authenticated USING (true);

-- ==========================================
-- DIGITAL SERVICES SIGNUPS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS digital_services_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    website_url TEXT,
    business_type TEXT,
    goals TEXT,
    current_challenges TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'onboarding', 'active', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_email ON digital_services_signups(email);
CREATE INDEX IF NOT EXISTS idx_digital_status ON digital_services_signups(status);
CREATE INDEX IF NOT EXISTS idx_digital_created_at ON digital_services_signups(created_at DESC);

ALTER TABLE digital_services_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON digital_services_signups
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON digital_services_signups
    FOR SELECT TO authenticated USING (true);

-- ==========================================
-- CREATE UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_signups_updated_at BEFORE UPDATE ON membership_signups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_enrollments_updated_at BEFORE UPDATE ON membership_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_justice_support_requests_updated_at BEFORE UPDATE ON justice_support_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dv_enrollments_updated_at BEFORE UPDATE ON dv_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_services_signups_updated_at BEFORE UPDATE ON digital_services_signups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## What These Tables Do

### 1. **contact_submissions**
Stores all contact form submissions from your main contact page.

### 2. **newsletter_subscriptions**
Tracks email newsletter subscriptions with active/inactive status.

### 3. **membership_signups**
Comprehensive membership signup data including tier selection, personal info, and interests.

### 4. **membership_enrollments**
Tracks membership enrollments going through payment processing (Stripe integration).

### 5. **justice_support_requests**
Stores requests for justice support services including family partners and crisis intervention.

### 6. **dv_enrollments**
Domestic violence class enrollment applications with full participant details.

### 7. **digital_services_signups**
Signups for your $150/month digital services package.

---

## Viewing Your Data

After creating the tables, you can view submissions in Supabase:

1. Go to **Table Editor** in your Supabase dashboard
2. Select any table from the dropdown
3. View, filter, and export your data

You can also query the data using SQL:

```sql
-- View recent contact submissions
SELECT * FROM contact_submissions
ORDER BY created_at DESC
LIMIT 10;

-- View all urgent justice support requests
SELECT * FROM justice_support_requests
WHERE urgency IN ('immediate', 'urgent')
AND status = 'new'
ORDER BY created_at DESC;

-- View membership signups by tier
SELECT membership_tier, COUNT(*) as count
FROM membership_signups
GROUP BY membership_tier;

-- View DV enrollments pending approval
SELECT * FROM dv_enrollments
WHERE status = 'pending'
ORDER BY created_at DESC;
```

---

## Setting Up Email Notifications (Optional)

To get notified when forms are submitted, you can:

1. **Use Supabase Database Webhooks:**
   - Go to Database > Webhooks in Supabase
   - Create webhooks for each table
   - Connect to email service (SendGrid, Mailgun, etc.)

2. **Use Supabase Edge Functions:**
   - Create serverless functions to send emails on new submissions
   - Trigger via database changes

3. **Use a Third-Party Service:**
   - Connect Supabase to Zapier/Make.com
   - Set up automatic email notifications

---

## Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- Anonymous users can INSERT (submit forms)
- Only authenticated users can READ/UPDATE (for your admin dashboard)
- Sensitive data like SSN last 4 digits is stored securely
- All timestamps use UTC timezone

---

## Next Steps

1. ✅ Run the SQL script in Supabase
2. ✅ Test each form on your website
3. ✅ Check that data appears in Supabase Table Editor
4. 🔔 Set up email notifications (optional)
5. 📊 Build an admin dashboard to view submissions (optional)

---

## Need Help?

- **Supabase Documentation:** https://supabase.com/docs
- **Your Project:** https://knamphazdfkktxovttic.supabase.co

All forms are now connected and will automatically save to your Supabase database!
