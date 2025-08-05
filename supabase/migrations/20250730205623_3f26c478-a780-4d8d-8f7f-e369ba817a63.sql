-- Add only missing footer translations
INSERT INTO public.ui_translations (key, language, value, category, context) VALUES
-- Quick links section
('footer_quick_links', 'fr', 'Liens rapides', 'footer', 'Footer quick links section title'),
('footer_quick_links', 'en', 'Quick Links', 'footer', 'Footer quick links section title'),
('footer_quick_links', 'de', 'Schnellzugriff', 'footer', 'Footer quick links section title'),

-- Explore section
('footer_explore', 'fr', 'Explorer', 'footer', 'Footer explore section title'),
('footer_explore', 'en', 'Explore', 'footer', 'Footer explore section title'),
('footer_explore', 'de', 'Entdecken', 'footer', 'Footer explore section title'),

-- Support section
('footer_support', 'fr', 'Support', 'footer', 'Footer support section title'),
('footer_support', 'en', 'Support', 'footer', 'Footer support section title'),
('footer_support', 'de', 'Support', 'footer', 'Footer support section title'),

-- Legal section
('footer_legal', 'fr', 'Légal', 'footer', 'Footer legal section title'),
('footer_legal', 'en', 'Legal', 'footer', 'Footer legal section title'),
('footer_legal', 'de', 'Rechtliches', 'footer', 'Footer legal section title'),

-- Rights text
('footer_rights', 'fr', 'Tous droits réservés.', 'footer', 'Footer copyright text'),
('footer_rights', 'en', 'All rights reserved.', 'footer', 'Footer copyright text'),
('footer_rights', 'de', 'Alle Rechte vorbehalten.', 'footer', 'Footer copyright text')
ON CONFLICT (key, language) DO NOTHING;