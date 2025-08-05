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
import { ClientLogoUpload } from './ClientLogoUpload';

const clientLogoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_en: z.string().optional().or(z.literal('')),
  name_de: z.string().optional().or(z.literal('')),
  logo_url: z.string().min(1, 'Logo is required'),
  website_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  description_en: z.string().optional().or(z.literal('')),
  description_de: z.string().optional().or(z.literal('')),
  category: z.string().default('partner'),
  language: z.string().default('fr'),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0),
});

type ClientLogoFormData = z.infer<typeof clientLogoSchema>;

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

interface ClientLogoFormProps {
  clientLogo?: ClientLogo | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClientLogoForm: React.FC<ClientLogoFormProps> = ({
  clientLogo,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const isEditing = !!clientLogo;

  const form = useForm<ClientLogoFormData>({
    resolver: zodResolver(clientLogoSchema),
    defaultValues: {
      name: clientLogo?.name || '',
      name_en: clientLogo?.name_en || '',
      name_de: clientLogo?.name_de || '',
      logo_url: clientLogo?.logo_url || '',
      website_url: clientLogo?.website_url || '',
      description: clientLogo?.description || '',
      description_en: clientLogo?.description_en || '',
      description_de: clientLogo?.description_de || '',
      category: clientLogo?.category || 'partner',
      language: clientLogo?.language || 'fr',
      is_active: clientLogo?.is_active ?? true,
      display_order: clientLogo?.display_order || 0,
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientLogoFormData) => {
      // Convert empty strings to null for optional fields
      const cleanData = {
        ...data,
        name_en: data.name_en || undefined,
        name_de: data.name_de || undefined,
        description: data.description || undefined,
        description_en: data.description_en || undefined,
        description_de: data.description_de || undefined,
        website_url: data.website_url || undefined,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('client_logos')
          .update(cleanData)
          .eq('id', clientLogo.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_logos')
          .insert(cleanData as any);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Client logo ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} client logo`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ClientLogoFormData) => {
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
            {isEditing ? 'Edit Client Logo' : 'Add New Client Logo'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Update client logo details' : 'Add a new partner or client logo'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo Details</CardTitle>
          <CardDescription>
            Fill in the client logo information in multiple languages
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
                        <FormLabel>Company Name (French) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (French)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="Brief description of the company or partnership"
                          />
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
                        <FormLabel>Company Name (English)</FormLabel>
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
                    name="description_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
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
                        <FormLabel>Company Name (German)</FormLabel>
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
                    name="description_de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (German)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
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
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo *</FormLabel>
                      <FormControl>
                        <ClientLogoUpload
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
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="url"
                            placeholder="https://example.com"
                          />
                        </FormControl>
                        <FormDescription>Company website (optional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="sponsor">Sponsor</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
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
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Show this logo on the website
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