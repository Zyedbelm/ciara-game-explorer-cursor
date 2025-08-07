-- Fix RLS policies for profiles to allow partners to view profiles of users who redeemed their rewards

-- Create new policy for partners to view profiles of users who redeemed their rewards
CREATE POLICY "Partners can view profiles of users who redeemed their rewards" ON profiles
FOR SELECT USING (
  CASE
    WHEN get_current_user_role() = 'partner' THEN (
      -- Allow partners to view profiles of users who redeemed their rewards
      EXISTS (
        SELECT 1 FROM reward_redemptions rr
        JOIN rewards r ON rr.reward_id = r.id
        WHERE r.partner_id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
        AND rr.user_id = profiles.user_id
      )
    )
    ELSE true
  END
);
