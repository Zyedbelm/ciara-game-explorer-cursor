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
import { Plus, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StepDocumentsTab } from './StepDocumentsTab';
import { StepQuizzesTab } from './StepQuizzesTab';
import { StepForm, StepFormData } from './StepForm';
import { StepsTable } from './StepsTable';
import { useStepsManagement } from '@/hooks/useStepsManagement';

interface StepsManagementProps {
  cityId?: string;
}

const StepsManagement: React.FC<StepsManagementProps> = ({ cityId }) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const {
    steps,
    cities,
    journeys,
    loading,
    submitting,
    createStep,
    updateStep,
    deleteStep
  } = useStepsManagement(cityId);

  const handleSubmit = async (data: StepFormData) => {
    if (editingStep) {
      await updateStep(editingStep.id, data);
    } else {
      await createStep(data);
    }
    
    setCreateDialogOpen(false);
    setEditingStep(null);
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
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gestion des Étapes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Gérez les étapes de vos parcours touristiques
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Étape
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <StepForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  initialData={editingStep}
                  cities={cities}
                  journeys={journeys}
                  loading={submitting}
                />
              </DialogContent>
            </Dialog>
          </div>

          <StepsTable
            steps={steps}
            loading={loading}
            searchTerm={searchTerm}
            typeFilter={typeFilter}
            cityFilter={cityFilter}
            onSearchChange={setSearchTerm}
            onTypeFilterChange={setTypeFilter}
            onCityFilterChange={setCityFilter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            cities={cities}
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