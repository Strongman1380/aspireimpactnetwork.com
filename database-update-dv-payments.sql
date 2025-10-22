-- Update DV Enrollments Table to Support Payment Tracking
-- Run this in your Supabase SQL Editor to add payment fields

-- Drop existing dv_enrollments table and recreate with new fields
DROP TABLE IF EXISTS dv_enrollments CASCADE;

-- Create updated dv_enrollments table with comprehensive fields
CREATE TABLE dv_enrollments (
    id BIGSERIAL PRIMARY KEY,

    -- Personal Information
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    dob DATE,
    ssn TEXT, -- Last 4 digits only

    -- Address
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,

    -- Enrollment Details
    enrollment_type TEXT CHECK (enrollment_type IN ('court-ordered', 'probation-required', 'voluntary', 'other')),
    court_info TEXT,
    probation_officer TEXT,
    probation_contact TEXT,
    attorney TEXT,
    attorney_contact TEXT,

    -- Scheduling Preferences
    preferred_schedule TEXT,
    class_format TEXT,

    -- Background Information
    employment_status TEXT,
    insurance TEXT,
    payment_ability TEXT,
    prior_treatment TEXT,
    substance_use TEXT,
    mental_health TEXT,

    -- Emergency Contact
    emergency_contact TEXT,
    emergency_relationship TEXT,
    emergency_phone TEXT,

    -- Additional Info
    additional_info TEXT,

    -- Payment Information
    payment_option TEXT CHECK (payment_option IN ('intake-now', 'intake-later', 'weekly-payment')),
    intake_fee_paid BOOLEAN DEFAULT FALSE,
    intake_payment_date TIMESTAMPTZ,
    intake_payment_id TEXT, -- Stripe payment ID

    -- Weekly Payment Tracking
    weeks_paid INTEGER DEFAULT 0,
    total_amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    last_payment_date TIMESTAMPTZ,
    last_payment_id TEXT, -- Stripe payment ID

    -- Program Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'active', 'completed', 'dropped', 'suspended')),
    enrollment_date DATE,
    completion_date DATE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_dv_enrollments_email ON dv_enrollments(email);
CREATE INDEX idx_dv_enrollments_status ON dv_enrollments(status);
CREATE INDEX idx_dv_enrollments_created_at ON dv_enrollments(created_at);

-- Enable Row Level Security
ALTER TABLE dv_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON dv_enrollments
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all (for admin dashboard)
CREATE POLICY "Allow authenticated users to read all" ON dv_enrollments
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to update (for payment status updates)
CREATE POLICY "Allow authenticated users to update" ON dv_enrollments
    FOR UPDATE TO authenticated
    USING (true);

-- Create payment history table for detailed tracking
CREATE TABLE dv_payment_history (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT REFERENCES dv_enrollments(id) ON DELETE CASCADE,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('intake', 'weekly')),
    amount DECIMAL(10, 2) NOT NULL,
    stripe_payment_id TEXT UNIQUE,
    stripe_session_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
    week_number INTEGER, -- For weekly payments
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for payment history
CREATE INDEX idx_payment_history_enrollment ON dv_payment_history(enrollment_id);
CREATE INDEX idx_payment_history_stripe_id ON dv_payment_history(stripe_payment_id);
CREATE INDEX idx_payment_history_date ON dv_payment_history(payment_date);

-- Enable RLS on payment history
ALTER TABLE dv_payment_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for webhook processing)
CREATE POLICY "Allow anonymous inserts" ON dv_payment_history
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all
CREATE POLICY "Allow authenticated users to read all" ON dv_payment_history
    FOR SELECT TO authenticated
    USING (true);

-- Create function to update enrollment payment status
CREATE OR REPLACE FUNCTION update_enrollment_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'succeeded' THEN
        IF NEW.payment_type = 'intake' THEN
            UPDATE dv_enrollments
            SET
                intake_fee_paid = true,
                intake_payment_date = NEW.payment_date,
                intake_payment_id = NEW.stripe_payment_id,
                status = 'enrolled',
                updated_at = NOW()
            WHERE id = NEW.enrollment_id;
        ELSIF NEW.payment_type = 'weekly' THEN
            UPDATE dv_enrollments
            SET
                weeks_paid = weeks_paid + 1,
                total_amount_paid = total_amount_paid + NEW.amount,
                last_payment_date = NEW.payment_date,
                last_payment_id = NEW.stripe_payment_id,
                updated_at = NOW()
            WHERE id = NEW.enrollment_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update enrollment when payment succeeds
CREATE TRIGGER update_enrollment_on_payment
    AFTER INSERT OR UPDATE ON dv_payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollment_payment_status();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_dv_enrollments_updated_at
    BEFORE UPDATE ON dv_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for enrollment summary with payment info
CREATE OR REPLACE VIEW dv_enrollment_summary AS
SELECT
    e.id,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    e.enrollment_type,
    e.status,
    e.payment_option,
    e.intake_fee_paid,
    e.weeks_paid,
    e.total_amount_paid,
    e.last_payment_date,
    e.enrollment_date,
    e.created_at,
    COUNT(p.id) as total_payments,
    SUM(CASE WHEN p.payment_type = 'weekly' THEN 1 ELSE 0 END) as weekly_payments_count
FROM dv_enrollments e
LEFT JOIN dv_payment_history p ON e.id = p.enrollment_id AND p.payment_status = 'succeeded'
GROUP BY e.id;

-- Grant access to view
GRANT SELECT ON dv_enrollment_summary TO authenticated;

COMMENT ON TABLE dv_enrollments IS 'Domestic violence accountability program enrollments with payment tracking';
COMMENT ON TABLE dv_payment_history IS 'Detailed payment history for DV program participants';
COMMENT ON VIEW dv_enrollment_summary IS 'Summary view of enrollments with payment statistics';
