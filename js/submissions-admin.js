// Submissions Admin Dashboard JavaScript
// This handles loading and displaying all submission data from Supabase

let currentTab = 'contact';

// Initialize the dashboard when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Submissions dashboard initializing...');
    
    // Initialize Supabase
    await initializeSupabase();
    
    // Setup tab functionality
    setupTabs();
    
    // Load initial data
    await loadSubmissions('contact');
});

// Setup tab switching functionality
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Load data for this tab if not already loaded
            currentTab = tabName;
            loadSubmissions(tabName);
        });
    });
}

// Load submissions for a specific type
async function loadSubmissions(type) {
    if (!supabase) {
        console.error('Supabase not initialized');
        showError(type, 'Database connection not available');
        return;
    }

    showLoading(type, true);
    hideError(type);

    try {
        let data;
        let tableName;

        switch(type) {
            case 'contact':
                tableName = 'contact_submissions';
                break;
            case 'newsletter':
                tableName = 'newsletter_subscriptions';
                break;
            case 'membership':
                tableName = 'membership_enrollments';
                break;
            case 'digital':
                tableName = 'digital_services_signups';
                break;
            case 'dv':
                tableName = 'dv_enrollments';
                break;
            default:
                throw new Error(`Unknown submission type: ${type}`);
        }

        console.log(`Loading ${type} submissions from ${tableName}...`);

        const { data: submissions, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        console.log(`Loaded ${submissions?.length || 0} ${type} submissions`);
        
        displaySubmissions(type, submissions || []);
        updateCount(type, submissions?.length || 0);

    } catch (error) {
        console.error(`Error loading ${type} submissions:`, error);
        showError(type, `Failed to load ${type} submissions: ${error.message}`);
    } finally {
        showLoading(type, false);
    }
}

// Display submissions in the UI
function displaySubmissions(type, submissions) {
    const container = document.getElementById(`${type}-submissions`);
    
    if (!submissions || submissions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h3>No ${type} submissions found</h3>
                <p>When users submit forms, they will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = submissions.map(submission => {
        switch(type) {
            case 'contact':
                return renderContactSubmission(submission);
            case 'newsletter':
                return renderNewsletterSubmission(submission);
            case 'membership':
                return renderMembershipSubmission(submission);
            case 'digital':
                return renderDigitalSubmission(submission);
            case 'dv':
                return renderDVSubmission(submission);
            default:
                return '';
        }
    }).join('');
}

// Render contact form submission
function renderContactSubmission(submission) {
    return `
        <div class="submission-card">
            <div class="submission-header">
                <div class="submission-name">${submission.first_name} ${submission.last_name}</div>
                <div class="submission-date">${formatDate(submission.created_at)}</div>
            </div>
            <div class="submission-details">
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${submission.email}</div>
                </div>
                ${submission.phone ? `
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${submission.phone}</div>
                </div>
                ` : ''}
                ${submission.organization ? `
                <div class="detail-row">
                    <div class="detail-label">Organization:</div>
                    <div class="detail-value">${submission.organization}</div>
                </div>
                ` : ''}
                <div class="detail-row">
                    <div class="detail-label">Interest:</div>
                    <div class="detail-value">${submission.interest}</div>
                </div>
                ${submission.budget ? `
                <div class="detail-row">
                    <div class="detail-label">Budget:</div>
                    <div class="detail-value">${submission.budget}</div>
                </div>
                ` : ''}
                ${submission.timeline ? `
                <div class="detail-row">
                    <div class="detail-label">Timeline:</div>
                    <div class="detail-value">${submission.timeline}</div>
                </div>
                ` : ''}
                <div class="detail-row">
                    <div class="detail-label">Newsletter:</div>
                    <div class="detail-value">${submission.newsletter_signup ? 'Yes' : 'No'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Privacy Consent:</div>
                    <div class="detail-value">${submission.privacy_consent ? 'Yes' : 'No'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Message:</div>
                    <div class="detail-value">
                        <div class="message-text">${submission.message}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render newsletter subscription
function renderNewsletterSubmission(subscription) {
    return `
        <div class="submission-card">
            <div class="submission-header">
                <div class="submission-name">${subscription.email}</div>
                <div class="submission-date">${formatDate(subscription.subscribed_at)}</div>
            </div>
            <div class="submission-details">
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge ${subscription.is_active ? 'status-active' : 'status-cancelled'}">
                            ${subscription.is_active ? 'Active' : 'Unsubscribed'}
                        </span>
                    </div>
                </div>
                ${subscription.unsubscribed_at ? `
                <div class="detail-row">
                    <div class="detail-label">Unsubscribed:</div>
                    <div class="detail-value">${formatDate(subscription.unsubscribed_at)}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Render membership enrollment
function renderMembershipSubmission(enrollment) {
    return `
        <div class="submission-card">
            <div class="submission-header">
                <div class="submission-name">${enrollment.first_name} ${enrollment.last_name}</div>
                <div class="submission-date">${formatDate(enrollment.created_at)}</div>
            </div>
            <div class="submission-details">
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${enrollment.email}</div>
                </div>
                ${enrollment.phone ? `
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${enrollment.phone}</div>
                </div>
                ` : ''}
                ${enrollment.organization ? `
                <div class="detail-row">
                    <div class="detail-label">Organization:</div>
                    <div class="detail-value">${enrollment.organization}</div>
                </div>
                ` : ''}
                <div class="detail-row">
                    <div class="detail-label">Membership Type:</div>
                    <div class="detail-value">${enrollment.membership_type.charAt(0).toUpperCase() + enrollment.membership_type.slice(1)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Billing:</div>
                    <div class="detail-value">${enrollment.billing_frequency.charAt(0).toUpperCase() + enrollment.billing_frequency.slice(1)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge status-${enrollment.status}">
                            ${enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render digital services signup
function renderDigitalSubmission(signup) {
    return `
        <div class="submission-card">
            <div class="submission-header">
                <div class="submission-name">${signup.first_name} ${signup.last_name}</div>
                <div class="submission-date">${formatDate(signup.created_at)}</div>
            </div>
            <div class="submission-details">
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${signup.email}</div>
                </div>
                ${signup.phone ? `
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${signup.phone}</div>
                </div>
                ` : ''}
                ${signup.organization ? `
                <div class="detail-row">
                    <div class="detail-label">Organization:</div>
                    <div class="detail-value">${signup.organization}</div>
                </div>
                ` : ''}
                ${signup.website_url ? `
                <div class="detail-row">
                    <div class="detail-label">Website:</div>
                    <div class="detail-value"><a href="${signup.website_url}" target="_blank">${signup.website_url}</a></div>
                </div>
                ` : ''}
                ${signup.business_type ? `
                <div class="detail-row">
                    <div class="detail-label">Business Type:</div>
                    <div class="detail-value">${signup.business_type}</div>
                </div>
                ` : ''}
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge status-${signup.status}">
                            ${signup.status.charAt(0).toUpperCase() + signup.status.slice(1)}
                        </span>
                    </div>
                </div>
                ${signup.goals ? `
                <div class="detail-row">
                    <div class="detail-label">Goals:</div>
                    <div class="detail-value">
                        <div class="message-text">${signup.goals}</div>
                    </div>
                </div>
                ` : ''}
                ${signup.current_challenges ? `
                <div class="detail-row">
                    <div class="detail-label">Challenges:</div>
                    <div class="detail-value">
                        <div class="message-text">${signup.current_challenges}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Render DV class enrollment
function renderDVSubmission(enrollment) {
    return `
        <div class="submission-card">
            <div class="submission-header">
                <div class="submission-name">${enrollment.first_name} ${enrollment.last_name}</div>
                <div class="submission-date">${formatDate(enrollment.created_at)}</div>
            </div>
            <div class="submission-details">
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${enrollment.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${enrollment.phone}</div>
                </div>
                ${enrollment.date_of_birth ? `
                <div class="detail-row">
                    <div class="detail-label">Date of Birth:</div>
                    <div class="detail-value">${formatDate(enrollment.date_of_birth)}</div>
                </div>
                ` : ''}
                ${enrollment.address ? `
                <div class="detail-row">
                    <div class="detail-label">Address:</div>
                    <div class="detail-value">${enrollment.address}</div>
                </div>
                ` : ''}
                ${enrollment.emergency_contact ? `
                <div class="detail-row">
                    <div class="detail-label">Emergency Contact:</div>
                    <div class="detail-value">${enrollment.emergency_contact}</div>
                </div>
                ` : ''}
                ${enrollment.referral_source ? `
                <div class="detail-row">
                    <div class="detail-label">Referral Source:</div>
                    <div class="detail-value">${enrollment.referral_source}</div>
                </div>
                ` : ''}
                <div class="detail-row">
                    <div class="detail-label">Court Ordered:</div>
                    <div class="detail-value">${enrollment.court_ordered ? 'Yes' : 'No'}</div>
                </div>
                ${enrollment.case_number ? `
                <div class="detail-row">
                    <div class="detail-label">Case Number:</div>
                    <div class="detail-value">${enrollment.case_number}</div>
                </div>
                ` : ''}
                ${enrollment.probation_officer ? `
                <div class="detail-row">
                    <div class="detail-label">Probation Officer:</div>
                    <div class="detail-value">${enrollment.probation_officer}</div>
                </div>
                ` : ''}
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge status-${enrollment.status}">
                            ${enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                    </div>
                </div>
                ${enrollment.enrollment_date ? `
                <div class="detail-row">
                    <div class="detail-label">Enrollment Date:</div>
                    <div class="detail-value">${formatDate(enrollment.enrollment_date)}</div>
                </div>
                ` : ''}
                ${enrollment.completion_date ? `
                <div class="detail-row">
                    <div class="detail-label">Completion Date:</div>
                    <div class="detail-value">${formatDate(enrollment.completion_date)}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}

function showLoading(type, show) {
    const loading = document.getElementById(`${type}-loading`);
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function hideError(type) {
    const error = document.getElementById(`${type}-error`);
    if (error) {
        error.style.display = 'none';
    }
}

function showError(type, message) {
    const error = document.getElementById(`${type}-error`);
    if (error) {
        error.textContent = message;
        error.style.display = 'block';
    }
}

function updateCount(type, count) {
    const countElement = document.getElementById(`${type}-count`);
    if (countElement) {
        const label = type === 'newsletter' ? 'subscriptions' : 
                     type === 'membership' ? 'enrollments' : 
                     type === 'digital' ? 'signups' : 
                     type === 'dv' ? 'enrollments' : 'submissions';
        
        countElement.textContent = `${count} ${label}`;
    }
}

// Auto-refresh every 30 seconds for the current tab
setInterval(() => {
    if (currentTab) {
        loadSubmissions(currentTab);
    }
}, 30000);

console.log('Submissions admin dashboard loaded');
