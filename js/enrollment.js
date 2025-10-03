// Stripe Payment Links for each membership tier
const PAYMENT_LINKS = {
    premier_monthly: 'https://buy.stripe.com/cNi28rcUUdkxbKi6CheZ202',
    premier_yearly: 'https://buy.stripe.com/cNi4gz8EEfsF29I5ydeZ203',
    pro_monthly: 'https://buy.stripe.com/3cIcN54ooa8l9Cad0FeZ204',
    pro_yearly: 'https://buy.stripe.com/bJecN51cc80d15Ef8NeZ205'
};

// Plan configurations
const PLAN_CONFIG = {
    'premier-monthly': {
        name: 'Premier Membership',
        price: '$25/month',
        description: 'Enhanced access for active community members',
        paymentLink: PAYMENT_LINKS.premier_monthly
    },
    'premier-yearly': {
        name: 'Premier Membership',
        price: '$240/year',
        description: 'Enhanced access for active community members (Save $60/year)',
        paymentLink: PAYMENT_LINKS.premier_yearly
    },
    'pro-monthly': {
        name: 'Pro Membership',
        price: '$35/month',
        description: 'Maximum value for organizations and leaders',
        paymentLink: PAYMENT_LINKS.pro_monthly
    },
    'pro-yearly': {
        name: 'Pro Membership',
        price: '$336/year',
        description: 'Maximum value for organizations and leaders (Save $84/year)',
        paymentLink: PAYMENT_LINKS.pro_yearly
    }
};

// Get plan from URL parameters
function getPlanFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('plan') || 'premier-monthly';
}

// Update plan summary based on selected plan
function updatePlanSummary() {
    const planKey = getPlanFromURL();
    const plan = PLAN_CONFIG[planKey];

    if (plan) {
        document.getElementById('plan-name').textContent = plan.name;
        document.getElementById('plan-price').textContent = plan.price;
        document.getElementById('plan-description').textContent = plan.description;
    }
}

// Save enrollment data to localStorage
function saveEnrollmentData(formData) {
    const enrollmentData = {
        fullName: formData.get('full-name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        organization: formData.get('organization'),
        role: formData.get('role'),
        interest: formData.get('interest'),
        goals: formData.get('goals'),
        referral: formData.get('referral'),
        newsletter: formData.get('newsletter') === 'on',
        plan: getPlanFromURL(),
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('aspire_enrollment', JSON.stringify(enrollmentData));
    return enrollmentData;
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    // Update plan summary on page load
    updatePlanSummary();

    const form = document.getElementById('enrollment-form');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get form data
        const formData = new FormData(form);

        // Save enrollment data
        const enrollmentData = saveEnrollmentData(formData);

        // Optional: Send to your backend/database (Supabase, etc.)
        // await sendToDatabase(enrollmentData);

        // Get the payment link for this plan
        const planKey = getPlanFromURL();
        const paymentLink = PLAN_CONFIG[planKey].paymentLink;

        // Show loading state
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Redirecting to payment...';

        // Redirect to Stripe payment
        window.location.href = paymentLink;
    });
});

// Optional: Function to send data to your backend
async function sendToDatabase(enrollmentData) {
    try {
        // Example: Send to Supabase or your API
        const response = await fetch('/api/enrollment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(enrollmentData)
        });

        if (!response.ok) {
            throw new Error('Failed to save enrollment data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving enrollment:', error);
        // Continue anyway - data is saved in localStorage
    }
}
