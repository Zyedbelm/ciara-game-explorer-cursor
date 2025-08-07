-- Fix RLS policies for rewards and reward_redemptions to allow partners to access their data via profile.partner_id

-- Drop existing policies on rewards
DROP POLICY IF EXISTS "Rewards viewable by role and city simple" ON rewards;
DROP POLICY IF EXISTS "Rewards manageable by role and city simple" ON rewards;

-- Create new policies for rewards that use profile.partner_id for partners
CREATE POLICY "Rewards viewable by role and city simple" ON rewards
FOR SELECT USING (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (
      EXISTS (
        SELECT 1 FROM partners p 
        WHERE p.id = rewards.partner_id AND p.city_id = get_user_city_id()
      )
    )
    WHEN get_current_user_role() = 'partner' THEN (
      partner_id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
    )
    ELSE (is_active = true)
  END
);

CREATE POLICY "Rewards manageable by role and city simple" ON rewards
FOR ALL USING (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (
      EXISTS (
        SELECT 1 FROM partners p 
        WHERE p.id = rewards.partner_id AND p.city_id = get_user_city_id()
      )
    )
    WHEN get_current_user_role() = 'partner' THEN (
      partner_id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
    )
    ELSE false
  END
) WITH CHECK (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (
      EXISTS (
        SELECT 1 FROM partners p 
        WHERE p.id = rewards.partner_id AND p.city_id = get_user_city_id()
      )
    )
    WHEN get_current_user_role() = 'partner' THEN (
      partner_id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
    )
    ELSE false
  END
);

-- Drop existing policies on reward_redemptions
DROP POLICY IF EXISTS "Reward redemptions viewable by role and city simple" ON reward_redemptions;
DROP POLICY IF EXISTS "Reward redemptions manageable by role and city simple" ON reward_redemptions;

-- Create new policies for reward_redemptions that use profile.partner_id for partners
CREATE POLICY "Reward redemptions viewable by role and city simple" ON reward_redemptions
FOR SELECT USING (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (
      EXISTS (
        SELECT 1 FROM (rewards r JOIN partners p ON p.id = r.partner_id)
        WHERE r.id = reward_redemptions.reward_id AND p.city_id = get_user_city_id()
      )
    )
    WHEN get_current_user_role() = 'partner' THEN (
      EXISTS (
        SELECT 1 FROM rewards r 
        WHERE r.id = reward_redemptions.reward_id 
        AND r.partner_id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
      )
    )
    ELSE (user_id = auth.uid())
  END
);

CREATE POLICY "Reward redemptions manageable by role and city simple" ON reward_redemptions
FOR UPDATE USING (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (
      EXISTS (
        SELECT 1 FROM (rewards r JOIN partners p ON p.id = r.partner_id)
        WHERE r.id = reward_redemptions.reward_id AND p.city_id = get_user_city_id()
      )
    )
    WHEN get_current_user_role() = 'partner' THEN (
      EXISTS (
        SELECT 1 FROM rewards r 
        WHERE r.id = reward_redemptions.reward_id 
        AND r.partner_id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
      )
    )
    ELSE (user_id = auth.uid())
  END
);
