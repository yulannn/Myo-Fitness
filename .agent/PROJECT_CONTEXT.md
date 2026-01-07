# 🏋️ Myo-Fitness - Contexte du Projet

## 📋 Vue d'ensemble

**Myo-Fitness** est une application web et mobile de coaching fitness intelligent, combinant l'intelligence artificielle (IA) avec un système social pour créer des programmes d'entraînement personnalisés et suivre la progression des utilisateurs.

### 🎯 Objectifs principaux
- Génération automatique de programmes d'entraînement via IA (Groq/Llama)
- Suivi en temps réel des performances et progression
- Système social : amis, groupes, chat en temps réel, activités
- Gamification : XP, niveaux, badges, statistiques musculaires
- Interface moderne et premium (inspirée de Strava, Nike Training Club)

---

## 🏗️ Architecture Technique

### **Stack Technologique**

#### Backend (`/api`)
- **Framework**: NestJS (TypeScript)
- **Base de données**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Authentification**: JWT (Access + Refresh tokens)
- **WebSockets**: Socket.io (chat temps réel)
- **IA**: Groq SDK (Llama)
- **Stockage**: AWS S3 (Cloudflare R2)
- **Email**: Nodemailer
- **Logging**: Pino
- **Monitoring**: Sentry
- **API Documentation**: Swagger
- **Paiement**: Stripe

**Port**: 3000  
**API Swagger**: http://localhost:3000/api

#### Frontend (`/client`)
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Routing**: React Router v7
- **State Management**: 
  - Zustand (état global)
  - TanStack Query (React Query v5) - gestion des requêtes API
- **Styling**: Tailwind CSS 4 + DaisyUI
- **Animations**: Framer Motion
- **UI Components**: Headless UI, Lucide React (icons)
- **Formulaires**: React Hook Form
- **WebSockets**: Socket.io-client
- **Maps**: Leaflet + React Leaflet
- **Mobile**: Capacitor (iOS/Android)

**Port**: 5173  
**URL Locale**: http://localhost:5173

---

## 📂 Structure du Projet

```
Myo-Fitness/
├── api/                          # Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma         # Modèle de données
│   │   ├── seed.ts               # Données de test
│   │   └── migrations/           # Migrations DB
│   ├── src/
│   │   ├── auth/                 # Authentification (JWT, guards)
│   │   ├── users/                # Gestion utilisateurs
│   │   ├── fitness-profile/      # Profils fitness
│   │   ├── program/              # Programmes d'entraînement
│   │   ├── session/              # Séances d'entraînement
│   │   ├── session-template/     # Templates de séances
│   │   ├── exercice/             # Exercices
│   │   ├── muscle-group/         # Groupes musculaires
│   │   ├── equipment/            # Équipements
│   │   ├── performance/          # Performances (sets, reps, poids)
│   │   ├── ia/                   # Service IA (génération programmes)
│   │   ├── session-adaptation/   # Adaptation intelligente des séances
│   │   ├── friend/               # Système d'amis
│   │   ├── group/                # Groupes d'amis
│   │   ├── chat/                 # Gateway WebSocket + messages
│   │   ├── social/               # Activités sociales
│   │   ├── badge/                # Système de badges
│   │   ├── body-atlas/           # Statistiques musculaires + Mirror Match
│   │   ├── shared-session/       # Séances partagées
│   │   ├── session-photo/        # Photos de séances
│   │   ├── subscription/         # Abonnements Premium
│   │   ├── stripe/               # Intégration Stripe
│   │   ├── r2/                   # Stockage Cloudflare R2
│   │   └── email/                # Service email
│   └── package.json
│
├── client/                       # Frontend React
│   ├── src/
│   │   ├── api/                  # Hooks React Query (API calls)
│   │   ├── components/           # Composants réutilisables
│   │   ├── pages/                # Pages de l'application
│   │   │   ├── home/             # Tableau de bord
│   │   │   ├── program/          # Gestion des programmes
│   │   │   ├── session/          # Séances actives
│   │   │   ├── profile/          # Profil utilisateur
│   │   │   ├── social/           # Fil d'actualité social
│   │   │   ├── chat/             # Messagerie
│   │   │   ├── friends/          # Amis
│   │   │   ├── body-atlas/       # Carte musculaire interactive
│   │   │   ├── onboarding/       # Onboarding nouveaux utilisateurs
│   │   │   └── settings/         # Paramètres
│   │   ├── context/              # Contexts React
│   │   ├── stores/               # Zustand stores
│   │   ├── routes/               # Configuration routing
│   │   ├── utils/                # Utilitaires
│   │   └── types/                # Types TypeScript
│   └── package.json
│
├── docker-compose.yml            # PostgreSQL + pgAdmin
├── .env                          # Variables d'environnement
├── ONBOARDING.md                 # Documentation onboarding
├── todo.md                       # Liste des améliorations
└── README.md                     # Guide de démarrage
```

