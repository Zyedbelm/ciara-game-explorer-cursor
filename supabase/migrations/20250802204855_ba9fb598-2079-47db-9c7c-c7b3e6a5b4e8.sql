-- Enable real-time updates for the tables we need to monitor
-- for automatic stats updates when journeys are deleted/modified

-- Enable full replica identity to capture complete row data
ALTER TABLE public.user_journey_progress REPLICA IDENTITY FULL;
ALTER TABLE public.step_completions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
-- Note: This might already be done, but it's safe to run again
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_journey_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.step_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;