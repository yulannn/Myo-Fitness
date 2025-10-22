# 🏋️ Guide Rapide - Import des Exercices depuis CSV

## 🎯 Objectif

Importer **890 exercices** depuis `fitness_final.csv` dans votre base de données Prisma avec :
- Détection automatique du type, difficulté, et équipements
- Mapping intelligent vers les groupes musculaires
- Prévention des doublons

## ⚡ Démarrage Rapide (2 minutes)

```bash
# 1. Prérequis : Créer les groupes musculaires de base
cd api
npm run prisma:seed

# 2. Importer les exercices depuis le CSV
npm run prisma:seed:exercices
```

## 📊 Ce que vous obtiendrez

✅ **890 exercices** du CSV  
✅ **+ 70 exercices** du seed de base  
✅ **= ~960 exercices** au total  

Avec :
- 5 niveaux de difficulté (1-5)
- 5 types (COMPOUND, ISOLATION, CARDIO, MOBILITY, STRETCH)
- Relations automatiques avec groupes musculaires
- Relations automatiques avec équipements
- Descriptions complètes

## 📁 Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `prisma/seed_exercices.ts` | Script d'import CSV principal |
| `prisma/fitness_final.csv` | Données source (890 exercices) |
| `prisma/SEED_EXERCICES_README.md` | Documentation complète |
| `package.json` | Script `prisma:seed:exercices` |

## 🔍 Vérification

Après l'import, vérifiez dans votre base de données :

```sql
SELECT COUNT(*) FROM "Exercice";
-- Devrait retourner ~960

SELECT type, COUNT(*) FROM "Exercice" GROUP BY type;
-- Distribution par type

SELECT difficulty, COUNT(*) FROM "Exercice" GROUP BY difficulty;
-- Distribution par difficulté
```

## 🐛 Problèmes Courants

| Erreur | Solution |
|--------|----------|
| `Table 'MuscleGroup' does not exist` | Exécutez `npm run prisma:seed` d'abord |
| `Cannot find module '@prisma/client'` | Exécutez `npm run prisma:generate` |
| `ENOENT: no such file` | Vérifiez que `fitness_final.csv` est dans `api/prisma/` |

## 📖 Documentation Complète

Pour plus de détails, consultez :
- [`prisma/SEED_EXERCICES_README.md`](./prisma/SEED_EXERCICES_README.md) - Guide complet
- [`SEED_README.md`](./SEED_README.md) - Guide du seed de base

## 🚀 Commandes Utiles

```bash
# Importer les exercices CSV
npm run prisma:seed:exercices

# Seed de base (utilisateurs, groupes musculaires, équipements)
npm run prisma:seed

# Reset complet de la DB + seed de base
npm run db:reset

# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npm run prisma:migrate
```

## 🎉 Étapes Suivantes

Après l'import réussi :

1. ✅ Vérifiez les exercices dans votre base de données
2. ✅ Testez les endpoints de votre API
3. ✅ Créez des programmes d'entraînement
4. ✅ Associez les exercices aux sessions

---

**Développé avec ❤️ pour Myo-Fitness**

