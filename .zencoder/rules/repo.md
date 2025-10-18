---
description: Repository Information Overview
alwaysApply: true
---

# Aspire Impact Network Website Information

## Summary
A comprehensive website for Aspire Impact Network, showcasing justice support programs and digital solutions services. Built with modern HTML5, CSS3, and JavaScript, featuring membership tiers, form handling, and payment processing.

## Structure
- **HTML Files**: Core website pages (index.html, justice-support.html, etc.)
- **CSS**: Styling with modern CSS3 (styles.css)
- **JavaScript**: Interactive functionality and form handling
- **API**: Serverless functions for payment processing
- **Images**: Website visual assets
- **Database**: SQL setup for Supabase backend

## Language & Runtime
**Language**: HTML5, CSS3, JavaScript
**Build System**: Static website (no build process required)
**Package Manager**: None (CDN-based dependencies)
**Database**: Supabase (PostgreSQL)

## Dependencies
**Main Dependencies**:
- Stripe.js (Payment processing)
- Supabase.js (Database and backend)

**External Services**:
- Stripe (Payment processing)
- Supabase (Database and backend)

## Build & Installation
```bash
# Local development server options
python -m http.server 8000
# OR
npx http-server
# OR
php -S localhost:8000
```

## Deployment
**Recommended**: Static hosting services
- Netlify: Connect Git repository, no build command needed
- Vercel: Connect Git repository, no build settings needed
- GitHub Pages: Push to repository, enable Pages in settings

## API Integration
**Stripe Integration**:
- API Endpoint: `/api/create-checkout-session.js`
- Environment Variables: `STRIPE_SECRET_KEY` (server-side)
- Public Key: Configured in `js/stripe-checkout.js`
- Payment Links: Configured for different membership tiers

**Supabase Integration**:
- Configuration: `js/supabase-config.js`
- Tables: contact_submissions, newsletter_subscriptions, membership_enrollments, digital_services_signups, dv_enrollments
- Database Setup: `database-setup.sql`

## Key Features
**Form Handling**:
- Contact form with validation
- Membership enrollment
- Newsletter signup
- Digital services signup
- Domestic violence class enrollment

**Payment Processing**:
- Stripe Checkout integration
- Subscription management
- Payment links for different tiers

**Data Storage**:
- Supabase database integration
- Form submissions stored in appropriate tables
- Row-level security policies implemented