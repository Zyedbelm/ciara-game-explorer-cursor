
-- Add FAQ translations to ui_translations table
INSERT INTO ui_translations (key, language, value) VALUES
-- FAQ Questions and Answers - French
('faq_usage_q1', 'fr', 'Comment commencer un parcours ?'),
('faq_usage_a1', 'fr', 'Pour commencer un parcours, rendez-vous sur la page d''une destination, choisissez un parcours qui vous intéresse et cliquez sur ''Commencer le Parcours''. Vous devez être connecté à votre compte pour participer.'),
('faq_usage_q2', 'fr', 'Comment gagner des points ?'),
('faq_usage_a2', 'fr', 'Vous gagnez des points en complétant les étapes des parcours, en répondant correctement aux quiz, et en validant votre présence aux points d''intérêt. Des bonus sont attribués pour les réponses rapides et parfaites.'),
('faq_usage_q3', 'fr', 'Que faire si la géolocalisation ne fonctionne pas ?'),
('faq_usage_a3', 'fr', 'Assurez-vous d''avoir autorisé l''accès à la géolocalisation dans votre navigateur. Si le problème persiste, essayez de rafraîchir la page ou de redémarrer votre navigateur.'),

('faq_rewards_q1', 'fr', 'Comment utiliser mes points ?'),
('faq_rewards_a1', 'fr', 'Vos points peuvent être échangés contre des récompenses chez nos partenaires locaux. Rendez-vous dans la section ''Récompenses'' pour voir les offres disponibles et générer vos codes de réduction.'),
('faq_rewards_q2', 'fr', 'Les points expirent-ils ?'),
('faq_rewards_a2', 'fr', 'Non, vos points CIARA n''expirent jamais. Cependant, certaines récompenses peuvent avoir des dates limite d''utilisation.'),
('faq_rewards_q3', 'fr', 'Comment connaître mon niveau ?'),
('faq_rewards_a3', 'fr', 'Votre niveau est visible dans votre profil et dépend du nombre total de points que vous avez gagnés. Chaque niveau débloque de nouveaux avantages.'),

('faq_technical_q1', 'fr', 'L''application fonctionne-t-elle hors ligne ?'),
('faq_technical_a1', 'fr', 'Certaines fonctionnalités de base sont disponibles hors ligne, mais vous aurez besoin d''une connexion internet pour valider les étapes et gagner des points.'),
('faq_technical_q2', 'fr', 'Sur quels appareils puis-je utiliser CIARA ?'),
('faq_technical_a2', 'fr', 'CIARA fonctionne sur tous les navigateurs web modernes, smartphones, tablettes et ordinateurs. Aucune installation n''est requise.'),
('faq_technical_q3', 'fr', 'Comment signaler un problème ?'),
('faq_technical_a3', 'fr', 'Vous pouvez nous contacter via le chat en bas à droite de la page ou par email. Nous nous efforçons de répondre dans les 24 heures.'),

('faq_ai_q1', 'fr', 'Comment fonctionne l''assistant IA de CIARA ?'),
('faq_ai_a1', 'fr', 'L''assistant IA CIARA utilise l''intelligence artificielle avancée (GPT-4) pour vous offrir une aide contextuelle personnalisée. Il analyse votre position, votre parcours actuel, votre profil utilisateur et vos préférences pour vous donner des conseils adaptés, des informations historiques sur les lieux que vous visitez, et des recommandations personnalisées.'),
('faq_ai_q2', 'fr', 'Sur quelles données se base l''IA pour ses recommandations ?'),
('faq_ai_a2', 'fr', 'L''IA de CIARA se base sur plusieurs sources : votre profil utilisateur (niveau, points, intérêts), votre localisation actuelle, votre historique de parcours, les données des points d''intérêt locaux dans notre base de données, les conditions météorologiques, et les patterns d''autres utilisateurs similaires. Toutes ces données sont traitées de manière sécurisée et respectueuse de votre vie privée.'),
('faq_ai_q3', 'fr', 'L''IA peut-elle créer des parcours personnalisés ?'),
('faq_ai_a3', 'fr', 'Oui ! Notre système d''IA peut générer automatiquement des parcours adaptés à vos préférences, votre condition physique, le temps dont vous disposez et vos centres d''intérêt. Elle optimise le trajet, sélectionne les étapes les plus pertinentes et adapte la difficulté selon votre profil.'),
('faq_ai_q4', 'fr', 'Comment l''assistant IA protège-t-il mes données ?'),
('faq_ai_a4', 'fr', 'Votre vie privée est notre priorité. L''assistant IA traite vos données localement quand possible, utilise le chiffrement pour toutes les communications, ne stocke que les informations essentielles avec votre consentement, et respecte strictement le RGPD. Vous pouvez à tout moment consulter, modifier ou supprimer vos données.'),
('faq_ai_q5', 'fr', 'L''IA peut-elle fonctionner dans plusieurs langues ?'),
('faq_ai_a5', 'fr', 'Oui, l''assistant IA CIARA supporte plusieurs langues et s''adapte automatiquement à vos préférences linguistiques. Il peut vous fournir des informations historiques, des recommandations et de l''aide dans votre langue préférée.'),

