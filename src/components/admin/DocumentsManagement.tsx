import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  Download,
  Eye,
  File
} from 'lucide-react';

const documentSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  document_type: z.enum(['guide', 'map', 'audio_transcript', 'historical_document', 'menu', 'brochure']),
  step_id: z.string().uuid('ID d\'étape invalide').optional(),
  journey_id: z.string().uuid('ID de parcours invalide').optional(),
  is_active: z.boolean(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface Document {
  id: string;
  title: string;
  description?: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  is_active: boolean;
  step_id?: string;
  journey_id?: string;
  city_id: string;
  created_at: string;
  updated_at: string;
  step?: {
    name: string;
    type: string;
  };
  journey?: {
    name: string;
  };
}

interface Step {
  id: string;
  name: string;
  type: string;
  city_id: string;
}

interface DocumentsManagementProps {
  stepId?: string;
  cityId?: string;
}

const DocumentsManagement: React.FC<DocumentsManagementProps> = ({ stepId, cityId }) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      description: '',
      document_type: 'guide',
      step_id: stepId || '',
      journey_id: '',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchSteps();
    fetchDocuments();
  }, [stepId, cityId]);

  const fetchSteps = async () => {
    try {
      const targetCityId = cityId || (profile?.role === 'tenant_admin' ? profile?.city_id : null);
      let query = supabase.from('steps').select('id, name, type, city_id').eq('is_active', true);
      
      if (targetCityId) {
        query = query.eq('city_id', targetCityId);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const targetCityId = cityId || (profile?.role === 'tenant_admin' ? profile?.city_id : null);
      
      let query = supabase
        .from('documents')
        .select('*');

      if (stepId) {
        query = query.eq('step_id', stepId);
      } else if (targetCityId) {
        query = query.eq('city_id', targetCityId);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: DocumentFormData) => {
    try {
      setUploading(true);
      const targetCityId = cityId || profile?.city_id;
      
      if (!targetCityId) {
        toast({
          title: "Erreur",
          description: "Impossible de déterminer la ville pour ce document",
          variant: "destructive",
        });
        return;
      }

      let fileUrl = editingDocument?.file_url || '';
      let fileName = editingDocument?.file_name || '';
      let fileSize = editingDocument?.file_size || 0;
      let mimeType = editingDocument?.mime_type || '';

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        mimeType = selectedFile.type;
      }

      if (!fileUrl) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier",
          variant: "destructive",
        });
        return;
      }

      const documentData = {
        title: data.title,
        description: data.description,
        content: data.description || '', // Add required content field
        document_type: data.document_type,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        mime_type: mimeType,
        is_active: data.is_active,
        step_id: data.step_id || null,
        journey_id: data.journey_id || null,
        city_id: targetCityId,
        created_by: profile?.user_id,
      };

      if (editingDocument) {
        const { error } = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', editingDocument.id);

        if (error) throw error;

        toast({
          title: "Document modifié",
          description: `Le document "${data.title}" a été modifié avec succès`,
        });
      } else {
        const { error } = await supabase
          .from('documents')
          .insert(documentData);

        if (error) throw error;

        toast({
          title: "Document créé",
          description: `Le document "${data.title}" a été créé avec succès`,
        });
      }

      setCreateDialogOpen(false);
      setEditingDocument(null);
      setSelectedFile(null);
      form.reset();
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    form.reset({
      title: document.title,
      description: document.description || '',
      document_type: document.document_type as any,
      step_id: document.step_id || '',
      journey_id: document.journey_id || '',
      is_active: document.is_active,
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      guide: 'Guide',
      map: 'Carte',
      audio_transcript: 'Transcription audio',
      historical_document: 'Document historique',
      menu: 'Menu',
      brochure: 'Brochure'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      guide: 'bg-blue-100 text-blue-800',
      map: 'bg-green-100 text-green-800',
      audio_transcript: 'bg-purple-100 text-purple-800',
      historical_document: 'bg-orange-100 text-orange-800',
      menu: 'bg-yellow-100 text-yellow-800',
      brochure: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.step?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && doc.is_active) ||
                         (statusFilter === 'inactive' && !doc.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    totalDocuments: documents.length,
    activeDocuments: documents.filter(d => d.is_active).length,
    stepDocuments: documents.filter(d => d.step_id).length,
    totalSize: documents.reduce((sum, d) => sum + (d.file_size || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Documents</h2>
          <p className="text-muted-foreground">
            {stepId ? 'Documents pour cette étape' : 'Gérez les documents de votre ville'}
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2"
              onClick={() => {
                setEditingDocument(null);
                setSelectedFile(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4" />
              Nouveau document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? 'Modifier le Document' : 'Ajouter un Nouveau Document'}
              </DialogTitle>
              <DialogDescription>
                {editingDocument ? 'Modifiez les détails de ce document' : 'Ajoutez un nouveau document'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre du document..." {...field} />
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
                        <FormLabel>Description (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description du document..."
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de document</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="guide">Guide</SelectItem>
                            <SelectItem value="map">Carte</SelectItem>
                            <SelectItem value="audio_transcript">Transcription audio</SelectItem>
                            <SelectItem value="historical_document">Document historique</SelectItem>
                            <SelectItem value="menu">Menu</SelectItem>
                            <SelectItem value="brochure">Brochure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!stepId && (
                    <FormField
                      control={form.control}
                      name="step_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Étape (optionnel)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} defaultValue={field.value || 'none'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une étape" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucune étape spécifique</SelectItem>
                              {steps.map((step) => (
                                <SelectItem key={step.id} value={step.id}>
                                  {step.name} - {step.type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="space-y-4">
                    <Label>Fichier</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedFile(file || null);
                        }}
                      />
                      {editingDocument && !selectedFile && (
                        <Badge variant="outline">
                          Fichier actuel: {editingDocument.file_name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Formats acceptés: PDF, DOC, DOCX, TXT, MD, JPG, JPEG, PNG, GIF
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border border-input"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Document actif
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Upload en cours...' : (editingDocument ? 'Modifier' : 'Créer')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents Actifs</p>
                <p className="text-2xl font-bold">{stats.activeDocuments}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Liés aux Étapes</p>
                <p className="text-2xl font-bold">{stats.stepDocuments}</p>
              </div>
              <File className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taille Totale</p>
                <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
              </div>
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="guide">Guide</SelectItem>
            <SelectItem value="map">Carte</SelectItem>
            <SelectItem value="audio_transcript">Transcription audio</SelectItem>
            <SelectItem value="historical_document">Document historique</SelectItem>
            <SelectItem value="menu">Menu</SelectItem>
            <SelectItem value="brochure">Brochure</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Étape</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Chargement des documents...
                  </TableCell>
                </TableRow>
              ) : filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Aucun document trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{document.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {document.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(document.document_type)}>
                        {getTypeLabel(document.document_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {document.step?.name ? (
                        <div>
                          <p className="font-medium">{document.step.name}</p>
                          <p className="text-sm text-muted-foreground">{document.step.type}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Général</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatFileSize(document.file_size)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={document.is_active ? 'default' : 'secondary'}>
                        {document.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(document.file_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(document)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(document.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsManagement;