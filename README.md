# 🚀 Guide de Démarrage Rapide - Myo Fitness

## Pour les correcteurs : Démarrage en 5 minutes

### 1️⃣ Cloner et installer

```bash
# Cloner le projet

cd Myo-Fitness

# Installer les dépendances backend
cd api
npm install

# Installer les dépendances frontend
cd ../client
npm install
cd ..
```

### 2️⃣ Configurer les variables d'environnement


dm 



### 3️⃣ Démarrer PostgreSQL avec Docker

```bash
docker-compose up -d
```

> ⏳ Attendez 5-10 secondes que PostgreSQL démarre complètement

### 4️⃣ Configurer la base de données

```bash
cd api

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# Remplir avec des données de test (optionnel mais recommandé)
npm run prisma:seed

```

### 5️⃣ Démarrer l'application

**Terminal 1 - Backend :**
```bash
cd api
npm run start:dev
```

**Terminal 2 - Frontend :**
```bash
cd client
npm run dev
```

### 6️⃣ Accéder à l'application

- **Application** : http://localhost:5173
- **API Swagger** : http://localhost:3000/api

### 👤 Compte de test (après seed)

```
**Utilisateur 1 :**

- Email: jean.dupont@example.com
- Mot de passe: password123
```

---

## ⚡ Commandes essentielles

### Redémarrer la base de données

```bash
# Arrêter
docker-compose down

# Redémarrer
docker-compose up -d
```

### Réinitialiser la base de données

```bash
cd api
npm run db:reset
```

### Vérifier que tout fonctionne

```bash
# Vérifier Docker
docker ps

# Devrait afficher : postgres_db (port 5433)
```

---

## 🐛 Problèmes fréquents

### "Cannot connect to database"
→ Vérifiez que Docker est lancé : `docker ps`
→ Redémarrez PostgreSQL : `docker-compose restart`

### "Port already in use"
→ Un autre service utilise le port 5433 ou 3000
→ Changez les ports dans `docker-compose.yml` et `api/.env`

### "Prisma Client not generated"
→ Exécutez : `cd api && npm run prisma:generate`

---

## 📊 Fonctionnalités à tester

1. ✅ **Inscription/Connexion** : Créez un compte ou utilisez le compte de test
2. ✅ **Programme** : Créez un programme automatique ou manuel
3. ✅ **Séance** : Démarrez une séance et validez des exercices
4. ✅ **XP** : Complétez une séance → +50 XP (1x par jour)
5. ✅ **Social** : Ajoutez des amis, créez un groupe
6. ✅ **Chat** : Envoyez des messages temps réel
7. ✅ **Statistiques** : Consultez vos graphiques de progression

---

## 📝 Notes pour la correction

- **Base de données** : PostgreSQL via Docker (pas d'installation locale requise)
- **Ports** : Backend 3000, Frontend 5173, PostgreSQL 5433
- **Documentation API** : Swagger à http://localhost:3000/api
- **TypeScript** : 100% du code backend et frontend
- **Tests** : `cd api && npm run test:unit`

---

**Temps estimé de setup : ~5 minutes** ⏱️

Si vous rencontrez un problème, vérifiez d'abord que Docker est bien lancé !
