# PRD — Sablia Vox Landing Page

> Landing page redesign. Cible : page d'accueil publique de `vox.sablia.io`.
> Derniere mise a jour : 2026-03-25.

---

## 1. Vision

Sablia Vox est une plateforme d'agents vocaux IA pour les entreprises francaises. La landing page doit vendre la **transformation** — pas la technologie. Le visiteur doit comprendre en 5 secondes : "vos appels manques vous coutent des clients, notre IA les traite instantanement".

**Positionnement** : "Liberez vos equipes des appels repetitifs" — jamais "remplacez vos commerciaux".

**Objectif principal** : Convertir les visiteurs B2B en demos live via un callback telephonique instantane.

**Objectifs secondaires** :
- Etablir la credibilite (metriques verifiables, logos clients, donnees hebergees en France/UE)
- Eduquer sur le fonctionnement en 3 etapes simples
- Couvrir les objections courantes (RGPD, qualite vocale, cout, delai)

---

## 2. Audience cible

**Marche** : Entreprises francaises B2B (PME a ETI) — 10 a 500 salaries.

**Secteurs prioritaires** :
- Immobilier (agences, promoteurs, reseaux de mandataires)
- Automobile (concessions, groupes multi-marques)
- Assurance (courtiers, mutuelles regionales)
- Services (cabinets comptables, centres de formation, maintenance)

**Persona principal** : Directeur commercial ou gerant d'entreprise, 35-55 ans, frustre par les appels manques et le turnover des SDR. Cherche une solution deployable rapidement, pas un projet IT de 6 mois.

**Persona secondaire** : Responsable operations/IT, mandate pour evaluer des solutions d'automatisation. Sensible aux garanties techniques (RGPD, integration CRM, uptime).

---

## 3. Structure de la page

### Section 1 — Hero

Headline percutant centre sur le probleme. Sous-titre avec la promesse. Formulaire de callback inline (champ telephone + bouton CTA).

**Contenu** :
- Headline : formulation probleme → solution (ex. "Chaque appel manque est un client perdu")
- Sous-titre : proposition de valeur en 1 phrase
- CTA primaire : formulaire inline avec champ telephone (+33 par defaut), bouton "Tester maintenant"
- Element visuel : animation de waveform ou transcription temps reel suggerant l'IA en action
- Badge de confiance : "Donnees hebergees en France" + "Mise en place en 48h"

### Section 2 — Amplification du probleme

Quantifier le cout des appels manques. Chiffres concrets, pas de pourcentages vagues.

**Contenu** :
- Statistiques sectorielles (ex. "62% des appels en agence immobiliere ne sont jamais rappeles")
- Cout moyen d'un lead perdu par secteur
- Comparaison : cout d'un SDR temps plein vs cout de l'IA par appel
- Ton : empathique, pas alarmiste

### Section 3 — Benefices

3-4 benefices cles presentes comme des transformations business, pas des features.

**Contenu** :
- Zero appels manques — 24h/24, 7j/7, meme le dimanche a 3h du matin
- Qualification automatique — l'IA pose les bonnes questions, filtre les leads, prend rendez-vous
- Liberez vos equipes — vos commerciaux se concentrent sur la vente, pas sur le telephone
- Deploiement rapide — operationnel en 48h, pas en 6 mois

### Section 4 — Comment ca marche

3 etapes simples avec icones/illustrations.

**Contenu** :
1. **Un appel arrive** — l'agent vocal IA decroche instantanement (entrant) ou rappelle en moins de 60 secondes (sortant)
2. **L'IA qualifie** — conversation naturelle, questions adaptees a votre secteur, prise de rendez-vous automatique
3. **Vous recevez le resultat** — notification immediate avec le resume de l'appel, le lead qualifie, et le rendez-vous dans votre agenda

### Section 5 — Preuve sociale

Metriques verifiables + temoignages + logos.

**Contenu** :
- KPIs agreges : nombre d'appels traites, taux de reponse, taux de conversion, temps moyen de reponse
- Temoignages clients (format : citation + nom + poste + entreprise + secteur)
- Logos clients (bande defilante)
- Badges : "Donnees hebergees en UE", "RGPD conforme", "Disponible 24/7"

### Section 6 — Cas d'usage par secteur

