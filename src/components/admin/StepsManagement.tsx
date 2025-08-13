import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, MapPin, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StepDocumentsTab } from './StepDocumentsTab';
import { StepQuizzesTab } from './StepQuizzesTab';
import { StepForm, StepFormData } from './StepForm';
import { StepsTable } from './StepsTable';
import { useStepsManagement } from '@/hooks/useStepsManagement';
import { useStepsFilters } from '@/hooks/useStepsFilters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StepsManagementProps {
  cityId?: string;
}

const StepsManagement: React.FC<StepsManagementProps> = ({ cityId }) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut, isSuperAdmin, isTenantAdmin } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  const {
    steps,
    cities,

    loading,
    submitting,
    createStep,
    updateStep,
    deleteStep
  } = useStepsManagement(cityId);

  // Utiliser le hook personnalisé pour les filtres
  const {
    countries,
    searchTerm,
    typeFilter,
    cityFilter,
    countryFilter,
    filteredCities,
    filteredSteps,
    setSearchTerm,
    setTypeFilter,
    setCityFilter,
    setCountryFilter,
    handleCountryChange,
    resetFilters
  } = useStepsFilters(cities, steps);

  const handleSubmit = async (data: StepFormData) => {
    console.log('🎯 HANDLESUBMIT APPELÉ - editingStep:', editingStep, 'data:', data);
    try {
      if (editingStep) {
        console.log('📝 MODE ÉDITION - stepId:', editingStep.id);
        await updateStep(editingStep.id, data);
      } else {
        console.log('➕ MODE CRÉATION');
        await createStep(data);
      }
      
      console.log('🎉 HANDLESUBMIT TERMINÉ AVEC SUCCÈS');
      setCreateDialogOpen(false);
      setEditingStep(null);
    } catch (error) {
      console.error('💀 ERREUR DANS HANDLESUBMIT:', error);
    }
  };

  const handleEdit = (step: any) => {
    setEditingStep(step);
    setCreateDialogOpen(true);
  };

  const handleDelete = async (stepId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) return;
    await deleteStep(stepId);
  };

  const handleCreateNew = () => {
    setEditingStep(null);
    setCreateDialogOpen(true);
  };

  const handleCancel = () => {
    setCreateDialogOpen(false);
    setEditingStep(null);
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Gestion des Étapes
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Étape
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingStep ? 'Modifier l\'étape' : 'Créer une nouvelle étape'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStep 
                      ? 'Modifiez les informations de cette étape'
                      : 'Créez une nouvelle étape pour vos parcours touristiques'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Informations de base</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="quizzes">Quiz</TabsTrigger>
                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-6">
                    <StepForm
                      onSubmit={handleSubmit}
                      onCancel={handleCancel}
                      initialData={editingStep}
                      cities={filteredCities}
                      loading={submitting}
                    />
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-6">
                    <StepDocumentsTab 
                      stepId={editingStep?.id} 
                      cityId={cityId || undefined} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="quizzes" className="space-y-6">
                    <StepQuizzesTab 
                      stepId={editingStep?.id}
                      onQuizAdded={() => {
                        // Recharger les données si nécessaire
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Aperçu de l'étape</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Aperçu de l'étape avec ses documents et quiz associés.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Gérez les étapes de vos parcours touristiques
            </p>
          </div>

          {/* Filtres Pays et Ville */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtres</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country-filter">Pays</Label>
                <Select value={countryFilter} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name_fr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-filter">Ville</Label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {filteredCities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="monument">Monument</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="viewpoint">Point de vue</SelectItem>
                    <SelectItem value="museum">Musée</SelectItem>
                    <SelectItem value="shop">Boutique</SelectItem>
                    <SelectItem value="activity">Activité</SelectItem>
                    <SelectItem value="landmark">Point d'intérêt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>



          <StepsTable
            steps={filteredSteps}
            loading={loading}
            searchTerm={searchTerm}
            typeFilter={typeFilter}
            cityFilter={cityFilter}
            onSearchChange={setSearchTerm}
            onTypeFilterChange={setTypeFilter}
            onCityFilterChange={setCityFilter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            cities={filteredCities}
          />
        </CardContent>
      </Card>

      {selectedStep && (
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'étape : {selectedStep.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="quizzes">Quiz</TabsTrigger>
              </TabsList>
              <TabsContent value="documents">
                <StepDocumentsTab stepId={selectedStep.id} cityId={cityId} />
              </TabsContent>
              <TabsContent value="quizzes">
                <StepQuizzesTab stepId={selectedStep.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StepsManagement;