import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  Plus,
  Brain,
  Trash2,
  Edit,
  Search,
} from 'lucide-react';

const quizSchema = z.object({
  question: z.string().min(1, 'La question est requise'),
  question_type: z.string().min(1, 'Le type de question est requis'),
  correct_answer: z.string().min(1, 'La réponse correcte est requise'),
  options: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  points_awarded: z.number().min(1, 'Les points doivent être supérieurs à 0'),

});

type QuizFormData = z.infer<typeof quizSchema>;

interface Quiz {
  id: string;
  question: string;
  question_type: string;
  correct_answer: string;
  options?: any;
  explanation?: string;
  points_awarded: number;

  step_id: string;
  created_at: string;
}

interface StepQuizzesTabProps {
  stepId?: string;
  onQuizAdded?: () => void;
}

export function StepQuizzesTab({ stepId, onQuizAdded }: StepQuizzesTabProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      question: '',
      question_type: 'multiple_choice',
      correct_answer: '',
      options: ['', '', '', ''],
      explanation: '',
      points_awarded: 10,

    },
  });

  const watchQuestionType = form.watch('question_type');

  const fetchQuizzes = async () => {
    if (!stepId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('step_id', stepId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [stepId]);

  const onSubmit = async (data: QuizFormData) => {
    if (!stepId) {
      toast({
        title: "Erreur",
        description: "Impossible de créer un quiz sans étape sélectionnée",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate required fields
      if (!data.question.trim()) {
        toast({
          title: "Erreur de validation",
          description: "La question est requise",
          variant: "destructive",
        });
        return;
      }

      if (!data.correct_answer.trim()) {
        toast({
          title: "Erreur de validation",
          description: "La réponse correcte est requise",
          variant: "destructive",
        });
        return;
      }

      // Validate multiple choice options
      if (data.question_type === 'multiple_choice') {
        const validOptions = data.options?.filter(opt => opt.trim()) || [];
        if (validOptions.length < 2) {
          toast({
            title: "Erreur de validation",
            description: "Au moins 2 options sont requises pour un QCM",
            variant: "destructive",
          });
          return;
        }
      }

      const quizData = {
        question: data.question,
        question_type: data.question_type,
        correct_answer: data.correct_answer,
        options: data.question_type === 'multiple_choice' ? data.options?.filter(opt => opt.trim()) : null,
        explanation: data.explanation || null,
        points_awarded: data.points_awarded,

        step_id: stepId,
      };

      if (editingQuiz) {
        const { error } = await supabase
          .from('quiz_questions')
          .update(quizData)
          .eq('id', editingQuiz.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Succès",
          description: "Quiz modifié avec succès",
        });
      } else {
        const { error } = await supabase
          .from('quiz_questions')
          .insert([quizData]);

        if (error) {
          throw error;
        }

        toast({
          title: "Succès",
          description: "Quiz créé avec succès",
        });

        // Mettre à jour l'étape pour indiquer qu'elle a un quiz
        await supabase
          .from('steps')
          .update({ has_quiz: true })
          .eq('id', stepId);
        
        onQuizAdded?.();
      }

      setCreateDialogOpen(false);
      setEditingQuiz(null);
      form.reset();
      fetchQuizzes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder le quiz: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    form.reset({
      question: quiz.question,
      question_type: quiz.question_type,
      correct_answer: quiz.correct_answer,
      options: quiz.options || ['', '', '', ''],
      explanation: quiz.explanation || '',
      points_awarded: quiz.points_awarded,

    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (quiz: Quiz) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', quiz.id);

      if (error) throw error;

      // Vérifier s'il reste des quiz pour cette étape
      const { data: remainingQuizzes } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('step_id', stepId);

      if (remainingQuizzes && remainingQuizzes.length === 0) {
        await supabase
          .from('steps')
          .update({ has_quiz: false })
          .eq('id', stepId);
      }

      toast({
        title: "Succès",
        description: "Quiz supprimé avec succès",
      });
      fetchQuizzes();
      onQuizAdded?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le quiz",
        variant: "destructive",
      });
    }
  };

  const addOption = () => {
    const currentOptions = form.getValues('options') || [];
    form.setValue('options', [...currentOptions, '']);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues('options') || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    form.setValue('options', newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = form.getValues('options') || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    form.setValue('options', newOptions);
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!stepId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Créez d'abord l'étape pour pouvoir ajouter des quiz
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton de création */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Quiz de l'étape</h3>
          <p className="text-sm text-muted-foreground">
            Créez des questions pour enrichir l'expérience des visiteurs
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2"
              onClick={() => {
                setEditingQuiz(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4" />
              Nouveau quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuiz ? 'Modifier le Quiz' : 'Créer un Nouveau Quiz'}
              </DialogTitle>
              <DialogDescription>
                {editingQuiz ? 'Modifiez les détails de ce quiz' : 'Ajoutez un nouveau quiz à cette étape'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Posez votre question..."
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
                  name="question_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de question</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="multiple_choice">QCM</SelectItem>
                          <SelectItem value="true_false">Vrai/Faux</SelectItem>
                          <SelectItem value="text">Texte libre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchQuestionType === 'multiple_choice' && (
                  <div className="space-y-4">
                    <Label>Options de réponse</Label>
                    {form.watch('options')?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                        />
                        {form.watch('options')!.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une option
                    </Button>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="correct_answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Réponse correcte</FormLabel>
                      <FormControl>
                        {watchQuestionType === 'true_false' ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez la réponse" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vrai">Vrai</SelectItem>
                              <SelectItem value="Faux">Faux</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : watchQuestionType === 'multiple_choice' ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez la bonne réponse parmi les options" />
                            </SelectTrigger>
                            <SelectContent>
                              {form.watch('options')?.filter(opt => opt.trim()).map((option, index) => (
                                <SelectItem key={index} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input placeholder="Entrez la réponse correcte..." {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explication (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Expliquez pourquoi cette réponse est correcte..."
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="points_awarded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points attribués</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


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
                    {editingQuiz ? 'Modifier' : 'Créer'} le Quiz
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtre de recherche */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table des quiz */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Points</TableHead>

              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredQuizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Aucun quiz trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <div>
                        <div className="font-medium">
                          {quiz.question.substring(0, 60)}...
                        </div>
                        {quiz.explanation && (
                          <div className="text-sm text-muted-foreground">
                            {quiz.explanation.substring(0, 40)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {quiz.question_type === 'multiple_choice' && 'QCM'}
                      {quiz.question_type === 'true_false' && 'Vrai/Faux'}
                      {quiz.question_type === 'text' && 'Texte'}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.points_awarded}</TableCell>
  
                  <TableCell>
                    {new Date(quiz.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(quiz)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(quiz)}
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