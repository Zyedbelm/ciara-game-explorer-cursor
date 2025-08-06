import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  size = 'lg', 
  showUploadButton = true 
}) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16', 
    lg: 'h-24 w-24'
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return profile.full_name[0].toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}/avatar.${fileExt}`;

      // Supprimer l'ancienne image si elle existe
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profile-photos')
            .remove([`${profile.user_id}/${oldPath}`]);
        }
      }

      // Upload la nouvelle image
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (updateError) throw updateError;

      // Rafraîchir le profil
      await refreshProfile();

      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre photo de profil.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} border-4 border-primary-foreground/20`}>
        <AvatarImage src={profile?.avatar_url} />
        <AvatarFallback className="text-2xl font-bold bg-primary-foreground text-primary">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      
      {showUploadButton && (
        <Button 
          size="sm" 
          variant="secondary" 
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;