import { Language } from '@/contexts/LanguageContext';
import { cookiesTranslations } from './cookiesTranslations';

// Fonction utilitaire pour obtenir le texte dans la langue appropriée
export const getLocalizedText = (
  baseText: string | null,
  translations: {
    en?: string | null;
    de?: string | null;
  },
  language: Language,
  fallbackLanguage: Language = 'fr'
): string => {
  if (!baseText) return '';

  switch (language) {
    case 'en':
      return translations.en || baseText;
    case 'de':
      return translations.de || baseText;
    case 'fr':
    default:
      return baseText;
  }
};

// Fonction pour obtenir les options de quiz localisées
export const getLocalizedQuizOptions = (
  baseOptions: any,
  translations: {
    options_en?: any;
    options_de?: any;
  },
  language: Language
): any => {
  if (!baseOptions) return null;

  switch (language) {
    case 'en':
      return translations.options_en || baseOptions;
    case 'de':
      return translations.options_de || baseOptions;
    case 'fr':
    default:
      return baseOptions;
  }
};

// Mappings des colonnes de base de données selon la langue
export const getColumnSuffix = (language: Language): string => {
  switch (language) {
    case 'en':
      return '_en';
    case 'de':
      return '_de';
    case 'fr':
    default:
      return '';
  }
};

// Helper pour construire les sélecteurs de colonnes pour Supabase
export const buildLocalizedSelect = (
  baseColumns: string[],
  translatableColumns: string[],
  language: Language = 'fr'
): string => {
  const suffix = getColumnSuffix(language);
  
  const allColumns = [
    ...baseColumns,
    ...translatableColumns.map(col => `${col}${suffix}`),
    // Toujours inclure les colonnes de base pour le fallback
    ...(suffix ? translatableColumns : [])
  ];
  
  return allColumns.join(', ');
};

// Navigation translations for missing pages  
export const navigationTranslations = {
  blog: {
    fr: "Blog",
    en: "Blog",
    de: "Blog"
  },
  pricing: {
    fr: "Plans",
    en: "Pricing", 
    de: "Preisgestaltung"
  },
  ai_features: {
    fr: "Fonctionnalités IA",
    en: "AI Features",
    de: "KI-Funktionen"
  },
  footer_explore: {
    fr: "Explorer",
    en: "Explore",
    de: "Entdecken"
  },
  // About page - Restructured content
  about_us: {
    fr: "À propos",
    en: "About Us",
    de: "Über uns"
  },
  about_title: {
    fr: "À propos de CIARA",
    en: "About CIARA",
    de: "Über CIARA"
  },
  about_subtitle: {
    fr: "La révolution du tourisme digital intelligent",
    en: "The digital tourism intelligence revolution",
    de: "Die Revolution des digitalen intelligenten Tourismus"
  },

  // Section 1: Vision et Mission
  about_vision_mission_title: {
    fr: "Vision et Mission",
    en: "Vision and Mission",
    de: "Vision und Mission"
  },
  about_vision_mission_description: {
    fr: "CIARA révolutionne l'industrie du tourisme en transformant chaque destination en expérience gamifiée et personnalisée grâce à l'intelligence artificielle. Notre mission est de créer des ponts intelligents entre les visiteurs, le patrimoine local et les commerces, en utilisant l'IA pour personnaliser chaque parcours et optimiser l'engagement.",
    en: "CIARA revolutionizes the tourism industry by transforming every destination into a gamified and personalized experience through artificial intelligence. Our mission is to create intelligent bridges between visitors, local heritage and businesses, using AI to personalize each journey and optimize engagement.",
    de: "CIARA revolutioniert die Tourismusbranche, indem wir jedes Reiseziel durch künstliche Intelligenz in ein gamifiziertes und personalisiertes Erlebnis verwandeln. Unsere Mission ist es, intelligente Brücken zwischen Besuchern, lokalem Erbe und Unternehmen zu schaffen, indem wir KI nutzen, um jede Reise zu personalisieren und das Engagement zu optimieren."
  },

  // Section 2: Notre Solution
  about_solution_title: {
    fr: "Notre Solution",
    en: "Our Solution",
    de: "Unsere Lösung"
  },
  about_solution_description: {
    fr: "Une plateforme complète qui combine intelligence artificielle, gamification et géolocalisation pour offrir des expériences touristiques uniques et engageantes.",
    en: "A comprehensive platform that combines artificial intelligence, gamification and geolocation to offer unique and engaging tourism experiences.",
    de: "Eine umfassende Plattform, die künstliche Intelligenz, Gamification und Geolokalisierung kombiniert, um einzigartige und ansprechende Tourismuserlebnisse zu bieten."
  },
  about_smart_itineraries: {
    fr: "Itinéraires Intelligents avec IA",
    en: "AI-Powered Smart Itineraries",
    de: "KI-gestützte intelligente Routen"
  },
  about_smart_itineraries_desc: {
    fr: "Génération automatique de parcours personnalisés selon vos préférences, votre temps disponible et les conditions locales.",
    en: "Automatic generation of personalized routes according to your preferences, available time and local conditions.",
    de: "Automatische Generierung personalisierter Routen entsprechend Ihren Vorlieben, verfügbarer Zeit und lokalen Bedingungen."
  },
  about_gamified_content: {
    fr: "Contenu Historique Gamifié",
    en: "Gamified Historical Content",
    de: "Gamifizierte historische Inhalte"
  },
  about_gamified_content_desc: {
    fr: "Découverte interactive du patrimoine avec quiz, défis et récompenses pour une expérience mémorable.",
    en: "Interactive heritage discovery with quizzes, challenges and rewards for a memorable experience.",
    de: "Interaktive Entdeckung des Erbes mit Quiz, Herausforderungen und Belohnungen für ein unvergessliches Erlebnis."
  },
  about_local_economy: {
    fr: "Valorisation Économique Locale",
    en: "Local Economic Enhancement",
    de: "Lokale Wirtschaftsförderung"
  },
  about_local_economy_desc: {
    fr: "Système de partenariats qui dirige les visiteurs vers les commerces locaux avec des récompenses attractives.",
    en: "Partnership system that directs visitors to local businesses with attractive rewards.",
    de: "Partnerschaftssystem, das Besucher mit attraktiven Belohnungen zu lokalen Unternehmen leitet."
  },

  // Section 3: Pour les Professionnels
  about_professionals_title: {
    fr: "Pour les Professionnels du Tourisme",
    en: "For Tourism Professionals",
    de: "Für Tourismusprofis"
  },
  about_professionals_description: {
    fr: "Des outils puissants pour les offices de tourisme et gestionnaires de destinations qui souhaitent optimiser l'expérience visiteur.",
    en: "Powerful tools for tourism offices and destination managers who want to optimize the visitor experience.",
    de: "Leistungsstarke Tools für Tourismusbüros und Destinationsmanager, die das Besuchererlebnis optimieren möchten."
  },
  about_analytics_tools: {
    fr: "Outils d'Analyse et Insights",
    en: "Analytics Tools and Insights",
    de: "Analyse-Tools und Erkenntnisse"
  },
  about_analytics_tools_desc: {
    fr: "Tableaux de bord en temps réel pour comprendre les comportements des visiteurs et optimiser les parcours.",
    en: "Real-time dashboards to understand visitor behavior and optimize routes.",
    de: "Echtzeit-Dashboards zum Verständnis des Besucherverhaltens und zur Optimierung von Routen."
  },
  about_content_management: {
    fr: "Plateforme de Gestion de Contenu",
    en: "Content Management Platform",
    de: "Content-Management-Plattform"
  },
  about_content_management_desc: {
    fr: "Interface intuitive pour créer, modifier et gérer tous les contenus et parcours de votre destination.",
    en: "Intuitive interface to create, edit and manage all content and routes for your destination.",
    de: "Intuitive Benutzeroberfläche zum Erstellen, Bearbeiten und Verwalten aller Inhalte und Routen für Ihr Reiseziel."
  },

  // Section 4: Technologie & Innovation
  about_technology_title: {
    fr: "Technologie & Innovation",
    en: "Technology & Innovation",
    de: "Technologie & Innovation"
  },
  about_technology_description: {
    fr: "Une stack technologique de pointe qui place l'intelligence artificielle au cœur de l'expérience utilisateur.",
    en: "A cutting-edge technology stack that places artificial intelligence at the heart of the user experience.",
    de: "Ein hochmoderner Technologie-Stack, der künstliche Intelligenz in den Mittelpunkt der Benutzererfahrung stellt."
  },
  about_ai_conversation: {
    fr: "IA Conversationnelle CIARA",
    en: "CIARA Conversational AI",
    de: "CIARA Konversations-KI"
  },
  about_ai_conversation_desc: {
    fr: "Assistant intelligent qui guide les visiteurs en temps réel et répond à toutes leurs questions.",
    en: "Intelligent assistant that guides visitors in real time and answers all their questions.",
    de: "Intelligenter Assistent, der Besucher in Echtzeit führt und alle ihre Fragen beantwortet."
  },
  about_smart_geolocation: {
    fr: "Géolocalisation Intelligente",
    en: "Smart Geolocation",
    de: "Intelligente Geolokalisierung"
  },
  about_smart_geolocation_desc: {
    fr: "Système de positionnement précis qui déclenche automatiquement les contenus selon votre position.",
    en: "Precise positioning system that automatically triggers content based on your location.",
    de: "Präzises Positionierungssystem, das automatisch Inhalte basierend auf Ihrem Standort auslöst."
  },

  // Section 5: Impact et Valeurs
  about_impact_title: {
    fr: "Impact et Valeurs",
    en: "Impact and Values",
    de: "Wirkung und Werte"
  },
  about_impact_description: {
    fr: "Notre engagement pour un tourisme qui bénéficie à tous : visiteurs, communautés locales et environnement.",
    en: "Our commitment to tourism that benefits everyone: visitors, local communities and the environment.",
    de: "Unser Engagement für einen Tourismus, der allen zugute kommt: Besuchern, lokalen Gemeinschaften und der Umwelt."
  },
  about_heritage_promotion: {
    fr: "Promotion du Patrimoine Local",
    en: "Local Heritage Promotion",
    de: "Förderung des lokalen Erbes"
  },
  about_heritage_promotion_desc: {
    fr: "Mise en valeur des richesses culturelles et historiques de chaque destination de manière interactive.",
    en: "Showcasing the cultural and historical riches of each destination in an interactive way.",
    de: "Interaktive Präsentation der kulturellen und historischen Reichtümer jedes Reiseziels."
  },
  about_local_business: {
    fr: "Soutien aux Commerces Locaux",
    en: "Support for Local Businesses",
    de: "Unterstützung lokaler Unternehmen"
  },
  about_local_business_desc: {
    fr: "Système de partenariats qui génère du trafic qualifié vers les entreprises locales.",
    en: "Partnership system that generates qualified traffic to local businesses.",
    de: "Partnerschaftssystem, das qualifizierten Traffic für lokale Unternehmen generiert."
  },
  about_sustainable_tourism: {
    fr: "Tourisme Durable et Responsable",
    en: "Sustainable and Responsible Tourism",
    de: "Nachhaltiger und verantwortungsvoller Tourismus"
  },
  about_sustainable_tourism_desc: {
    fr: "Promotion de pratiques respectueuses de l'environnement et des communautés locales.",
    en: "Promoting practices that respect the environment and local communities.",
    de: "Förderung von Praktiken, die die Umwelt und lokale Gemeinschaften respektieren."
  },

  // Section 6: Notre Équipe
  about_team_title: {
    fr: "Notre Équipe",
    en: "Our Team",
    de: "Unser Team"
  },
  about_team_description: {
    fr: "Une équipe multidisciplinaire passionnée par l'innovation technologique et l'industrie du tourisme, unie par la vision de transformer la façon dont nous découvrons le monde.",
    en: "A multidisciplinary team passionate about technological innovation and the tourism industry, united by the vision of transforming the way we discover the world.",
    de: "Ein multidisziplinäres Team, das sich für technologische Innovation und die Tourismusbranche begeistert, vereint durch die Vision, die Art und Weise zu transformieren, wie wir die Welt entdecken."
  }
};

