
import React from 'react';
import { Facebook, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const MapAuthButton: React.FC = () => {
  const { user, loading, signInWithFacebook, signOut } = useAuth();

  if (loading) {
    return (
      <Button 
        size="sm"
        variant="secondary"
        className="rounded-full w-12 h-12 p-0 shadow-lg"
        disabled
      >
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Avatar className="h-12 w-12 shadow-lg">
            <AvatarImage 
              src={user.user_metadata?.avatar_url} 
              alt={user.user_metadata?.full_name || 'User'} 
            />
            <AvatarFallback className="bg-white">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
        <Button 
          size="sm"
          variant="secondary"
          onClick={signOut}
          className="rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      size="sm"
      onClick={signInWithFacebook}
      className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
    >
      <Facebook className="h-5 w-5 text-white" />
    </Button>
  );
};

export default MapAuthButton;
