-- Function to update user total points
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
$$ LANGUAGE plpgsql SECURITY DEFINER;