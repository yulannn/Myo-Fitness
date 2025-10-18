# 🌱 Fichier Seed - Base de Données Myo-Fitness

Ce fichier seed contient des données complètes pour initialiser votre base de données avec des données réalistes.

## 📊 Contenu du Seed

### 👥 Utilisateurs (2)

- **Jean Dupont** (jean.dupont@example.com) - Homme, 28 ans, Intermédiaire
- **Marie Martin** (marie.martin@example.com) - Femme, 25 ans, Débutante

### 💪 Groupes Musculaires (14)

- Pectoraux, Dorsaux, Épaules, Biceps, Triceps
- Quadriceps, Ischio-jambiers, Fessiers, Mollets
- Abdominaux, Obliques, Avant-bras, Trapèzes, Lombaires

### 🏋️ Exercices (70)

**Poids du Corps (35 exercices) :**

- Pompes (classiques, inclinées, diamant, archer, pike, spiderman, une main)
- Tractions (classiques, assistées, australiennes, L-sit)
- Squats (classiques, sautés, pistol, bulgares, jump)
- Planches (classique, latérale)
- Burpees, Mountain Climbers
- Exercices avancés (Handstand Push-ups, Muscle-ups, L-sit, Dragon Flags)

**Salle de Sport (35 exercices) :**

- Développé couché (plat, incliné, décliné, haltères, Arnold)
- Tirage (horizontal, vertical, face pulls)
- Soulevé de terre (classique, roumain, sumo)
- Squats barre (classique, avant, goblet, hack)
- Développé militaire, Élévations
- Curls biceps (concentrés, 21), Extensions triceps (couché)
- Hip Thrust, Swing Kettlebell, Tractions lestées

### 🏃‍♀️ Profils Fitness (2)

- **Profil 1** : Homme, 4x/semaine, Salle de sport, Prise de masse
- **Profil 2** : Femme, 3x/semaine, Poids du corps, Perte de poids

### 🎯 Programmes d'Exemple (2)

- Programme Intermédiaire 4x/semaine (Upper/Lower)
- Programme Débutant 3x/semaine (Full Body)

## 🚀 Utilisation

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données

Assurez-vous que votre fichier `.env` contient :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/myo_fitness"
```

### 3. Génération du client Prisma

```bash
npm run prisma:generate
```

### 4. Exécution des migrations

```bash
npm run prisma:migrate
```

### 5. Exécution du seed

```bash
npm run prisma:seed
```

### 6. Reset complet (optionnel)

```bash
npm run db:reset
```

## 📋 Scripts Disponibles

- `npm run prisma:generate` - Génère le client Prisma
- `npm run prisma:migrate` - Exécute les migrations
- `npm run prisma:seed` - Exécute le seed
- `npm run db:reset` - Reset complet + seed

## 🔐 Identifiants de Test

**Utilisateur 1 :**

- Email: jean.dupont@example.com
- Mot de passe: password123

**Utilisateur 2 :**

- Email: marie.martin@example.com
- Mot de passe: password123

## 📈 Répartition des Exercices

### Par Type

- **Compound** : 50 exercices (mouvements complexes)
- **Isolation** : 18 exercices (mouvements ciblés)
- **Cardio** : 2 exercices (endurance)

### Par Difficulté

- **Niveau 1** : 8 exercices (débutants)
- **Niveau 2** : 18 exercices (intermédiaires)
- **Niveau 3** : 20 exercices (avancés)
- **Niveau 4** : 12 exercices (experts)
- **Niveau 5** : 12 exercices (élite)

### Par Équipement

- **Poids du corps** : 35 exercices
- **Haltères** : 15 exercices
- **Barre** : 10 exercices
- **Câbles** : 6 exercices
- **Kettlebell** : 3 exercices
- **Banc de musculation** : 8 exercices
- **Rack à squats** : 4 exercices

## 🎯 Objectifs Couverts

- **MUSCLE_GAIN** : Prise de masse musculaire
- **WEIGHT_LOSS** : Perte de poids
- **ENDURANCE** : Amélioration de l'endurance
- **MAINTENANCE** : Maintien de la forme

## 🔧 Personnalisation

Pour ajouter vos propres données, modifiez le fichier `prisma/seed.ts` :

1. **Ajouter des utilisateurs** : Modifiez la section `users`
2. **Ajouter des exercices** : Modifiez la section `exercices`
3. **Ajouter des groupes musculaires** : Modifiez la section `muscleGroups`
4. **Ajouter des équipements** : Modifiez la section `equipments`

## ⚠️ Notes Importantes

- Les mots de passe sont hashés avec bcrypt
- Tous les exercices sont marqués comme `isDefault: true`
- Les relations entre exercices et groupes musculaires sont automatiquement créées
- Les programmes sont créés avec le statut `DRAFT`
- Les données sont réalistes et utilisables en production
