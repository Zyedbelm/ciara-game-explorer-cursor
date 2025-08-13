import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
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
  Plus,
  FileText,
  Download,
  Trash2,
  Edit,
  Search,
  Brain,
} from 'lucide-react';

const documentSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  document_type: z.enum(['guide', 'map', 'audio_transcript', 'historical_document', 'menu', 'brochure']),
  is_active: z.boolean(),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentType {
  id: string;
  title: string;
  content: string;
  description?: string;
  ai_content?: string;
  document_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_active: boolean;
  created_at: string;
  step_id?: string;
  city_id?: string;
  [key: string]: any;
}

interface StepDocumentsTabProps {
  stepId?: string;
  cityId?: string;
}

export function StepDocumentsTab({ stepId, cityId }: StepDocumentsTabProps) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDocument, setEditingDocument] = useState<DocumentType | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      description: '',
      ai_content: '',
      document_type: 'guide',
      file_url: '',
      file_name: '',
    },
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('content_documents')
        .select('*');

      // Ne filtrer par city_id que si cityId n'est pas vide
      if (cityId && cityId.trim() !== '') {
        query = query.eq('city_id', cityId);
      }

      // Ne filtrer par step_id que si stepId n'est pas vide ET si l'étape existe
      if (stepId && stepId.trim() !== '') {
        query = query.eq('step_id', stepId);
      } else {
        // Si pas de stepId, ne montrer aucun document (étape pas encore créée)
        setDocuments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [stepId, cityId]);

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      throw new Error('Erreur lors du téléchargement du fichier');
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    try {
      let fileUrl = data.file_url;
      let fileName = data.file_name;
      let fileSize = data.file_size;
      let mimeType = data.mime_type;

      // Validate required fields
      if (!data.title.trim()) {
        toast({
          title: "Erreur de validation",
          description: "Le titre est requis",
          variant: "destructive",
        });
        return;
      }

      if (!data.document_type) {
        toast({
          title: "Erreur de validation",
          description: "Le type de document est requis",
          variant: "destructive",
        });
        return;
      }

      // Ensure we have at least some content
      if (!data.ai_content?.trim() && !data.description?.trim() && !selectedFile && !data.file_url?.trim()) {
        toast({
          title: "Erreur de validation", 
          description: "Au moins un contenu (description, contenu IA, fichier ou URL) est requis",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile) {
        fileUrl = await handleFileUpload(selectedFile);
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        mimeType = selectedFile.type;
      }

      // Build content field - always required in DB
      const contentParts = [];
      if (data.ai_content?.trim()) {
        contentParts.push(data.ai_content.trim());
      }
      if (data.description?.trim()) {
        contentParts.push(data.description.trim());
      }
      if (fileUrl) {
        contentParts.push(`Fichier: ${fileName || 'document'}`);
      }
      
      const finalContent = contentParts.length > 0 ? contentParts.join('\n\n') : data.title;

      const documentData = {
        title: data.title,
        content: finalContent,
        description: data.description || null,
        ai_content: data.ai_content || null,
        document_type: data.document_type,
        file_url: fileUrl || null,
        file_name: fileName || null,
        file_size: fileSize || null,
        mime_type: mimeType || null,
        city_id: cityId && cityId.trim() !== '' ? cityId : null,
        step_id: stepId && stepId.trim() !== '' ? stepId : null,
        is_active: true,
      };

      if (editingDocument) {
        const { error } = await supabase
          .from('content_documents')
          .update(documentData)
          .eq('id', editingDocument.id);

        if (error) {
          toast({
            title: "Erreur de mise à jour",
            description: `Impossible de modifier le document: ${error.message}`,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Succès",
          description: "Document modifié avec succès",
        });
      } else {
        const { error } = await supabase
          .from('content_documents')
          .insert([documentData]);

        if (error) {
          toast({
            title: "Erreur de création",
            description: `Impossible de créer le document: ${error.message}`,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Succès",
          description: "Document créé avec succès",
        });
      }

      setCreateDialogOpen(false);
      setEditingDocument(null);
      setSelectedFile(null);
      form.reset();
      fetchDocuments();
    } catch (error) {
      let errorMessage = 'Erreur inconnue';
      if (error instanceof Error) {
        if (error.message.includes('violates not-null constraint')) {
          errorMessage = 'Un champ obligatoire est manquant';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Ce document existe déjà';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Référence invalide (étape ou ville)';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (document: DocumentType) => {
    setEditingDocument(document);
    form.reset({
      title: document.title,
      description: document.description || '',
      ai_content: document.ai_content || '',
      document_type: document.document_type,
      file_url: document.file_url || '',
      file_name: document.file_name || '',
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (document: DocumentType) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('content_documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Document supprimé avec succès",
      });

      fetchDocuments();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: DocumentType) => {
    if (!document.file_url) {
      toast({
        title: "Erreur",
        description: "Aucun fichier à télécharger",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(document.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name || document.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && doc.is_active) ||
                         (statusFilter === 'inactive' && !doc.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header avec bouton de création */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Documents de l'étape</h3>
          <p className="text-sm text-muted-foreground">
            {stepId && stepId.trim() !== '' 
              ? 'Gérez les documents associés à cette étape'
              : 'Créez d\'abord l\'étape pour pouvoir ajouter des documents'
            }
          </p>
        </div>
        {stepId && stepId.trim() !== '' && (
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
                    name="ai_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          Contenu IA pour le Chat (prioritaire)
                        </FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Saisissez le contenu que l'IA doit utiliser en priorité pour répondre aux questions sur cette étape..."
                            className="min-h-[300px]"
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Ce contenu sera utilisé en priorité par l'IA de conversation pour donner des informations sur cette étape.
                        </div>
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

                  <div>
                    <FormLabel>Fichier</FormLabel>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-primary/50 transition-colors">
                      <div className="text-center">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFile(file);
                              form.setValue('file_name', file.name);
                              form.setValue('file_size', file.size);
                              form.setValue('mime_type', file.type);
                              form.setValue('file_url', '');
                            }
                          }}
                          className="w-full cursor-pointer"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.avi"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Formats acceptés: PDF, DOC, DOCX, TXT, images, audio, vidéo
                        </p>
                        {selectedFile && (
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                            <p className="text-green-700 font-medium">
                              ✅ Fichier sélectionné: {selectedFile.name}
                            </p>
                            <p className="text-green-600 text-xs">
                              Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!selectedFile && (
                      <div>
                        <FormField
                          control={form.control}
                          name="file_url"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Ou URL du fichier</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingDocument ? 'Modifier' : 'Créer'} le Document
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table des documents */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Taille</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : !stepId || stepId.trim() === '' ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Créez d'abord l'étape pour pouvoir ajouter des documents</p>
                  </div>
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
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{document.title}</div>
                        {document.description && (
                          <div className="text-sm text-muted-foreground">
                            {document.description.substring(0, 60)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.document_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {document.file_size && (
                      <span className="text-sm text-muted-foreground">
                        {(document.file_size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={document.is_active ? 'default' : 'secondary'}>
                      {document.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(document.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {document.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
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
                        onClick={() => handleDelete(document)}
                        className="text-red-600 hover:text-red-700"
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
} 