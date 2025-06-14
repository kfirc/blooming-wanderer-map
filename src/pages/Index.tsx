
import React, { useState } from 'react';
import Map from '../components/Map';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { BloomReport } from '../types/BloomReport';

// Mock data for demonstration
const mockReports: BloomReport[] = [
  {
    id: 1,
    location: { lat: 32.0853, lng: 34.7818 }, // Tel Aviv area
    reporterName: "שרה כהן",
    reporterPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
    postDate: "2025-06-12",
    likes: 24,
    images: [
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
    ],
    description: "פריחה מדהימה של נרקיסים בפארק הירקון! צבעים יפהפיים",
    flowerTypes: ["נרקיסים", "שקדיות"],
    wazeUrl: "https://waze.com/ul?ll=32.0853,34.7818",
    intensity: 0.8
  },
  {
    id: 2,
    location: { lat: 31.7683, lng: 35.2137 }, // Jerusalem area
    reporterName: "דוד לוי",
    reporterPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    postDate: "2025-06-13",
    likes: 18,
    images: [
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=300&fit=crop"
    ],
    description: "פריחת אביב מרהיבה בהרי ירושלים",
    flowerTypes: ["כלניות", "קחוונים"],
    wazeUrl: "https://waze.com/ul?ll=31.7683,35.2137",
    intensity: 0.6
  },
  {
    id: 3,
    location: { lat: 32.7940, lng: 34.9896 }, // Haifa area
    reporterName: "מיכל ברק",
    reporterPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    postDate: "2025-06-14",
    likes: 35,
    images: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    ],
    description: "הר הכרמל פורח! מחזה בלתי נשכח",
    flowerTypes: ["רקפות", "לוטוסים"],
    wazeUrl: "https://waze.com/ul?ll=32.7940,34.9896",
    intensity: 0.9
  }
];

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<BloomReport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLocationClick = (report: BloomReport) => {
    setSelectedLocation(report);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedLocation(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-purple-50">
      <Header />
      <div className="flex-1 flex relative">
        <Map 
          reports={mockReports} 
          onLocationClick={handleLocationClick}
          selectedLocation={selectedLocation}
        />
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          reports={selectedLocation ? [selectedLocation] : mockReports}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
};

export default Index;