// Translations for Contact page
export const contactTranslations = {
  // Page titles
  contact: {
    fr: "Contact",
    en: "Contact", 
    de: "Kontakt"
  },
  contact_subtitle: {
    fr: "Nous sommes là pour vous aider",
    en: "We are here to help",
    de: "Wir sind für Sie da"
  },
  contact_team: {
    fr: "Contactez notre équipe",
    en: "Contact our team",
    de: "Kontaktieren Sie unser Team"
  },
  contact_hero_text: {
    fr: "Une question ? Un problème ? Nous sommes là pour vous accompagner dans votre expérience CIARA",
    en: "A question? A problem? We are here to guide you through your CIARA experience",
    de: "Eine Frage? Ein Problem? Wir sind hier, um Sie bei Ihrer CIARA-Erfahrung zu unterstützen"
  },

  // Button to see all cities
  see_all_cities: {
    fr: "Voir toutes les villes",
    en: "See all cities",
    de: "Alle Städte anzeigen"
  },

  // Social Proof translations
  social_proof: {
    title: {
      fr: "Ils nous font confiance",
      en: "They trust us",
      de: "Sie vertrauen uns"
    },
    testimonials_subtitle: {
      fr: "Découvrez ce que nos utilisateurs pensent de CIARA",
      en: "Discover what our users think about CIARA",
      de: "Entdecken Sie, was unsere Nutzer über CIARA denken"
    },
    partners_subtitle: {
      fr: "Nos partenaires de confiance",
      en: "Our trusted partners",
      de: "Unsere vertrauenswürdigen Partner"
    }
  },

  // Contact cards
  contact_email: {
    fr: "Email",
    en: "Email",
    de: "E-Mail"
  },
  contact_email_response: {
    fr: "Réponse sous 24h",
    en: "Response within 24h",
    de: "Antwort innerhalb von 24h"
  },
  contact_phone: {
    fr: "Téléphone",
    en: "Phone",
    de: "Telefon"
  },
  contact_phone_hours: {
    fr: "Lun-Ven 9h-18h",
    en: "Mon-Fri 9am-6pm",
    de: "Mo-Fr 9-18 Uhr"
  },
  contact_address: {
    fr: "Adresse",
    en: "Address",
    de: "Adresse"
  },
  contact_address_desc: {
    fr: "Siège principal",
    en: "Main office",
    de: "Hauptbüro"
  },
  contact_chat: {
    fr: "Chat en direct",
    en: "Live chat",
    de: "Live-Chat"
  },
  contact_chat_desc: {
    fr: "Assistance immédiate",
    en: "Immediate assistance",
    de: "Sofortige Hilfe"
  },
  contact_chat_availability: {
    fr: "Disponible 24/7",
    en: "Available 24/7",
    de: "Rund um die Uhr verfügbar"
  },
  contact_action: {
    fr: "Contacter",
    en: "Contact",
    de: "Kontaktieren"
  },

  // Hours
  contact_hours_title: {
    fr: "Heures d'ouverture",
    en: "Opening hours",
    de: "Öffnungszeiten"
  },
  contact_hours_weekdays: {
    fr: "Lundi - Vendredi",
    en: "Monday - Friday",
    de: "Montag - Freitag"
  },
  contact_hours_saturday: {
    fr: "Samedi",
    en: "Saturday",
    de: "Samstag"
  },
  contact_hours_sunday: {
    fr: "Dimanche",
    en: "Sunday",
    de: "Sonntag"
  },
  contact_hours_closed: {
    fr: "Fermé",
    en: "Closed",
    de: "Geschlossen"
  },
  contact_chat_247: {
    fr: "Chat 24/7 disponible",
    en: "24/7 chat available",
    de: "24/7 Chat verfügbar"
  },

  // Journey completion modal translations
  journey_completion_congratulations: {
    fr: "🎉 Félicitations !",
    en: "🎉 Congratulations!",
    de: "🎉 Gratulation!"
  },
  journey_completion_finished: {
    fr: "Parcours terminé avec brio !",
    en: "Journey completed brilliantly!",
    de: "Reise brilliant abgeschlossen!"
  },
  journey_completion_evaluate: {
    fr: "Évaluer mon expérience",
    en: "Rate my experience",
    de: "Meine Erfahrung bewerten"
  },
  journey_completion_feedback_help: {
    fr: "Votre avis nous aide à améliorer l'expérience",
    en: "Your feedback helps us improve the experience",
    de: "Ihr Feedback hilft uns, die Erfahrung zu verbessern"
  },
  journey_completion_how_was_experience: {
    fr: "Comment était votre expérience ?",
    en: "How was your experience?",
    de: "Wie war Ihre Erfahrung?"
  },
  journey_completion_your_rating: {
    fr: "Votre note :",
    en: "Your rating:",
    de: "Ihre Bewertung:"
  },
  journey_completion_stars: {
    fr: "étoiles",
    en: "stars", 
    de: "Sterne"
  },
  journey_completion_comment_optional: {
    fr: "Commentaire (optionnel) :",
    en: "Comment (optional):",
    de: "Kommentar (optional):"
  },
  journey_completion_comment_placeholder: {
    fr: "Partagez vos impressions sur ce parcours...",
    en: "Share your impressions about this journey...",
    de: "Teilen Sie Ihre Eindrücke zu dieser Reise..."
  },
  journey_completion_finish_journey: {
    fr: "Terminer le parcours",
    en: "Finish journey",
    de: "Reise beenden"
  },
  journey_completion_skip_rating: {
    fr: "Passer l'évaluation",
    en: "Skip rating",
    de: "Bewertung überspringen"
  },
  journey_completion_finalizing: {
    fr: "Finalisation...",
    en: "Finalizing...",
    de: "Wird abgeschlossen..."
  },
  journey_completion_thank_you: {
    fr: "Merci beaucoup ! 🎊",
    en: "Thank you very much! 🎊",
    de: "Vielen Dank! 🎊"
  },
  journey_completion_rating_saved: {
    fr: "Votre évaluation a été enregistrée et un email de félicitations vous a été envoyé.",
    en: "Your rating has been saved and a congratulations email has been sent to you.",
    de: "Ihre Bewertung wurde gespeichert und eine Gratulations-E-Mail wurde an Sie gesendet."
  },
  journey_completion_create_travel_journal: {
    fr: "Créer mon carnet de voyage",
    en: "Create my travel journal",
    de: "Mein Reisetagebuch erstellen"
  },
  journey_completion_discover_rewards: {
    fr: "Découvrir mes récompenses",
    en: "Discover my rewards",
    de: "Meine Belohnungen entdecken"
  },
  journey_completion_back_to_journeys: {
    fr: "Retour à mes parcours",
    en: "Back to my journeys",
    de: "Zurück zu meinen Reisen"
  },
  journey_completion_generating_journal: {
    fr: "Génération en cours...",
    en: "Generating...",
    de: "Wird generiert..."
  },
  journey_completion_rating_required: {
    fr: "Note requise",
    en: "Rating required",
    de: "Bewertung erforderlich"
  },
  journey_completion_rating_required_desc: {
    fr: "Veuillez donner une note avant de continuer",
    en: "Please provide a rating before continuing",
    de: "Bitte geben Sie eine Bewertung ab, bevor Sie fortfahren"
  },
  journey_completion_rate_first: {
    fr: "Veuillez d'abord évaluer le parcours",
    en: "Please rate the journey first",
    de: "Bitte bewerten Sie zuerst die Reise"
  },
  travel_journal_generated: {
    fr: "Carnet de voyage généré !",
    en: "Travel journal generated!",
    de: "Reisetagebuch erstellt!"
  },
  travel_journal_created_successfully: {
    fr: "Votre carnet personnalisé a été créé avec succès.",
    en: "Your personalized journal has been created successfully.",
    de: "Ihr personalisiertes Tagebuch wurde erfolgreich erstellt."
  },
  travel_journal_generation_error: {
    fr: "Impossible de générer le carnet de voyage.",
    en: "Failed to generate travel journal.",
    de: "Reisetagebuch konnte nicht erstellt werden."
  },
  journey_completed: {
    fr: "Parcours terminé !",
    en: "Journey completed!",
    de: "Reise abgeschlossen!"
  },
  journey_completion_success: {
    fr: "Merci pour votre évaluation de {rating}/5 étoiles !",
    en: "Thank you for your {rating}/5 star rating!",
    de: "Danke für Ihre {rating}/5 Sterne Bewertung!"
  },
  journey_completion_failed: {
    fr: "Impossible de finaliser le parcours",
    en: "Failed to complete journey",
    de: "Reise konnte nicht abgeschlossen werden"
  },

  // Travel journal modal translations
  travel_journal_modal_title: {
    fr: "Votre Carnet de Voyage",
    en: "Your Travel Journal",
    de: "Ihr Reisetagebuch"
  },
  travel_journal_download: {
    fr: "Télécharger le PDF",
    en: "Download PDF",
    de: "PDF herunterladen"
  },
  travel_journal_close: {
    fr: "Fermer",
    en: "Close",
    de: "Schließen"
  },

  // Form
  contact_form_title: {
    fr: "Envoyez-nous un message",
    en: "Send us a message",
    de: "Senden Sie uns eine Nachricht"
  },
  contact_form_subtitle: {
    fr: "Remplissez le formulaire ci-dessous et nous vous répondrons rapidement",
    en: "Fill out the form below and we will get back to you promptly",
    de: "Füllen Sie das untenstehende Formular aus und wir werden uns umgehend bei Ihnen melden"
  },
  contact_form_name: {
    fr: "Nom complet",
    en: "Full name",
    de: "Vollständiger Name"
  },
  contact_form_name_placeholder: {
    fr: "Votre nom",
    en: "Your name",
    de: "Ihr Name"
  },
  contact_form_email: {
    fr: "Email",
    en: "Email",
    de: "E-Mail"
  },
  contact_form_email_placeholder: {
    fr: "votre.email@exemple.com",
    en: "your.email@example.com",
    de: "ihre.email@beispiel.com"
  },
  contact_form_subject: {
    fr: "Sujet",
    en: "Subject",
    de: "Betreff"
  },
  contact_form_subject_placeholder: {
    fr: "Sujet de votre message",
    en: "Subject of your message",
    de: "Betreff Ihrer Nachricht"
  },
  contact_form_priority: {
    fr: "Priorité",
    en: "Priority",
    de: "Priorität"
  },
  contact_priority_low: {
    fr: "Faible",
    en: "Low",
    de: "Niedrig"
  },
  contact_priority_normal: {
    fr: "Normale",
    en: "Normal",
    de: "Normal"
  },
  contact_priority_high: {
    fr: "Élevée",
    en: "High",
    de: "Hoch"
  },
  contact_priority_urgent: {
    fr: "Urgente",
    en: "Urgent",
    de: "Dringend"
  },
  contact_form_message: {
    fr: "Message",
    en: "Message",
    de: "Nachricht"
  },
  contact_form_message_placeholder: {
    fr: "Décrivez votre demande en détail...",
    en: "Describe your request in detail...",
    de: "Beschreiben Sie Ihre Anfrage im Detail..."
  },
  contact_form_sending: {
    fr: "Envoi en cours...",
    en: "Sending...",
    de: "Wird gesendet..."
  },
  contact_form_send: {
    fr: "Envoyer le message",
    en: "Send message",
    de: "Nachricht senden"
  },

  // Legal page
  legal_title: {
    fr: "Mentions légales",
    en: "Legal notice",
    de: "Rechtliche Hinweise"
  },
  legal_subtitle: {
    fr: "Informations juridiques",
    en: "Legal information",
    de: "Rechtliche Informationen"
  },
  legal_mentions: {
    fr: "Mentions Légales",
    en: "Legal Notice",
    de: "Rechtliche Hinweise"
  },
  legal_info_description: {
    fr: "Informations légales et coordonnées de CIARA",
    en: "Legal information and contact details of CIARA",
    de: "Rechtliche Informationen und Kontaktdaten von CIARA"
  },
  legal_company_name: {
    fr: "Raison sociale",
    en: "Company name",
    de: "Firmenname"
  },
  legal_legal_form: {
    fr: "Forme juridique",
    en: "Legal form",
    de: "Rechtsform"
  },
  legal_ide_number: {
    fr: "Numéro IDE",
    en: "IDE number",
    de: "UID-Nummer"
  },
  legal_capital: {
    fr: "Capital social",
    en: "Share capital",
    de: "Aktienkapital"
  },
  legal_headquarters: {
    fr: "Siège social",
    en: "Headquarters",
    de: "Hauptsitz"
  },
  legal_trade_register: {
    fr: "Registre du commerce",
    en: "Trade register",
    de: "Handelsregister"
  },
  legal_vat: {
    fr: "TVA",
    en: "VAT",
    de: "MwSt"
  },
  legal_phone: {
    fr: "Téléphone",
    en: "Phone",
    de: "Telefon"
  },
  legal_email_general: {
    fr: "Email général",
    en: "General email",
    de: "Allgemeine E-Mail"
  },
  legal_support: {
    fr: "Support",
    en: "Support",
    de: "Support"
  },
  legal_specialized_contacts: {
    fr: "Contacts spécialisés",
    en: "Specialized contacts",
    de: "Spezialisierte Kontakte"
  },
  legal_legal_questions: {
    fr: "Questions juridiques",
    en: "Legal questions",
    de: "Rechtliche Fragen"
  },
  legal_data_protection: {
    fr: "Protection des données",
    en: "Data protection",
    de: "Datenschutz"
  },
  legal_partnerships: {
    fr: "Partenariats",
    en: "Partnerships",
    de: "Partnerschaften"
  },
  legal_press: {
    fr: "Presse",
    en: "Press",
    de: "Presse"
  },
  legal_investors: {
    fr: "Investisseurs",
    en: "Investors",
    de: "Investoren"
  },
  legal_careers: {
    fr: "Carrières",
    en: "Careers",
    de: "Karriere"
  },
  legal_hosting_services: {
    fr: "Services d'hébergement",
    en: "Hosting services",
    de: "Hosting-Dienste"
  },
  legal_web_application: {
    fr: "Application web",
    en: "Web application",
    de: "Web-Anwendung"
  },
  legal_database: {
    fr: "Base de données",
    en: "Database",
    de: "Datenbank"
  },
  legal_cdn_services: {
    fr: "CDN et services tiers",
    en: "CDN and third-party services",
    de: "CDN und Drittanbieterdienste"
  },
  legal_images_media: {
    fr: "Images et médias",
    en: "Images and media",
    de: "Bilder und Medien"
  },
  legal_maps: {
    fr: "Cartes",
    en: "Maps",
    de: "Karten"
  },
  legal_analytics: {
    fr: "Analytics",
    en: "Analytics",
    de: "Analytik"
  },
  legal_email: {
    fr: "Email",
    en: "Email",
    de: "E-Mail"
  },
  legal_trademarks: {
    fr: "Marques",
    en: "Trademarks",
    de: "Marken"
  },
  legal_copyright: {
    fr: "Droits d'auteur",
    en: "Copyright",
    de: "Urheberrecht"
  },
  legal_licenses: {
    fr: "Licences",
    en: "Licenses",
    de: "Lizenzen"
  },
  legal_european_compliance: {
    fr: "Conformité européenne",
    en: "European compliance",
    de: "Europäische Konformität"
  },
  legal_competent_courts: {
    fr: "Tribunaux compétents",
    en: "Competent courts",
    de: "Zuständige Gerichte"
  },
  legal_switzerland: {
    fr: "Suisse",
    en: "Switzerland",
    de: "Schweiz"
  },
  legal_france: {
    fr: "France",
    en: "France",
    de: "Frankreich"
  },

  // Top Explorers section
  top_explorers: {
    fr: "Top Explorateurs",
    en: "Top Explorers", 
    de: "Top-Entdecker"
  },
  first_explorer: {
    fr: "Soyez le premier !",
    en: "Be the first!",
    de: "Seien Sie der Erste!"
  },
  top_explorers_empty_logged_out: {
    fr: "Découvrez la ville et soyez parmi les premiers explorateurs !",
    en: "Discover the city and be among the first explorers!",
    de: "Entdecken Sie die Stadt und seien Sie unter den ersten Entdeckern!"
  },
  top_explorers_empty_logged_in: {
    fr: "Commencez votre exploration pour apparaître dans le classement !",
    en: "Start your exploration to appear in the rankings!",
    de: "Beginnen Sie Ihre Erkundung, um in der Rangliste zu erscheinen!"
  },
  start_exploring: {
    fr: "Commencer à explorer",
    en: "Start exploring",
    de: "Mit dem Erkunden beginnen"
  },
  login_to_compete: {
    fr: "Se connecter pour participer",
    en: "Login to compete",
    de: "Anmelden um teilzunehmen"
  },

  // FAQ Translations
  // FAQ categories
  faq_category_usage: {
    fr: "Utilisation",
    en: "Usage",
    de: "Nutzung"
  },
  faq_category_rewards: {
    fr: "Récompenses",
    en: "Rewards",
    de: "Belohnungen"
  },
  faq_category_technical: {
    fr: "Technique",
    en: "Technical",
    de: "Technisch"
  },
  faq_category_ai: {
    fr: "Intelligence Artificielle",
    en: "Artificial Intelligence",
    de: "Künstliche Intelligenz"
  },

  // FAQ subtitle
  faq_subtitle_new: {
    fr: "Trouvez rapidement les réponses à vos questions les plus fréquentes",
    en: "Quickly find answers to your most frequently asked questions",
    de: "Finden Sie schnell Antworten auf Ihre häufigsten Fragen"
  },

  // Usage questions
  faq_usage_q1: {
    fr: "Comment commencer un parcours ?",
    en: "How do I start a journey?",
    de: "Wie beginne ich eine Tour?"
  },
  faq_usage_a1: {
    fr: "Pour commencer un parcours, rendez-vous sur la page d'une destination, choisissez un parcours qui vous intéresse et cliquez sur 'Commencer le Parcours'. Vous devez être connecté à votre compte pour participer.",
    en: "To start a journey, go to a destination page, choose a journey that interests you and click 'Start Journey'. You must be logged in to your account to participate.",
    de: "Um eine Tour zu beginnen, gehen Sie zu einer Zielseite, wählen Sie eine Tour, die Sie interessiert, und klicken Sie auf 'Tour starten'. Sie müssen in Ihrem Konto angemeldet sein, um teilzunehmen."
  },
  faq_usage_q2: {
    fr: "Comment gagner des points ?",
    en: "How do I earn points?",
    de: "Wie verdiene ich Punkte?"
  },
  faq_usage_a2: {
    fr: "Vous gagnez des points en complétant les étapes des parcours, en répondant correctement aux quiz, et en validant votre présence aux points d'intérêt. Des bonus sont attribués pour les réponses rapides et parfaites.",
    en: "You earn points by completing journey steps, answering quiz questions correctly, and validating your presence at points of interest. Bonuses are awarded for quick and perfect answers.",
    de: "Sie verdienen Punkte, indem Sie Tourenschritte abschließen, Quiz-Fragen richtig beantworten und Ihre Anwesenheit an Sehenswürdigkeiten validieren. Boni werden für schnelle und perfekte Antworten vergeben."
  },
  faq_usage_q3: {
    fr: "Que faire si la géolocalisation ne fonctionne pas ?",
    en: "What should I do if geolocation doesn't work?",
    de: "Was soll ich tun, wenn die Geolokalisierung nicht funktioniert?"
  },
  faq_usage_a3: {
    fr: "Assurez-vous d'avoir autorisé l'accès à la géolocalisation dans votre navigateur. Si le problème persiste, essayez de rafraîchir la page ou de redémarrer votre navigateur.",
    en: "Make sure you have authorized geolocation access in your browser. If the problem persists, try refreshing the page or restarting your browser.",
    de: "Stellen Sie sicher, dass Sie den Zugriff auf die Geolokalisierung in Ihrem Browser autorisiert haben. Wenn das Problem weiterhin besteht, versuchen Sie, die Seite zu aktualisieren oder Ihren Browser neu zu starten."
  },

  // Rewards questions
  faq_rewards_q1: {
    fr: "Comment utiliser mes points ?",
    en: "How do I use my points?",
    de: "Wie verwende ich meine Punkte?"
  },
  faq_rewards_a1: {
    fr: "Vos points peuvent être échangés contre des récompenses chez nos partenaires locaux. Rendez-vous dans la section 'Récompenses' pour voir les offres disponibles et générer vos codes de réduction.",
    en: "Your points can be exchanged for rewards at our local partners. Go to the 'Rewards' section to see available offers and generate your discount codes.",
    de: "Ihre Punkte können gegen Belohnungen bei unseren lokalen Partnern eingetauscht werden. Gehen Sie zum Abschnitt 'Belohnungen', um verfügbare Angebote zu sehen und Ihre Rabattcodes zu generieren."
  },
  faq_rewards_q2: {
    fr: "Les points expirent-ils ?",
    en: "Do points expire?",
    de: "Laufen die Punkte ab?"
  },
  faq_rewards_a2: {
    fr: "Non, vos points CIARA n'expirent jamais. Cependant, certaines récompenses peuvent avoir des dates limite d'utilisation.",
    en: "No, your CIARA points never expire. However, some rewards may have usage expiration dates.",
    de: "Nein, Ihre CIARA-Punkte laufen nie ab. Einige Belohnungen können jedoch Verwendungsfristen haben."
  },
  faq_rewards_q3: {
    fr: "Comment connaître mon niveau ?",
    en: "How can I see my level?",
    de: "Wie kann ich mein Level sehen?"
  },
  faq_rewards_a3: {
    fr: "Votre niveau est visible dans votre profil et dépend du nombre total de points que vous avez gagnés. Chaque niveau débloque de nouveaux avantages.",
    en: "Your level is visible in your profile and depends on the total number of points you have earned. Each level unlocks new benefits.",
    de: "Ihr Level ist in Ihrem Profil sichtbar und hängt von der Gesamtzahl der von Ihnen verdienten Punkte ab. Jedes Level schaltet neue Vorteile frei."
  },

  // Technical questions
  faq_technical_q1: {
    fr: "L'application fonctionne-t-elle hors ligne ?",
    en: "Does the application work offline?",
    de: "Funktioniert die Anwendung offline?"
  },
  faq_technical_a1: {
    fr: "Certaines fonctionnalités de base sont disponibles hors ligne, mais vous aurez besoin d'une connexion internet pour valider les étapes et gagner des points.",
    en: "Some basic features are available offline, but you will need an internet connection to validate steps and earn points.",
    de: "Einige grundlegende Funktionen sind offline verfügbar, aber Sie benötigen eine Internetverbindung, um Schritte zu validieren und Punkte zu sammeln."
  },
  faq_technical_q2: {
    fr: "Sur quels appareils puis-je utiliser CIARA ?",
    en: "On which devices can I use CIARA?",
    de: "Auf welchen Geräten kann ich CIARA verwenden?"
  },
  faq_technical_a2: {
    fr: "CIARA fonctionne sur tous les navigateurs web modernes, smartphones, tablettes et ordinateurs. Aucune installation n'est requise.",
    en: "CIARA works on all modern web browsers, smartphones, tablets and computers. No installation required.",
    de: "CIARA funktioniert auf allen modernen Webbrowsern, Smartphones, Tablets und Computern. Keine Installation erforderlich."
  },
  faq_technical_q3: {
    fr: "Comment signaler un problème ?",
    en: "How do I report a problem?",
    de: "Wie melde ich ein Problem?"
  },
  faq_technical_a3: {
    fr: "Vous pouvez nous contacter via le chat en bas à droite de la page ou par email. Nous nous efforçons de répondre dans les 24 heures.",
    en: "You can contact us via the chat at the bottom right of the page or by email. We strive to respond within 24 hours.",
    de: "Sie können uns über den Chat unten rechts auf der Seite oder per E-Mail kontaktieren. Wir bemühen uns, innerhalb von 24 Stunden zu antworten."
  },

  // AI questions
  faq_ai_q1: {
    fr: "Comment fonctionne l'assistant IA de CIARA ?",
    en: "How does the CIARA AI assistant work?",
    de: "Wie funktioniert der CIARA KI-Assistent?"
  },
  faq_ai_a1: {
    fr: "L'assistant IA CIARA utilise l'intelligence artificielle avancée (GPT-4) pour vous offrir une aide contextuelle personnalisée. Il analyse votre position, votre parcours actuel, votre profil utilisateur et vos préférences pour vous donner des conseils adaptés, des informations historiques sur les lieux que vous visitez, et des recommandations personnalisées.",
    en: "The CIARA AI assistant uses advanced artificial intelligence (GPT-4) to provide you with personalized contextual help. It analyzes your position, current journey, user profile and preferences to give you tailored advice, historical information about places you visit, and personalized recommendations.",
    de: "Der CIARA KI-Assistent nutzt fortschrittliche künstliche Intelligenz (GPT-4), um Ihnen personalisierte kontextuelle Hilfe zu bieten. Er analysiert Ihre Position, aktuelle Tour, Ihr Benutzerprofil und Ihre Vorlieben, um Ihnen maßgeschneiderte Ratschläge, historische Informationen über Orte, die Sie besuchen, und personalisierte Empfehlungen zu geben."
  },
  faq_ai_q2: {
    fr: "Sur quelles données se base l'IA pour ses recommandations ?",
    en: "What data does the AI base its recommendations on?",
    de: "Auf welche Daten stützt die KI ihre Empfehlungen?"
  },
  faq_ai_a2: {
    fr: "L'IA de CIARA se base sur plusieurs sources : votre profil utilisateur (niveau, points, intérêts), votre localisation actuelle, votre historique de parcours, les données des points d'intérêt locaux dans notre base de données, les conditions météorologiques, et les patterns d'autres utilisateurs similaires. Toutes ces données sont traitées de manière sécurisée et respectueuse de votre vie privée.",
    en: "CIARA's AI is based on several sources: your user profile (level, points, interests), your current location, your journey history, local points of interest data in our database, weather conditions, and patterns from other similar users. All this data is processed securely and with respect for your privacy.",
    de: "CIARAs KI basiert auf mehreren Quellen: Ihr Benutzerprofil (Level, Punkte, Interessen), Ihr aktueller Standort, Ihre Tourenhistorie, lokale Sehenswürdigkeiten in unserer Datenbank, Wetterbedingungen und Muster von anderen ähnlichen Benutzern. All diese Daten werden sicher und unter Wahrung Ihrer Privatsphäre verarbeitet."
  },
  faq_ai_q3: {
    fr: "L'IA peut-elle créer des parcours personnalisés ?",
    en: "Can the AI create personalized journeys?",
    de: "Kann die KI personalisierte Touren erstellen?"
  },
  faq_ai_a3: {
    fr: "Oui ! Notre système d'IA peut générer automatiquement des parcours adaptés à vos préférences, votre condition physique, le temps dont vous disposez et vos centres d'intérêt. Elle optimise le trajet, sélectionne les étapes les plus pertinentes et adapte la difficulté selon votre profil.",
    en: "Yes! Our AI system can automatically generate journeys adapted to your preferences, physical condition, available time and interests. It optimizes the route, selects the most relevant steps and adapts the difficulty according to your profile.",
    de: "Ja! Unser KI-System kann automatisch Touren generieren, die an Ihre Vorlieben, körperliche Verfassung, verfügbare Zeit und Interessen angepasst sind. Sie optimiert die Route, wählt die relevantesten Schritte aus und passt die Schwierigkeit entsprechend Ihrem Profil an."
  },
  faq_ai_q4: {
    fr: "Comment l'assistant IA protège-t-il mes données ?",
    en: "How does the AI assistant protect my data?",
    de: "Wie schützt der KI-Assistent meine Daten?"
  },
  faq_ai_a4: {
    fr: "Votre vie privée est notre priorité. L'assistant IA traite vos données localement quand possible, utilise le chiffrement pour toutes les communications, ne stocke que les informations essentielles avec votre consentement, et respecte strictement le RGPD. Vous pouvez à tout moment consulter, modifier ou supprimer vos données.",
    en: "Your privacy is our priority. The AI assistant processes your data locally when possible, uses encryption for all communications, only stores essential information with your consent, and strictly respects GDPR. You can view, modify or delete your data at any time.",
    de: "Ihre Privatsphäre ist unsere Priorität. Der KI-Assistent verarbeitet Ihre Daten wenn möglich lokal, verwendet Verschlüsselung für alle Kommunikationen, speichert nur wesentliche Informationen mit Ihrer Zustimmung und respektiert strikt die DSGVO. Sie können Ihre Daten jederzeit einsehen, ändern oder löschen."
  },
  faq_ai_q5: {
    fr: "L'IA peut-elle fonctionner dans plusieurs langues ?",
    en: "Can the AI work in multiple languages?",
    de: "Kann die KI in mehreren Sprachen arbeiten?"
  },
  faq_ai_a5: {
    fr: "Oui, l'assistant IA CIARA supporte plusieurs langues et s'adapte automatiquement à vos préférences linguistiques. Il peut vous fournir des informations historiques, des recommandations et de l'aide dans votre langue préférée.",
    en: "Yes, the CIARA AI assistant supports multiple languages and automatically adapts to your language preferences. It can provide you with historical information, recommendations and help in your preferred language.",
    de: "Ja, der CIARA KI-Assistent unterstützt mehrere Sprachen und passt sich automatisch an Ihre Sprachvorlieben an. Er kann Ihnen historische Informationen, Empfehlungen und Hilfe in Ihrer bevorzugten Sprache bereitstellen."
  },

  // Common translations
  common: {
    login_required: {
      fr: "Connexion requise",
      en: "Login required",
      de: "Anmeldung erforderlich"
    },
    back: {
      fr: "Retour",
      en: "Back",
      de: "Zurück"
    },
    loading: {
      fr: "Chargement...",
      en: "Loading...",
      de: "Laden..."
    },
    retry: {
      fr: "Réessayer",
      en: "Retry",
      de: "Wiederholen"
    },
    refresh: {
      fr: "Actualiser",
      en: "Refresh",
      de: "Aktualisieren"
    },
    discover_rewards: {
      fr: "Découvrir les récompenses",
      en: "Discover rewards",
      de: "Belohnungen entdecken"
    },
    my_rewards: {
      fr: "Mes récompenses",
      en: "My rewards",
      de: "Meine Belohnungen"
    }
  },

  // Toast translations
  toast: {
    error: {
      title: {
        fr: "Erreur",
        en: "Error",
        de: "Fehler"
      }
    },
    success: {
      title: {
        fr: "Succès",
        en: "Success",
        de: "Erfolg"
      }
    }
  },

  // Partner translations
  partner: {
    location_unavailable: {
      fr: "Localisation non disponible",
      en: "Location unavailable",
      de: "Standort nicht verfügbar"
    },
    location_available: {
      fr: "Localisation disponible",
      en: "Location available", 
      de: "Standort verfügbar"
    },
    locate: {
      fr: "Localiser",
      en: "Locate",
      de: "Lokalisieren"
    }
  },

  // Rewards page translations
  rewards: {
    // Types de récompenses
    type_discount: {
      fr: "Réduction",
      en: "Discount", 
      de: "Rabatt"
    },
    type_free_item: {
      fr: "Gratuit",
      en: "Free",
      de: "Kostenlos"
    },
    type_upgrade: {
      fr: "Upgrade",
      en: "Upgrade",
      de: "Upgrade"
    },
    type_experience: {
      fr: "Expérience",
      en: "Experience",
      de: "Erlebnis"
    },
    type_freebie: {
      fr: "Cadeau",
      en: "Gift",
      de: "Geschenk"
    },
    type_default: {
      fr: "Récompense",
      en: "Reward",
      de: "Belohnung"
    },
    
    // Validity and usage
    valid_days: {
      fr: "Valable {days} jours",
      en: "Valid for {days} days",
      de: "Gültig für {days} Tage"
    },
    usage_count: {
      fr: "{used}/{total} utilisé",
      en: "{used}/{total} used",
      de: "{used}/{total} verwendet"
    },
    
    // Location
    location_available: {
      fr: "Localisation disponible",
      en: "Location available",
      de: "Standort verfügbar"
    },
    locate: {
      fr: "Localiser",
      en: "Locate",
      de: "Lokalisieren"
    },
    
    // Error messages
    login_required: {
      fr: "Vous devez être connecté pour échanger une récompense",
      en: "You must be logged in to redeem a reward",
      de: "Sie müssen angemeldet sein, um eine Belohnung einzulösen"
    },
    redemption_limit_reached: {
      fr: "Cette récompense ne peut plus être échangée (limites atteintes)",
      en: "This reward can no longer be redeemed (limits reached)",
      de: "Diese Belohnung kann nicht mehr eingelöst werden (Limits erreicht)"
    },
    used_success: {
      fr: "Récompense utilisée avec succès !",
      en: "Reward used successfully!",
      de: "Belohnung erfolgreich verwendet!"
    },
    use_error: {
      fr: "Impossible d'utiliser la récompense",
      en: "Unable to use the reward",
      de: "Belohnung konnte nicht verwendet werden"
    },
    
    // Voucher specific translations
    voucher: {
      expires_at: {
        fr: "Expire le",
        en: "Expires on",
        de: "Läuft ab am"
      },
      expires_in: {
        fr: "Expire dans {days} jours",
        en: "Expires in {days} days", 
        de: "Läuft in {days} Tagen ab"
      },
      usage_stats: {
        fr: "Utilisé {used}/{total} fois",
        en: "Used {used}/{total} times",
        de: "Verwendet {used}/{total} mal"
      }
    }
  },
  
  // Profile specific translations
  profile: {
    save_changes: {
      fr: "Sauvegarder les modifications",
      en: "Save changes",
      de: "Änderungen speichern"
    },
    cancel: {
      fr: "Annuler",
      en: "Cancel",
      de: "Abbrechen"
    },
    change_password: {
      fr: "Changer le mot de passe",
      en: "Change password",
      de: "Passwort ändern"
    },
    hide_password_change: {
      fr: "Masquer changement mot de passe",
      en: "Hide password change",
      de: "Passwort-Änderung ausblenden"
    },
    edit_to_change_password: {
      fr: "Modifiez pour changer votre mot de passe",
      en: "Edit to change your password",
      de: "Bearbeiten um Ihr Passwort zu ändern"
    },
    full_name: {
      fr: "Nom complet",
      en: "Full name",
      de: "Vollständiger Name"
    },
    profile_photo: {
      fr: "Photo de profil",
      en: "Profile photo",
      de: "Profilbild"
    },
    preferences: {
      fr: "Préférences",
      en: "Preferences",
      de: "Einstellungen"
    },
    fitness_level: {
      fr: "Niveau de forme physique",
      en: "Fitness level",
      de: "Fitness-Level"
    },
    fitness_scale: {
      fr: "1 = Sédentaire, 5 = Très sportif",
      en: "1 = Sedentary, 5 = Very athletic",
      de: "1 = Sitzend, 5 = Sehr sportlich"
    },
    preferred_languages: {
      fr: "Langues préférées",
      en: "Preferred languages",
      de: "Bevorzugte Sprachen"
    },
    select_language: {
      fr: "Sélectionnez votre langue",
      en: "Select your language",
      de: "Wählen Sie Ihre Sprache"
    },
    confirm_email: {
      fr: "Confirmer",
      en: "Confirm",
      de: "Bestätigen"
    },
    saving: {
      fr: "Sauvegarde...",
      en: "Saving...",
      de: "Speichern..."
    }
  },

  // Password change specific translations
  password: {
    new_password: {
      fr: "Nouveau mot de passe",
      en: "New password",
      de: "Neues Passwort"
    },
    confirm_new_password: {
      fr: "Confirmer le nouveau mot de passe",
      en: "Confirm new password",
      de: "Neues Passwort bestätigen"
    },
    enter_new_password: {
      fr: "Entrez votre nouveau mot de passe",
      en: "Enter your new password",
      de: "Geben Sie Ihr neues Passwort ein"
    },
    update_password: {
      fr: "Mettre à jour le mot de passe",
      en: "Update password",
      de: "Passwort aktualisieren"
    },
    updating: {
      fr: "Mise à jour...",
      en: "Updating...",
      de: "Aktualisierung..."
    },
    password_too_short: {
      fr: "Le mot de passe doit contenir au moins 6 caractères",
      en: "Password must be at least 6 characters long",
      de: "Das Passwort muss mindestens 6 Zeichen lang sein"
    },
    password_updated_successfully: {
      fr: "Mot de passe mis à jour avec succès",
      en: "Password updated successfully",
      de: "Passwort erfolgreich aktualisiert"
    },
    password_update_error: {
      fr: "Erreur lors de la mise à jour du mot de passe",
      en: "Error updating password",
      de: "Fehler beim Aktualisieren des Passworts"
    },
    passwords_not_match: {
      fr: "Les mots de passe ne correspondent pas",
      en: "Passwords do not match",
      de: "Passwörter stimmen nicht überein"
    }
  },

  // Merge navigation and cookies translations
  ...navigationTranslations,
  ...cookiesTranslations
};

