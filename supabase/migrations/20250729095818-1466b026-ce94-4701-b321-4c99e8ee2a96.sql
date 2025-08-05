-- Create email_newsletter table for newsletter subscriptions
CREATE TABLE public.email_newsletter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_newsletter ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.email_newsletter 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view newsletter subscriptions" 
ON public.email_newsletter 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text]));

-- Add trigger for updated_at
CREATE TRIGGER update_email_newsletter_updated_at
BEFORE UPDATE ON public.email_newsletter
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();