-- FAQ Questions and Answers - English
('faq_usage_q1', 'en', 'How do I start a journey?'),
('faq_usage_a1', 'en', 'To start a journey, go to a destination page, choose a journey that interests you and click ''Start Journey''. You must be logged in to your account to participate.'),
('faq_usage_q2', 'en', 'How do I earn points?'),
('faq_usage_a2', 'en', 'You earn points by completing journey steps, answering quiz questions correctly, and validating your presence at points of interest. Bonuses are awarded for quick and perfect answers.'),
('faq_usage_q3', 'en', 'What should I do if geolocation doesn''t work?'),
('faq_usage_a3', 'en', 'Make sure you have authorized geolocation access in your browser. If the problem persists, try refreshing the page or restarting your browser.'),

('faq_rewards_q1', 'en', 'How do I use my points?'),
('faq_rewards_a1', 'en', 'Your points can be exchanged for rewards at our local partners. Go to the ''Rewards'' section to see available offers and generate your discount codes.'),
('faq_rewards_q2', 'en', 'Do points expire?'),
('faq_rewards_a2', 'en', 'No, your CIARA points never expire. However, some rewards may have usage expiration dates.'),
('faq_rewards_q3', 'en', 'How can I see my level?'),
('faq_rewards_a3', 'en', 'Your level is visible in your profile and depends on the total number of points you have earned. Each level unlocks new benefits.'),

('faq_technical_q1', 'en', 'Does the application work offline?'),
('faq_technical_a1', 'en', 'Some basic features are available offline, but you will need an internet connection to validate steps and earn points.'),
('faq_technical_q2', 'en', 'On which devices can I use CIARA?'),
('faq_technical_a2', 'en', 'CIARA works on all modern web browsers, smartphones, tablets and computers. No installation required.'),
('faq_technical_q3', 'en', 'How do I report a problem?'),
('faq_technical_a3', 'en', 'You can contact us via the chat at the bottom right of the page or by email. We strive to respond within 24 hours.'),

('faq_ai_q1', 'en', 'How does the CIARA AI assistant work?'),
('faq_ai_a1', 'en', 'The CIARA AI assistant uses advanced artificial intelligence (GPT-4) to provide you with personalized contextual help. It analyzes your position, current journey, user profile and preferences to give you tailored advice, historical information about places you visit, and personalized recommendations.'),
('faq_ai_q2', 'en', 'What data does the AI base its recommendations on?'),
('faq_ai_a2', 'en', 'CIARA''s AI is based on several sources: your user profile (level, points, interests), your current location, your journey history, local points of interest data in our database, weather conditions, and patterns from other similar users. All this data is processed securely and with respect for your privacy.'),
('faq_ai_q3', 'en', 'Can the AI create personalized journeys?'),
('faq_ai_a3', 'en', 'Yes! Our AI system can automatically generate journeys adapted to your preferences, physical condition, available time and interests. It optimizes the route, selects the most relevant steps and adapts the difficulty according to your profile.'),
('faq_ai_q4', 'en', 'How does the AI assistant protect my data?'),
('faq_ai_a4', 'en', 'Your privacy is our priority. The AI assistant processes your data locally when possible, uses encryption for all communications, only stores essential information with your consent, and strictly respects GDPR. You can view, modify or delete your data at any time.'),
('faq_ai_q5', 'en', 'Can the AI work in multiple languages?'),
('faq_ai_a5', 'en', 'Yes, the CIARA AI assistant supports multiple languages and automatically adapts to your language preferences. It can provide you with historical information, recommendations and help in your preferred language.'),

-- FAQ Questions and Answers - German
('faq_usage_q1', 'de', 'Wie beginne ich eine Tour?'),
('faq_usage_a1', 'de', 'Um eine Tour zu beginnen, gehen Sie zu einer Zielseite, wählen Sie eine Tour, die Sie interessiert, und klicken Sie auf ''Tour starten''. Sie müssen in Ihrem Konto angemeldet sein, um teilzunehmen.'),
('faq_usage_q2', 'de', 'Wie verdiene ich Punkte?'),
('faq_usage_a2', 'de', 'Sie verdienen Punkte, indem Sie Tourenschritte abschließen, Quiz-Fragen richtig beantworten und Ihre Anwesenheit an Sehenswürdigkeiten validieren. Boni werden für schnelle und perfekte Antworten vergeben.'),
('faq_usage_q3', 'de', 'Was soll ich tun, wenn die Geolokalisierung nicht funktioniert?'),
('faq_usage_a3', 'de', 'Stellen Sie sicher, dass Sie den Zugriff auf die Geolokalisierung in Ihrem Browser autorisiert haben. Wenn das Problem weiterhin besteht, versuchen Sie, die Seite zu aktualisieren oder Ihren Browser neu zu starten.'),

