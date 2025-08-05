
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  User,
  Settings,
  Trophy,
  Crown,
  LogOut,
  MapPin,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserMenuProps {
  variant?: 'default' | 'transparent';
}

const UserMenu: React.FC<UserMenuProps> = ({ variant = 'default' }) => {
  const { user, profile, isAdmin, loading, signOut, hasRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTransparent = variant === 'transparent';

  // Show loading state to prevent flash
  if (loading) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="h-8 w-16 sm:h-10 sm:w-20 bg-muted animate-pulse rounded" />
        <div className="h-8 w-16 sm:h-10 sm:w-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button 
          asChild 
          variant="ghost"
          size={isMobile ? "sm" : "default"}
          className={isTransparent ? 'text-white hover:bg-white/10 hover:text-white' : ''}
        >
          <Link to="/auth" className="flex items-center">
            {isMobile ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <span>{t('login')}</span>
            )}
          </Link>
        </Button>
        <Button 
          asChild
          size={isMobile ? "sm" : "default"}
          className={isTransparent ? 'bg-white text-primary hover:bg-white/90' : ''}
        >
          <Link to="/auth" className="flex items-center">
            {isMobile ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <span>{t('register')}</span>
            )}
          </Link>
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const getUserInitials = () => {
    return profile?.full_name?.[0] || profile?.email?.[0] || 'U';
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Crown className="h-3 w-3" />;
    return null;
  };

  const getRoleLabel = () => {
    switch (profile.role) {
      case 'super_admin': return t('role.super_admin') || 'Super Admin';
      case 'tenant_admin': return t('role.tenant_admin') || 'Admin Ville';
      default: return t('role.explorer') || 'Explorateur';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`relative h-8 w-8 sm:h-10 sm:w-10 rounded-full ${
            isTransparent ? 'hover:bg-white/10' : ''
          }`}
        >
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={undefined} alt={user.email || ''} />
            <AvatarFallback className={isTransparent ? 'bg-white/20 text-white' : ''}>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 sm:w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none truncate max-w-[180px]">
                {profile.full_name || profile.email}
              </p>
              {getRoleIcon() && (
                <Badge variant="secondary" className="h-5 flex items-center gap-1">
                  {getRoleIcon()}
                  <span className="text-xs">{getRoleLabel()}</span>
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              <span>{profile.total_points} {t('points')}</span>
              <span>•</span>
              <span>{t('level')} {profile.current_level}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/my-journeys" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{t('my_journeys')}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/rewards" className="flex items-center">
            <Trophy className="mr-2 h-4 w-4" />
            <span>{t('rewards')}</span>
          </Link>
        </DropdownMenuItem>

        {(isAdmin || profile?.role === 'partner') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('administration')}</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
