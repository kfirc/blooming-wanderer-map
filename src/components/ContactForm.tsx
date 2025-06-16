import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle2, Send, Mail, User, MessageSquare, AlertCircle } from 'lucide-react'
import { sendContactFormEmail } from '@/utils/emailService'

interface ContactFormData {
  name: string
  email: string
  message: string
}

interface ContactFormProps {
  fromEmail?: string
}

export const ContactForm: React.FC<ContactFormProps> = ({ 
  fromEmail = 'kfir969@gmail.com' 
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear any existing error when user starts typing
    if (error) setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'השם נדרש'
    }
    if (!formData.email.trim()) {
      return 'כתובת אימייל נדרשת'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'כתובת אימייל לא תקינה'
    }
    if (!formData.message.trim()) {
      return 'הודעה נדרשת'
    }
    if (formData.message.trim().length < 10) {
      return 'ההודעה חייבת להכיל לפחות 10 תווים'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await sendContactFormEmail(formData, fromEmail)
      
      if (result.success) {
        setIsSuccess(true)
        setFormData({ name: '', email: '', message: '' })
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false)
        }, 5000)
      } else {
        setError(result.error || 'שגיאה בשליחת ההודעה')
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name.trim() && 
    formData.email.trim() && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.message.trim().length >= 10

  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardContent className="pt-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex flex-col space-y-1">
                <div className="font-medium">ההודעה נשלחה בהצלחה! 🎉</div>
                <div className="text-sm">
                  תודה שפנית אלינו. נחזור אליך בהקדם האפשרי.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-3">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Mail className="h-4 w-4 text-blue-600" />
          צור קשר
        </CardTitle>
        <CardDescription className="text-sm">
          שתף אותנו במחשבות או שאלות
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name Field */}
          <div className="space-y-1">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm">
              <User className="h-3 w-3" />
              שם מלא
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="הכנס את שמך המלא"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
              className="w-full h-8 text-sm"
              dir="rtl"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3" />
              כתובת אימייל
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isSubmitting}
              className="w-full h-8 text-sm"
              dir="ltr"
            />
          </div>

          {/* Message Field */}
          <div className="space-y-1">
            <Label htmlFor="message" className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-3 w-3" />
              הודעה
            </Label>
            <div className="relative">
              <Textarea
                id="message"
                placeholder="ספר לנו על הרעיון שלך או השאלה שלך..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-[60px] max-h-[80px] resize-none text-sm pb-6"
                dir="rtl"
              />
              <div className="absolute bottom-2 left-2 text-xs text-gray-400 pointer-events-none">
                {formData.message.length}/10
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full h-8 text-sm transition-all duration-200 ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : isFormValid
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                שולח...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-3 w-3" />
                שלח הודעה
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 