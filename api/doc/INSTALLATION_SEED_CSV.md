# 🎯 Installation & Utilisation - Seed CSV Exercices

## ✅ Ce qui a été créé

### 📝 Fichiers Créés

| Fichier | Description | Lignes |
|---------|-------------|--------|
| `prisma/seed_exercices.ts` | Script d'import CSV principal | 500+ |
| `prisma/SEED_EXERCICES_README.md` | Documentation complète | - |
| `README_SEED_CSV.md` | Guide de démarrage rapide | - |
| `GUIDE_SEED_EXERCICES.md` | Guide complet avec exemples | - |
| `CHANGELOG_SEED_CSV.md` | Historique et métriques | - |
| `INSTALLATION_SEED_CSV.md` | Ce fichier (instructions d'installation) | - |

### ⚙️ Fichiers Modifiés

| Fichier | Modification |
|---------|-------------|
| `package.json` | Ajout du script `prisma:seed:exercices` |
| `SEED_README.md` | Ajout de la section seed CSV |

## 🚀 Installation en 4 Étapes

### Étape 1 : Régénérer le Client Prisma

**Important** : Le script utilise le champ `imageUrl` ajouté récemment au schéma. Il faut régénérer le client Prisma :

```bash
cd api
npm run prisma:generate
```

> ⚠️ Cette étape est **obligatoire** sinon vous aurez une erreur TypeScript.

### Étape 2 : Appliquer les Migrations (si besoin)

```bash
npm run prisma:migrate
```

### Étape 3 : Créer les Données de Base

```bash
npm run prisma:seed
```

Cela va créer :
- 2 utilisateurs de test
- 14 groupes musculaires
- 10 équipements
- 70 exercices de base
- 2 profils fitness
- 2 programmes d'exemple

### Étape 4 : Importer les Exercices CSV

```bash
npm run prisma:seed:exercices
```

Cela va importer :
- **890 exercices** depuis `fitness_final.csv`
- Avec **descriptions complètes**
- Avec **URLs des GIFs d'animation**
- Avec **groupes musculaires** automatiquement assignés
- Avec **équipements** automatiquement détectés
- Avec **type et difficulté** intelligemment déterminés

## 📊 Résultat Attendu

Après les 4 étapes, vous aurez :

```
📦 Base de données Myo-Fitness
├── 👥 Utilisateurs: 2
├── 💪 Groupes musculaires: 14
├── 🏋️ Équipements: 10
├── 🎯 Exercices: ~960
│   ├── 📥 Du CSV: 890
│   ├── 📝 De base: 70
│   ├── 🏠 Poids du corps: ~125
│   └── 🏋️ Avec matériel: ~835
├── 👤 Profils fitness: 2
└── 📋 Programmes: 2
```

## 🔍 Vérification

### Option 1 : Via la Console du Script

Après l'exécution, vous devriez voir :

```
🎉 Seeding des exercices terminé !
📊 Résumé:
  - ✅ 890 exercices créés
  - ⏭️  0 exercices ignorés
  - ❌ 0 erreurs

📈 Statistiques de la base de données:
  - Total d'exercices: 960
  - Exercices au poids du corps: 125
  - Exercices avec matériel: 835
```

### Option 2 : Via Prisma Studio

```bash
npx prisma studio
```

Puis naviguez vers la table `Exercice` et vérifiez :
- Le nombre total d'exercices (~960)
- Les relations avec `ExerciceMuscleGroup`
- Les relations avec `ExerciceEquipment`
- Les valeurs des champs `imageUrl`

### Option 3 : Via SQL

```sql
-- Compter les exercices
SELECT COUNT(*) FROM "Exercice";

-- Voir la répartition par difficulté
SELECT difficulty, COUNT(*) as count 
FROM "Exercice" 
GROUP BY difficulty 
ORDER BY difficulty;

-- Voir la répartition par type
SELECT type, COUNT(*) as count 
FROM "Exercice" 
GROUP BY type;

-- Voir les exercices avec GIF
SELECT COUNT(*) 
FROM "Exercice" 
WHERE "imageUrl" IS NOT NULL;
```

## 🎨 Fonctionnalités du Script

### ✨ Ce que le script fait automatiquement :

1. ✅ **Parse le CSV** avec gestion des virgules dans les descriptions
2. ✅ **Détecte le type** (COMPOUND, ISOLATION, CARDIO, MOBILITY, STRETCH)
3. ✅ **Détermine la difficulté** (1-5) selon les mots-clés
4. ✅ **Identifie les équipements** nécessaires (haltères, barre, etc.)
5. ✅ **Assigne les groupes musculaires** (1-5 par exercice)
6. ✅ **Stocke les URLs des GIFs** pour l'affichage
7. ✅ **Évite les doublons** (si un exercice existe déjà, il est ignoré)
8. ✅ **Affiche des statistiques** détaillées

### 🧠 Exemples de Détection Intelligente

| Nom de l'exercice | Type | Difficulté | Équipements | Groupes Musculaires |
|-------------------|------|------------|-------------|---------------------|
| "Pompes" | COMPOUND | 2 | [] | Pectoraux, Triceps |
| "Handstand push-up" | COMPOUND | 5 | [] | Épaules, Triceps |
| "Curl avec haltères" | ISOLATION | 2 | [Haltères] | Biceps, Avant-bras |
| "Développé couché" | COMPOUND | 3 | [Barre, Banc] | Pectoraux, Triceps, Épaules |
| "Burpees" | CARDIO | 4 | [] | Full body |

## 🐛 Résolution des Problèmes

### Erreur : `imageUrl does not exist in type`

**Cause** : Le client Prisma n'a pas été régénéré après l'ajout du champ `imageUrl`.

**Solution** :
```bash
npm run prisma:generate
npm run prisma:seed:exercices
```

### Erreur : `Table 'MuscleGroup' does not exist`

**Cause** : Les migrations n'ont pas été appliquées ou le seed de base n'a pas été exécuté.

**Solution** :
```bash
npm run prisma:migrate
npm run prisma:seed
npm run prisma:seed:exercices
```

### Erreur : `Foreign key constraint failed`

**Cause** : Les groupes musculaires ou équipements n'existent pas.

**Solution** : Exécutez d'abord le seed de base :
```bash
npm run prisma:seed
npm run prisma:seed:exercices
```

### Message : `⏭️ Exercice déjà existant: ...`

**Cause** : Le script a déjà été exécuté et les exercices existent.

**Solution** : C'est normal ! Le script évite les doublons. Si vous voulez réimporter :
```bash
npm run db:reset
npm run prisma:seed:exercices
```

### Erreur de Parsing CSV

**Symptôme** : Certains exercices ne sont pas importés.

**Solution** : Vérifiez que le CSV est bien formaté (guillemets pour les descriptions avec virgules).

## 🔄 Commandes Utiles

### Reset Complet

```bash
npm run db:reset  # Reset + seed de base uniquement
npm run prisma:seed:exercices  # Puis import CSV
```

### Réimport Complet

```bash
npx prisma migrate reset --force
npm run prisma:seed
npm run prisma:seed:exercices
```

### Import Incrémental

```bash
# Ajoutez de nouveaux exercices dans fitness_final.csv
npm run prisma:seed:exercices
# Les nouveaux seront ajoutés, les existants ignorés
```

## 📚 Documentation Disponible

| Document | Usage |
|----------|-------|
| `README_SEED_CSV.md` | 🚀 Démarrage rapide (2 min) |
| `GUIDE_SEED_EXERCICES.md` | 📖 Guide complet avec exemples |
| `prisma/SEED_EXERCICES_README.md` | 🔧 Documentation technique détaillée |
| `CHANGELOG_SEED_CSV.md` | 📊 Métriques et historique |
| `INSTALLATION_SEED_CSV.md` | 💻 Ce fichier (installation) |

## 🎯 Prochaines Étapes

Maintenant que vous avez importé les exercices :

### 1. Testez votre API

```bash
# Démarrer le serveur
npm run start:dev

# Tester les endpoints
curl http://localhost:3000/exercice
curl http://localhost:3000/exercice/1
curl http://localhost:3000/exercice?type=COMPOUND
curl http://localhost:3000/exercice?difficulty=3
```

### 2. Créez des Programmes

Utilisez les exercices pour créer des programmes d'entraînement via votre API.

### 3. Filtrez Intelligemment

```typescript
// Par difficulté
const exercicesFaciles = await prisma.exercice.findMany({
  where: { difficulty: { lte: 2 } }
});

// Par type
const exercicesComposes = await prisma.exercice.findMany({
  where: { type: 'COMPOUND' }
});

// Par groupe musculaire
const exercicesPectoraux = await prisma.exercice.findMany({
  where: {
    groupes: {
      some: {
        groupe: { name: 'Pectoraux' }
      }
    }
  },
  include: {
    groupes: { include: { groupe: true } },
    equipments: { include: { equipment: true } }
  }
});

// Poids du corps uniquement
const exercicesPoidsCorps = await prisma.exercice.findMany({
  where: { bodyWeight: true }
});

// Avec équipements spécifiques
const exercicesHalteres = await prisma.exercice.findMany({
  where: {
    equipments: {
      some: {
        equipment: { name: 'Haltères' }
      }
    }
  }
});
```

### 4. Affichez les GIFs

```typescript
// Dans votre frontend
const exercice = await fetch('/api/exercice/1').then(r => r.json());

// Afficher le GIF
<img src={exercice.imageUrl} alt={exercice.name} />
```

## 🎉 Félicitations !

Vous avez maintenant une base de données complète avec **960 exercices** prêts à l'emploi ! 💪

### Résumé de ce que vous avez :

✅ **890 exercices** du CSV avec GIFs  
✅ **70 exercices** du seed de base  
✅ **14 groupes musculaires** couverts  
✅ **10 types d'équipements**  
✅ **5 niveaux de difficulté**  
✅ **5 types d'exercices**  
✅ **Relations complètes** exercices ↔ groupes ↔ équipements  
✅ **Descriptions détaillées**  
✅ **URLs des GIFs animés**  

### Support

Si vous avez des questions ou des problèmes :

1. Consultez la documentation complète dans `GUIDE_SEED_EXERCICES.md`
2. Vérifiez le troubleshooting dans `prisma/SEED_EXERCICES_README.md`
3. Regardez les exemples dans `CHANGELOG_SEED_CSV.md`

---

**Bon développement ! 🚀**

