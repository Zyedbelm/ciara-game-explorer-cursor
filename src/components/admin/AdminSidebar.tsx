import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Home,
  Users,
  MapPin,
  FileText,
  BarChart3,
  Trophy,
  Globe,
  Settings,
  Shield,
  Activity,
  Eye,
  MessageSquare,
  Building,
  Star,
  Mail,
  ChevronDown,
  ChevronRight,
  Link
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  canManageUsers: () => boolean;
  canManageContent: () => boolean;
  canViewAnalytics: () => boolean;
  isSuperAdmin: () => boolean;
  isTenantAdmin: () => boolean;
  isPartner: () => boolean;
  cityName?: string | null;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  children?: NavItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  canManageUsers,
  canManageContent,
  canViewAnalytics,
  isSuperAdmin,
  isTenantAdmin,
  isPartner,
  cityName
}) => {
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set(['main', 'management']));

  const toggleGroup = (groupId: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  const navigationGroups = [
    {
      id: 'main',
      label: 'Navigation',
      items: [
        {
          id: 'overview',
          label: 'Vue d\'ensemble',
          icon: Home,
        },
        ...(typeof canManageUsers === 'function' && canManageUsers() ? [{
          id: 'users',
          label: 'Utilisateurs',
          icon: Users,
        }] : []),
        ...(typeof isSuperAdmin === 'function' && isSuperAdmin() ? [
          { id: 'cities', label: 'Gestion des villes', icon: Building },
          { id: 'countries', label: 'Gestion des pays', icon: Globe },
          { id: 'homepage', label: 'Visibilité homepage', icon: Eye }
        ] : []),
        ...(typeof canManageContent === 'function' && canManageContent() ? [{
          id: 'content',
          label: 'Parcours & Étapes',
          icon: FileText,
        }] : []),
        ...(typeof canManageContent === 'function' && canManageContent() ? [{
          id: 'articles',
          label: 'Articles de blog',
          icon: FileText,
        }] : []),
        ...(typeof isPartner === 'function' && isPartner() ? [{
          id: 'reward-offers',
          label: 'Gestion des offres Récompenses',
          icon: Trophy,
        }] : [{
          id: 'reward-offers',
          label: 'Gestion des offres Récompenses',
          icon: Trophy,
        }]),
        ...(typeof isPartner === 'function' && isPartner() ? [] : [{
          id: 'partners',
          label: 'Gestion des Partenaires',
          icon: Building,
        }]),
        ...(typeof isSuperAdmin === 'function' && isSuperAdmin() ? [{
          id: 'partner-links',
          label: 'Liens Partenaires',
          icon: Link,
          badge: 'Super Admin'
        }] : []),
      ].filter(Boolean)
    },
    ...(typeof canViewAnalytics === 'function' && canViewAnalytics() ? [{
      id: 'analytics',
      label: 'Analytics & Rapports',
      items: [
        {
          id: 'analytics',
          label: 'Tableaux de bord',
          icon: BarChart3,
        },
        {
          id: 'insights',
          label: 'Insights Avancés',
          icon: Activity,
          badge: 'Nouveau'
        }
      ]
    }] : []),
    ...(typeof isSuperAdmin === 'function' && isSuperAdmin() ? [{
      id: 'system',
      label: 'Système & Sécurité',
      items: [
        {
          id: 'system',
          label: 'Système',
          icon: Shield,
        },
        {
          id: 'email-diagnostic',
          label: 'Diagnostic Email',
          icon: Mail,
          badge: 'Audit'
        },
        {
          id: 'testimonials',
          label: 'Témoignages',
          icon: MessageSquare,
        },
        {
          id: 'client-logos',
          label: 'Logos clients',
          icon: Star,
        }
      ]
    }] : [])
  ].filter(group => group.items.length > 0);

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = activeTab === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = hasChildren && item.children?.some(child => child.id === activeTab);

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleGroup(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isChildActive && "bg-accent/50",
              level > 0 && "ml-4"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {openGroups.has(item.id) ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </button>
          
          <Collapsible open={openGroups.has(item.id)}>
            <CollapsibleContent className="space-y-1">
              {item.children?.map(child => (
                <button
                  key={child.id}
                  onClick={() => onTabChange(child.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ml-6",
                    "hover:bg-accent hover:text-accent-foreground",
                    activeTab === child.id && "bg-primary text-primary-foreground shadow-sm"
                  )}
                >
                  <child.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{child.label}</span>
                  {child.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {child.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-primary text-primary-foreground shadow-sm",
          level > 0 && "ml-4"
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {item.badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm">Administration</h2>
            <p className="text-xs text-muted-foreground truncate">
              {typeof isSuperAdmin === 'function' && isSuperAdmin() ? 'Super Admin' : typeof isTenantAdmin === 'function' && isTenantAdmin() ? 'Admin Ville' : 'Gestionnaire'}
            </p>
          </div>
        </div>
        
        {typeof isTenantAdmin === 'function' && isTenantAdmin() && cityName && (
          <div className="mt-3 p-2 rounded-lg bg-accent/50">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary truncate">{cityName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.id}>
            <Collapsible 
              open={openGroups.has(group.id)} 
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger className="w-full group">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 hover:text-foreground transition-colors">
                  <span>{group.label}</span>
                  {openGroups.has(group.id) ? (
                    <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1">
                {group.items.map(item => renderNavItem(item))}
              </CollapsibleContent>
            </Collapsible>
            
            {group.id !== navigationGroups[navigationGroups.length - 1].id && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>Système actif</span>
          <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;