Cards par secteur avec scenario concret + resultat mesurable.

**Contenu** :
- Immobilier : rappel instantane des leads internet, qualification du projet, prise de rendez-vous visite
- Automobile : suivi des demandes d'essai, relance des devis non convertis, gestion des rappels atelier
- Assurance : accueil telephonique 24/7, qualification des sinistres, orientation vers le bon interlocuteur
- Services : prise de rendez-vous, reactivation clients dormants, enquete de satisfaction post-prestation

### Section 7 — Apercu du dashboard

Capture d'ecran ou mockup du dashboard avec des metriques reelles.

**Contenu** :
- Vue d'ensemble : KPIs temps reel (appels du jour, taux de reponse, rendez-vous pris)
- Detail d'un appel : transcription, emotion detectee, actions prises
- Message : "Suivez chaque appel en temps reel depuis votre tableau de bord"

### Section 8 — Integrations

Logos et descriptions courtes des integrations disponibles.

**Contenu** :
- Telephonie : SIP, Twilio, numeros francais natifs
- CRM : Salesforce, HubSpot, Pipedrive, webhook generique
- Agenda : Google Calendar, Outlook
- Notifications : SMS, email, webhook
- Message : "S'integre a vos outils existants en quelques clics"

### Section 9 — FAQ

Accordion avec les 8-10 questions les plus frequentes.

**Contenu** :
- RGPD et donnees : ou sont stockees les donnees, qui y a acces, duree de retention
- Qualite vocale : comment l'IA sonne naturelle, gestion des accents, langues supportees
- Mise en place : delai, prerequis techniques, accompagnement
- Cout : modele de tarification, engagement minimum, cout par appel
- Customisation : adaptation au vocabulaire metier, scenarios specifiques
- Fallback : que se passe-t-il si l'IA ne sait pas repondre (transfert vers un humain)

### Section 10 — CTA final

Derniere chance de conversion. Double CTA : callback rapide + formulaire complet.

**Contenu** :
- Headline de cloture : reformulation de la proposition de valeur
- CTA primaire : meme formulaire callback que le hero (champ telephone, bouton "Tester maintenant")
- CTA secondaire : formulaire de contact complet (nom, email, telephone, entreprise, secteur, message)
- Mention legale RGPD sous les formulaires

---

## 4. User Stories

### Navigation et decouverte

**US-LP-01** : En tant que visiteur B2B, je veux comprendre la proposition de valeur en moins de 5 secondes apres l'arrivee sur la page, afin de decider si je continue a scroller.
- Critere : le hero affiche headline + sous-titre + CTA visible sans scroll.

**US-LP-02** : En tant que visiteur, je veux naviguer facilement entre les sections de la page via un header avec ancres, afin de trouver rapidement l'information qui m'interesse.
- Critere : header fixe avec liens vers les sections principales, smooth scroll.

**US-LP-03** : En tant que visiteur mobile, je veux une experience fluide et lisible sur smartphone, afin de consulter la page depuis n'importe quel appareil.
- Critere : responsive design, touch-friendly, temps de chargement < 3s sur 4G.

### Phone callback CTA

**US-LP-04** : En tant que visiteur interesse, je veux entrer mon numero de telephone dans le hero et recevoir un appel de demo instantane, afin de tester l'agent vocal sans friction.
- Critere : champ telephone avec prefixe +33, bouton "Tester maintenant", appel recu en < 30 secondes.

**US-LP-05** : En tant que visiteur en attente de l'appel, je veux voir une animation "appel en cours" avec un feedback visuel clair, afin de savoir que ma demande a ete prise en compte.
- Critere : etat "calling" avec animation (waveform ou pulsation), timeout a 60s avec message d'erreur gracieux.

**US-LP-06** : En tant que visiteur ayant termine l'appel de demo, je veux voir un ecran post-appel avec les prochaines etapes, afin de savoir comment continuer.
- Critere : message de remerciement + CTA "Prendre rendez-vous" ou "Nous contacter".

**US-LP-07** : En tant que visiteur soucieux de mes donnees, je veux donner mon consentement explicite avant que mes informations soient utilisees pour un suivi commercial, afin de respecter le RGPD.
- Critere : checkbox non cochee par defaut "J'accepte que mes donnees soient utilisees pour un suivi commercial", formulaire non soumissible sans consentement.