---

## 🗄️ Modèle de Données (Prisma)

### **Modèles Principaux**

#### **User**
- Informations de base (nom, email, mot de passe)
- Système XP & Levels (gamification)
- Tokens JWT (refreshToken, tokenVersion)
- Réinitialisation mot de passe
- Vérification email
- Photo de profil (S3/R2)
- **Friend Code**: Code unique pour ajouter des amis
- Relations: FitnessProfile, Friends, Groups, Messages, Badges, Activities

#### **FitnessProfile**
- Informations physiques (âge, taille, poids, sexe)
- Objectifs (WEIGHT_LOSS, MUSCLE_GAIN, ENDURANCE, MAINTENANCE)
- Niveau d'expérience (BEGINNER, INTERMEDIATE, ADVANCED)
- Fréquence d'entraînement
- Jours d'entraînement (trainingDays)
- Environnement (HOME, GYM)
- Poids cible (targetWeight)
- Priorités musculaires (musclePriorities)
- Relations: TrainingPrograms, WeightHistory

#### **TrainingProgram**
- Nom du programme
- Statut (ACTIVE, COMPLETED, ARCHIVED, DRAFT)
- Template (FULL_BODY, UPPER_LOWER, PUSH_PULL_LEGS, PPL_UPPER_LOWER, PPL_X2, PPL_X2_FULL_BODY, CUSTOM)
- Date de début
- Relations: SessionTemplates, TrainingSessions

#### **SessionTemplate** 🆕
- **Template réutilisable** d'une séance
- Nom, description, ordre dans le programme
- Relations: ExerciseTemplates (exercices planifiés), TrainingSessions (instances créées)

#### **ExerciseTemplate** 🆕
- Exercice planifié dans un template
- Sets, reps, poids suggérés
- Durée (pour cardio)
- Ordre dans la séance

#### **TrainingSession**
- **Instance d'une séance** (planifiée ou exécutée)
- Statut: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- Lien vers SessionTemplate source (nullable)
- Date, durée
- Complétion (completed, performedAt)
- Relations: ExerciceSession, SessionPhotos, SessionSummary

#### **Exercice**
- Nom, description, image
- Type (COMPOUND, ISOLATION, CARDIO, MOBILITY, STRETCH)
- Difficulté (1-10)
- Tier (STAPLE, STANDARD, NICHE)
- Relations: MuscleGroups, Equipments

#### **ExerciceSession**
- Lien exercice ↔ session
- Sets, reps, poids planifiés
- ⚠️ **Contrainte unique**: (sessionId, exerciceId) - **TODO: À retirer pour permettre duplications**
- Relations: SetPerformances (performances réelles)

#### **SetPerformance**
- Performance d'une série
- Reps effectuées vs prévues
- Poids, RPE (Rate of Perceived Exertion)
- Succès (boolean)

#### **MuscleGroup**
- Nom, catégorie (CHEST, BACK, SHOULDERS, ARMS, LEGS, CORE, OTHER)
- Relations: Exercices, UserMuscleStats

#### **UserMuscleStats** 🎯 Body Atlas
- Statistiques par muscle et utilisateur
- Volume total cumulé
- Niveau (0-5: Novice → Legend)
- Dernière date d'entraînement
- Utilisé pour la heatmap musculaire

#### **MirrorMatch** 🎯 Body Atlas
- Duels en temps réel entre utilisateurs
- Muscle ciblé
- Volumes respectifs (user1Volume, user2Volume)
- Statut (ACTIVE, COMPLETED, CANCELLED)
- Gagnant (winnerId)

#### **Friend**
- Relation d'amitié bidirectionnelle
- Statut (PENDING, ACCEPTED, BLOCKED)

#### **FriendRequest**
- Demande d'ami
- Statut (PENDING, ACCEPTED, REJECTED)

#### **FriendGroup**
- Groupes d'amis
- Admin, membres
- Relations: Conversations, SharedSessions

#### **Conversation**
- Type (PRIVATE, GROUP)
- Relations: Participants, Messages

#### **Message**
- Contenu, type (TEXT, IMAGE, VIDEO, FILE, SYSTEM, INVITATION)
- Édité/Supprimé flags
- Relations: Sender, Reactions

