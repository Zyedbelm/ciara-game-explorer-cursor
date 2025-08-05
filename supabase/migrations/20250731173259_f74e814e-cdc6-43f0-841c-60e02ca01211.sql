-- Supprimer tous les logs d'emails sauf pour le super admin zyed.elmeddeb@gmail.com
DELETE FROM public.system_logs 
WHERE context->>'email' IS NOT NULL 
  AND context->>'email' != 'zyed.elmeddeb@gmail.com';

-- Supprimer les logs liés aux fonctions d'email sauf pour le super admin
DELETE FROM public.system_logs 
WHERE message ILIKE '%email%' 
  AND context->>'email' != 'zyed.elmeddeb@gmail.com'
  AND context->>'email' IS NOT NULL;

-- Supprimer les logs des edge functions d'email sauf pour le super admin
DELETE FROM public.system_logs 
WHERE (
  message ILIKE '%send-welcome%' OR 
  message ILIKE '%send-email%' OR 
  message ILIKE '%password-reset%' OR
  message ILIKE '%confirmation%'
) AND (
  context->>'email' != 'zyed.elmeddeb@gmail.com' OR
  context->>'email' IS NULL
);