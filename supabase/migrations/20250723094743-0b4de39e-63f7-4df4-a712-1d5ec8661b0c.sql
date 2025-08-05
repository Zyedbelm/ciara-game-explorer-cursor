-- Add missing translations for social proof section
INSERT INTO ui_translations (key, language, value) VALUES
-- Social proof translations - French
('social_proof.title', 'fr', 'Ils nous font confiance'),
('social_proof.testimonials_subtitle', 'fr', 'Découvrez ce que nos utilisateurs pensent de CIARA'),
('social_proof.partners_subtitle', 'fr', 'Nos partenaires de confiance'),

-- Social proof translations - English  
('social_proof.title', 'en', 'They trust us'),
('social_proof.testimonials_subtitle', 'en', 'Discover what our users think about CIARA'),
('social_proof.partners_subtitle', 'en', 'Our trusted partners'),

-- Social proof translations - German
('social_proof.title', 'de', 'Sie vertrauen uns'),
('social_proof.testimonials_subtitle', 'de', 'Entdecken Sie, was unsere Benutzer über CIARA denken'),
('social_proof.partners_subtitle', 'de', 'Unsere vertrauenswürdigen Partner'),

-- Admin tabs translations - French
('admin.tabs.testimonials', 'fr', 'Témoignages'),
('admin.tabs.client_logos', 'fr', 'Logos clients'),

-- Admin tabs translations - English
('admin.tabs.testimonials', 'en', 'Testimonials'), 
('admin.tabs.client_logos', 'en', 'Client Logos'),

-- Admin tabs translations - German
('admin.tabs.testimonials', 'de', 'Testimonials'),
('admin.tabs.client_logos', 'de', 'Kundenlogos'),

-- Admin testimonials management translations - French
('admin.testimonials.title', 'fr', 'Gestion des témoignages'),
('admin.testimonials.add', 'fr', 'Ajouter un témoignage'),
('admin.testimonials.edit', 'fr', 'Modifier le témoignage'),
('admin.testimonials.delete_confirm', 'fr', 'Êtes-vous sûr de vouloir supprimer ce témoignage ?'),
('admin.testimonials.no_testimonials', 'fr', 'Aucun témoignage trouvé'),

-- Admin testimonials management translations - English
('admin.testimonials.title', 'en', 'Testimonials Management'),
('admin.testimonials.add', 'en', 'Add Testimonial'),
('admin.testimonials.edit', 'en', 'Edit Testimonial'),
('admin.testimonials.delete_confirm', 'en', 'Are you sure you want to delete this testimonial?'),
('admin.testimonials.no_testimonials', 'en', 'No testimonials found'),

-- Admin testimonials management translations - German
('admin.testimonials.title', 'de', 'Testimonial-Verwaltung'),
('admin.testimonials.add', 'de', 'Testimonial hinzufügen'),
('admin.testimonials.edit', 'de', 'Testimonial bearbeiten'), 
('admin.testimonials.delete_confirm', 'de', 'Sind Sie sicher, dass Sie dieses Testimonial löschen möchten?'),
('admin.testimonials.no_testimonials', 'de', 'Keine Testimonials gefunden'),

-- Admin client logos management translations - French
('admin.client_logos.title', 'fr', 'Gestion des logos clients'),
('admin.client_logos.add', 'fr', 'Ajouter un logo'),
('admin.client_logos.edit', 'fr', 'Modifier le logo'),
('admin.client_logos.delete_confirm', 'fr', 'Êtes-vous sûr de vouloir supprimer ce logo ?'),
('admin.client_logos.no_logos', 'fr', 'Aucun logo trouvé'),

-- Admin client logos management translations - English
('admin.client_logos.title', 'en', 'Client Logos Management'),
('admin.client_logos.add', 'en', 'Add Logo'),
('admin.client_logos.edit', 'en', 'Edit Logo'),
('admin.client_logos.delete_confirm', 'en', 'Are you sure you want to delete this logo?'),
('admin.client_logos.no_logos', 'en', 'No logos found'),

-- Admin client logos management translations - German
('admin.client_logos.title', 'de', 'Kundenlogo-Verwaltung'),
('admin.client_logos.add', 'de', 'Logo hinzufügen'),
('admin.client_logos.edit', 'de', 'Logo bearbeiten'),
('admin.client_logos.delete_confirm', 'de', 'Sind Sie sicher, dass Sie dieses Logo löschen möchten?'),
('admin.client_logos.no_logos', 'de', 'Keine Logos gefunden')

ON CONFLICT (key, language) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();