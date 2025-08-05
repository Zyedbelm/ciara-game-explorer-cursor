export const getAudioErrorMessage = (error: Error | string, language: 'fr' | 'en' | 'de' = 'fr'): string => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  const errorMessages = {
    fr: {
      permission_denied: 'Accès au microphone refusé. Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur et réessayer.',
      not_found: 'Aucun microphone détecté. Veuillez vérifier que votre microphone est connecté et fonctionne.',
      not_supported: 'L\'enregistrement audio n\'est pas supporté par votre navigateur. Veuillez utiliser Chrome, Firefox ou Safari.',
      network_error: 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.',
      transcription_failed: 'Échec de la transcription audio. Veuillez parler plus clairement et réessayer.',
      ai_error: 'Erreur du service IA. Veuillez réessayer dans quelques instants.',
      generic: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      max_duration: 'Enregistrement trop long. Veuillez limiter votre message à 15 secondes.',
      recording_failed: 'Échec de l\'enregistrement. Veuillez vérifier votre microphone et réessayer.'
    },
    en: {
      permission_denied: 'Microphone access denied. Please allow microphone access in your browser settings and try again.',
      not_found: 'No microphone detected. Please check that your microphone is connected and working.',
      not_supported: 'Audio recording is not supported by your browser. Please use Chrome, Firefox, or Safari.',
      network_error: 'Connection error. Please check your internet connection and try again.',
      transcription_failed: 'Audio transcription failed. Please speak more clearly and try again.',
      ai_error: 'AI service error. Please try again in a few moments.',
      generic: 'An unexpected error occurred. Please try again.',
      max_duration: 'Recording too long. Please limit your message to 15 seconds.',
      recording_failed: 'Recording failed. Please check your microphone and try again.'
    },
    de: {
      permission_denied: 'Mikrofonzugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff in Ihren Browsereinstellungen und versuchen Sie es erneut.',
      not_found: 'Kein Mikrofon erkannt. Bitte überprüfen Sie, ob Ihr Mikrofon angeschlossen und funktionsfähig ist.',
      not_supported: 'Audioaufnahme wird von Ihrem Browser nicht unterstützt. Bitte verwenden Sie Chrome, Firefox oder Safari.',
      network_error: 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
      transcription_failed: 'Audio-Transkription fehlgeschlagen. Bitte sprechen Sie deutlicher und versuchen Sie es erneut.',
      ai_error: 'KI-Service-Fehler. Bitte versuchen Sie es in wenigen Augenblicken erneut.',
      generic: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      max_duration: 'Aufnahme zu lang. Bitte beschränken Sie Ihre Nachricht auf 15 Sekunden.',
      recording_failed: 'Aufnahme fehlgeschlagen. Bitte überprüfen Sie Ihr Mikrofon und versuchen Sie es erneut.'
    }
  };

  const messages = errorMessages[language];

  // Detect error type based on error message content
  if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('denied')) {
    return messages.permission_denied;
  }
  
  if (errorMessage.toLowerCase().includes('notfound') || errorMessage.toLowerCase().includes('not found')) {
    return messages.not_found;
  }
  
  if (errorMessage.toLowerCase().includes('not supported') || errorMessage.toLowerCase().includes('unsupported')) {
    return messages.not_supported;
  }
  
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
    return messages.network_error;
  }
  
  if (errorMessage.toLowerCase().includes('transcription')) {
    return messages.transcription_failed;
  }
  
  if (errorMessage.toLowerCase().includes('openai') || errorMessage.toLowerCase().includes('ai')) {
    return messages.ai_error;
  }
  
  if (errorMessage.toLowerCase().includes('duration') || errorMessage.toLowerCase().includes('too long')) {
    return messages.max_duration;
  }
  
  if (errorMessage.toLowerCase().includes('recording')) {
    return messages.recording_failed;
  }

  return messages.generic;
};

export const getAudioHelpTips = (language: 'fr' | 'en' | 'de' = 'fr'): string[] => {
  const tips = {
    fr: [
      'Assurez-vous que votre microphone est connecté et fonctionne',
      'Parlez clairement et distinctement',
      'Évitez les bruits de fond',
      'Tenez-vous à une distance appropriée du microphone',
      'Vérifiez les paramètres de confidentialité de votre navigateur'
    ],
    en: [
      'Make sure your microphone is connected and working',
      'Speak clearly and distinctly',
      'Avoid background noise',
      'Keep an appropriate distance from the microphone',
      'Check your browser privacy settings'
    ],
    de: [
      'Stellen Sie sicher, dass Ihr Mikrofon angeschlossen und funktionsfähig ist',
      'Sprechen Sie klar und deutlich',
      'Vermeiden Sie Hintergrundgeräusche',
      'Halten Sie einen angemessenen Abstand zum Mikrofon',
      'Überprüfen Sie Ihre Browser-Datenschutzeinstellungen'
    ]
  };

  return tips[language];
};