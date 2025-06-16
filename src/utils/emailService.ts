import { supabase } from '@/integrations/supabase/client'

export interface EmailOptions {
  to: string | string[]
  from: string
  subject: string
  html?: string
  text?: string
  cc?: string[]
  bcc?: string[]
  reply_to?: string[]
}

export interface EmailResponse {
  success: boolean
  message: string
  data?: {
    id: string
    from: string
    to: string[]
    created_at: string
  }
  error?: string
}

export interface ContactFormData {
  name: string
  email: string
  message: string
}

/**
 * Send an email using Supabase Edge Function with Resend
 * 
 * This function automatically uses:
 * - Local development: http://localhost:54321/functions/v1/send-email  
 * - Production: https://dxrlkykphghgwcqcflbs.supabase.co/functions/v1/send-email
 * 
 * @param emailOptions Email configuration
 * @returns Promise with email sending result
 */
export async function sendEmail(emailOptions: EmailOptions): Promise<EmailResponse> {
  try {
    console.log('📧 Sending email via Supabase Edge Function...', {
      to: emailOptions.to,
      from: emailOptions.from,
      subject: emailOptions.subject
    })

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailOptions
    })

    if (error) {
      console.error('❌ Supabase function error:', error)
      
      // Handle specific CORS and network errors
      if (error.message?.includes('non-2xx') || error.message?.includes('CORS')) {
        return {
          success: false,
          message: 'Network error - please check if the email service is running',
          error: `Network/CORS error: ${error.message}`
        }
      }
      
      // Handle function execution errors
      if (error.context) {
        try {
          const errorData = await error.context.json()
          return {
            success: false,
            message: errorData.message || 'Email service error',
            error: errorData.error || error.message
          }
        } catch {
          // If we can't parse the error context, use the original error
        }
      }
      
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message
      }
    }

    console.log('✅ Email sent successfully:', data)
    return {
      success: true,
      message: 'Email sent successfully',
      data
    }

  } catch (err) {
    console.error('❌ Email service error:', err)
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

/**
 * Send a contact form email with predefined formatting
 * @param contactData Contact form data
 * @param toEmail Recipient email (defaults to contact email)
 * @returns Promise with email sending result
 */
export async function sendContactFormEmail(
  contactData: ContactFormData,
  toEmail: string = 'kfir969@gmail.com'
): Promise<EmailResponse> {
  
  const emailOptions: EmailOptions = {
    to: toEmail,
    from: 'onboarding@resend.dev', // Using Resend's verified sender
    subject: `🗺️ הודעה חדשה ממפת הפריחה - ${contactData.name}`,
    reply_to: [contactData.email],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🗺️ מפת הפריחה</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">הודעה חדשה מטופס הקשר</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; text-align: right;">פרטי השולח:</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>שם:</strong> ${contactData.name}</p>
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>אימייל:</strong> ${contactData.email}</p>
          </div>
          
          <h3 style="color: #333; text-align: right;">ההודעה:</h3>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; border-right: 4px solid #667eea; text-align: right;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${contactData.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p style="font-size: 14px; margin: 0;">נשלח ב-${new Date().toLocaleDateString('he-IL')} בשעה ${new Date().toLocaleTimeString('he-IL')}</p>
            <p style="font-size: 12px; margin: 10px 0 0 0; opacity: 0.7;">מפת הפריחה - Blooming Wanderer Map</p>
          </div>
        </div>
      </div>
    `,
    text: `
הודעה חדשה ממפת הפריחה

שם: ${contactData.name}
אימייל: ${contactData.email}

ההודעה:
${contactData.message}

נשלח ב-${new Date().toLocaleDateString('he-IL')} בשעה ${new Date().toLocaleTimeString('he-IL')}
    `.trim()
  }

  return sendEmail(emailOptions)
}

/**
 * Send a welcome email to new users
 * @param userEmail User's email address
 * @param userName User's name
 * @returns Promise with email sending result
 */
export async function sendWelcomeEmail(
  userEmail: string, 
  userName: string,
  fromEmail: string = 'onboarding@resend.dev'
): Promise<EmailResponse> {
  const emailOptions: EmailOptions = {
    to: userEmail,
    from: fromEmail,
    subject: '🌸 ברוכים הבאים למפת הפריחה הנודדת!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>🌸 ברוכים הבאים למפת הפריחה הנודדת, ${userName}!</h1>
        <p>תודה שהצטרפת אלינו. אנו שמחים שאתה חלק מקהילת חובבי הפריחה.</p>
        <p>במפה שלנו תוכל למצוא את כל אתרי הפריחה הכי יפים בישראל!</p>
      </div>
    `,
    text: `ברוכים הבאים למפת הפריחה הנודדת, ${userName}! תודה שהצטרפת אלינו.`
  }

  return sendEmail(emailOptions)
} 