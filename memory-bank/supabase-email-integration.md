# Supabase Edge Functions + Resend Email Integration

## Setup Requirements
- Resend account with API key (FREE TIER AVAILABLE)
- Domain verification in Resend for production
- Supabase CLI latest version
- Environment variable: `RESEND_API_KEY`

## Resend Pricing (2025)
- **FREE**: 3,000 emails/month, 100 emails/day, 1 domain
- **Pro**: $20/month for 50,000 emails, no daily limit, 10 domains
- **Scale**: $90/month for 100,000 emails, 1,000 domains
- **Enterprise**: Custom pricing for high volume

## Key Implementation Points
- Edge Function path: `supabase/functions/send-email/index.ts`
- Uses Deno runtime with fetch API to call Resend API
- CORS headers required for browser requests
- Input validation for required fields (to, from, subject)
- Error handling for API failures and missing configuration

## Production Deployment
1. Set secrets: `supabase secrets set RESEND_API_KEY=xxx`
2. Deploy: `supabase functions deploy send-email --no-verify-jwt`
3. Access via: `supabase.functions.invoke('send-email', { body: emailOptions })`

## Security Best Practices
- Never expose API keys client-side
- Validate email inputs
- Consider rate limiting
- Add authentication checks if needed

## Advanced Features
- Template support for common email types
- Database logging of email sends
- Batch email capabilities
- Retry logic for failed sends

## Cost Optimization
- Use templates to reduce payload size
- Implement proper error handling to avoid unnecessary retries
- Consider batching for multiple recipients

## Test Results (Successful)
- ✅ Edge Function deployment: Working
- ✅ Resend API integration: Connected  
- ✅ Email sending: 3 successful test emails sent
- ✅ HTML templates: Rendering correctly
- ✅ Error handling: Validates inputs properly
- ✅ CORS support: Enabled for browser requests
- 🆔 Test Email IDs: 77c8bfb4-f47f-4b57-a514-1d57c2e535b0, f9829776-b8c7-4e08-b518-b0fa67ca7702, 5e8a24ee-0503-47ba-b481-5f8039418dad

## TROUBLESHOOTING RESOLVED ✅ (June 16, 2025)
**Issue**: "Edge Function returned a non-2xx status code" when calling from website
**Root Causes**: 
1. Missing VITE_SUPABASE_URL environment variable
2. Production function had JWT verification enabled
3. Local dev environment variable not loaded properly

**Solutions Applied**:
1. ✅ Added VITE_SUPABASE_URL=https://dxrlkykphghgwcqcflbs.supabase.co to .env
2. ✅ Re-deployed function with --no-verify-jwt flag 
3. ✅ Created .env.local with RESEND_API_KEY for local development
4. ✅ Enhanced error handling in emailService.ts for better debugging
5. ✅ Restarted dev server to pick up environment changes

**Final Test**: Email ID 69d3671d-16cb-403e-ada0-c0332cdcded9 sent successfully from production

## Production Deployment (COMPLETED ✅)
- ✅ API Key: Set in production secrets (RESEND_API_KEY)
- ✅ Function Deployed: supabase/functions/send-email/index.ts 
- ✅ Production URL: https://dxrlkykphghgwcqcflbs.supabase.co/functions/v1/send-email
- ✅ No JWT verification: Allows direct client access
- ✅ Production Test: Email ID b9d5fb8b-8274-40ec-b1e6-b86ab67bd3b8
- ✅ Client Utils: src/utils/emailService.ts configured for prod
- ✅ Local Test Scripts: scripts/test-email.js working
- 🔗 Dashboard: https://supabase.com/dashboard/project/dxrlkykphghgwcqcflbs/functions

## Contact Form Integration (COMPLETED)
- ✅ Contact form component: `src/components/ContactForm.tsx`
- ✅ Integrated into sidebar: `src/components/Sidebar/SidebarInfoMode.tsx`
- ✅ Form features: Name, email, message fields with validation
- ✅ UI/UX: Loading states, success animation, error handling
- ✅ Hebrew interface with RTL text direction support
- ✅ Email service: `sendContactFormEmail()` with beautiful HTML templates
- ✅ Form validation: Required fields, email format, minimum message length
- ✅ Success feedback: 5-second success message with auto-hide
- ✅ Email templates: Professional Hebrew email templates with gradients
- ✅ Direct reply capability: Sets reply-to header for easy responses 