#### **Activity**
- Activités sociales (SESSION_COMPLETED, PERSONAL_RECORD, PROGRAM_COMPLETED, STREAK_REACHED, SESSION_SHARED)
- Données JSON
- Relations: Reactions

#### **Badge**
- Badges débloquables
- Catégories (TRAINING, SOCIAL, PROGRESSION, SPECIAL)
- Tiers (BRONZE, SILVER, GOLD, PLATINUM, LEGENDARY)
- Récompense XP
- Requirement (JSON)

#### **UserBadge**
- Badge débloqué par un utilisateur
- Date d'obtention, progression

#### **Subscription**
- Plans (FREE, MONTHLY, YEARLY, LIFETIME)
- Statut (ACTIVE, EXPIRED, CANCELLED, TRIAL)
- Intégration Stripe

---

## 🤖 Système d'IA (Génération de Programmes)

### **Service**: `IaService` (`api/src/ia/ia.service.ts`)

#### Fonctionnement
1. **Scoring du profil** → Analyse du fitness profile (objectifs, niveau, fréquence)
2. **Sélection du template** → Choix du programme optimal (FULL_BODY, PPL, etc.)
3. **Génération via IA** (Groq/Llama):
   - Prompt structuré avec contexte utilisateur
   - Liste d'exercices disponibles (filtré par équipement/environnement)
   - Génération JSON avec séances + exercices
4. **Parsing & Validation** → Extraction du JSON, validation des données
5. **Création en DB** → Enregistrement programme + templates + séances

#### Backup System 🚧 (TODO)
- Actuellement: 3 tentatives max avant échec
- **À implémenter**: Fallback algorithmique si IA échoue

---

## 🔄 Architecture des Séances (Templates vs Instances)

### Concept Clé

**SessionTemplate** = Modèle réutilisable  
**TrainingSession** = Instance concrète (planifiée ou exécutée)

### Flow
1. Programme créé → **SessionTemplates** générés (ex: "Push Day", "Pull Day")
2. Utilisateur planifie une séance → Création d'une **TrainingSession** liée au template
3. Utilisateur exécute → Statut passe de SCHEDULED → IN_PROGRESS → COMPLETED
4. L'utilisateur peut:
   - Modifier la date d'une session planifiée
   - Supprimer une session planifiée (pas le template)
   - Re-créer plusieurs instances du même template

---

## 🔐 Authentification & Sécurité

### Stratégie JWT
- **Access Token**: Durée courte (15 min), stocké en mémoire
- **Refresh Token**: Durée longue (7 jours), stocké en HTTP-only cookie
- **Token Version**: Révocation globale des tokens par utilisateur

### Guards
- `JwtAuthGuard`: Vérifie l'access token
- `RolesGuard`: Permissions par rôle (non implémenté à ce jour)

### Sécurité Récente (Fixed)
- **Friend Code**: Génération unique pour éviter collisions
- **Endpoints sensibles**: Protection des données utilisateur (`getUserByEmail`, `getUserById`)

---

## 🎨 Design System (Frontend)

### Couleurs Principales
- **Primary**: `#94fbdd` (cyan/turquoise)
- **Secondary**: `#7de3c7`
- **Gradients**: Cyan → Turquoise pour les CTAs

### Philosophie UI/UX
- **Mobile-first**: Responsive by default
- **Premium & Modern**: Glassmorphism, animations subtiles, micro-interactions
- **Inspirations**: Strava, Nike Training Club, Apple Health
- **Principes**:
  - Hiérarchie visuelle claire
  - Typographie moderne (Inter, Roboto)
  - Animations Framer Motion (spring physics)
  - Dark mode par défaut (possibilité light mode)

### Composants Clés
- `EditProgramModal`: Édition de programmes (cardio refactorisé récemment)
- `EditSessionModal`: Édition de séances (scroll optimisé)
- `SelectExerciseModal`: Sélection d'exercices (filtres par muscle)
- `ProgramCard`: Carte de programme (extraite pour réutilisabilité)
- `MuscleHeatmap`: Carte musculaire interactive (body atlas)
- `ActiveSessionView`: Interface session en cours

---

## 🚀 Fonctionnalités Principales

### ✅ Implémenté

#### 1. Gestion des Programmes
- Création automatique (via IA) ou manuelle
- Templates multiples (Full Body, PPL, Upper/Lower, etc.)
- Statuts (Active, Archived, Completed, Draft)
- Édition complète (nom, séances, exercices, cardio)

#### 2. Séances d'Entraînement
- **Templates réutilisables** (SessionTemplate)
- **Planification** de sessions (TrainingSession)
- **Exécution en temps réel** (statuts SCHEDULED → IN_PROGRESS → COMPLETED)
- Tracking performances (sets, reps, poids, RPE)
- Photos de séances
- Résumés automatiques (volume total, calories)

