# 📋 TODO - Améliorations Myo-Fitness

## 🎯 Vue d'ensemble

Ce document liste les améliorations prioritaires pour l'application Myo-Fitness, organisées par ordre d'importance et de complexité.

---

## 🏋️‍♂️ TODO — Autoriser plusieurs occurrences du même exercice dans une session

### 🎯 Objectif
Permettre d’ajouter plusieurs fois le même exercice dans une session sans lever l’erreur Prisma `P2002: Unique constraint failed on the fields: (sessionId, exerciceId)`.

### 🧩 Problème actuel
La table `ExerciceSession` possède une contrainte d’unicité sur (`sessionId`, `exerciceId`), empêchant la duplication d’un même exercice dans une session.  
Lorsqu’on tente d’ajouter un exercice déjà existant, Prisma renvoie une erreur de contrainte unique.

### ✅ Solution à implémenter
- [ ] Modifier le modèle `ExerciceSession` dans `schema.prisma` :
  ```prisma
  model ExerciceSession {
    id             Int      @id @default(autoincrement())
    sessionId      Int
    exerciceId     Int
    sets           Int?
    reps           Int?
    weight         Int?

    trainingSession TrainingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
    exercice         Exercice        @relation(fields: [exerciceId], references: [id], onDelete: Cascade)
  }




## 🔧 **1. Gestion Intelligente des Équipements**

### 📝 Description

Actuellement, le système ne distingue que deux types d'entraînement : poids du corps vs salle de sport. Il faut intégrer la gestion des équipements spécifiques de l'utilisateur pour personnaliser davantage les programmes.

### 🎯 Objectif

- Utiliser les équipements disponibles chez l'utilisateur pour générer des exercices adaptés
- Optimiser la sélection d'exercices selon l'équipement réellement disponible
- Améliorer l'expérience utilisateur en proposant des exercices faisables

### 📋 Tâches à implémenter

#### 1.1 Cible

- Uniquement pour les utilisateurs qui ne vont pas a la salle car en salle de sport tout les équipements de base sont disponible

#### 1.2 Interface utilisateur

- [ ] Créer une page "Mes Équipements" dans le profil utilisateur
- [ ] Interface pour sélectionner les équipements disponibles
- [ ] Système de checkboxes pour chaque équipement (haltères, barre, TRX, etc.)

#### 1.3 Logique métier

- [ ] Modifier `IaService.generateProgram()` pour prendre en compte les équipements
- [ ] Filtrer les exercices selon l'équipement disponible
- [ ] Prioriser les exercices avec équipement disponible vs exercices de substitution

#### 1.4 Règles d'équipement

- [ ] **Salle de sport** : Supposer que tous les équipements basiques sont disponibles
- [ ] **Domicile** : Utiliser uniquement les équipements sélectionnés par l'utilisateur
- [ ] **Mixte** : Combiner équipements domicile + salle selon les préférences

---

## 🤖 **2. Système de Backup pour l'IA**

### 📝 Description

Implémenter un système de fallback robuste qui génère des programmes de manière algorithmique si l'IA échoue après 3 tentatives.

### 🎯 Objectif

- Garantir qu'un programme est toujours généré, même en cas d'échec de l'IA
- Réduire la dépendance à l'API externe
- Améliorer la fiabilité du système

### 📋 Tâches à implémenter

#### 2.1 Fonction de backup

- [ ] Créer `generateProgramBackup()` dans `IaService`
- [ ] Algorithme de génération basé sur les templates prédéfinis
- [ ] Sélection aléatoire d'exercices par groupe musculaire
- [ ] Respect des règles de progression et de variété

#### 2.2 Logique de retry améliorée

```typescript
// Structure proposée
async generateProgram(fitnessProfile: FitnessProfile) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
   // logique du llm
  }

  // si maxRetries === attempt on appel le backup
}
```

#### 2.3 Règles algorithmiques

- [ ] **Template FULL_BODY** : 1 séance avec 5-6 exercices couvrant tous les groupes
- [ ] **Template PUSH_PULL_LEGS** : 3 séances spécialisées avec 4-5 exercices chacune
- [ ] **Template PUSH_PULL_LEGS_PUSH_PULL_LEGS** : 6 séances spécialisées avec 4-5 exercices chacune
- [ ] **Template UPPER_LOWER** : 2 séances avec 5-6 exercices par séance
- [ ] **Template UPPER_LOWERUPPER_LOWER** : 4 séances avec 5-6 exercices par séance
- [ ] **Template PUSH_PULL_LEGS_UPPER_LOWER** : 5 séances avec 4-5 exercices chacune

#### 2.4 Sélection intelligente d'exercices

- [ ] Éviter la répétition d'exercices dans la même semaine
- [ ] Équilibrer les exercices compound vs isolation
- [ ] Respecter le niveau de difficulté de l'utilisateur
- [ ] Varier les exercices selon les préférences (poids du corps/salle)

---

## 📅 **3. Système d'Agenda de Séances**

### 📝 Description

Créer un système d'agenda similaire à Pronote où l'utilisateur peut planifier ses séances sur un calendrier hebdomadaire.

### 🎯 Objectif

- Permettre à l'utilisateur de planifier ses entraînements
- Visualiser sa semaine d'entraînement
- Faciliter l'organisation et la motivation

### 📋 Tâches à implémenter

#### 3.1 Modèle de données

- [ ] Ajouter `ScheduledSession` dans le schéma Prisma
- [ ] Champs : `userId`, `programId`, `sessionId`, `scheduledDate`, `status`
- [ ] Statuts : `PLANNED`, `COMPLETED`, `SKIPPED`, `RESCHEDULED`

#### 3.2 Interface utilisateur

- [ ] Calendrier hebdomadaire (vue semaine)
- [ ] Drag & drop des séances sur les jours
- [ ] Indicateurs visuels : séances planifiées, complétées, manquées
- [ ] Modal pour sélectionner une séance à planifier

#### 3.3 Fonctionnalités

- [ ] **Planification** : Cliquer sur un jour → choisir une séance du programme
- [ ] **Réorganisation** : Déplacer une séance d'un jour à l'autre
- [ ] **Suivi** : Marquer une séance comme complétée
- [ ] **Historique** : Voir les séances passées et leurs performances

#### 3.4 Intégration avec les programmes

- [ ] Auto-planification lors de la génération d'un programme
- [ ] Suggestions intelligentes selon la fréquence d'entraînement
- [ ] Alertes pour les séances manquées

---

## ⚙️ **4. Préférences Avancées du Profil Fitness**

### 📝 Description

Permettre aux utilisateurs de personnaliser finement leurs programmes en définissant leurs propres templates d'entraînement.

### 🎯 Objectif

- Offrir une flexibilité maximale dans la création de programmes
- Permettre des programmes spécialisés (ex: focus jambes uniquement)
- Remplacer les templates prédéfinis par des templates personnalisés

### 📋 Tâches à implémenter

#### 4.1 Modèle de données

- [ ] Ajouter `CustomTemplate` dans le schéma Prisma
- [ ] Champs : `userId`, `name`, `sessions`, `isActive`
- [ ] Structure JSON pour définir les séances personnalisées

#### 4.2 Interface de configuration

- [ ] Page "Mes Préférences" dans le profil
- [ ] Interface drag & drop pour créer des séances
- [ ] Sélection des groupes musculaires par séance
- [ ] Nombre d'exercices par séance (3-8 exercices)

#### 4.3 Exemple d'utilisation

```typescript
// Exemple : Programme "Focus Jambes"
const customTemplate = {
  name: "Focus Jambes",
  sessions: [
    {
      name: "Jambes 1",
      muscleGroups: ["Quadriceps", "Fessiers"],
      exerciseCount: 5,
    },
    {
      name: "Jambes 2",
      muscleGroups: ["Ischio-jambiers", "Mollets"],
      exerciseCount: 4,
    },
    {
      name: "Jambes 3",
      muscleGroups: ["Quadriceps", "Fessiers", "Ischio-jambiers"],
      exerciseCount: 6,
    },
    {
      name: "Abdominaux",
      muscleGroups: ["Abdominaux", "Obliques"],
      exerciseCount: 4,
    },
  ],
};
```

#### 4.4 Logique de génération

- [ ] Modifier `templateCreation()` pour détecter les templates personnalisés
- [ ] Utiliser `CUSTOM` comme template au lieu des templates prédéfinis
- [ ] Générer les exercices selon les groupes musculaires spécifiés

---

## 🔄 **5. Système d'Alternatives d'Exercices**

### 📝 Description

Permettre aux utilisateurs de remplacer des exercices par des alternatives après la génération du programme.

### 🎯 Objectif

- Adapter le programme aux préférences personnelles
- Remplacer des exercices non appréciés ou non faisables
- Maintenir la cohérence du programme

### 📋 Tâches à implémenter

#### 5.1 Modèle de données

- [ ] Ajouter `ExerciseAlternative` dans le schéma Prisma
- [ ] Champs : `originalExerciseId`, `alternativeExerciseId`, `reason`
- [ ] Raisons : `PREFERENCE`, `EQUIPMENT_UNAVAILABLE`, `INJURY`, `DIFFICULTY`

#### 5.2 Interface utilisateur

- [ ] Bouton "Remplacer" sur chaque exercice du programme
- [ ] Modal avec liste des alternatives possibles
- [ ] Filtres : même groupe musculaire, même difficulté, même équipement
- [ ] Prévisualisation de l'exercice alternatif

#### 5.3 Logique de suggestions

- [ ] **Même groupe musculaire** : Priorité aux exercices ciblant les mêmes muscles
- [ ] **Même difficulté** : Maintenir le niveau de challenge
- [ ] **Même équipement** : Respecter les contraintes d'équipement
- [ ] **Même type** : Compound vs Isolation selon l'original

#### 5.4 Règles de substitution

- [ ] Éviter les doublons dans la même séance
- [ ] Maintenir l'équilibre compound/isolation
- [ ] Conserver la progression logique du programme
- [ ] Sauvegarder l'historique des substitutions

---

## 📊 **Priorisation et Planning**

### 🔥 **Phase 1 - Critique (Semaine 1-2)**

1. **Système de Backup IA** - Garantir la fiabilité
2. **Gestion des Équipements** - Améliorer la personnalisation

### ⚡ **Phase 2 - Important (Semaine 3-4)**

3. **Préférences Avancées** - Flexibilité maximale
4. **Alternatives d'Exercices** - Adaptation fine

### 🎯 **Phase 3 - Amélioration (Semaine 5-6)**

5. **Système d'Agenda** - Expérience utilisateur complète

---

## 🧪 **Tests et Validation**

### Tests unitaires

- [ ] Tests pour `generateProgramBackup()`
- [ ] Tests pour la gestion des équipements
- [ ] Tests pour les templates personnalisés

### Tests d'intégration

- [ ] Test complet du flux de génération de programme
- [ ] Test de l'agenda avec planification
- [ ] Test des alternatives d'exercices

### Tests utilisateur

- [ ] Validation avec des utilisateurs réels
- [ ] Feedback sur l'interface d'agenda
- [ ] Test des préférences avancées

---

## 📈 **Métriques de Succès**

- **Fiabilité** : 99%+ de génération de programmes réussie
- **Personnalisation** : 80%+ des utilisateurs utilisent les préférences avancées
- **Engagement** : 70%+ des séances planifiées sont complétées
- **Satisfaction** : 4.5/5 étoiles sur l'expérience utilisateur
