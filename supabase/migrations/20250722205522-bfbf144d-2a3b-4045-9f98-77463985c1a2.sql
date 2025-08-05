-- Phase 1: Add status column to user_journey_progress table
ALTER TABLE public.user_journey_progress 
ADD COLUMN status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'in_progress', 'completed', 'abandoned'));

-- Update existing records to have appropriate status based on current data
UPDATE public.user_journey_progress 
SET status = CASE 
  WHEN is_completed = true THEN 'completed'
  WHEN current_step_order > 1 THEN 'in_progress'
  ELSE 'saved'
END;

-- Create index for better performance on status queries
CREATE INDEX idx_user_journey_progress_status ON public.user_journey_progress(status);
CREATE INDEX idx_user_journey_progress_user_status ON public.user_journey_progress(user_id, status);