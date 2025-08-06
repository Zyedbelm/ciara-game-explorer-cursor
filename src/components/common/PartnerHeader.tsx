import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Globe, User } from 'lucide-react';

const PartnerHeader: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo et flèche retour */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-xl font-bold text-gray-900">CIARA</span>
            </Link>
            <span className="text-sm text-gray-500">Administration</span>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center space-x-4">
            {/* Sélecteur de langue */}
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4" />
            </Button>

            {/* Menu utilisateur */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{profile?.full_name || 'Partenaire'}</span>
              </Button>
            </div>

            {/* Badge rôle */}
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              Partenaire
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader; 