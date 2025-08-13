import React from 'react';
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
import { Edit, Trash2, Search, MapPin, Target, FileText } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  points_awarded: number;
  validation_radius: number;
  has_quiz: boolean;
  images?: string[];
  is_active: boolean;
  city_id: string;
  created_at: string;
  updated_at: string;
  city_name?: string;
  journey_name?: string;
}

interface StepsTableProps {
  steps: Step[];
  loading: boolean;
  searchTerm: string;
  typeFilter: string;
  cityFilter: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onCityFilterChange: (value: string) => void;
  onEdit: (step: Step) => void;
  onDelete: (stepId: string) => void;
  cities: Array<{ id: string; name: string }>;
}

export const StepsTable: React.FC<StepsTableProps> = ({
  steps,
  loading,
  searchTerm,
  typeFilter,
  cityFilter,
  onSearchChange,
  onTypeFilterChange,
  onCityFilterChange,
  onEdit,
  onDelete,
  cities
}) => {
  const getTypeLabel = (type: string) => {
    const labels = {
      monument: 'Monument',
      restaurant: 'Restaurant',
      viewpoint: 'Point de vue',
      museum: 'Musée',
      shop: 'Boutique',
      activity: 'Activité',
      landmark: 'Point d\'intérêt'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      monument: 'bg-blue-100 text-blue-800',
      restaurant: 'bg-green-100 text-green-800',
      viewpoint: 'bg-purple-100 text-purple-800',
      museum: 'bg-orange-100 text-orange-800',
      shop: 'bg-pink-100 text-pink-800',
      activity: 'bg-indigo-100 text-indigo-800',
      landmark: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredSteps = steps.filter(step => {
    const matchesSearch = step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         step.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || step.type === typeFilter;
    const matchesCity = cityFilter === 'all' || step.city_id === cityFilter;
    
    return matchesSearch && matchesType && matchesCity;
  });

  return (
    <div className="space-y-4">
      {/* Recherche uniquement */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une étape..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Étape</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Parcours</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Chargement des étapes...
                </TableCell>
              </TableRow>
            ) : filteredSteps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Aucune étape trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredSteps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {step.description.substring(0, 60)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(step.type)}>
                      {getTypeLabel(step.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{step.city_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {step.journey_name || 'Aucun parcours'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{step.points_awarded} pts</Badge>
                      {step.has_quiz && (
                        <Badge variant="outline" className="text-xs">
                          Quiz
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={step.is_active ? "default" : "secondary"}>
                      {step.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(step)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(step.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 