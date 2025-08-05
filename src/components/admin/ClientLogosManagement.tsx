import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ClientLogoForm } from './ClientLogoForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientLogo {
  id: string;
  name: string;
  name_en?: string;
  name_de?: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  category: string;
  language: string;
  is_active: boolean;
  display_order: number;
}

export const ClientLogosManagement: React.FC = () => {
  const [editingLogo, setEditingLogo] = useState<ClientLogo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: clientLogos = [], isLoading } = useQuery({
    queryKey: ['admin_client_logos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_logos')
        .select('*')
        .order('display_order')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientLogo[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_logos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_client_logos'] });
      toast({
        title: "Success",
        description: "Client logo deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete client logo",
        variant: "destructive",
      });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('client_logos')
        .update({ display_order: newOrder })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_client_logos'] });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('client_logos')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_client_logos'] });
      toast({
        title: "Success",
        description: "Client logo updated successfully",
      });
    }
  });

  const handleEdit = (logo: ClientLogo) => {
    setEditingLogo(logo);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client logo?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (logo: ClientLogo, index: number) => {
    if (index > 0) {
      const prevLogo = clientLogos[index - 1];
      updateOrderMutation.mutate({ 
        id: logo.id, 
        newOrder: prevLogo.display_order 
      });
      updateOrderMutation.mutate({ 
        id: prevLogo.id, 
        newOrder: logo.display_order 
      });
    }
  };

  const handleMoveDown = (logo: ClientLogo, index: number) => {
    if (index < clientLogos.length - 1) {
      const nextLogo = clientLogos[index + 1];
      updateOrderMutation.mutate({ 
        id: logo.id, 
        newOrder: nextLogo.display_order 
      });
      updateOrderMutation.mutate({ 
        id: nextLogo.id, 
        newOrder: logo.display_order 
      });
    }
  };

  if (showForm) {
    return (
      <ClientLogoForm
        clientLogo={editingLogo}
        onClose={() => {
          setShowForm(false);
          setEditingLogo(null);
        }}
        onSuccess={() => {
          setShowForm(false);
          setEditingLogo(null);
          queryClient.invalidateQueries({ queryKey: ['admin_client_logos'] });
        }}
      />
    );
  }

  // Group logos by category
  const groupedLogos = clientLogos.reduce((acc, logo) => {
    const category = logo.category || 'partner';
    if (!acc[category]) acc[category] = [];
    acc[category].push(logo);
    return acc;
  }, {} as Record<string, ClientLogo[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('social_proof.admin.client_logos')}</h2>
          <p className="text-muted-foreground">
            Manage partner and client logos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('social_proof.admin.add_client_logo')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLogos).map(([category, logos]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {category}s ({logos.length})
              </h3>
              
              <div className="grid gap-4">
                {logos.map((logo, index) => (
                  <Card key={logo.id} className={!logo.is_active ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
                            <img 
                              src={logo.logo_url}
                              alt={logo.name}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{logo.name}</CardTitle>
                            <CardDescription>
                              {logo.description}
                              {logo.website_url && (
                                <a 
                                  href={logo.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 inline-flex items-center text-primary hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {logo.category}
                          </Badge>
                          <Badge variant={logo.is_active ? 'default' : 'secondary'}>
                            {logo.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveUp(logo, index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveDown(logo, index)}
                            disabled={index === logos.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Order: {logo.display_order}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({ 
                              id: logo.id, 
                              isActive: !logo.is_active 
                            })}
                          >
                            {logo.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(logo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(logo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          
          {clientLogos.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No client logos yet. Create your first one to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};