('faq_rewards_q1', 'de', 'Wie verwende ich meine Punkte?'),
('faq_rewards_a1', 'de', 'Ihre Punkte können gegen Belohnungen bei unseren lokalen Partnern eingetauscht werden. Gehen Sie zum Abschnitt ''Belohnungen'', um verfügbare Angebote zu sehen und Ihre Rabattcodes zu generieren.'),
('faq_rewards_q2', 'de', 'Laufen die Punkte ab?'),
('faq_rewards_a2', 'de', 'Nein, Ihre CIARA-Punkte laufen nie ab. Einige Belohnungen können jedoch Verwendungsfristen haben.'),
('faq_rewards_q3', 'de', 'Wie kann ich mein Level sehen?'),
('faq_rewards_a3', 'de', 'Ihr Level ist in Ihrem Profil sichtbar und hängt von der Gesamtzahl der von Ihnen verdienten Punkte ab. Jedes Level schaltet neue Vorteile frei.'),

('faq_technical_q1', 'de', 'Funktioniert die Anwendung offline?'),
('faq_technical_a1', 'de', 'Einige grundlegende Funktionen sind offline verfügbar, aber Sie benötigen eine Internetverbindung, um Schritte zu validieren und Punkte zu sammeln.'),
('faq_technical_q2', 'de', 'Auf welchen Geräten kann ich CIARA verwenden?'),
('faq_technical_a2', 'de', 'CIARA funktioniert auf allen modernen Webbrowsern, Smartphones, Tablets und Computern. Keine Installation erforderlich.'),
('faq_technical_q3', 'de', 'Wie melde ich ein Problem?'),
('faq_technical_a3', 'de', 'Sie können uns über den Chat unten rechts auf der Seite oder per E-Mail kontaktieren. Wir bemühen uns, innerhalb von 24 Stunden zu antworten.'),

('faq_ai_q1', 'de', 'Wie funktioniert der CIARA KI-Assistent?'),
('faq_ai_a1', 'de', 'Der CIARA KI-Assistent nutzt fortschrittliche künstliche Intelligenz (GPT-4), um Ihnen personalisierte kontextuelle Hilfe zu bieten. Er analysiert Ihre Position, aktuelle Tour, Ihr Benutzerprofil und Ihre Vorlieben, um Ihnen maßgeschneiderte Ratschläge, historische Informationen über Orte, die Sie besuchen, und personalisierte Empfehlungen zu geben.'),
('faq_ai_q2', 'de', 'Auf welche Daten stützt die KI ihre Empfehlungen?'),
('faq_ai_a2', 'de', 'CIARAs KI basiert auf mehreren Quellen: Ihr Benutzerprofil (Level, Punkte, Interessen), Ihr aktueller Standort, Ihre Tourenhistorie, lokale Sehenswürdigkeiten in unserer Datenbank, Wetterbedingungen und Muster von anderen ähnlichen Benutzern. All diese Daten werden sicher und unter Wahrung Ihrer Privatsphäre verarbeitet.'),
('faq_ai_q3', 'de', 'Kann die KI personalisierte Touren erstellen?'),
('faq_ai_a3', 'de', 'Ja! Unser KI-System kann automatisch Touren generieren, die an Ihre Vorlieben, körperliche Verfassung, verfügbare Zeit und Interessen angepasst sind. Sie optimiert die Route, wählt die relevantesten Schritte aus und passt die Schwierigkeit entsprechend Ihrem Profil an.'),
('faq_ai_q4', 'de', 'Wie schützt der KI-Assistent meine Daten?'),
('faq_ai_a4', 'de', 'Ihre Privatsphäre ist unsere Priorität. Der KI-Assistent verarbeitet Ihre Daten wenn möglich lokal, verwendet Verschlüsselung für alle Kommunikationen, speichert nur wesentliche Informationen mit Ihrer Zustimmung und respektiert strikt die DSGVO. Sie können Ihre Daten jederzeit einsehen, ändern oder löschen.'),
('faq_ai_q5', 'de', 'Kann die KI in mehreren Sprachen arbeiten?'),
('faq_ai_a5', 'de', 'Ja, der CIARA KI-Assistent unterstützt mehrere Sprachen und passt sich automatisch an Ihre Sprachvorlieben an. Er kann Ihnen historische Informationen, Empfehlungen und Hilfe in Ihrer bevorzugten Sprache bereitstellen.'),

-- Add missing subtitle translation
('faq_subtitle_new', 'fr', 'Trouvez rapidement les réponses à vos questions les plus fréquentes'),
('faq_subtitle_new', 'en', 'Quickly find answers to your most frequently asked questions'),
('faq_subtitle_new', 'de', 'Finden Sie schnell Antworten auf Ihre häufigsten Fragen')

ON CONFLICT (key, language) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();
