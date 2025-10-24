# 🏋️ Seed Exercices CSV - Guide Complet

Ce fichier permet d'importer automatiquement **800+ exercices** depuis le fichier CSV `fitness_final.csv` directement dans votre base de données.

## 📋 Table des Matières

- [Prérequis](#-prérequis)
- [Installation Rapide](#-installation-rapide)
- [Fonctionnalités](#-fonctionnalités)
- [Structure du CSV](#-structure-du-csv)
- [Mapping Intelligent](#-mapping-intelligent)
- [Utilisation](#-utilisation)
- [Statistiques](#-statistiques)
- [Dépannage](#-dépannage)

## ✅ Prérequis

Avant d'exécuter le seed des exercices CSV, assurez-vous que :

1. **La base de données est configurée** : Votre `.env` contient `DATABASE_URL`
2. **Les migrations sont appliquées** : `npm run prisma:migrate`
3. **Les groupes musculaires existent** : Exécutez d'abord `npm run prisma:seed` pour créer les groupes musculaires et équipements de base
4. **Le fichier CSV est présent** : `api/prisma/fitness_final.csv` (déjà inclus)

## 🚀 Installation Rapide

```bash
# 1. Installer les dépendances
cd api
npm install

# 2. Configurer la base de données
cp .env.example .env
# Éditez .env avec vos informations de connexion

# 3. Appliquer les migrations
npm run prisma:migrate

# 4. Créer les groupes musculaires et équipements de base
npm run prisma:seed

# 5. Importer les exercices depuis le CSV
npm run prisma:seed:exercices
```

## 🎯 Fonctionnalités

### ✨ Parsing CSV Intelligent

- **Gère les virgules dans les descriptions** : Le parser détecte les guillemets et parse correctement les champs avec virgules
- **Ignore les lignes vides** : Pas d'erreurs sur les lignes vides
- **Gestion robuste des erreurs** : Continue l'import même en cas d'erreur sur un exercice

### 🧠 Détection Automatique

Le script détecte automatiquement :

1. **Type d'exercice** (COMPOUND, ISOLATION, CARDIO, MOBILITY, STRETCH)
2. **Difficulté** (1 à 5)
3. **Matériel requis** (bodyWeight vs Materials)
4. **Équipements nécessaires** (haltères, barre, kettlebell, etc.)
5. **Groupes musculaires ciblés**

### 🔄 Prévention des Doublons

- Vérifie si l'exercice existe déjà (par nom)
- Ne crée pas de doublons
- Affiche les exercices ignorés

### 📊 Statistiques Détaillées

Après l'import, vous obtenez :

- Nombre d'exercices créés
- Nombre d'exercices ignorés
- Nombre d'erreurs
- Répartition par difficulté
- Répartition par type
- Total d'exercices en base

## 📁 Structure du CSV

Le fichier `fitness_final.csv` contient 4 colonnes :

```csv
categorie,nom_exercice,description,gif_url
Exercices epaules,Développé militaire,"Description...",https://...
Exercices biceps,Curl à la barre,"Description...",https://...
...
```

### Catégories Disponibles

- `Exercices epaules` → Épaules, Trapèzes
- `Exercices biceps` → Biceps, Avant-bras
- `Exercices triceps` → Triceps
- `Exercices pectoraux` → Pectoraux
- `Exercices dos` → Dorsaux, Trapèzes
- `Exercices jambes` → Quadriceps, Ischio-jambiers, Fessiers
- `Exercices fessiers` → Fessiers, Ischio-jambiers
- `Exercices quadriceps` → Quadriceps
- `Exercices ischio-jambiers` → Ischio-jambiers
- `Exercices mollets` → Mollets
- `Exercices abdos` → Abdominaux
- `Exercices obliques` → Obliques
- `Exercices lombaires` → Lombaires
- `Exercices avant-bras` → Avant-bras
- `Exercices cardio` → Cardio
- `Exercices full body` → Compound

## 🧠 Mapping Intelligent

### Détection du Type d'Exercice

| Type | Mots-clés |
|------|-----------|
| **CARDIO** | burpee, sprint, course, cardio |
| **STRETCH** | stretch, étirement |
| **MOBILITY** | mobilité, mobility |
| **ISOLATION** | curl, extension, élévation, fly, oiseau, pec deck, face pull, rotation |
| **COMPOUND** | développé, press, squat, traction, pompe, push-up, rowing, soulevé |

### Détection de la Difficulté

| Niveau | Mots-clés | Description |
|--------|-----------|-------------|
| **5** | handstand, muscle-up, pistol, dragon flag, planche, front lever | Très difficile / Élite |
| **4** | militaire, deadlift, squat barre, lesté, weighted | Difficile / Expert |
| **3** | - | Moyen (par défaut) |
| **2** | classique, standard, base, planche, pont | Facile-Moyen |
| **1** | assisté, assisted, débutant, beginner, genou, knee, incliné | Facile / Débutant |

### Détection des Équipements

Le script détecte automatiquement si l'exercice nécessite :

- **Haltères** : haltère, dumbbell
- **Barre** : barre, barbell (sauf barre de traction)
- **Kettlebell** : kettlebell
- **Câbles/Poulie** : poulie, cable
- **Banc** : banc
- **Rack/Machine** : rack, smith, guidée, machine, presse
- **Barre de traction** : traction, pull-up
- **TRX** : trx, suspension, sangles
- **Anneaux** : anneau, rings
- **Matelas** : matelas, tapis, sol

### Détection des Groupes Musculaires

En plus du mapping par catégorie, le script détecte les groupes musculaires dans le nom :

- **Épaules** : épaule, shoulder, deltoïde
- **Pectoraux** : pectoraux, chest, poitrine
- **Dorsaux** : dorsaux, dos, back
- **Biceps** : biceps
- **Triceps** : triceps
- **Abdominaux** : abdo, abs, core
- **Quadriceps** : quadriceps, quad, cuisse
- **Fessiers** : fessier, glute
- **Mollets** : mollet, calf
- etc.

## 💻 Utilisation

### Option 1 : Commande NPM (Recommandé)

```bash
npm run prisma:seed:exercices
```

### Option 2 : Commande Directe

```bash
cd api
npx ts-node prisma/seed_exercices.ts
```

### Option 3 : Avec Docker

```bash
docker-compose exec api npm run prisma:seed:exercices
```

### Exemple de Sortie Console

```
🌱 Début du seeding des exercices depuis le CSV...
📖 Lecture du fichier CSV...
✅ 891 exercices trouvés dans le CSV

🔍 Vérification des groupes musculaires...
🔍 Vérification des équipements...

💪 Création des exercices...
  ✅ 50 exercices créés...
  ✅ 100 exercices créés...
  ✅ 150 exercices créés...
  ...

🎉 Seeding des exercices terminé !
📊 Résumé:
  - ✅ 891 exercices créés
  - ⏭️  0 exercices ignorés
  - ❌ 0 erreurs

📈 Statistiques de la base de données:
  - Total d'exercices: 961
  - Exercices au poids du corps: 125
  - Exercices avec matériel: 836

📊 Répartition par difficulté:
  - Niveau 1: 89 exercices
  - Niveau 2: 245 exercices
  - Niveau 3: 398 exercices
  - Niveau 4: 156 exercices
  - Niveau 5: 73 exercices

📊 Répartition par type:
  - COMPOUND: 524 exercices
  - ISOLATION: 356 exercices
  - CARDIO: 45 exercices
  - MOBILITY: 23 exercices
  - STRETCH: 13 exercices
```

## 📊 Statistiques

Après l'import complet, vous aurez environ :

- **891 exercices** importés du CSV
- **+ 70 exercices** du seed de base
- **= ~960 exercices** au total

### Répartition Attendue

**Par Catégorie :**
- Épaules : ~150 exercices
- Pectoraux : ~120 exercices
- Dos : ~110 exercices
- Biceps : ~80 exercices
- Triceps : ~70 exercices
- Jambes : ~180 exercices
- Abdos : ~100 exercices
- Autres : ~150 exercices

**Par Type :**
- COMPOUND : ~55%
- ISOLATION : ~38%
- CARDIO : ~5%
- MOBILITY/STRETCH : ~2%

**Par Difficulté :**
- Niveau 1 (Débutant) : ~10%
- Niveau 2 (Facile-Moyen) : ~25%
- Niveau 3 (Moyen) : ~42%
- Niveau 4 (Difficile) : ~17%
- Niveau 5 (Élite) : ~6%

**Par Équipement :**
- Poids du corps : ~13%
- Haltères : ~35%
- Barre : ~20%
- Câbles/Poulie : ~15%
- Machines : ~10%
- Autres : ~7%

## 🐛 Dépannage

### Erreur : "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Erreur : "Table 'MuscleGroup' does not exist"

```bash
npm run prisma:migrate
npm run prisma:seed
```

### Erreur : "ENOENT: no such file or directory, open 'fitness_final.csv'"

Vérifiez que le fichier CSV est dans `api/prisma/fitness_final.csv`.

### Beaucoup d'exercices ignorés

C'est normal si vous avez déjà exécuté le seed. Le script ignore les exercices existants pour éviter les doublons.

### Erreurs de parsing CSV

Si des exercices ont des descriptions avec des guillemets mal formés, ils seront ignorés. Vérifiez les logs pour identifier les exercices problématiques.

## 🔧 Personnalisation

### Ajouter des Catégories

Dans `seed_exercices.ts`, modifiez `categoryToMuscleGroups` :

```typescript
const categoryToMuscleGroups: Record<string, string[]> = {
  'Exercices epaules': ['Épaules', 'Trapèzes'],
  'Ma nouvelle catégorie': ['Groupe1', 'Groupe2'],
  // ...
};
```

### Modifier la Détection de Difficulté

Dans `seed_exercices.ts`, modifiez `determineDifficulty()` :

```typescript
const level5Keywords = [
  'handstand', 'muscle-up', 'pistol',
  'mon_mot_cle_custom', // Ajoutez vos mots-clés
];
```

### Ajouter des Équipements

Dans `seed_exercices.ts`, ajoutez dans `equipmentNames` :

```typescript
const equipmentNames = [
  { name: 'Haltères', description: 'Haltères ajustables' },
  { name: 'Mon Équipement', description: 'Description' },
  // ...
];
```

Puis dans `determineEquipments()`, ajoutez la détection :

```typescript
if (lowerName.includes('mon_mot_cle')) {
  equipments.push('Mon Équipement');
}
```

## 📚 Ressources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Schéma de la base de données](./schema.prisma)
- [Seed de base](./seed.ts)
- [CSV Source](./fitness_final.csv)

## 🎉 Résultat Final

Après avoir exécuté les deux seeds (`prisma:seed` + `prisma:seed:exercices`), vous aurez :

✅ **~960 exercices** avec descriptions complètes
✅ **14 groupes musculaires** couverts
✅ **10 types d'équipements** différents
✅ **Relations automatiques** exercices ↔ groupes musculaires
✅ **Relations automatiques** exercices ↔ équipements
✅ **Métadonnées complètes** : difficulté, type, matériel requis
✅ **Base de données prête** pour votre application fitness

---

**Bon seeding ! 💪**

