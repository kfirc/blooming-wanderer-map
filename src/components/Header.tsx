
import React from 'react';
import { Flower2, Facebook, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { bloomReportsService } from '../services/bloomReportsService';

const Header = () => {
  // Fetch reports and locations for stats
  const { data: reports = [] } = useQuery({
    queryKey: ['bloom-reports'],
    queryFn: bloomReportsService.getRecentReports,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: bloomReportsService.getLocations,
  });

  // Calculate stats
  const weeklyReports = reports.length;
  const activeLocations = locations.filter(loc => loc.intensity > 0).length;
  const accuracyPercentage = 85; // This could be calculated based on actual data

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-green-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-purple-500 rounded-lg">
              <Flower2 className="h-6 w-6 text-white" />
            </div>
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
              <div className="font-semibold text-purple-700">{activeLocations}</div>
              <div className="text-gray-500">אזורי פריחה פעילים</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{accuracyPercentage}%</div>
              <div className="text-gray-500">דיוק התחזיות</div>
            </div>
          </div>

          {/* Auth */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="hidden sm:flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Facebook className="h-4 w-4" />
              <span>התחבר עם פייסבוק</span>
            </Button>
            <Button size="sm" variant="ghost" className="p-2">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
