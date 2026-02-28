import type { FAQItem } from '@/lib/types/landing'

// FAQs générales pour la Home
export const homeFAQs: FAQItem[] = [
  {
    question: "Les prospects vont-ils sentir que c'est un robot ?",
    answer:
      "Non. Nos agents utilisent les modèles vocaux les plus avancés (Eleven Labs, Cartesia) et s'adaptent en temps réel aux réponses. La voix est naturelle, fluide, avec des variations d'intonation. Si un prospect demande explicitement s'il parle à un humain, l'agent répond honnêtement qu'il est assisté par IA. Transparence totale.",
  },
  {
    question: 'Et si un lead pose une question complexe ?',
    answer:
      "L'agent reconnaît les questions hors périmètre et propose soit de planifier un RDV avec votre équipe pour répondre en détail, soit de transférer l'appel en temps réel vers un commercial disponible.",
  },
  {
    question: 'Combien de temps pour déployer Sablia Vox ?',
    answer:
      '5 jours en moyenne. Jour 1-2 : Configuration et intégration CRM. Jour 3-4 : Personnalisation du script et tests. Jour 5 : Mise en production avec monitoring.',
  },
  {
    question: 'Est-ce que je peux arrêter quand je veux ?',
    answer:
      "Oui, aucun engagement. Vous pouvez mettre en pause ou résilier votre abonnement à tout moment. Si vous décidez d'arrêter, toutes vos données et historiques restent accessibles pendant 90 jours.",
  },
  {
    question: "Qu'est-ce qui est inclus dans l'abonnement mensuel ?",
    answer:
      'Tout : infrastructure IA complète (serveur, ligne téléphonique, hébergement), script vocal personnalisé, dashboard Sablia Vox, intégrations CRM, transcriptions, scoring automatique, support 24/7. Vous payez uniquement la consommation (appels, SMS) en plus.',
  },
  {
    question: 'Sablia Vox est-il conforme RGPD ?',
    answer:
      'Oui, totalement. Données hébergées en Europe (Paris et Francfort), chiffrement de bout en bout, conformité RGPD et ISO 27001. Vous restez propriétaire de toutes vos données. Contrat de traitement des données fourni sur demande.',
  },
  {
    question: 'Que se passe-t-il si un appel se passe mal ?',
    answer:
      "Chaque appel est enregistré et transcrit. En cas de problème, nous analysons l'appel sous 24h et ajustons le script. Vous avez également un dashboard en temps réel pour surveiller les appels et intervenir si nécessaire.",
  },
]

// Export FAQs object for easy access
export const faqs = {
  home: homeFAQs,
}
