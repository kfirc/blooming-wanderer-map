import React from 'react';
import { ContactForm } from '../ContactForm';

interface SidebarInfoModeProps {
  title?: string;
  content?: string;
}

export const SidebarInfoMode: React.FC<SidebarInfoModeProps> = () => {
  return (
    <div className="h-full overflow-y-auto">
      {/* Information Section */}
      <div className="p-6 text-center text-gray-700 border-b border-gray-100">
        <div className="space-y-2">          
          {/* Quick Info Cards */}
          <div className="grid gap-3 mt-2">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌸</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">גלה אתרי פריחה</p>
                  <p className="text-xs text-gray-600">מצא את המקומות הכי יפים לפריחה בישראל</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">ניווט חכם</p>
                  <p className="text-xs text-gray-600">קבל הנחיות נסיעה באמצעות Waze</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">📊</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">מידע עדכני</p>
                  <p className="text-xs text-gray-600">דיווחי פריחה בזמן אמת מהקהילה</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="p-4 pt-4 pb-8">
        <ContactForm />
      </div>
    </div>
  );
}; 