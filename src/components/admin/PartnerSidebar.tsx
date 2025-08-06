import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Gift, 
  TrendingUp, 
  Settings,
  Building2
} from 'lucide-react';

interface PartnerSidebarProps {
  className?: string;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ className }) => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Tableau de bord',
      href: '/partner-dashboard',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble de vos performances'
    },
    {
      title: 'Gestion des récompenses',
      href: '/partner-rewards',
      icon: Gift,
      description: 'Gérer vos offres et récompenses'
    },
    {
      title: 'Analytics',
      href: '/partner-analytics',
      icon: TrendingUp,
      description: 'Analyses détaillées et rapports'
    }
  ];

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Espace Partenaire
        </h2>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-secondary"
                )}
                asChild
              >
                <Link to={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PartnerSidebar; 