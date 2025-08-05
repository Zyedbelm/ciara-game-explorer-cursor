-- Create countries table with Switzerland and France
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_de TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Countries are viewable by everyone" 
ON public.countries 
FOR SELECT 
USING (is_active = true);

-- Create policy for admin modifications
CREATE POLICY "Only super admins can manage countries" 
ON public.countries 
FOR ALL 
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- Insert Switzerland and France
INSERT INTO public.countries (code, name_fr, name_en, name_de, display_order) VALUES 
('CH', 'Suisse', 'Switzerland', 'Schweiz', 1),
('FR', 'France', 'France', 'Frankreich', 2);

-- Create trigger for updated_at
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();