#### 3. Système Social
- **Amis**: Ajout via friend code, demandes, acceptation
- **Groupes**: Création, invitation, gestion membres
- **Chat temps réel**: WebSockets, conversations privées/groupes
- **Activités**: Fil d'actualité (séances complétées, PRs, streaks)
- **Réactions**: Emojis sur messages et activités

#### 4. Gamification
- **XP & Levels**: +50 XP par séance complétée (1x/jour max)
- **Badges**: 4 catégories (Training, Social, Progression, Special)
- **Body Atlas**: Statistiques musculaires, niveaux par muscle (0-5)
- **Mirror Match**: Duels en temps réel sur un muscle spécifique

#### 5. Onboarding
- Flow moderne en 5 étapes (Welcome → Infos → Objectifs → Expérience → Jours)
- Animations Framer Motion
- Stockage Zustand + localStorage
- Redirection automatique si pas de fitness profile

#### 6. Premium/Subscription
- Plans: FREE, MONTHLY, YEARLY, LIFETIME
- Intégration Stripe
- Gestion des trials

---

### 🚧 TODO (Priorités - voir `todo.md`)

#### Phase 1 - Critique
1. **Système de Backup IA**: Fallback algorithmique si IA échoue (3 tentatives max)
2. **Gestion des Équipements**: Filtrage exercices selon équipement disponible (utilisateurs à domicile)

#### Phase 2 - Important
3. **Préférences Avancées**: Templates personnalisés (ex: Focus Jambes uniquement)
4. **Alternatives d'Exercices**: Remplacement d'exercices après génération

#### Phase 3 - Amélioration
5. **Système d'Agenda**: Calendrier Pronote-style pour planifier séances

#### Bugs Connus
- **ExerciceSession**: Contrainte unique (sessionId, exerciceId) empêche duplications → À retirer pour autoriser plusieurs occurrences du même exercice dans une session

---

## 📊 Conventions de Code

### Backend (NestJS)
- **Modules**: Un module par fonctionnalité (auth, users, program, etc.)
- **Services**: Logique métier (ex: `ProgramService`, `IaService`)
- **Controllers**: Routes API (décorateurs `@Get`, `@Post`, etc.)
- **DTOs**: Validation via `class-validator` (ex: `CreateProgramDto`)
- **Guards**: Authentification (`JwtAuthGuard`) et autorisations
- **Interceptors**: Logging, transformation de réponses
- **Naming**: 
  - Controllers: `*.controller.ts`
  - Services: `*.service.ts`
  - DTOs: `*.dto.ts`
  - Entities: `*.entity.ts` (ou types Prisma)

### Frontend (React)
- **Components**: Functional components (hooks)
- **State**: 
  - Local: `useState`, `useReducer`
  - Global: Zustand stores
  - Server: TanStack Query (React Query)
- **Hooks personnalisés**: Préfixe `use` (ex: `useAuth`, `useProgram`)
- **Styling**: Tailwind CSS (utility-first)
- **Naming**:
  - Components: PascalCase (ex: `ProgramCard.tsx`)
  - Hooks: camelCase avec `use` (ex: `useCreateProgram.ts`)
  - Utils: camelCase (ex: `formatDate.ts`)
  - Types: PascalCase (ex: `Program.ts`)

---

## 🧪 Tests

### Backend
- **Unit**: Jest (`npm run test:unit`)
- **E2E**: Jest (`npm run test:e2e`)
- **Config**: `test/unit/jest-unit.json`, `test/e2e/jest-e2e.json`

### Frontend
- ⚠️ Pas de tests configurés à ce jour (TODO)

---

## 🌐 Environnement de Développement

### Ports
- **Backend**: 3000
- **Frontend**: 5173
- **PostgreSQL**: 5433 (à cause du conflit avec le port par défaut 5432)
- **pgAdmin** (optionnel): 5050

### Variables d'Environnement

#### `.env` (root)
```env
DATABASE_URL="postgresql://user:password@localhost:5433/myo_fitness"
```

#### `api/.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5433/myo_fitness"
JWT_SECRET="votre_secret"
JWT_REFRESH_SECRET="votre_refresh_secret"
GROQ_API_KEY="votre_clé_groq"
AWS_ACCESS_KEY_ID="votre_r2_access_key"
AWS_SECRET_ACCESS_KEY="votre_r2_secret"
AWS_S3_BUCKET="myo-fitness"
AWS_S3_REGION="auto"
AWS_S3_ENDPOINT="https://xxxxx.r2.cloudflarestorage.com"
STRIPE_SECRET_KEY="sk_test_xxxxx"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="votre_email"
EMAIL_PASSWORD="votre_app_password"
```

#### `client/.env.development`
```env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="http://localhost:3000"
```

---

## 🚀 Commandes Essentielles

### Setup Initial
```bash
# Installer dépendances
cd api && npm install
cd ../client && npm install

