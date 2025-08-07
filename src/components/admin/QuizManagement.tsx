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
  Brain,
  Plus,
  Edit,
  Trash2,
  Search,
  HelpCircle,
  Award,
  Target
} from 'lucide-react';

const quizSchema = z.object({
  question: z.string().min(10, 'La question doit contenir au moins 10 caractères'),
  question_type: z.enum(['multiple_choice', 'true_false', 'text']),
  options: z.array(z.string()).min(2, 'Au moins 2 options requises').optional(),
  correct_answer: z.string().min(1, 'La réponse correcte est requise'),
  explanation: z.string().optional(),
  points_awarded: z.number().min(1).max(50),

  step_id: z.string().uuid('ID d\'étape invalide'),
});

type QuizFormData = z.infer<typeof quizSchema>;

interface Quiz {
  id: string;
  question: string;
  question_type: string;
  options?: any;
  correct_answer: string;
  explanation?: string;
  points_awarded: number;

  step_id: string;
  created_at: string;
  updated_at: string;
  step?: {
    name: string;
    type: string;
  };
}

interface Step {
  id: string;
  name: string;
  type: string;
  city_id: string;
}

interface QuizManagementProps {
  cityId?: string;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ cityId }) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stepFilter, setStepFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [city, setCity] = useState<any>(null);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      question: '',
      question_type: 'multiple_choice',
      options: ['', ''],
      correct_answer: '',
      explanation: '',
      points_awarded: 10,

      step_id: '',
    },
  });

  const watchQuestionType = form.watch('question_type');

  useEffect(() => {
    fetchCity();
    fetchSteps();
    fetchQuizzes();
  }, [cityId]);

  const fetchCity = async () => {
    if (!cityId && profile?.role === 'tenant_admin' && profile?.city_id) {
      const { data } = await supabase
        .from('cities')
        .select('*')
        .eq('id', profile.city_id)
        .single();
      setCity(data);
    } else if (cityId) {
      const { data } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .single();
      setCity(data);
    }
  };

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
      toast({
        title: "Erreur",
        description: "Impossible de charger les étapes",
        variant: "destructive",
      });
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const targetCityId = cityId || (profile?.role === 'tenant_admin' ? profile?.city_id : null);
      
      const query = supabase
        .from('quiz_questions')
        .select('*');

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match expected interface
      const transformedQuizzes = (data || []).map(quiz => ({
        ...quiz,
        step: { name: 'Step', type: 'unknown' } // Default fallback
      }));

      setQuizzes(transformedQuizzes);
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

  const onSubmit = async (data: QuizFormData) => {
    try {
      const quizData = {
        question: data.question,
        question_type: data.question_type,
        options: data.question_type === 'multiple_choice' ? data.options : null,
        correct_answer: data.correct_answer,
        explanation: data.explanation,
        points_awarded: data.points_awarded,

        step_id: data.step_id,
      };

      if (editingQuiz) {
        const { error } = await supabase
          .from('quiz_questions')
          .update(quizData)
          .eq('id', editingQuiz.id);

        if (error) throw error;

        toast({
          title: "Quiz modifié",
          description: "Le quiz a été modifié avec succès",
        });
      } else {
        const { error } = await supabase
          .from('quiz_questions')
          .insert(quizData);

        if (error) throw error;

        toast({
          title: "Quiz créé",
          description: "Le quiz a été créé avec succès",
        });
      }

      setCreateDialogOpen(false);
      setEditingQuiz(null);
      form.reset();
      fetchQuizzes();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le quiz",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    form.reset({
      question: quiz.question,
      question_type: quiz.question_type as any,
      options: quiz.options || ['', ''],
      correct_answer: quiz.correct_answer,
      explanation: quiz.explanation || '',
      points_awarded: quiz.points_awarded,

      step_id: quiz.step_id,
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast({
        title: "Quiz supprimé",
        description: "Le quiz a été supprimé avec succès",
      });

      fetchQuizzes();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le quiz",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      multiple_choice: 'QCM',
      true_false: 'Vrai/Faux',
      text: 'Texte libre'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      multiple_choice: 'bg-blue-100 text-blue-800',
      true_false: 'bg-green-100 text-green-800',
      text: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const addOption = () => {
    const currentOptions = form.getValues('options') || [];
    form.setValue('options', [...currentOptions, '']);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues('options') || [];
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      form.setValue('options', newOptions);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.step?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || quiz.question_type === typeFilter;
    const matchesStep = stepFilter === 'all' || quiz.step_id === stepFilter;
    return matchesSearch && matchesType && matchesStep;
  });

  const stats = {
    totalQuizzes: quizzes.length,
    multipleChoice: quizzes.filter(q => q.question_type === 'multiple_choice').length,
    trueFalse: quizzes.filter(q => q.question_type === 'true_false').length,
    averagePoints: quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q.points_awarded, 0) / quizzes.length) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Quiz</h2>
          <p className="text-muted-foreground">
            Créez et gérez les quiz pour vos étapes
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-wrap break-words">
                {editingQuiz ? 'Modifier le Quiz' : 'Créer un Nouveau Quiz'}
              </DialogTitle>
              <DialogDescription className="text-wrap">
                {editingQuiz ? 'Modifiez les détails de ce quiz' : 'Ajoutez un nouveau quiz à une étape'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="step_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Étape</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une étape" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {steps.map((step) => (
                              <SelectItem key={step.id} value={step.id}>
                                <span className="text-wrap break-words">{step.name} - {step.type}</span>
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
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Posez votre question..."
                            className="min-h-20 text-wrap break-words"
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
                            onChange={(e) => {
                              const newOptions = [...form.watch('options')];
                              newOptions[index] = e.target.value;
                              form.setValue('options', newOptions);
                            }}
                            className="text-wrap break-words"
                          />
                          {(form.watch('options')?.length || 0) > 2 && (
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
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>
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
                          <Input placeholder="La réponse correcte..." {...field} />
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
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            max="50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingQuiz ? 'Modifier' : 'Créer'}
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
                <p className="text-sm font-medium text-muted-foreground">Total Quiz</p>
                <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              </div>
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">QCM</p>
                <p className="text-2xl font-bold">{stats.multipleChoice}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vrai/Faux</p>
                <p className="text-2xl font-bold">{stats.trueFalse}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points Moyens</p>
                <p className="text-2xl font-bold">{stats.averagePoints}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un quiz..."
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
            <SelectItem value="multiple_choice">QCM</SelectItem>
            <SelectItem value="true_false">Vrai/Faux</SelectItem>
            <SelectItem value="text">Texte libre</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stepFilter} onValueChange={setStepFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Étape" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les étapes</SelectItem>
            {steps.map((step) => (
              <SelectItem key={step.id} value={step.id}>
                {step.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quiz Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Étape</TableHead>
                <TableHead>Points</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement des quiz...
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
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-wrap break-words line-clamp-2">{quiz.question}</p>
                        {quiz.question.length > 100 && (
                          <p className="text-xs text-muted-foreground">
                            {quiz.question.length} caractères
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(quiz.question_type)}>
                        {getTypeLabel(quiz.question_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-wrap break-words">{quiz.step?.name}</p>
                        <p className="text-sm text-muted-foreground">{quiz.step?.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{quiz.points_awarded} pts</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
                          onClick={() => handleDelete(quiz.id)}
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

export default QuizManagement;