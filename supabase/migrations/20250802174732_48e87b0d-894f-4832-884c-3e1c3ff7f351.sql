-- Add is_active column to cities table
ALTER TABLE cities ADD COLUMN is_active boolean DEFAULT true;

-- Update the RLS policy to hide inactive cities from public view
DROP POLICY IF EXISTS "Cities viewable by all" ON cities;

CREATE POLICY "Cities viewable by all" ON cities
FOR SELECT USING (
  CASE
    WHEN (is_archived = true OR is_active = false) THEN (COALESCE(get_current_user_role(), 'visitor'::text) = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]))
    ELSE true
  END
);

-- Add comment for clarity
COMMENT ON COLUMN cities.is_active IS 'Determines if city is active and visible on public website. Inactive cities are only visible to admins.';