// Export the complete translations object
export const translations = {
  ...navigationTranslations,
  ...contactTranslations,
  ...cookiesTranslations,
  // Footer translations
  footer_company_description: {
    fr: "Découvrez les destinations avec des parcours gamifiés et des expériences interactives.",
    en: "Discover destinations with gamified routes and interactive experiences.",
    de: "Entdecken Sie Reiseziele mit gamifizierten Routen und interaktiven Erlebnissen."
  },
  footer_quick_links: {
    fr: "Liens rapides",
    en: "Quick Links",
    de: "Schnellzugriff"
  },
  footer_support: {
    fr: "Support",
    en: "Support",
    de: "Support"
  },
  footer_legal: {
    fr: "Légal",
    en: "Legal",
    de: "Rechtliches"
  },
  footer_rights: {
    fr: "Tous droits réservés.",
    en: "All rights reserved.",
    de: "Alle Rechte vorbehalten."
  },
    // Journey translations
  journey: {
    step: {
      completed: {
        fr: "Étape terminée !",
        en: "Step completed!",
        de: "Schritt abgeschlossen!"
      },
      validating: {
        fr: "Validation en cours...",
        en: "Validating...",
        de: "Validierung läuft..."
      },
      arrived: {
        fr: "Je suis arrivé(e)",
        en: "I have arrived",
        de: "Ich bin angekommen"
      },
      activate_location: {
        fr: "Activer la géolocalisation",
        en: "Activate location",
        de: "Standort aktivieren"
      },
      distance: {
        fr: "Distance",
        en: "Distance",
        de: "Entfernung"
      },
      complete_route: {
        fr: "Parcours complet",
        en: "Complete route", 
        de: "Vollständige Route"
      },
      your_path_to_first: {
        fr: "Votre trajet vers la première étape",
        en: "Your path to the first step",
        de: "Ihr Weg zum ersten Schritt"
      },
      planned_route: {
        fr: "Parcours planifié",
        en: "Planned route",
        de: "Geplante Route"
      }
    }
  },
  
    // Common navigation items used in footer
  our_cities: {
    fr: "Nos villes",
    en: "Our cities",
    de: "Unsere Städte"
  },
  rewards: {
    fr: "Récompenses",
    en: "Rewards",
    de: "Belohnungen"
  },
  my_journeys: {
    fr: "Mes parcours",
    en: "My journeys",
    de: "Meine Routen"
  },
  profile: {
    fr: "Profil",
    en: "Profile",
    de: "Profil"
  },
  faq: {
    fr: "FAQ",
    en: "FAQ",
    de: "FAQ"
  },
  contact_us: {
    fr: "Nous contacter",
    en: "Contact us",
    de: "Kontakt"
  },
  privacy: {
    fr: "Confidentialité",
    en: "Privacy",
    de: "Datenschutz"
  },
  terms: {
    fr: "Conditions",
    en: "Terms",
    de: "Bedingungen"
  },
  cookies: {
    fr: "Cookies",
    en: "Cookies",
    de: "Cookies"
  },
  legal: {
    fr: "Mentions légales",
    en: "Legal",
    de: "Rechtliches"
  },
  
  // Journey completion translations
  journey_completion_congratulations: {
    fr: "Félicitations !",
    en: "Congratulations!",
    de: "Gratulation!"
  },
  journey_completion_finished: {
    fr: "Vous avez terminé votre parcours !",
    en: "You have completed your journey!",
    de: "Sie haben Ihre Route abgeschlossen!"
  },
  journey_completion_evaluate: {
    fr: "Évaluer le parcours",
    en: "Evaluate the journey",
    de: "Route bewerten"
  },
  journey_completion_feedback_help: {
    fr: "Votre avis nous aide à améliorer l'expérience",
    en: "Your feedback helps us improve the experience",
    de: "Ihr Feedback hilft uns, das Erlebnis zu verbessern"
  },
  journey_completion_how_was_experience: {
    fr: "Comment était votre expérience ?",
    en: "How was your experience?",
    de: "Wie war Ihr Erlebnis?"
  },
  journey_completion_your_rating: {
    fr: "Votre note",
    en: "Your rating",
    de: "Ihre Bewertung"
  },
  journey_completion_stars: {
    fr: "étoiles",
    en: "stars",
    de: "Sterne"
  },
  journey_completion_comment_optional: {
    fr: "Commentaire (optionnel)",
    en: "Comment (optional)",
    de: "Kommentar (optional)"
  },
  journey_completion_comment_placeholder: {
    fr: "Partagez votre expérience...",
    en: "Share your experience...",
    de: "Teilen Sie Ihr Erlebnis..."
  },
  journey_completion_finish_journey: {
    fr: "Terminer le parcours",
    en: "Finish journey",
    de: "Route beenden"
  },
  journey_completion_finalizing: {
    fr: "Finalisation...",
    en: "Finalizing...",
    de: "Finalisierung..."
  },
  journey_completion_skip_rating: {
    fr: "Ignorer l'évaluation",
    en: "Skip rating",
    de: "Bewertung überspringen"
  },
  journey_completion_thank_you: {
    fr: "Merci pour votre évaluation !",
    en: "Thank you for your rating!",
    de: "Vielen Dank für Ihre Bewertung!"
  },
  journey_completion_rating_saved: {
    fr: "Votre évaluation a été enregistrée",
    en: "Your rating has been saved",
    de: "Ihre Bewertung wurde gespeichert"
  },
  journey_completion_create_travel_journal: {
    fr: "Créer un carnet de voyage",
    en: "Create travel journal",
    de: "Reisetagebuch erstellen"
  },
  journey_completion_generating_journal: {
    fr: "Génération du carnet...",
    en: "Generating journal...",
    de: "Tagebuch wird erstellt..."
  },
  journey_completion_discover_rewards: {
    fr: "Découvrir les récompenses",
    en: "Discover rewards",
    de: "Belohnungen entdecken"
  },
  journey_completion_back_to_journeys: {
    fr: "Retour aux parcours",
    en: "Back to journeys",
    de: "Zurück zu den Routen"
  },
  
  // Travel journal translations
  travel_journal_modal_title: {
    fr: "Votre carnet de voyage",
    en: "Your travel journal",
    de: "Ihr Reisetagebuch"
  },
  travel_journal_download: {
    fr: "Télécharger",
    en: "Download",
    de: "Herunterladen"
  },
  travel_journal_close: {
    fr: "Fermer",
    en: "Close",
    de: "Schließen"
  },
  travel_journal_generated: {
    fr: "Carnet généré !",
    en: "Journal generated!",
    de: "Tagebuch erstellt!"
  },
  travel_journal_created_successfully: {
    fr: "Votre carnet de voyage a été créé avec succès",
    en: "Your travel journal has been created successfully",
    de: "Ihr Reisetagebuch wurde erfolgreich erstellt"
  },
  travel_journal_pdf_downloaded: {
    fr: "Votre carnet de voyage PDF a été téléchargé avec succès",
    en: "Your travel journal PDF has been downloaded successfully", 
    de: "Ihr Reisetagebuch-PDF wurde erfolgreich heruntergeladen"
  },
  travel_journal_html_downloaded: {
    fr: "Votre carnet de voyage HTML a été téléchargé avec succès",
    en: "Your travel journal HTML has been downloaded successfully",
    de: "Ihr Reisetagebuch-HTML wurde erfolgreich heruntergeladen"
  },
  travel_journal_generation_error: {
    fr: "Erreur lors de la génération du carnet de voyage",
    en: "Error generating travel journal",
    de: "Fehler beim Erstellen des Reisetagebuchs"
  },
  
  // Additional completion status translations
  completed_on: {
    fr: "Terminé le",
    en: "Completed on",
    de: "Abgeschlossen am"
  },
  points_earned: {
    fr: "Points gagnés",
    en: "Points earned",
    de: "Punkte erhalten"
  },
  your_comment: {
    fr: "Votre commentaire",
    en: "Your comment",
    de: "Ihr Kommentar"
  },
  travel_journal_button: {
    fr: "Carnet de voyage",
    en: "Travel journal",
    de: "Reisetagebuch"
  },
  
  // Journey completion success
  journey_completed: {
    fr: "Parcours terminé !",
    en: "Journey completed!",
    de: "Route abgeschlossen!"
  },
  journey_completion_success: {
    fr: "Votre évaluation de {rating} étoiles a été enregistrée",
    en: "Your {rating}-star rating has been saved",
    de: "Ihre {rating}-Sterne-Bewertung wurde gespeichert"
  },
  journey_completion_failed: {
    fr: "Erreur lors de l'enregistrement de votre évaluation",
    en: "Error saving your rating",
    de: "Fehler beim Speichern Ihrer Bewertung"
  },
  journey_completion_rating_required: {
    fr: "Note requise",
    en: "Rating required",
    de: "Bewertung erforderlich"
  },
  journey_completion_rating_required_desc: {
    fr: "Veuillez donner une note avant de continuer",
    en: "Please provide a rating before continuing",
    de: "Bitte geben Sie eine Bewertung ab, bevor Sie fortfahren"
  },
  journey_completion_rate_first: {
    fr: "Veuillez d'abord évaluer votre parcours",
    en: "Please rate your journey first",
    de: "Bitte bewerten Sie Ihre Route zuerst"
  },
  
  // Password reset with Magic Link translations
  magic_link_sent: {
    fr: "Lien magique envoyé !",
    en: "Magic Link sent!",
    de: "Magic Link gesendet!"
  },
  check_email_magic_link: {
    fr: "Vérifiez votre boîte email et cliquez sur le lien magique pour vous connecter.",
    en: "Check your email and click the magic link to log in.",
    de: "Überprüfen Sie Ihre E-Mails und klicken Sie auf den Magic Link zum Anmelden."
  },
  cannot_send_magic_link: {
    fr: "Impossible d'envoyer le lien magique. Veuillez réessayer.",
    en: "Unable to send magic link. Please try again.",
    de: "Magic Link konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
  },
  
  // Password change translations
  change_password: {
    fr: "Changer le mot de passe",
    en: "Change password",
    de: "Passwort ändern"
  },
  new_password: {
    fr: "Nouveau mot de passe",
    en: "New password",
    de: "Neues Passwort"
  },
  enter_new_password: {
    fr: "Saisissez votre nouveau mot de passe",
    en: "Enter your new password",
    de: "Geben Sie Ihr neues Passwort ein"
  },
  confirm_new_password: {
    fr: "Confirmer le nouveau mot de passe",
    en: "Confirm new password",
    de: "Neues Passwort bestätigen"
  },
  update_password: {
    fr: "Mettre à jour le mot de passe",
    en: "Update password",
    de: "Passwort aktualisieren"
  },
  password_updated_successfully: {
    fr: "Mot de passe mis à jour avec succès",
    en: "Password updated successfully",
    de: "Passwort erfolgreich aktualisiert"
  },
  password_update_error: {
    fr: "Erreur lors de la mise à jour du mot de passe",
    en: "Error updating password",
    de: "Fehler beim Aktualisieren des Passworts"
  },
  password_too_short: {
    fr: "Le mot de passe doit contenir au moins 6 caractères",
    en: "Password must be at least 6 characters long",
    de: "Das Passwort muss mindestens 6 Zeichen lang sein"
  },
  updating: {
    fr: "Mise à jour...",
    en: "Updating...",
    de: "Aktualisierung..."
  },
  
  // Magic Link modal translations
  magic_link_login: {
    fr: "Connexion avec Magic Link",
    en: "Magic Link Login",
    de: "Magic Link Anmeldung"
  },
  magic_link_instruction: {
    fr: "Entrez votre adresse email et nous vous enverrons un lien magique pour vous connecter automatiquement. Vous pourrez ensuite changer votre mot de passe dans l'espace de votre Profile.",
    en: "Enter your email address and we'll send you a Magic Link to log in automatically. You can then change your password in your Profile area.",
    de: "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Magic Link zum automatischen Anmelden. Sie können dann Ihr Passwort in Ihrem Profil-Bereich ändern."
  },
  send_magic_link: {
    fr: "Envoyer le lien magique",
    en: "Send Magic Link",
    de: "Magic Link senden"
  },
  email_address: {
    fr: "Adresse email",
    en: "Email address",
    de: "E-Mail-Adresse"
  },
  
  // Profile-specific translations
  hide_password_change: {
    fr: "Masquer le changement de mot de passe",
    en: "Hide password change",
    de: "Passwort-Änderung ausblenden"
  },
  show_password_change: {
    fr: "Afficher le changement de mot de passe",
    en: "Show password change",
    de: "Passwort-Änderung anzeigen"
  },
  language_preferences: {
    fr: "Préférences de langue",
    en: "Language preferences",
    de: "Spracheinstellungen"
  },
  interface_language: {
    fr: "Langue de l'interface",
    en: "Interface language",
    de: "Oberflächensprache"
  },
  content_languages: {
    fr: "Langues de contenu préférées",
    en: "Preferred content languages",
    de: "Bevorzugte Inhaltssprachen"
  },
  language_note: {
    fr: "La langue sélectionnée sera utilisée pour l'interface et le contenu des parcours. Vous pouvez changer de langue à tout moment.",
    en: "The selected language will be used for the interface and journey content. You can change the language at any time.",
    de: "Die ausgewählte Sprache wird für die Benutzeroberfläche und den Inhalt der Reisen verwendet. Sie können die Sprache jederzeit ändern."
  }
};