# Démarrer PostgreSQL (Docker)
docker-compose up -d

# Setup DB (Prisma)
cd api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Développement
```bash
# Terminal 1 - Backend
cd api
npm run start:dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Base de Données
```bash
# Réinitialiser DB (⚠️ Supprime toutes les données)
cd api
npm run db:reset

# Nouvelle migration
npx prisma migrate dev --name nom_migration

# Regénérer client Prisma (après modif schema)
npm run prisma:generate

# Seed data
npm run prisma:seed
```

### Mobile (Capacitor)
```bash
cd client

# Android
npm run android:sync
npm run android:run

# iOS
npm run ios:sync
npm run ios:dev
```

---

## 🔍 Points d'Attention Récents

### Refactoring Récent (issues résolues)
- **Cardio UI** (EditProgramModal): Refonte design cohérent avec thème #94fbdd
- **Security**: Correction collision friend codes + protection endpoints sensibles
- **Program Page Header**: Redesign moderne et minimaliste
- **Sessions From Templates**: Séparation claire templates ↔ instances
- **Active Session Input**: Fallback sur planned reps/weight si non modifié
- **Modal Scroll**: Fix défilement choppy dans EditSessionModal
- **Exercise Selection**: Filtres modernes (tri par muscle, alphabétique)
- **Badge Checking**: Optimisation queries N+1

### Architecture Patterns
- **Separation of Concerns**: Templates (réutilisables) vs Instances (concrètes)
- **Server State**: React Query pour cache + invalidation automatique
- **Real-time**: WebSockets pour chat + notifications
- **Optimistic Updates**: UI réactive avant confirmation serveur
- **Mobile-first**: Responsive layouts par défaut

---

## 📚 Ressources Utiles

### Documentation
- **NestJS**: https://docs.nestjs.com/
- **Prisma**: https://www.prisma.io/docs
- **React Query**: https://tanstack.com/query/latest/docs/framework/react/overview
- **Zustand**: https://zustand-demo.pmnd.rs/
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com/docs

### API Swagger
- Accès local: http://localhost:3000/api
- Routes testables directement depuis l'interface

### Compte de Test (après seed)
```
Email: jean.dupont@example.com
Password: password123
```

---

## 🎯 Philosophie du Projet

### Objectifs UX
- **Simplicité**: Flow intuitif, onboarding fluide
- **Motivation**: Gamification (XP, badges), social (amis, activités)
- **Personnalisation**: IA adaptée au profil, modifications manuelles possibles
- **Fiabilité**: Backup IA, validation stricte, gestion d'erreurs

### Principes Techniques
- **Type Safety**: TypeScript strict (backend + frontend)
- **API-first**: Backend comme source de vérité
- **Real-time**: WebSockets pour expérience collaborative
- **Mobile-ready**: Responsive + Capacitor pour apps natives
- **Performance**: Lazy loading, caching intelligent (React Query), optimistic updates

---

## 📈 Métriques de Succès (Objectifs)

- **Fiabilité IA**: 99%+ de génération réussie
- **Personnalisation**: 80%+ utilisent préférences avancées
- **Engagement**: 70%+ séances planifiées complétées
- **Satisfaction**: 4.5/5 étoiles UX

---

## 🔗 Liens Rapides

- **Repository**: GitHub (local - pas d'URL publique renseignée)
- **Temps de setup**: ~5 minutes
- **Status**: ✅ MVP Fonctionnel (en développement actif)
- **Version**: 0.0.1
- **Date de création**: 2024-2025
- **Dernière mise à jour contexte**: 2026-01-07

---

## 🤝 Utilisation de ce Document

### Pour l'IA (Antigravity/Claude)
Ce fichier doit être fourni en contexte à chaque nouvelle conversation pour comprendre:
- L'architecture globale
- Les technologies utilisées
- Les conventions de code
- Les fonctionnalités implémentées
- Les TODOs prioritaires
- Les refactorings récents

### Pour les Développeurs
Référence rapide pour:
- Onboarding nouveaux contributeurs
- Comprendre le flow de données
- Identifier les dépendances entre modules
- Consulter les règles de nommage

---

**🎉 Myo-Fitness est prêt pour vos prochaines fonctionnalités !**
