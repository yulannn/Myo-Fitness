#!/bin/bash

echo "🌱 Test du fichier seed Myo-Fitness"
echo "=================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis le répertoire api/"
    exit 1
fi

# Vérifier que Prisma est installé
if ! command -v npx prisma &> /dev/null; then
    echo "❌ Erreur: Prisma n'est pas installé"
    echo "Exécutez: npm install"
    exit 1
fi

echo "✅ Environnement vérifié"

# Vérifier la configuration de la base de données
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Avertissement: DATABASE_URL n'est pas défini"
    echo "Assurez-vous que votre fichier .env contient DATABASE_URL"
fi

echo ""
echo "🚀 Exécution du seed..."
echo ""

# Exécuter le seed
npm run prisma:seed

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Seed exécuté avec succès !"
    echo ""
    echo "📊 Données créées :"
    echo "- 2 utilisateurs de test"
    echo "- 14 groupes musculaires"
    echo "- 10 équipements"
    echo "- 50 exercices (25 poids du corps + 25 salle)"
    echo "- 2 profils fitness"
    echo "- 2 programmes d'exemple"
    echo ""
    echo "🔐 Identifiants de test :"
    echo "- jean.dupont@example.com / password123"
    echo "- marie.martin@example.com / password123"
else
    echo ""
    echo "❌ Erreur lors de l'exécution du seed"
    echo "Vérifiez votre configuration de base de données"
fi
