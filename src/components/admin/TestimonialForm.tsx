import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestimonialAvatarUpload } from './TestimonialAvatarUpload';

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_en: z.string().optional().or(z.literal('')),
  name_de: z.string().optional().or(z.literal('')),
  title: z.string().min(1, 'Title is required'),
  title_en: z.string().optional().or(z.literal('')),
  title_de: z.string().optional().or(z.literal('')),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  content_en: z.string().optional().or(z.literal('')),
  content_de: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  company_en: z.string().optional().or(z.literal('')),
  company_de: z.string().optional().or(z.literal('')),
  avatar_url: z.string().optional().or(z.literal('')),
  rating: z.number().min(1).max(5),
  language: z.string().default('fr'),
  featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

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

interface TestimonialFormProps {
  testimonial?: Testimonial | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  testimonial,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const isEditing = !!testimonial;

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: testimonial?.name || '',
      name_en: testimonial?.name_en || '',
      name_de: testimonial?.name_de || '',
      title: testimonial?.title || '',
      title_en: testimonial?.title_en || '',
      title_de: testimonial?.title_de || '',
      content: testimonial?.content || '',
      content_en: testimonial?.content_en || '',
      content_de: testimonial?.content_de || '',
      company: testimonial?.company || '',
      company_en: testimonial?.company_en || '',
      company_de: testimonial?.company_de || '',
      avatar_url: testimonial?.avatar_url || '',
      rating: testimonial?.rating || 5,
      language: testimonial?.language || 'fr',
      featured: testimonial?.featured || false,
      is_active: testimonial?.is_active ?? true,
      display_order: testimonial?.display_order || 0,
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      // Convert empty strings to null for optional fields  
      const cleanData = {
        ...data,
        name_en: data.name_en || undefined,
        name_de: data.name_de || undefined,
        title_en: data.title_en || undefined,
        title_de: data.title_de || undefined,
        content_en: data.content_en || undefined,
        content_de: data.content_de || undefined,
        company: data.company || undefined,
        company_en: data.company_en || undefined,
        company_de: data.company_de || undefined,
        avatar_url: data.avatar_url || undefined,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('testimonials')
          .update(cleanData)
          .eq('id', testimonial.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(cleanData as any);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Testimonial ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} testimonial`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: TestimonialFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Update testimonial details' : 'Create a new customer testimonial'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonial Details</CardTitle>
          <CardDescription>
            Fill in the testimonial information in multiple languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="de">Deutsch</TabsTrigger>
                </TabsList>

                <TabsContent value="fr" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (French) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title/Position (French) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Directeur Marketing" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Testimonial Content (French) *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4}
                            placeholder="What did the customer say about CIARA?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (French)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (English)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Leave empty to use French version</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title/Position (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Marketing Director" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Testimonial Content (English)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (English)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="de" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name_de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (German)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Leave empty to use French version</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title_de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title/Position (German)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Marketing Direktor" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content_de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Testimonial Content (German)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (German)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar</FormLabel>
                      <FormControl>
                        <TestimonialAvatarUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(rating => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} Star{rating !== 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="display_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Lower numbers appear first</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured</FormLabel>
                          <FormDescription>
                            Mark as featured testimonial
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Show this testimonial on the website
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};