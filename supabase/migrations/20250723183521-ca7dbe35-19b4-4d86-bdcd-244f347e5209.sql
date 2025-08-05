-- Fix the search path for the function
CREATE OR REPLACE FUNCTION public.update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's total points in profiles table
  UPDATE public.profiles 
  SET 
    total_points = (
      SELECT COALESCE(SUM(points_earned), 0) 
      FROM public.step_completions 
      WHERE user_id = NEW.user_id
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger to automatically update total points when step completion is added/updated
CREATE OR REPLACE TRIGGER trigger_update_user_points_on_completion
  AFTER INSERT OR UPDATE ON public.step_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_total_points();

-- Fix existing data by updating all user total points
UPDATE public.profiles 
SET total_points = (
  SELECT COALESCE(SUM(points_earned), 0) 
  FROM public.step_completions 
  WHERE user_id = profiles.user_id
);