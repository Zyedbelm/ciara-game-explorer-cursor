import { Language } from '@/contexts/LanguageContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const adminTranslations = {
  // Dashboard
  'admin.dashboard.title': {
    fr: 'Dashboard Administration',
    en: 'Administration Dashboard',
    de: 'Verwaltungs-Dashboard'
  },
  'admin.dashboard.overview': {
    fr: 'Vue d\'ensemble',
    en: 'Overview',
    de: 'Übersicht'
  },
  'admin.dashboard.users': {
    fr: 'Utilisateurs',
    en: 'Users',
    de: 'Benutzer'
  },
  'admin.dashboard.content': {
    fr: 'Contenu',
    en: 'Content',
    de: 'Inhalt'
  },
  'admin.dashboard.analytics': {
    fr: 'Analytics',
    en: 'Analytics',
    de: 'Analytik'
  },
  'admin.dashboard.notifications': {
    fr: 'Notifications',
    en: 'Notifications',
    de: 'Benachrichtigungen'
  },
  'admin.dashboard.settings': {
    fr: 'Paramètres',
    en: 'Settings',
    de: 'Einstellungen'
  },

  // Journey Creator
  'admin.journey.create.title': {
    fr: 'Créer un Nouveau Parcours',
    en: 'Create New Journey',
    de: 'Neue Route erstellen'
  },
  'admin.journey.edit.title': {
    fr: 'Modifier le Parcours',
    en: 'Edit Journey',
    de: 'Route bearbeiten'
  },
  'admin.journey.form.basic_info': {
    fr: 'Informations de Base',
    en: 'Basic Information',
    de: 'Grundinformationen'
  },
  'admin.journey.form.name': {
    fr: 'Nom du parcours',
    en: 'Journey name',
    de: 'Name der Route'
  },
  'admin.journey.form.name.placeholder': {
    fr: 'Ex: Découverte du Vieux-Lausanne',
    en: 'Ex: Old Town Discovery',
    de: 'Z.B.: Entdeckung der Altstadt'
  },
  'admin.journey.form.description': {
    fr: 'Description',
    en: 'Description',
    de: 'Beschreibung'
  },
  'admin.journey.form.description.placeholder': {
    fr: 'Décrivez votre parcours...',
    en: 'Describe your journey...',
    de: 'Beschreiben Sie Ihre Route...'
  },
  'admin.journey.form.category': {
    fr: 'Catégorie',
    en: 'Category',
    de: 'Kategorie'
  },
  'admin.journey.form.category.placeholder': {
    fr: 'Sélectionnez une catégorie',
    en: 'Select a category',
    de: 'Kategorie auswählen'
  },
  'admin.journey.form.difficulty': {
    fr: 'Difficulté',
    en: 'Difficulty',
    de: 'Schwierigkeit'
  },
  'admin.journey.form.difficulty.easy': {
    fr: 'Facile',
    en: 'Easy',
    de: 'Einfach'
  },
  'admin.journey.form.difficulty.medium': {
    fr: 'Moyen',
    en: 'Medium',
    de: 'Mittel'
  },
  'admin.journey.form.difficulty.hard': {
    fr: 'Difficile',
    en: 'Hard',
    de: 'Schwer'
  },
  'admin.journey.form.difficulty.expert': {
    fr: 'Expert',
    en: 'Expert',
    de: 'Experte'
  },
  'admin.journey.form.duration': {
    fr: 'Durée estimée (minutes)',
    en: 'Estimated duration (minutes)',
    de: 'Geschätzte Dauer (Minuten)'
  },
  'admin.journey.form.distance': {
    fr: 'Distance (km)',
    en: 'Distance (km)',
    de: 'Entfernung (km)'
  },
  'admin.journey.form.distance.auto': {
    fr: 'Auto:',
    en: 'Auto:',
    de: 'Auto:'
  },
  'admin.journey.form.active': {
    fr: 'Parcours actif',
    en: 'Active journey',
    de: 'Aktive Route'
  },
  'admin.journey.form.predefined': {
    fr: 'Parcours prédéfini',
    en: 'Predefined journey',
    de: 'Vordefinierte Route'
  },

  // Steps management
  'admin.journey.steps.title': {
    fr: 'Étapes du Parcours',
    en: 'Journey Steps',
    de: 'Route-Schritte'
  },
  'admin.journey.steps.add': {
    fr: 'Ajouter une étape',
    en: 'Add step',
    de: 'Schritt hinzufügen'
  },
  'admin.journey.steps.empty': {
    fr: 'Aucune étape ajoutée',
    en: 'No steps added',
    de: 'Keine Schritte hinzugefügt'
  },
  'admin.journey.steps.empty.description': {
    fr: 'Cliquez sur "Ajouter une étape" pour commencer',
    en: 'Click "Add step" to get started',
    de: 'Klicken Sie auf "Schritt hinzufügen" um zu beginnen'
  },

  // Actions
  'admin.actions.save': {
    fr: 'Sauvegarder',
    en: 'Save',
    de: 'Speichern'
  },
  'admin.actions.cancel': {
    fr: 'Annuler',
    en: 'Cancel',
    de: 'Abbrechen'
  },
  'admin.actions.create': {
    fr: 'Créer',
    en: 'Create',
    de: 'Erstellen'
  },
  'admin.actions.edit': {
    fr: 'Modifier',
    en: 'Edit',
    de: 'Bearbeiten'
  },
  'admin.actions.delete': {
    fr: 'Supprimer',
    en: 'Delete',
    de: 'Löschen'
  },
  'admin.actions.preview': {
    fr: 'Aperçu',
    en: 'Preview',
    de: 'Vorschau'
  },

  // Status messages
  'admin.status.loading': {
    fr: 'Chargement...',
    en: 'Loading...',
    de: 'Wird geladen...'
  },
  'admin.status.saving': {
    fr: 'Sauvegarde...',
    en: 'Saving...',
    de: 'Speichern...'
  },
  'admin.status.saved': {
    fr: 'Sauvegardé',
    en: 'Saved',
    de: 'Gespeichert'
  },

  // Error messages
  'admin.error.generic': {
    fr: 'Une erreur est survenue',
    en: 'An error occurred',
    de: 'Ein Fehler ist aufgetreten'
  },
  'admin.error.save_failed': {
    fr: 'Impossible de sauvegarder',
    en: 'Failed to save',
    de: 'Speichern fehlgeschlagen'
  },
  'admin.error.load_failed': {
    fr: 'Impossible de charger les données',
    en: 'Failed to load data',
    de: 'Daten konnten nicht geladen werden'
  },

  // Journey Detail Page
  'journey.detail.loading': {
    fr: 'Chargement...',
    en: 'Loading...',
    de: 'Wird geladen...'
  },
  'journey.detail.error': {
    fr: 'Erreur',
    en: 'Error',
    de: 'Fehler'
  },
  'journey.detail.not_found': {
    fr: 'Parcours introuvable',
    en: 'Journey not found',
    de: 'Route nicht gefunden'
  },
  'journey.detail.not_found_description': {
    fr: 'Le parcours demandé n\'existe pas ou n\'est plus disponible.',
    en: 'The requested journey does not exist or is no longer available.',
    de: 'Die angeforderte Route existiert nicht oder ist nicht mehr verfügbar.'
  },
  'journey.detail.back': {
    fr: 'Retour',
    en: 'Back',
    de: 'Zurück'
  },
  'journey.detail.load_error': {
    fr: 'Impossible de charger le parcours',
    en: 'Failed to load journey',
    de: 'Route konnte nicht geladen werden'
  },

  // Journey Player
  'journey.player.not_found': {
    fr: 'Parcours introuvable',
    en: 'Journey not found',
    de: 'Route nicht gefunden'
  },
  'journey.player.no_steps': {
    fr: 'Aucune étape disponible',
    en: 'No steps available',
    de: 'Keine Schritte verfügbar'
  },
  'journey.player.no_steps_description': {
    fr: 'Ce parcours n\'a pas encore d\'étapes configurées.',
    en: 'This journey does not have any configured steps yet.',
    de: 'Diese Route hat noch keine konfigurierten Schritte.'
  },
  'journey.player.back_to_journeys': {
    fr: 'Retour aux parcours',
    en: 'Back to journeys',
    de: 'Zurück zu den Routen'
  },

  // Toast messages
  'toast.error.title': {
    fr: 'Erreur',
    en: 'Error',
    de: 'Fehler'
  },
  'toast.success.title': {
    fr: 'Succès',
    en: 'Success',
    de: 'Erfolg'
  },
  'toast.warning.title': {
    fr: 'Attention',
    en: 'Warning',
    de: 'Warnung'
  },
  'toast.info.title': {
    fr: 'Information',
    en: 'Information',
    de: 'Information'
  },

  // Step validation messages
  'step.validation.location_unavailable': {
    fr: 'Position non disponible',
    en: 'Location unavailable',
    de: 'Standort nicht verfügbar'
  },
  'step.validation.location_unavailable_description': {
    fr: 'Impossible d\'obtenir votre position. Veuillez activer la géolocalisation.',
    en: 'Unable to get your location. Please enable geolocation.',
    de: 'Standort kann nicht ermittelt werden. Bitte aktivieren Sie die Geolokalisierung.'
  },
  'step.validation.too_far': {
    fr: 'Trop loin de l\'étape',
    en: 'Too far from step',
    de: 'Zu weit vom Schritt entfernt'
  },
  'step.validation.too_far_description': {
    fr: 'Vous devez être plus proche de l\'étape pour la valider.',
    en: 'You must be closer to the step to validate it.',
    de: 'Sie müssen näher am Schritt sein, um ihn zu validieren.'
  },
  'step.validation.completed': {
    fr: 'Étape validée !',
    en: 'Step validated!',
    de: 'Schritt validiert!'
  },
  'step.validation.completed_description': {
    fr: 'Félicitations ! Vous avez atteint cette étape.',
    en: 'Congratulations! You have reached this step.',
    de: 'Herzlichen Glückwunsch! Sie haben diesen Schritt erreicht.'
  },
  'step.validation.journey_completed': {
    fr: 'Parcours terminé !',
    en: 'Journey completed!',
    de: 'Route abgeschlossen!'
  },
  'step.validation.journey_completed_description': {
    fr: 'Bravo ! Vous avez terminé ce parcours.',
    en: 'Well done! You have completed this journey.',
    de: 'Gut gemacht! Sie haben diese Route abgeschlossen.'
  },

  // Email notifications
  'email.welcome.sent': {
    fr: 'Email de bienvenue envoyé avec succès',
    en: 'Welcome email sent successfully',
    de: 'Willkommens-E-Mail erfolgreich gesendet'
  },
  'email.welcome.error': {
    fr: 'Erreur lors de l\'envoi de l\'email de bienvenue',
    en: 'Error sending welcome email',
    de: 'Fehler beim Senden der Willkommens-E-Mail'
  },
  'email.journey_completion.sent': {
    fr: 'Notification de parcours terminé envoyée',
    en: 'Journey completion notification sent',
    de: 'Benachrichtigung über Reiseabschluss gesendet'
  },
  'email.journey_completion.error': {
    fr: 'Erreur lors de l\'envoi de la notification',
    en: 'Error sending completion notification',
    de: 'Fehler beim Senden der Benachrichtigung'
  },
  'email.inactive_reminder.sent': {
    fr: 'Rappel d\'inactivité envoyé',
    en: 'Inactive reminder sent',
    de: 'Inaktivitätserinnerung gesendet'
  },
  'email.inactive_reminder.error': {
    fr: 'Erreur lors de l\'envoi du rappel',
    en: 'Error sending reminder',
    de: 'Fehler beim Senden der Erinnerung'
  },
  'email.reward_notification.sent': {
    fr: 'Notification de récompense envoyée',
    en: 'Reward notification sent',
    de: 'Belohnungsbenachrichtigung gesendet'
  },
  'email.reward_notification.error': {
    fr: 'Erreur lors de l\'envoi de la notification de récompense',
    en: 'Error sending reward notification',
    de: 'Fehler beim Senden der Belohnungsbenachrichtigung'
  },
  'email.security_alert.sent': {
    fr: 'Alerte de sécurité envoyée',
    en: 'Security alert sent',
    de: 'Sicherheitswarnung gesendet'
  },
  'email.security_alert.error': {
    fr: 'Erreur lors de l\'envoi de l\'alerte de sécurité',
    en: 'Error sending security alert',
    de: 'Fehler beim Senden der Sicherheitswarnung'
  }
};

// Use the main translation system instead
export const getAdminTranslation = (
  key: string,
  language: Language = 'fr'
): string => {
  // This is kept for backward compatibility
  const translation = adminTranslations[key as keyof typeof adminTranslations];
  if (!translation) {
    return key;
  }
  
  return translation[language] || translation.fr || key;
};

// Hook for using admin translations via the centralized system
export const useAdminTranslation = () => {
  const { t } = useLanguage();
  return t;
};
