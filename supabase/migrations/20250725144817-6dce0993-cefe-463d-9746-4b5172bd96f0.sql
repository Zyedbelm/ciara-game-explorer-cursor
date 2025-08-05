-- Create articles table for blog management
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  title_de TEXT,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  content_en TEXT,
  content_de TEXT,
  excerpt TEXT,
  excerpt_en TEXT,
  excerpt_de TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  city_id UUID REFERENCES public.cities(id),
  category TEXT DEFAULT 'general',
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'de')),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create city_packages table for package details
CREATE TABLE public.city_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL CHECK (package_type IN ('starter', 'professional', 'enterprise')),
  annual_amount_chf DECIMAL(10,2) NOT NULL,
  billing_period TEXT DEFAULT 'annual' CHECK (billing_period IN ('monthly', 'annual', 'custom')),
  contract_start_date DATE,
  contract_end_date DATE,
  renewal_date DATE,
  auto_renewal BOOLEAN DEFAULT TRUE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
  features_included JSONB DEFAULT '{}',
  custom_terms TEXT,
  contact_person_name TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on articles table
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- RLS policies for articles
CREATE POLICY "Articles are viewable by everyone for published articles"
ON public.articles FOR SELECT
USING (status = 'published' OR get_current_user_role() = ANY(ARRAY['super_admin', 'tenant_admin', 'content_manager']));

CREATE POLICY "Super admins can manage all articles"
ON public.articles FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Tenant admins can manage articles in their city"
ON public.articles FOR ALL
USING (
  get_current_user_role() = 'tenant_admin' 
  AND (city_id = get_user_city_id() OR city_id IS NULL)
);

CREATE POLICY "Content managers can manage articles in their city"
ON public.articles FOR ALL
USING (
  get_current_user_role() = 'content_manager' 
  AND (city_id = get_user_city_id() OR city_id IS NULL)
);

-- Enable RLS on city_packages table
ALTER TABLE public.city_packages ENABLE ROW LEVEL SECURITY;

-- RLS policies for city_packages
CREATE POLICY "Super admins can manage all city packages"
ON public.city_packages FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Tenant admins can view their city package"
ON public.city_packages FOR SELECT
USING (
  get_current_user_role() = 'tenant_admin' 
  AND city_id = get_user_city_id()
);

-- Create indexes for better performance
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_city_id ON public.articles(city_id);
CREATE INDEX idx_articles_published_at ON public.articles(published_at);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_city_packages_city_id ON public.city_packages(city_id);
CREATE INDEX idx_city_packages_package_type ON public.city_packages(package_type);

-- Create trigger for updating updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_city_packages_updated_at
  BEFORE UPDATE ON public.city_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();