-- Add validity_days column to rewards table for configurable validity periods
ALTER TABLE public.rewards 
ADD COLUMN validity_days integer DEFAULT 30 NOT NULL;

-- Add some sample validity periods for existing rewards
UPDATE public.rewards 
SET validity_days = 30 
WHERE validity_days IS NULL;

-- Create function to cleanup expired vouchers
CREATE OR REPLACE FUNCTION public.cleanup_expired_vouchers()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  expired_count integer;
BEGIN
  -- Mark vouchers as expired if they are past their expiration date
  UPDATE public.reward_redemptions 
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'pending' 
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN 'Marked ' || expired_count || ' vouchers as expired';
END;
$function$;