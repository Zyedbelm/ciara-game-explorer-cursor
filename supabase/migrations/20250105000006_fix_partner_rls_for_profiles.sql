-- Fix RLS policies for partners to allow access via profile.partner_id
-- Drop existing policies
DROP POLICY IF EXISTS "Partners viewable by role and city" ON partners;
DROP POLICY IF EXISTS "Partners manageable by role and city" ON partners;

-- Create new policies that allow partners to access their partner data via profile.partner_id
CREATE POLICY "Partners viewable by role and city" ON partners
FOR SELECT USING (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (city_id = get_user_city_id())
    WHEN get_current_user_role() = 'partner' THEN (
      id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
    )
    ELSE true
  END
);

CREATE POLICY "Partners manageable by role and city" ON partners
FOR ALL USING (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (city_id = get_user_city_id())
    WHEN get_current_user_role() = 'partner' THEN (
      id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
    )
    ELSE false
  END
) WITH CHECK (
  CASE
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() = 'tenant_admin' THEN (city_id = get_user_city_id())
    WHEN get_current_user_role() = 'partner' THEN (
      id = (SELECT partner_id FROM profiles WHERE user_id = auth.uid())
    )
    ELSE false
  END
);
