-- Fix search path security warning for can_user_redeem_reward function
CREATE OR REPLACE FUNCTION public.can_user_redeem_reward(
  p_reward_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reward_record RECORD;
  user_redemptions_count INTEGER;
  total_redemptions_count INTEGER;
BEGIN
  -- Get reward details
  SELECT max_redemptions, max_redemptions_per_user, is_active
  INTO reward_record
  FROM public.rewards
  WHERE id = p_reward_id;
  
  -- Check if reward exists and is active
  IF NOT FOUND OR NOT reward_record.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check per-user limit if set
  IF reward_record.max_redemptions_per_user IS NOT NULL THEN
    SELECT COUNT(*)
    INTO user_redemptions_count
    FROM public.reward_redemptions
    WHERE reward_id = p_reward_id 
      AND user_id = p_user_id 
      AND status IN ('pending', 'used');
    
    IF user_redemptions_count >= reward_record.max_redemptions_per_user THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check global limit if set
  IF reward_record.max_redemptions IS NOT NULL THEN
    SELECT COUNT(*)
    INTO total_redemptions_count
    FROM public.reward_redemptions
    WHERE reward_id = p_reward_id 
      AND status IN ('pending', 'used');
    
    IF total_redemptions_count >= reward_record.max_redemptions THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Fix search path security warning for get_reward_redemption_stats function
CREATE OR REPLACE FUNCTION public.get_reward_redemption_stats(p_reward_id uuid)
RETURNS TABLE(
  total_redemptions bigint,
  max_redemptions integer,
  user_redemptions bigint,
  max_redemptions_per_user integer,
  can_redeem boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.reward_redemptions 
     WHERE reward_id = p_reward_id AND status IN ('pending', 'used')),
    r.max_redemptions,
    (SELECT COUNT(*) FROM public.reward_redemptions 
     WHERE reward_id = p_reward_id AND user_id = auth.uid() AND status IN ('pending', 'used')),
    r.max_redemptions_per_user,
    public.can_user_redeem_reward(p_reward_id, auth.uid())
  FROM public.rewards r
  WHERE r.id = p_reward_id;
END;
$$;