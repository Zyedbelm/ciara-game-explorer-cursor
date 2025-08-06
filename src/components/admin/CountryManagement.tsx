import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, Globe, ArrowUp, ArrowDown } from 'lucide-react';

interface Country {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const countryFormSchema = z.object({
  code: z.string().min(2).max(3).toUpperCase(),
  name_fr: z.string().min(1, 'Le nom français est requis'),
  name_en: z.string().min(1, 'Le nom anglais est requis'),
  name_de: z.string().min(1, 'Le nom allemand est requis'),
  is_active: z.boolean().default(true),
  display_order: z.number().min(0).default(0)
});

const CountryManagement: React.FC = () => {
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const form = useForm<z.infer<typeof countryFormSchema>>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      code: '',
      name_fr: '',
      name_en: '',
      name_de: '',
      is_active: true,
      display_order: 0
    },
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les pays",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof countryFormSchema>) => {
    try {
      if (editingCountry) {
        // Update existing country
        const { error } = await supabase
          .from('countries')
          .update({
            code: values.code,
            name_fr: values.name_fr,
            name_en: values.name_en,
            name_de: values.name_de,
            is_active: values.is_active,
            display_order: values.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCountry.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Pays modifié avec succès",
        });
        setEditDialogOpen(false);
        setEditingCountry(null);
      } else {
        // Create new country
        const { error } = await supabase
          .from('countries')
          .insert({
            code: values.code,
            name_fr: values.name_fr,
            name_en: values.name_en,
            name_de: values.name_de,
            is_active: values.is_active,
            display_order: values.display_order
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Pays créé avec succès",
        });
        setCreateDialogOpen(false);
      }

      form.reset();
      fetchCountries();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le pays",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    form.reset({
      code: country.code,
      name_fr: country.name_fr,
      name_en: country.name_en,
      name_de: country.name_de,
      is_active: country.is_active,
      display_order: country.display_order
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (country: Country) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le pays "${country.name_fr}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('countries')
        .delete()
        .eq('id', country.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Pays supprimé avec succès",
      });
      fetchCountries();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le pays (peut-être qu'il est utilisé par des villes)",
        variant: "destructive",
      });
    }
  };

  const updateDisplayOrder = async (countryId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('countries')
        .update({ 
          display_order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', countryId);

      if (error) throw error;
      
      fetchCountries();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'ordre d'affichage",
        variant: "destructive",
      });
    }
  };

  const moveUp = (country: Country) => {
    const newOrder = Math.max(0, country.display_order - 1);
    updateDisplayOrder(country.id, newOrder);
  };

  const moveDown = (country: Country) => {
    const newOrder = country.display_order + 1;
    updateDisplayOrder(country.id, newOrder);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des pays...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Gestion des Pays
            </CardTitle>
            <CardDescription>
              Gérez les pays disponibles dans l'application
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Pays
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Créer un nouveau pays</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau pays à la liste des destinations disponibles.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code Pays (ISO)</FormLabel>
                        <FormControl>
                          <Input placeholder="CH, FR, DE..." {...field} maxLength={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name_fr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom (Français)</FormLabel>
                        <FormControl>
                          <Input placeholder="Suisse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom (Anglais)</FormLabel>
                        <FormControl>
                          <Input placeholder="Switzerland" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name_de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom (Allemand)</FormLabel>
                        <FormControl>
                          <Input placeholder="Schweiz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="display_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordre d'affichage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Actif</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Le pays sera visible dans l'application
                          </div>
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
                  <DialogFooter>
                    <Button type="submit">Créer</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom Français</TableHead>
                <TableHead>Nom Anglais</TableHead>
                <TableHead>Nom Allemand</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell className="font-mono font-semibold">{country.code}</TableCell>
                  <TableCell>{country.name_fr}</TableCell>
                  <TableCell>{country.name_en}</TableCell>
                  <TableCell>{country.name_de}</TableCell>
                  <TableCell>
                    <Badge variant={country.is_active ? "default" : "secondary"}>
                      {country.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{country.display_order}</span>
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => moveUp(country)}
                          disabled={country.display_order === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => moveDown(country)}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(country)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(country)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {countries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun pays configuré. Créez le premier pays pour commencer.
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le pays</DialogTitle>
            <DialogDescription>
              Modifiez les informations du pays sélectionné.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Pays (ISO)</FormLabel>
                    <FormControl>
                      <Input placeholder="CH, FR, DE..." {...field} maxLength={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (Français)</FormLabel>
                    <FormControl>
                      <Input placeholder="Suisse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (Anglais)</FormLabel>
                    <FormControl>
                      <Input placeholder="Switzerland" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_de"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (Allemand)</FormLabel>
                    <FormControl>
                      <Input placeholder="Schweiz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordre d'affichage</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Actif</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Le pays sera visible dans l'application
                      </div>
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
              <DialogFooter>
                <Button type="submit">Modifier</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CountryManagement;