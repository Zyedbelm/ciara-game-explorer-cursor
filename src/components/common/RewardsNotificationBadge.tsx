import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

interface RewardsNotificationBadgeProps {
  count: number;
  className?: string;
}

const RewardsNotificationBadge: React.FC<RewardsNotificationBadgeProps> = ({ 
  count, 
  className = '' 
}) => {
  if (count === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <Gift className="h-5 w-5 text-primary" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </div>
  );
};

export default RewardsNotificationBadge;
