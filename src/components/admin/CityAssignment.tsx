import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Users, Edit, Save, X } from 'lucide-react';

interface TenantAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  city_id: string | null;
  city_name?: string;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

const CityAssignment = () => {
  const [tenantAdmins, setTenantAdmins] = useState<TenantAdmin[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tenant admins
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, city_id')
        .eq('role', 'tenant_admin');

      if (adminsError) throw adminsError;

      // Fetch all cities
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, slug')
        .order('name');

      if (citiesError) throw citiesError;

      const processedAdmins = (admins || []).map(admin => ({
        id: admin.user_id,
        email: admin.email,
        first_name: admin.full_name?.split(' ')[0] || '',
        last_name: admin.full_name?.split(' ').slice(1).join(' ') || '',
        city_id: admin.city_id,
        city_name: admin.city_id ? citiesData?.find(c => c.id === admin.city_id)?.name : null
      }));

      setTenantAdmins(processedAdmins);
      setCities(citiesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCityAssignment = async (adminId: string, cityId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ city_id: cityId })
        .eq('user_id', adminId);

      if (error) throw error;

      // Update local state
      setTenantAdmins(prev => prev.map(admin => 
        admin.id === adminId 
          ? { 
              ...admin, 
              city_id: cityId,
              city_name: cityId ? cities.find(c => c.id === cityId)?.name || null : null
            }
          : admin
      ));

      setEditingAdmin(null);
      toast({
        title: "Succès",
        description: "Assignation de ville mise à jour",
      });
    } catch (error) {
      console.error('Error updating city assignment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'assignation",
        variant: "destructive",
      });
    }
  };

  const filteredAdmins = tenantAdmins.filter(admin => 
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${admin.first_name} ${admin.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Assignation des Villes</h3>
        <p className="text-muted-foreground">
          Assignez des villes spécifiques aux administrateurs de tenant
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un administrateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tenant Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administrateurs de Tenant ({filteredAdmins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ville Assignée</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="font-medium">
                      {admin.first_name} {admin.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    {editingAdmin === admin.id ? (
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={admin.city_id || 'none'}
                          onValueChange={(value) => updateCityAssignment(admin.id, value === 'none' ? null : value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Choisir une ville" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune ville</SelectItem>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingAdmin(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {admin.city_name ? (
                          <Badge variant="outline" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {admin.city_name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Non assigné</Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAdmin !== admin.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingAdmin(admin.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Aperçu des Villes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => {
              const assignedAdmins = tenantAdmins.filter(admin => admin.city_id === city.id);
              return (
                <div key={city.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{city.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assignedAdmins.length} administrateur(s) assigné(s)
                  </div>
                  {assignedAdmins.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {assignedAdmins.map(admin => (
                        <div key={admin.id} className="text-xs text-muted-foreground">
                          • {admin.first_name} {admin.last_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CityAssignment;