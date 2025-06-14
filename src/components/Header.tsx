
import React from 'react';
import { Flower2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bloomReportsService } from '../services/bloomReportsService';
import AuthButton from './AuthButton';

const Header = () => {
  // Fetch reports and flowers data for stats
  const { data: reports = [] } = useQuery({
    queryKey: ['bloom-reports'],
    queryFn: bloomReportsService.getRecentReports,
  });

  const { data: flowers = [] } = useQuery({
    queryKey: ['flowers'],
    queryFn: bloomReportsService.getFlowers,
  });

  // Calculate stats
  const weeklyReports = reports.length;
  const activeFlowerTypes = flowers.length;
  const accuracyPercentage = 85; // This could be calculated based on actual data

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-green-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.jpg"
              alt="Website Logo"
              style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 8 }}
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-purple-700 bg-clip-text text-transparent">
                פריחת ישראל
              </h1>
              <p className="text-sm text-gray-500">מפת פריחה בזמן אמת</p>
            </div>
          </div>

          {/* Center Stats */}
          <div className="hidden md:flex items-center space-x-8 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-700">{weeklyReports}</div>
              <div className="text-gray-500">דיווחים השבוע</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-700">{activeFlowerTypes}</div>
              <div className="text-gray-500">סוגי פרחים</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{accuracyPercentage}%</div>
              <div className="text-gray-500">דיוק התחזיות</div>
            </div>
          </div>

          {/* Auth */}
          <AuthButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
