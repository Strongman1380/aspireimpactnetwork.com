-- Supabase Database Setup for Aspire Impact Network
-- Run these SQL commands in your Supabase SQL editor

-- Contact form submissions table
CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    interest TEXT NOT NULL,
    budget TEXT,
    timeline TEXT,
    message TEXT NOT NULL,
    newsletter_signup BOOLEAN DEFAULT FALSE,
    privacy_consent BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    unsubscribed_at TIMESTAMPTZ
);

-- Membership enrollments table
CREATE TABLE membership_enrollments (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    membership_type TEXT NOT NULL CHECK (membership_type IN ('basic', 'premier', 'pro')),
    billing_frequency TEXT DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'yearly')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital services signups table
CREATE TABLE digital_services_signups (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    website_url TEXT,
    business_type TEXT,
    goals TEXT,
    current_challenges TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'onboarding', 'active', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domestic violence class enrollments table
CREATE TABLE dv_enrollments (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE,
    address TEXT,
    emergency_contact TEXT,
    referral_source TEXT,
    court_ordered BOOLEAN DEFAULT FALSE,
    case_number TEXT,
    probation_officer TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'active', 'completed', 'dropped')),
    enrollment_date DATE,
    completion_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_services_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dv_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert data (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscriptions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts" ON membership_enrollments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts" ON digital_services_signups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts" ON dv_enrollments FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users to read their own data (for admin dashboard later)
CREATE POLICY "Allow authenticated users to read all" ON contact_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read all" ON newsletter_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read all" ON membership_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read all" ON digital_services_signups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read all" ON dv_enrollments FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update data (for admin purposes)
CREATE POLICY "Allow authenticated users to update all" ON contact_submissions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update all" ON newsletter_subscriptions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update all" ON membership_enrollments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update all" ON digital_services_signups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update all" ON dv_enrollments FOR UPDATE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_interest ON contact_submissions(interest);

CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_is_active ON newsletter_subscriptions(is_active);

CREATE INDEX idx_membership_enrollments_email ON membership_enrollments(email);
CREATE INDEX idx_membership_enrollments_type ON membership_enrollments(membership_type);
CREATE INDEX idx_membership_enrollments_status ON membership_enrollments(status);

CREATE INDEX idx_digital_services_email ON digital_services_signups(email);
CREATE INDEX idx_digital_services_status ON digital_services_signups(status);

CREATE INDEX idx_dv_enrollments_email ON dv_enrollments(email);
CREATE INDEX idx_dv_enrollments_status ON dv_enrollments(status);
CREATE INDEX idx_dv_enrollments_court_ordered ON dv_enrollments(court_ordered);

-- Create a view for quick stats (optional)
CREATE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM contact_submissions) as total_contacts,
    (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true) as active_subscribers,
    (SELECT COUNT(*) FROM membership_enrollments WHERE status = 'active') as active_members,
    (SELECT COUNT(*) FROM digital_services_signups WHERE status IN ('active', 'onboarding')) as digital_clients,
    (SELECT COUNT(*) FROM dv_enrollments WHERE status IN ('enrolled', 'active')) as dv_participants;