### Contenu et confiance

**US-LP-08** : En tant que directeur commercial, je veux voir des metriques verifiables (nombre d'appels traites, taux de conversion) et non des pourcentages generiques, afin d'evaluer la credibilite de la solution.
- Critere : section preuve sociale avec chiffres reels ou realistes, source identifiable.

**US-LP-09** : En tant que responsable IT, je veux comprendre ou sont hebergees les donnees et quelles certifications RGPD sont en place, afin de valider la conformite avant de recommander la solution.
- Critere : badge "Donnees hebergees en France/UE" visible dans le hero, section FAQ avec detail RGPD.

**US-LP-10** : En tant que gerant de PME dans l'immobilier, je veux voir un cas d'usage specifique a mon secteur avec un resultat mesurable, afin de me projeter dans l'utilisation.
- Critere : section cas d'usage avec au moins 4 secteurs, scenario concret + chiffre de resultat par secteur.

### Contact et conversion

**US-LP-11** : En tant que visiteur qui prefere un contact humain, je veux acceder a un formulaire de contact complet en bas de page, afin de poser mes questions avant de m'engager.
- Critere : formulaire avec nom, email, telephone, entreprise, secteur (select), message libre.

**US-LP-12** : En tant que visiteur revenant sur la page apres un premier appel de demo, je veux retrouver facilement le moyen de nous contacter ou de planifier un rendez-vous, afin de poursuivre la conversation commerciale.
- Critere : CTA final visible, header fixe avec lien de contact.

### SEO et performance

**US-LP-13** : En tant que moteur de recherche, je veux trouver des meta-donnees structurees (title, description, OpenGraph, schema.org) et un contenu semantiquement riche, afin de bien referencer la page sur "agent vocal IA entreprise".
- Critere : metadata complete, balises h1/h2/h3 hierarchiques, structured data Organization + Product.

**US-LP-14** : En tant que visiteur sur une connexion lente, je veux que la page charge rapidement avec un bon score Lighthouse, afin de ne pas abandonner avant d'avoir vu le contenu.
- Critere : Lighthouse Performance >= 90, LCP < 2.5s, CLS < 0.1.

---

## 5. Direction creative

**Redesign complet** — aucune contrainte du theme actuel (dark/violet). Pas d'agents nommes (Louis, Arthur, Alexandra) sur la landing. Positionnement benefices, pas features.

**Langue** : Francais uniquement.

**Ton** : Professionnel mais accessible. Pas de jargon technique inutile. Empathique sur les problemes, confiant sur les solutions.

**Inspirations visuelles** (a explorer en Phase D) :
- Design dark-first avec hero anime (aurora/gradient)
- Glassmorphism raffine sur les cards de features
- Typographie distinctive : display serif/oversize pour les headlines, sans-serif pour le corps
- Palette : teintes froides primaires (bleu electrique/teal) + accent chaud (ambre/orange) pour les CTA
- Animations subtiles au scroll (reveal, stagger)
- Effet glow sur le CTA primaire

---

## 6. Contraintes techniques

| Contrainte | Detail |
|------------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Components | shadcn/ui v4 |
| Animations | motion/react (ex framer-motion) + CSS transitions |
| Rendering | Server Components par defaut, `'use client'` uniquement si necessaire |
| Phone callback | Route handler server-side (`/api/demo-callback`), webhook n8n, pas d'URL exposee cote client |
| Rate limiting | 3 appels/IP/heure via Supabase `demo_rate_limits` |
| RGPD | Consentement explicite pour suivi commercial (pas pour l'appel lui-meme) |
| Performance | Lighthouse >= 90 sur les 4 axes |
| Accessibilite | WCAG 2.1 AA minimum |
| SEO | Metadata complete, structured data, semantic HTML |

---

## 7. Hors scope

- Dashboard (pages authentifiees) — non concerne par ce redesign
- Chatbot widget — reste inchange
- Authentification — pages login/signup non modifiees
- Backend/API (sauf route handler demo-callback)
- Tarification — pas de section prix sur cette version (ajout ulterieur)
- Multi-langue — francais uniquement pour cette iteration
