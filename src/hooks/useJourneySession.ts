import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ActiveJourney, JourneyStep } from '@/types/journey';

interface JourneySessionData {
  journey_id: string;
  user_id: string;
  current_step_index: number;
  completed_steps: number[];
  total_points_earned: number;
  session_data: {
    startTime: number;
    lastActivity: number;
    chatSessionId?: string;
    completedAt?: number;
    validationHistory: Array<{
      stepId: string;
      timestamp: number;
      method: string;
      success: boolean;
    }>;
  };
  is_active: boolean;
  updated_at: string;
}

export function useJourneySession(journeyId: string) {
  const [sessionData, setSessionData] = useState<JourneySessionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);
  const SAVE_THROTTLE_MS = 2000; // Save at most every 2 seconds

  // Load existing session or create new one
  const initializeSession = useCallback(async () => {
    if (!user || !journeyId) return;

    setLoading(true);

    try {
      // Try to load existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from('user_journey_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('journey_id', journeyId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSession) {
        const sessionData: JourneySessionData = {
          journey_id: existingSession.journey_id,
          user_id: existingSession.user_id,
          current_step_index: Math.max(0, (existingSession.current_step_order || 1) - 1),
          completed_steps: existingSession.quiz_responses ? 
            JSON.parse(String(existingSession.quiz_responses) || '[]').map((r: any) => r.stepIndex || 0) : [],
          total_points_earned: existingSession.total_points_earned || 0,
          session_data: {
            startTime: new Date(existingSession.started_at).getTime(),
            lastActivity: new Date(existingSession.updated_at).getTime(),
            chatSessionId: (existingSession.generation_criteria as any)?.chatSessionId,
            validationHistory: (existingSession.generation_criteria as any)?.validationHistory || []
          },
          is_active: !existingSession.is_completed,
          updated_at: existingSession.updated_at || new Date().toISOString()
        };
        setSessionData(sessionData);
      } else {
        // Create new session
        const newSessionData: JourneySessionData = {
          journey_id: journeyId,
          user_id: user.id,
          current_step_index: 0,
          completed_steps: [],
          total_points_earned: 0,
          session_data: {
            startTime: Date.now(),
            lastActivity: Date.now(),
            validationHistory: []
          },
          is_active: true,
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('user_journey_progress')
          .insert({
            user_id: user.id,
            journey_id: journeyId,
            current_step_order: 1,
            total_points_earned: 0,
            is_completed: false,
            status: 'in_progress',
            generation_criteria: {
              startTime: newSessionData.session_data.startTime,
              validationHistory: []
            }
          });

        if (insertError && insertError.code !== '23505') { // Not a duplicate
          throw insertError;
        }

        setSessionData(newSessionData);
        }
    } catch (error) {
      toast({
        title: 'Erreur de session',
        description: 'Impossible de charger votre progression',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, journeyId, toast]);

  // Save session data with throttling
  const saveSession = useCallback(async (updateData: Partial<JourneySessionData>, immediate = false) => {
    if (!sessionData || !user) return;

    const now = Date.now();
    
    // Throttle saves unless immediate
    if (!immediate && now - lastSaveRef.current < SAVE_THROTTLE_MS) {
      // Clear existing timeout and set a new one
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveSession(updateData, true);
      }, SAVE_THROTTLE_MS);
      return;
    }

    setSaving(true);
    lastSaveRef.current = now;

    try {
      const updatedSession = {
        ...sessionData,
        ...updateData,
        session_data: {
          ...sessionData.session_data,
          ...(updateData.session_data || {}),
          lastActivity: now
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_journey_progress')
        .update({
          current_step_order: updatedSession.current_step_index + 1,
          total_points_earned: updatedSession.total_points_earned,
          is_completed: !updatedSession.is_active,
          generation_criteria: updatedSession.session_data,
          quiz_responses: JSON.stringify(
            updatedSession.completed_steps.map(stepIndex => ({
              stepIndex,
              completedAt: now
            }))
          ),
          updated_at: updatedSession.updated_at
        })
        .eq('user_id', user.id)
        .eq('journey_id', journeyId);

      if (error) throw error;

      setSessionData(updatedSession);
      } catch (error) {
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder votre progression',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }, [sessionData, user, journeyId, toast]);

  // Update current step
  const updateCurrentStep = useCallback((stepIndex: number) => {
    if (!sessionData) return;
    
    saveSession({ current_step_index: stepIndex });
  }, [sessionData, saveSession]);

  // Mark step as completed
  const markStepCompleted = useCallback((stepIndex: number, step: JourneyStep, method = 'geolocation') => {
    if (!sessionData) return;

    const isAlreadyCompleted = sessionData.completed_steps.includes(stepIndex);
    if (isAlreadyCompleted) {
      return;
    }

    const newCompletedSteps = [...sessionData.completed_steps, stepIndex];
    const newTotalPoints = sessionData.total_points_earned + (step.points_awarded || 0);
    const validationEntry = {
      stepId: step.id,
      timestamp: Date.now(),
      method,
      success: true
    };

    saveSession({
      completed_steps: newCompletedSteps,
      total_points_earned: newTotalPoints,
      current_step_index: Math.min(stepIndex + 1, 99), // Move to next step
      session_data: {
        ...sessionData.session_data,
        validationHistory: [...sessionData.session_data.validationHistory, validationEntry]
      }
    }, true); // Save immediately for step completion

    toast({
      title: 'Étape validée !',
      description: `+${step.points_awarded || 0} points gagnés`,
    });
  }, [sessionData, saveSession, toast]);

  // Complete journey
  const completeJourney = useCallback(async () => {
    if (!sessionData) return;

    await saveSession({
      is_active: false,
      session_data: {
        ...sessionData.session_data,
        completedAt: Date.now()
      }
    }, true);

    toast({
      title: 'Parcours terminé !',
      description: `Vous avez gagné ${sessionData.total_points_earned} points au total`,
    });
  }, [sessionData, saveSession, toast]);

  // Link chat session
  const linkChatSession = useCallback((chatSessionId: string) => {
    if (!sessionData) return;
    
    saveSession({
      session_data: {
        ...sessionData.session_data,
        chatSessionId
      }
    });
  }, [sessionData, saveSession]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Auto-save activity every 30 seconds if session is active
  useEffect(() => {
    if (!sessionData?.is_active) return;

    const interval = setInterval(() => {
      saveSession({
        session_data: {
          ...sessionData.session_data,
          lastActivity: Date.now()
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionData?.is_active, saveSession]);

  return {
    sessionData,
    loading,
    saving,
    updateCurrentStep,
    markStepCompleted,
    completeJourney,
    linkChatSession,
    initializeSession
  };
}