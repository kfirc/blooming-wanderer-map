
import React from 'react';
import { Facebook, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const AuthButton: React.FC = () => {
  const { user, loading, signInWithFacebook, signOut } = useAuth();

  if (loading) {
    return (
      <Button size="sm" variant="ghost" className="p-2" disabled>
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={user.user_metadata?.avatar_url} 
            alt={user.user_metadata?.full_name || 'User'} 
          />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <Button size="sm" variant="ghost" onClick={signOut} className="p-2">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      size="sm"
      onClick={signInWithFacebook}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Facebook className="h-4 w-4" />
      <span className="hidden sm:inline">התחבר עם פייסבוק</span>
    </Button>
  );
};

export default AuthButton;
