import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestimonialForm } from './TestimonialForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: string;
  name: string;
  name_en?: string;
  name_de?: string;
  title: string;
  title_en?: string;
  title_de?: string;
  content: string;
  content_en?: string;
  content_de?: string;
  company?: string;
  company_en?: string;
  company_de?: string;
  avatar_url?: string;
  rating: number;
  featured: boolean;
  language: string;
  is_active: boolean;
  display_order: number;
}

export const TestimonialsManagement: React.FC = () => {
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin_testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Testimonial[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_testimonials'] });
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('testimonials')
        .update({ display_order: newOrder })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_testimonials'] });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_testimonials'] });
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
    }
  });

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (testimonial: Testimonial, index: number) => {
    if (index > 0) {
      const prevTestimonial = testimonials[index - 1];
      updateOrderMutation.mutate({ 
        id: testimonial.id, 
        newOrder: prevTestimonial.display_order 
      });
      updateOrderMutation.mutate({ 
        id: prevTestimonial.id, 
        newOrder: testimonial.display_order 
      });
    }
  };

  const handleMoveDown = (testimonial: Testimonial, index: number) => {
    if (index < testimonials.length - 1) {
      const nextTestimonial = testimonials[index + 1];
      updateOrderMutation.mutate({ 
        id: testimonial.id, 
        newOrder: nextTestimonial.display_order 
      });
      updateOrderMutation.mutate({ 
        id: nextTestimonial.id, 
        newOrder: testimonial.display_order 
      });
    }
  };

  if (showForm) {
    return (
      <TestimonialForm
        testimonial={editingTestimonial}
        onClose={() => {
          setShowForm(false);
          setEditingTestimonial(null);
        }}
        onSuccess={() => {
          setShowForm(false);
          setEditingTestimonial(null);
          queryClient.invalidateQueries({ queryKey: ['admin_testimonials'] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('social_proof.admin.testimonials')}</h2>
          <p className="text-muted-foreground">
            Manage customer testimonials and reviews
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('social_proof.admin.add_testimonial')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className={!testimonial.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar_url} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>
                        {testimonial.title}
                        {testimonial.company && ` • ${testimonial.company}`}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {testimonial.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    <Badge variant={testimonial.is_active ? 'default' : 'secondary'}>
                      {testimonial.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex items-center">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(testimonial, index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(testimonial, index)}
                      disabled={index === testimonials.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Order: {testimonial.display_order}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate({ 
                        id: testimonial.id, 
                        isActive: !testimonial.is_active 
                      })}
                    >
                      {testimonial.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {testimonials.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No testimonials yet. Create your first one to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};