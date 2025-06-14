
import React from 'react';
import { Facebook, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapActionButtons: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col space-y-3">
      {/* Facebook Login */}
      <Button 
        size="sm"
        className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <Facebook className="h-5 w-5 text-white" />
      </Button>
      
      {/* Profile Button */}
      <Button 
        size="sm" 
        variant="secondary"
        className="rounded-full w-12 h-12 p-0 shadow-lg"
      >
        <User className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MapActionButtons;
