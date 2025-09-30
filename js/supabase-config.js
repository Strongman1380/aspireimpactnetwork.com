// Supabase Configuration
const SUPABASE_URL = 'https://knamphazdfkktxovttic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYW1waGF6ZGZra3R4b3Z0dGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTYxNDUsImV4cCI6MjA3NDc3MjE0NX0.NnzZ0Ur1vNHt11nTS6a2C4ODuLhWDKezX_sYkxqC6Bg';

// Initialize Supabase client
let supabase;

// Load Supabase library and initialize client
async function initializeSupabase() {
    try {
        // Load Supabase from CDN
        if (!window.supabase) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            document.head.appendChild(script);

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }

        // Initialize Supabase client
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return supabase;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return null;
    }
}

// Database functions
const Database = {
    // Save contact form submission
    async saveContactSubmission(formData) {
        try {
            const { data, error } = await supabase
                .from('contact_submissions')
                .insert([{
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone || null,
                    organization: formData.organization || null,
                    interest: formData.interest,
                    budget: formData.budget || null,
                    timeline: formData.timeline || null,
                    message: formData.message,
                    newsletter_signup: formData.newsletter || false,
                    privacy_consent: formData.privacy || false,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving contact submission:', error);
            return { success: false, error: error.message };
        }
    },

    // Save newsletter subscription
    async saveNewsletterSubscription(email) {
        try {
            const { data, error } = await supabase
                .from('newsletter_subscriptions')
                .insert([{
                    email: email,
                    subscribed_at: new Date().toISOString(),
                    is_active: true
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving newsletter subscription:', error);
            return { success: false, error: error.message };
        }
    },

    // Save membership enrollment
    async saveMembershipEnrollment(membershipData) {
        try {
            const { data, error } = await supabase
                .from('membership_enrollments')
                .insert([{
                    first_name: membershipData.firstName,
                    last_name: membershipData.lastName,
                    email: membershipData.email,
                    phone: membershipData.phone || null,
                    organization: membershipData.organization || null,
                    membership_type: membershipData.membershipType,
                    billing_frequency: membershipData.billingFrequency || 'monthly',
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving membership enrollment:', error);
            return { success: false, error: error.message };
        }
    },

    // Save domestic violence class enrollment
    async saveDVEnrollment(enrollmentData) {
        try {
            const { data, error } = await supabase
                .from('dv_enrollments')
                .insert([{
                    first_name: enrollmentData.firstName,
                    last_name: enrollmentData.lastName,
                    email: enrollmentData.email,
                    phone: enrollmentData.phone,
                    date_of_birth: enrollmentData.dateOfBirth,
                    address: enrollmentData.address || null,
                    emergency_contact: enrollmentData.emergencyContact || null,
                    referral_source: enrollmentData.referralSource || null,
                    court_ordered: enrollmentData.courtOrdered || false,
                    case_number: enrollmentData.caseNumber || null,
                    probation_officer: enrollmentData.probationOfficer || null,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving DV enrollment:', error);
            return { success: false, error: error.message };
        }
    },

    // Save digital services signup
    async saveDigitalServicesSignup(signupData) {
        try {
            const { data, error } = await supabase
                .from('digital_services_signups')
                .insert([{
                    first_name: signupData.firstName,
                    last_name: signupData.lastName,
                    email: signupData.email,
                    phone: signupData.phone || null,
                    organization: signupData.organization || null,
                    website_url: signupData.websiteUrl || null,
                    business_type: signupData.businessType || null,
                    goals: signupData.goals || null,
                    current_challenges: signupData.currentChallenges || null,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving digital services signup:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export for use in other files
window.Database = Database;
window.initializeSupabase = initializeSupabase;