-- Create notifications table for push notifications management
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Target audience
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'active_users', 'journey_participants', 'city_users')),
  city_id UUID REFERENCES public.cities(id), -- For city-specific notifications
  
  -- Scheduling and status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  send_immediately BOOLEAN DEFAULT true,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Action configuration
  action_type TEXT DEFAULT 'none' CHECK (action_type IN ('none', 'open_journey', 'open_rewards', 'open_profile')),
  action_data TEXT, -- JSON string for action parameters
  
  -- Delivery tracking
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_deliveries table to track individual deliveries
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  
  -- Delivery status
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  
  -- Device info
  device_token TEXT,
  device_type TEXT, -- 'ios', 'android', 'web'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Notifications are viewable by admins and content managers" 
ON public.notifications 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text, 'ciara_staff'::text]));

CREATE POLICY "Only admins can manage notifications" 
ON public.notifications 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]));

-- Create policies for notification deliveries
CREATE POLICY "Delivery stats are viewable by admins" 
ON public.notification_deliveries 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text, 'ciara_staff'::text]));

CREATE POLICY "Users can view their own deliveries" 
ON public.notification_deliveries 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

-- Create indexes for performance
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_city_id ON public.notifications(city_id);
CREATE INDEX idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX idx_notification_deliveries_notification_id ON public.notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_user_id ON public.notification_deliveries(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample notifications for testing
INSERT INTO public.notifications (title, message, target_audience, status, sent_at, sent_count, opened_count, created_by) 
VALUES 
  (
    'Bienvenue sur CIARA !',
    'Découvrez votre première aventure urbaine avec notre plateforme d''exploration interactive.',
    'all',
    'sent',
    '2024-01-10T10:00:00Z',
    1250,
    423,
    (SELECT user_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1)
  ),
  (
    'Nouveau parcours disponible !',
    'Explorez le parcours "Street Art de Sion" avec 8 nouvelles œuvres à découvrir.',
    'city_users',
    'sent',
    '2024-01-13T14:30:00Z',
    342,
    156,
    (SELECT user_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1)
  ),
  (
    'Événement spécial ce weekend',
    'Participez à notre chasse au trésor numérique et gagnez des points bonus !',
    'active_users',
    'scheduled',
    NULL,
    0,
    0,
    (SELECT user_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1)
  );