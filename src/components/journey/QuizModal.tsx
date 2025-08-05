
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Zap,
  X
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  points_awarded: number;
  explanation?: string;
}

interface QuizModalProps {
  stepId: string;
  stepName: string;
  onQuizComplete?: (points: number) => void;
  trigger?: React.ReactNode;
}

const QuizModal: React.FC<QuizModalProps> = ({ 
  stepId, 
  stepName, 
  onQuizComplete, 
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [resultTimeLeft, setResultTimeLeft] = useState(10);
  const [resultTimerActive, setResultTimerActive] = useState(false);
  const [autoProgressTimeout, setAutoProgressTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();

  // Timer effect for questions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleNextQuestion();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Timer effect for results display
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resultTimerActive && resultTimeLeft > 0) {
      interval = setInterval(() => {
        setResultTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (resultTimeLeft === 0 && resultTimerActive) {
      handleCloseResult();
    }
    return () => clearInterval(interval);
  }, [resultTimerActive, resultTimeLeft]);

  const fetchQuestions = async () => {
    if (!stepId) return;

    setLoading(true);
    try {
      // Check if user has already completed this quiz
      if (user) {
        const { data: completion, error: completionError } = await supabase
          .from('step_completions')
          .select('quiz_score, points_earned')
          .eq('step_id', stepId)
          .eq('user_id', user.id)
          .single();

        if (!completionError && completion) {
          setIsCompleted(true);
          setScore(completion.points_earned || 0);
        }
      }

      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('step_id', stepId);

      if (error) throw error;

      const formattedQuestions: QuizQuestion[] = data.map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : 
                 typeof q.options === 'string' ? JSON.parse(q.options) : 
                 q.options ? Object.values(q.options) : [],
        correct_answer: q.correct_answer,
        points_awarded: q.points_awarded || 10,
        explanation: q.explanation
      }));

      setQuestions(formattedQuestions);
      if (formattedQuestions.length > 0) {
        setCurrentQuestionIndex(0);
        if (!isCompleted) {
          setTimeLeft(30);
          setTimerActive(true);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les questions du quiz.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setSelectedAnswer('');
    setResultTimerActive(false);
    setResultTimeLeft(10);
    
    if (autoProgressTimeout) {
      clearTimeout(autoProgressTimeout);
      setAutoProgressTimeout(null);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      // Quiz completed
      handleQuizComplete();
    }
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    // Store the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));

    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points_awarded);
    }

    setShowResult(true);
    setTimerActive(false);
    setResultTimeLeft(10);
    setResultTimerActive(true);

    // Set auto-progress timeout for 10 seconds
    const timeout = setTimeout(() => {
      handleCloseResult();
    }, 10000);
    setAutoProgressTimeout(timeout);
  };

  const handleQuizComplete = async () => {
    const totalPoints = score;
    const correctAnswers = Object.values(answers).filter((answer, index) => 
      answer === questions[index]?.correct_answer
    ).length;

    try {
      // Save quiz completion (if user is logged in) using UPSERT to prevent duplicate points
      if (user) {
        const { error } = await supabase
          .from('step_completions')
          .upsert({
            user_id: user.id,
            step_id: stepId,
            quiz_score: correctAnswers,
            points_earned: totalPoints,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,step_id'
          });

        if (error) {
          console.error('Error saving quiz completion:', error);
        }
      }

      toast({
        title: "Quiz terminé !",
        description: `Vous avez obtenu ${correctAnswers}/${questions.length} bonnes réponses et gagné ${totalPoints} points !`,
      });

      onQuizComplete?.(totalPoints);
    } catch (error) {
      console.error('Error completing quiz:', error);
    }

    // Reset quiz state
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setTimeLeft(30);
    setTimerActive(false);
    setOpen(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setIsReviewMode(false);
      fetchQuestions();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant={isCompleted ? "secondary" : "outline"}
            disabled={isCompleted && !isReviewMode}
            onClick={() => isCompleted && setIsReviewMode(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {isCompleted ? 'Revoir le Quiz' : 'Quiz'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Quiz - {stepName}
          </DialogTitle>
          <DialogDescription>
            {isCompleted 
              ? "Revoyez vos réponses et les explications (aucun point ne sera attribué)"
              : "Répondez aux questions pour gagner des points bonus !"
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun quiz disponible pour cette étape.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {score} points
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Timer - only show if not completed */}
            {!isCompleted && (
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono text-lg ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
            )}

            {/* Question */}
            {currentQuestion && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
                  
                  {showResult ? (
                    <div className="space-y-4">
                      {/* Barre d'en-tête avec timer et bouton fermer */}
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Fermeture automatique dans {resultTimeLeft}s</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseResult}
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className={`flex items-center gap-2 p-4 rounded-lg ${
                        selectedAnswer === currentQuestion.correct_answer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAnswer === currentQuestion.correct_answer ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <span className="font-medium">
                          {selectedAnswer === currentQuestion.correct_answer 
                            ? `Correct ! +${currentQuestion.points_awarded} points`
                            : `Incorrect. La bonne réponse était : ${currentQuestion.correct_answer}`
                          }
                        </span>
                      </div>
                      
                      {currentQuestion.explanation && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                        </div>
                      )}

                      {/* Bouton pour passer manuellement */}
                      <Button 
                        onClick={handleCloseResult}
                        className="w-full"
                        variant="outline"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={selectedAnswer === option ? "default" : "outline"}
                          className={`w-full text-left justify-start h-auto p-4 ${
                            isCompleted || isReviewMode 
                              ? (option === currentQuestion.correct_answer 
                                  ? 'bg-green-100 border-green-300 text-green-800' 
                                  : 'opacity-60 cursor-not-allowed')
                              : ''
                          }`}
                          onClick={() => !isCompleted && !isReviewMode && handleAnswerSelect(option)}
                          disabled={isCompleted || isReviewMode}
                        >
                          {option}
                          {(isCompleted || isReviewMode) && option === currentQuestion.correct_answer && (
                            <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      ))}
                      
                      {isCompleted || isReviewMode ? (
                        <div className="space-y-3">
                          {currentQuestion.explanation && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                            </div>
                          )}
                          <Button 
                            onClick={handleCloseResult}
                            className="w-full"
                            variant="outline"
                          >
                            <Zap className="mr-2 h-4 w-4" />
                            {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer la revue'}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={handleNextQuestion}
                          disabled={!selectedAnswer}
                          className="w-full mt-4"
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer'}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;
