import { PrismaClient, BadgeCategory, BadgeTier, MuscleCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // 1. Créer les utilisateurs
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      password: hashedPassword,
      emailVerified: true, // ✅ Email vérifié par défaut pour le dev
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      password: hashedPassword,
      emailVerified: true, // ✅ Email vérifié par défaut pour le dev
    },
  });

  console.log('✅ Utilisateurs créés');

  // 1.5. Créer les badges
  console.log('🏋️ Création des badges...');

  const trainingBadges = [
    {
      code: 'FIRST_SESSION',
      name: 'Rookie',
      description: 'Complète ta première séance d\'entraînement',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.BRONZE,
      iconUrl: 'badge_first_session.png',
      xpReward: 50,
      requirement: { type: 'count', field: 'sessions', target: 1 },
      isSecret: false,
    },
    {
      code: 'SESSIONS_10',
      name: 'Habitué',
      description: 'Complète 10 séances d\'entraînement',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.BRONZE,
      iconUrl: 'badge_sessions_10.png',
      xpReward: 50,
      requirement: { type: 'count', field: 'sessions', target: 10 },
      isSecret: false,
    },
    {
      code: 'SESSIONS_50',
      name: 'Vétéran',
      description: 'Complète 50 séances d\'entraînement',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.SILVER,
      iconUrl: 'badge_sessions_50.png',
      xpReward: 100,
      requirement: { type: 'count', field: 'sessions', target: 50 },
      isSecret: false,
    },
    {
      code: 'EARLY_BIRD',
      name: 'Lève-tôt',
      description: 'Complète 10 séances avant 8h du matin',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.SILVER,
      iconUrl: 'badge_early_bird.png',
      xpReward: 100,
      requirement: { type: 'time', condition: 'before', target: 8, metadata: { count: 10 } },
      isSecret: false,
    },
    {
      code: 'NIGHT_OWL',
      name: 'Chouette de nuit',
      description: 'Complète 10 séances après 22h',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.SILVER,
      iconUrl: 'badge_night_owl.png',
      xpReward: 100,
      requirement: { type: 'time', condition: 'after', target: 22, metadata: { count: 10 } },
      isSecret: false,
    },
    {
      code: 'VOLUME_10000',
      name: 'Force Brute',
      description: 'Soulève un total de 10 000 kg',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.SILVER,
      iconUrl: 'badge_volume_10000.png',
      xpReward: 100,
      requirement: { type: 'count', field: 'totalVolume', target: 10000 },
      isSecret: false,
    },
    {
      code: 'SESSIONS_100',
      name: 'Centurion',
      description: 'Complète 100 séances d\'entraînement',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.GOLD,
      iconUrl: 'badge_sessions_100.png',
      xpReward: 250,
      requirement: { type: 'count', field: 'sessions', target: 100 },
      isSecret: false,
    },
    {
      code: 'PERFECT_WEEK',
      name: 'Semaine Parfaite',
      description: 'Complète toutes les séances prévues cette semaine',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.GOLD,
      iconUrl: 'badge_perfect_week.png',
      xpReward: 250,
      requirement: { type: 'custom', condition: 'perfect_week' },
      isSecret: false,
    },
    {
      code: 'VOLUME_100000',
      name: 'Hercule',
      description: 'Soulève un total de 100 000 kg',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.PLATINUM,
      iconUrl: 'badge_volume_100000.png',
      xpReward: 500,
      requirement: { type: 'count', field: 'totalVolume', target: 100000 },
      isSecret: false,
    },
    {
      code: 'SESSIONS_500',
      name: 'Légende',
      description: 'Complète 500 séances d\'entraînement',
      category: BadgeCategory.TRAINING,
      tier: BadgeTier.LEGENDARY,
      iconUrl: 'badge_sessions_500.png',
      xpReward: 1000,
      requirement: { type: 'count', field: 'sessions', target: 500 },
      isSecret: false,
    },
  ];

  for (const badge of trainingBadges) {
    const badgeWithIcon = {
      ...badge,
    };

    await prisma.badge.upsert({
      where: { code: badge.code },
      create: badgeWithIcon,
      update: badgeWithIcon,
    });
  }

  console.log(`✅ ${trainingBadges.length} badges créés avec succès`);

  // 2. Créer les groupes musculaires (uniquement en français, avec catégories)
  console.log('💪 Nettoyage et création des groupes musculaires...');

  // Supprimer d'abord tous les groupes musculaires existants pour éviter les doublons
  await prisma.muscleGroup.deleteMany({});

  const muscleGroups = [
    // 🫀 CHEST (Poitrine)
    { name: 'Pectoraux', category: MuscleCategory.CHEST },

    // 💪 BACK (Dos)
    { name: 'Dorsaux', category: MuscleCategory.BACK },
    { name: 'Trapèzes', category: MuscleCategory.BACK },
    { name: 'Lombaires', category: MuscleCategory.BACK },

    // 🏋️ SHOULDERS (Épaules)
    { name: 'Épaules', category: MuscleCategory.SHOULDERS },

    // 💪 ARMS (Bras)
    { name: 'Biceps', category: MuscleCategory.ARMS },
    { name: 'Triceps', category: MuscleCategory.ARMS },
    { name: 'Avant-bras', category: MuscleCategory.ARMS },

    // 🦵 LEGS (Jambes)
    { name: 'Quadriceps', category: MuscleCategory.LEGS },
    { name: 'Ischio-jambiers', category: MuscleCategory.LEGS },
    { name: 'Fessiers', category: MuscleCategory.LEGS },
    { name: 'Mollets', category: MuscleCategory.LEGS },

    // 🔥 CORE (Core/Abdominaux)
    { name: 'Abdominaux', category: MuscleCategory.CORE },
    { name: 'Obliques', category: MuscleCategory.CORE },
  ];

  const createdMuscleGroups = await Promise.all(
    muscleGroups.map(group =>
      prisma.muscleGroup.create({ data: group })
    )
  );

  console.log(`✅ ${muscleGroups.length} groupes musculaires créés (FR uniquement)`);

  // 3. Créer les équipements
  const equipments = [
    { name: 'Haltères', description: 'Haltères ajustables' },
    { name: 'Barre', description: 'Barre olympique' },
    { name: 'Rack à squats', description: 'Rack de musculation' },
    { name: 'Banc de musculation', description: 'Banc inclinable' },
    { name: 'Câbles', description: 'Machine à câbles' },
    { name: 'Kettlebell', description: 'Kettlebell' },
    { name: 'TRX', description: 'Suspension training' },
    { name: 'Barre de traction', description: 'Barre de traction' },
    { name: 'Anneaux', description: 'Anneaux de gymnastique' },
    { name: 'Matelas', description: 'Matelas de yoga' },
  ];

  const createdEquipments = await Promise.all(
    equipments.map(equipment =>
      prisma.equipment.create({ data: equipment })
    )
  );

  console.log('✅ Équipements créés');

  // 4. Créer les exercices (25 poids du corps + 25 salle)
  const exercices = [
    // EXERCICES POIDS DU CORPS (25)
    {
      name: 'Pompes',
      difficulty: 2,
      description: 'Exercice de base pour les pectoraux',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
      equipments: []
    },
    {
      name: 'Pompes inclinées',
      difficulty: 1,
      description: 'Pompes avec les pieds surélevés',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
      equipments: []
    },
    {
      name: 'Pompes diamant',
      difficulty: 3,
      description: 'Pompes avec les mains rapprochées',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Triceps', 'Pectoraux'],
      equipments: []
    },
    {
      name: 'Tractions',
      difficulty: 4,
      description: 'Exercice de base pour les dorsaux',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps', 'Trapèzes'],
      equipments: ['Barre de traction']
    },
    {
      name: 'Tractions assistées',
      difficulty: 2,
      description: 'Tractions avec assistance',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps'],
      equipments: ['TRX']
    },
    {
      name: 'Squats',
      difficulty: 1,
      description: 'Exercice de base pour les jambes',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
      equipments: []
    },
    {
      name: 'Squats sautés',
      difficulty: 3,
      description: 'Squats avec saut explosif',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers'],
      equipments: []
    },
    {
      name: 'Fentes',
      difficulty: 2,
      description: 'Exercice unilatéral pour les jambes',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
      equipments: []
    },
    {
      name: 'Planche',
      difficulty: 2,
      description: 'Exercice isométrique pour le core',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Abdominaux', 'Obliques'],
      equipments: ['Matelas']
    },
    {
      name: 'Planche latérale',
      difficulty: 3,
      description: 'Planche sur le côté',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Obliques', 'Abdominaux'],
      equipments: ['Matelas']
    },
    {
      name: 'Burpees',
      difficulty: 4,
      description: 'Exercice cardio complet',
      type: 'CARDIO',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Pectoraux', 'Triceps'],
      equipments: []
    },
    {
      name: 'Mountain Climbers',
      difficulty: 3,
      description: 'Exercice cardio pour le core',
      type: 'CARDIO',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Abdominaux', 'Quadriceps'],
      equipments: ['Matelas']
    },
    {
      name: 'Pompes sur les genoux',
      difficulty: 1,
      description: 'Pompes adaptées débutants',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps'],
      equipments: []
    },
    {
      name: 'Dips sur chaise',
      difficulty: 2,
      description: 'Dips avec support',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Triceps', 'Épaules'],
      equipments: []
    },
    {
      name: 'Pistol Squats',
      difficulty: 5,
      description: 'Squats sur une jambe',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers'],
      equipments: []
    },
    {
      name: 'Handstand Push-ups',
      difficulty: 5,
      description: 'Pompes en équilibre',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Épaules', 'Triceps'],
      equipments: []
    },
    {
      name: 'Muscle-ups',
      difficulty: 5,
      description: 'Tractions avec transition',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Triceps', 'Épaules'],
      equipments: ['Barre de traction']
    },
    {
      name: 'L-sit',
      difficulty: 4,
      description: 'Position en L suspendue',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Abdominaux', 'Triceps'],
      equipments: ['Anneaux']
    },
    {
      name: 'Hollow Hold',
      difficulty: 2,
      description: 'Position creuse isométrique',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Abdominaux'],
      equipments: ['Matelas']
    },
    {
      name: 'V-ups',
      difficulty: 3,
      description: 'Relevés de buste en V',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Abdominaux'],
      equipments: ['Matelas']
    },
    {
      name: 'Russian Twists',
      difficulty: 2,
      description: 'Rotations du buste',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Obliques'],
      equipments: ['Matelas']
    },
    {
      name: 'Calf Raises',
      difficulty: 1,
      description: 'Élévations sur les pointes',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Mollets'],
      equipments: []
    },
    {
      name: 'Glute Bridges',
      difficulty: 1,
      description: 'Ponts fessiers',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Fessiers', 'Ischio-jambiers'],
      equipments: ['Matelas']
    },
    {
      name: 'Single Leg Glute Bridges',
      difficulty: 2,
      description: 'Ponts fessiers sur une jambe',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Fessiers', 'Ischio-jambiers'],
      equipments: ['Matelas']
    },
    {
      name: 'Wall Sits',
      difficulty: 2,
      description: 'Position assise contre le mur',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps'],
      equipments: []
    },

    // EXERCICES SALLE (25)
    {
      name: 'Développé couché',
      difficulty: 3,
      description: 'Exercice roi pour les pectoraux',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
      equipments: ['Barre', 'Banc de musculation']
    },
    {
      name: 'Développé incliné',
      difficulty: 3,
      description: 'Développé sur banc incliné',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
      equipments: ['Barre', 'Banc de musculation']
    },
    {
      name: 'Développé décliné',
      difficulty: 3,
      description: 'Développé sur banc décliné',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps'],
      equipments: ['Barre', 'Banc de musculation']
    },
    {
      name: 'Écarté haltères',
      difficulty: 2,
      description: 'Isolation des pectoraux',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Pectoraux'],
      equipments: ['Haltères', 'Banc de musculation']
    },
    {
      name: 'Tirage horizontal',
      difficulty: 2,
      description: 'Exercice pour les dorsaux',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps'],
      equipments: ['Câbles']
    },
    {
      name: 'Rowing haltères',
      difficulty: 3,
      description: 'Rowing unilatéral',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps'],
      equipments: ['Haltères', 'Banc de musculation']
    },
    {
      name: 'Soulevé de terre',
      difficulty: 4,
      description: 'Exercice roi pour le dos',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Fessiers', 'Ischio-jambiers', 'Trapèzes'],
      equipments: ['Barre']
    },
    {
      name: 'Squats barre',
      difficulty: 4,
      description: 'Squats avec barre',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
      equipments: ['Barre', 'Rack à squats']
    },
    {
      name: 'Squats avant',
      difficulty: 5,
      description: 'Squats avec barre devant',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers', 'Abdominaux'],
      equipments: ['Barre', 'Rack à squats']
    },
    {
      name: 'Fentes haltères',
      difficulty: 3,
      description: 'Fentes avec haltères',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
      equipments: ['Haltères']
    },
    {
      name: 'Leg Press',
      difficulty: 2,
      description: 'Presse à cuisses',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers'],
      equipments: ['Rack à squats']
    },
    {
      name: 'Extensions quadriceps',
      difficulty: 2,
      description: 'Isolation des quadriceps',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Quadriceps'],
      equipments: ['Câbles']
    },
    {
      name: 'Curls ischio-jambiers',
      difficulty: 2,
      description: 'Isolation des ischio-jambiers',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Ischio-jambiers'],
      equipments: ['Câbles']
    },
    {
      name: 'Développé militaire',
      difficulty: 4,
      description: 'Développé debout',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Épaules', 'Triceps'],
      equipments: ['Barre']
    },
    {
      name: 'Élévations latérales',
      difficulty: 2,
      description: 'Isolation des épaules',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Épaules'],
      equipments: ['Haltères']
    },
    {
      name: 'Élévations frontales',
      difficulty: 2,
      description: 'Isolation des deltoïdes antérieurs',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Épaules'],
      equipments: ['Haltères']
    },
    {
      name: 'Oiseau',
      difficulty: 2,
      description: 'Élévations arrière',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Épaules'],
      equipments: ['Haltères']
    },
    {
      name: 'Curls biceps',
      difficulty: 2,
      description: 'Isolation des biceps',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Biceps'],
      equipments: ['Haltères']
    },
    {
      name: 'Curls marteau',
      difficulty: 2,
      description: 'Curls avec prise neutre',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Biceps', 'Avant-bras'],
      equipments: ['Haltères']
    },
    {
      name: 'Extensions triceps',
      difficulty: 2,
      description: 'Isolation des triceps',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Triceps'],
      equipments: ['Haltères']
    },
    {
      name: 'Dips aux barres parallèles',
      difficulty: 3,
      description: 'Dips sur barres parallèles',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Triceps', 'Pectoraux'],
      equipments: ['Rack à squats']
    },
    {
      name: 'Soulevé de terre roumain',
      difficulty: 3,
      description: 'Soulevé de terre avec jambes tendues',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Ischio-jambiers', 'Fessiers'],
      equipments: ['Barre']
    },
    {
      name: 'Hip Thrust',
      difficulty: 2,
      description: 'Poussée de hanches',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Fessiers', 'Ischio-jambiers'],
      equipments: ['Barre', 'Banc de musculation']
    },
    {
      name: 'Mollets debout',
      difficulty: 1,
      description: 'Élévations de mollets debout',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Mollets'],
      equipments: ['Haltères']
    },
    {
      name: 'Crunchs',
      difficulty: 1,
      description: 'Relevés de buste',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Abdominaux'],
      equipments: ['Matelas']
    },
    {
      name: 'Swing Kettlebell',
      difficulty: 3,
      description: 'Swing avec kettlebell',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Fessiers', 'Ischio-jambiers', 'Épaules'],
      equipments: ['Kettlebell']
    },

    // EXERCICES SUPPLÉMENTAIRES (20)
    {
      name: 'Pompes archer',
      difficulty: 5,
      description: 'Pompes avec déplacement latéral',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
      equipments: []
    },
    {
      name: 'Tractions lestées',
      difficulty: 5,
      description: 'Tractions avec poids supplémentaire',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps', 'Trapèzes'],
      equipments: ['Haltères']
    },
    {
      name: 'Squats bulgares',
      difficulty: 3,
      description: 'Squats avec pied arrière surélevé',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
      equipments: ['Banc de musculation']
    },
    {
      name: 'Développé haltères',
      difficulty: 3,
      description: 'Développé couché avec haltères',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
      equipments: ['Haltères', 'Banc de musculation']
    },
    {
      name: 'Tirage vertical',
      difficulty: 2,
      description: 'Tirage vers le bas',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps'],
      equipments: ['Câbles']
    },
    {
      name: 'Hack Squats',
      difficulty: 3,
      description: 'Squats à la machine',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers'],
      equipments: ['Rack à squats']
    },
    {
      name: 'Face Pulls',
      difficulty: 2,
      description: 'Tirage vers le visage',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Épaules', 'Trapèzes'],
      equipments: ['Câbles']
    },
    {
      name: 'Curls concentrés',
      difficulty: 2,
      description: 'Curls biceps isolés',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Biceps'],
      equipments: ['Haltères', 'Banc de musculation']
    },
    {
      name: 'Extensions triceps couché',
      difficulty: 2,
      description: 'Extensions triceps allongé',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Triceps'],
      equipments: ['Haltères', 'Banc de musculation']
    },
    {
      name: 'Soulevé de terre sumo',
      difficulty: 4,
      description: 'Soulevé de terre avec écartement large',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Fessiers', 'Ischio-jambiers', 'Quadriceps'],
      equipments: ['Barre']
    },
    {
      name: 'Pompes pike',
      difficulty: 3,
      description: 'Pompes en position pike',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Épaules', 'Triceps'],
      equipments: []
    },
    {
      name: 'Dragon Flags',
      difficulty: 5,
      description: 'Relevés de jambes avancés',
      type: 'ISOLATION',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Abdominaux'],
      equipments: ['Matelas']
    },
    {
      name: 'Pompes sur une main',
      difficulty: 5,
      description: 'Pompes unilatérales',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
      equipments: []
    },
    {
      name: 'Tractions australiennes',
      difficulty: 2,
      description: 'Tractions horizontales',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps'],
      equipments: ['Barre de traction']
    },
    {
      name: 'Squats goblet',
      difficulty: 2,
      description: 'Squats avec haltère devant',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers', 'Abdominaux'],
      equipments: ['Kettlebell']
    },
    {
      name: 'Développé Arnold',
      difficulty: 3,
      description: 'Développé avec rotation',
      type: 'COMPOUND',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Épaules', 'Triceps'],
      equipments: ['Haltères']
    },
    {
      name: 'Curls 21',
      difficulty: 3,
      description: 'Curls en 3 phases',
      type: 'ISOLATION',
      Materials: true,
      bodyWeight: false,
      isDefault: true,
      muscleGroups: ['Biceps'],
      equipments: ['Haltères']
    },
    {
      name: 'Squats jump',
      difficulty: 4,
      description: 'Squats avec saut explosif',
      type: 'CARDIO',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Quadriceps', 'Fessiers'],
      equipments: []
    },
    {
      name: 'Pompes spiderman',
      difficulty: 4,
      description: 'Pompes avec genou vers le coude',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Pectoraux', 'Triceps', 'Abdominaux'],
      equipments: []
    },
    {
      name: 'Tractions L-sit',
      difficulty: 5,
      description: 'Tractions avec jambes en L',
      type: 'COMPOUND',
      Materials: false,
      bodyWeight: true,
      isDefault: true,
      muscleGroups: ['Dorsaux', 'Biceps', 'Abdominaux'],
      equipments: ['Barre de traction']
    }
  ];

  // Créer les exercices avec leurs relations
  for (const exercice of exercices) {
    const createdExercice = await prisma.exercice.create({
      data: {
        name: exercice.name,
        imageUrl: 'exercise_placeholder.png',
        difficulty: exercice.difficulty,
        description: exercice.description,
        type: exercice.type as any,
        Materials: exercice.Materials,
        bodyWeight: exercice.bodyWeight,
        isDefault: exercice.isDefault,
      },
    });

    // Associer les groupes musculaires
    // 🆕 Le premier muscle dans la liste est le muscle PRINCIPAL (isPrimary: true)
    // Les autres sont des muscles SECONDAIRES (isPrimary: false)
    for (let i = 0; i < exercice.muscleGroups.length; i++) {
      const muscleGroupName = exercice.muscleGroups[i];
      const muscleGroup = createdMuscleGroups.find(mg => mg.name === muscleGroupName);
      if (muscleGroup) {
        await prisma.exerciceMuscleGroup.create({
          data: {
            exerciceId: createdExercice.id,
            groupeId: muscleGroup.id,
            isPrimary: i === 0, // 🎯 Le premier = muscle principal
          },
        });
      }
    }

    // Associer les équipements
    for (const equipmentName of exercice.equipments) {
      const equipment = createdEquipments.find(eq => eq.name === equipmentName);
      if (equipment) {
        await prisma.exerciceEquipment.create({
          data: {
            exerciceId: createdExercice.id,
            equipmentId: equipment.id,
          },
        });
      }
    }
  }

  console.log('✅ Exercices créés');

  // 5. Créer les profils fitness
  const fitnessProfile1 = await prisma.fitnessProfile.create({
    data: {
      userId: user1.id,
      age: 28,
      height: 175.0,
      weight: 75.0,
      trainingFrequency: 4,
      experienceLevel: 'INTERMEDIATE',
      goals: ['MUSCLE_GAIN'],
      gender: 'MALE',
      bodyWeight: false, // Préfère la salle
    },
  });

  const fitnessProfile2 = await prisma.fitnessProfile.create({
    data: {
      userId: user2.id,
      age: 25,
      height: 165.0,
      weight: 60.0,
      trainingFrequency: 3,
      experienceLevel: 'BEGINNER',
      goals: ['WEIGHT_LOSS'],
      gender: 'FEMALE',
      bodyWeight: true, // Préfère le poids du corps
    },
  });

  console.log('✅ Profils fitness créés');

  // 6. Créer les programmes avec NOUVELLE ARCHITECTURE : SessionTemplate
  const program1 = await prisma.trainingProgram.create({
    data: {
      fitnessProfileId: fitnessProfile1.id,
      name: 'Programme Push/Pull/Legs',
      template: 'PUSH_PULL_LEGS',
      status: 'ACTIVE',
    },
  });

  const program2 = await prisma.trainingProgram.create({
    data: {
      fitnessProfileId: fitnessProfile2.id,
      name: 'Programme Full Body',
      template: 'FULL_BODY',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Programmes créés');

  // Récupérer les exercices pour créer les templates
  const allExercices = await prisma.exercice.findMany();
  const benchPress = allExercices.find(e => e.name === 'Développé couché');
  const pullUps = allExercices.find(e => e.name === 'Tractions');
  const militaryPress = allExercices.find(e => e.name === 'Développé militaire');
  const squats = allExercices.find(e => e.name === 'Squats');
  const deadlift = allExercices.find(e => e.name === 'Soulevé de terre');
  const pushups = allExercices.find(e => e.name === 'Pompes');
  const plank = allExercices.find(e => e.name === 'Planche');
  const rowing = allExercices.find(e => e.name === 'Rowing haltères');

  console.log('📋 Création des Session Templates...');

  // ===== PROGRAMME 1 : Push/Pull/Legs =====

  // 🆕 Template 1 : Push Day
  const pushTemplate = await prisma.sessionTemplate.create({
    data: {
      programId: program1.id,
      name: 'Push Day',
      description: 'Pectoraux, Épaules, Triceps',
      exercises: {
        create: [
          benchPress && {
            exerciseId: benchPress.id,
            sets: 4,
            reps: 8,
            weight: 80.0,
            orderInSession: 1,
          },
          militaryPress && {
            exerciseId: militaryPress.id,
            sets: 3,
            reps: 10,
            weight: 50.0,
            orderInSession: 2,
          },
          pushups && {
            exerciseId: pushups.id,
            sets: 3,
            reps: 15,
            weight: null,
            orderInSession: 3,
          },
        ].filter(Boolean) as Array<{
          exerciseId: number;
          sets: number;
          reps: number;
          weight: number | null;
          orderInSession: number;
        }>,
      },
    },
  });

  console.log('  ✅ Template "Push Day" créé');

  // 🆕 Template 2 : Pull Day
  const pullTemplate = await prisma.sessionTemplate.create({
    data: {
      programId: program1.id,
      name: 'Pull Day',
      description: 'Dos, Biceps',
      exercises: {
        create: [
          pullUps && {
            exerciseId: pullUps.id,
            sets: 4,
            reps: 10,
            weight: null,
            orderInSession: 1,
          },
          deadlift && {
            exerciseId: deadlift.id,
            sets: 4,
            reps: 5,
            weight: 120.0,
            orderInSession: 2,
          },
          rowing && {
            exerciseId: rowing.id,
            sets: 3,
            reps: 10,
            weight: 35.0,
            orderInSession: 3,
          },
        ].filter(Boolean) as Array<{
          exerciseId: number;
          sets: number;
          reps: number;
          weight: number | null;
          orderInSession: number;
        }>,
      },
    },
  });

  console.log('  ✅ Template "Pull Day" créé');

  // 🆕 Template 3 : Leg Day
  const legTemplate = await prisma.sessionTemplate.create({
    data: {
      programId: program1.id,
      name: 'Leg Day',
      description: 'Jambes complètes',
      exercises: {
        create: [
          squats && {
            exerciseId: squats.id,
            sets: 5,
            reps: 6,
            weight: 100.0,
            orderInSession: 1,
          },
          deadlift && {
            exerciseId: deadlift.id,
            sets: 4,
            reps: 5,
            weight: 140.0,
            orderInSession: 2,
          },
        ].filter(Boolean) as Array<{
          exerciseId: number;
          sets: number;
          reps: number;
          weight: number | null;
          orderInSession: number;
        }>,
      },
    },
  });

  console.log('  ✅ Template "Leg Day" créé');

  // ===== PROGRAMME 2 : Full Body =====

  const fullBodyTemplate = await prisma.sessionTemplate.create({
    data: {
      programId: program2.id,
      name: 'Full Body Routine',
      description: 'Corps complet avec poids du corps',
      exercises: {
        create: [
          pushups && {
            exerciseId: pushups.id,
            sets: 3,
            reps: 12,
            weight: null,
            orderInSession: 1,
          },
          squats && {
            exerciseId: squats.id,
            sets: 3,
            reps: 15,
            weight: null,
            orderInSession: 2,
          },
          plank && {
            exerciseId: plank.id,
            sets: 3,
            reps: 60,
            weight: null,
            orderInSession: 3,
          },
          pullUps && {
            exerciseId: pullUps.id,
            sets: 3,
            reps: 8,
            weight: null,
            orderInSession: 4,
          },
        ].filter(Boolean) as Array<{
          exerciseId: number;
          sets: number;
          reps: number;
          weight: number | null;
          orderInSession: number;
        }>,
      },
    },
  });

  console.log('  ✅ Template "Full Body" créé');

  console.log('✅ Tous les templates créés');

  // 🆕 Créer des INSTANCES depuis les templates pour démonstration
  console.log('📅 Création d\'instances de démonstration...');

  // Instance 1 : Push Day planifiée dans 2 jours
  const pushInstance = await prisma.trainingSession.create({
    data: {
      programId: program1.id,
      sessionTemplateId: pushTemplate.id,
      sessionName: pushTemplate.name,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completed: false,
    },
  });

  // Copier les exercices du template vers l'instance
  const pushTemplateExercises = await prisma.exerciseTemplate.findMany({
    where: { sessionTemplateId: pushTemplate.id },
    orderBy: { orderInSession: 'asc' },
  });

  for (const exTemplate of pushTemplateExercises) {
    await prisma.exerciceSession.create({
      data: {
        sessionId: pushInstance.id,
        exerciceId: exTemplate.exerciseId,
        sets: exTemplate.sets,
        reps: exTemplate.reps,
        weight: exTemplate.weight,
      },
    });
  }

  console.log('  ✅ Instance "Push Day" planifiée créée');

  // Instance 2 : Pull Day COMPLÉTÉE avec performances (il y a 3 jours)
  const completedPullInstance = await prisma.trainingSession.create({
    data: {
      programId: program1.id,
      sessionTemplateId: pullTemplate.id,
      sessionName: pullTemplate.name,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: 65,
      completed: true,
      performedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const pullTemplateExercises = await prisma.exerciseTemplate.findMany({
    where: { sessionTemplateId: pullTemplate.id },
    orderBy: { orderInSession: 'asc' },
  });

  for (const exTemplate of pullTemplateExercises) {
    const exerciceSession = await prisma.exerciceSession.create({
      data: {
        sessionId: completedPullInstance.id,
        exerciceId: exTemplate.exerciseId,
        sets: exTemplate.sets,
        reps: exTemplate.reps,
        weight: exTemplate.weight,
      },
    });

    // Créer des performances pour chaque série
    for (let i = 1; i <= exTemplate.sets; i++) {
      await prisma.setPerformance.create({
        data: {
          id_exercice_session: exerciceSession.id,
          set_index: i,
          reps_effectuees: exTemplate.reps - (i === exTemplate.sets ? 1 : 0),
          reps_prevues: exTemplate.reps,
          weight: exTemplate.weight,
          rpe: 6 + i,
          success: i < exTemplate.sets,
        },
      });
    }
  }

  console.log('  ✅ Instance "Pull Day" complétée créée avec performances');

  // Instance 3 : Full Body COMPLÉTÉE (il y a 5 jours)
  const completedFullBodyInstance = await prisma.trainingSession.create({
    data: {
      programId: program2.id,
      sessionTemplateId: fullBodyTemplate.id,
      sessionName: fullBodyTemplate.name,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      duration: 45,
      completed: true,
      performedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const fullBodyTemplateExercises = await prisma.exerciseTemplate.findMany({
    where: { sessionTemplateId: fullBodyTemplate.id },
    orderBy: { orderInSession: 'asc' },
  });

  for (const exTemplate of fullBodyTemplateExercises) {
    const exerciceSession = await prisma.exerciceSession.create({
      data: {
        sessionId: completedFullBodyInstance.id,
        exerciceId: exTemplate.exerciseId,
        sets: exTemplate.sets,
        reps: exTemplate.reps,
        weight: exTemplate.weight,
      },
    });

    for (let i = 1; i <= exTemplate.sets; i++) {
      await prisma.setPerformance.create({
        data: {
          id_exercice_session: exerciceSession.id,
          set_index: i,
          reps_effectuees: exTemplate.reps,
          reps_prevues: exTemplate.reps,
          weight: exTemplate.weight,
          rpe: 7,
          success: true,
        },
      });
    }
  }

  console.log('  ✅ Instance "Full Body" complétée créée avec performances');

  // Compter les données créées
  const totalTemplates = await prisma.sessionTemplate.count();
  const totalExerciseTemplates = await prisma.exerciseTemplate.count();
  const totalInstances = await prisma.trainingSession.count();
  const totalExerciceSessions = await prisma.exerciceSession.count();
  const totalPerformances = await prisma.setPerformance.count();

  console.log('');
  console.log('🎉 Seeding terminé avec succès !');
  console.log('');
  console.log('📊 Résumé:');
  console.log(`- ${muscleGroups.length} groupes musculaires`);
  console.log(`- ${equipments.length} équipements`);
  console.log(`- ${exercices.length} exercices (${exercices.filter(e => e.bodyWeight).length} poids du corps, ${exercices.filter(e => !e.bodyWeight).length} salle)`);
  console.log(`- Répartition par difficulté:`);
  console.log(`  * Niveau 1: ${exercices.filter(e => e.difficulty === 1).length} exercices`);
  console.log(`  * Niveau 2: ${exercices.filter(e => e.difficulty === 2).length} exercices`);
  console.log(`  * Niveau 3: ${exercices.filter(e => e.difficulty === 3).length} exercices`);
  console.log(`  * Niveau 4: ${exercices.filter(e => e.difficulty === 4).length} exercices`);
  console.log(`  * Niveau 5: ${exercices.filter(e => e.difficulty === 5).length} exercices`);
  console.log(`- 2 utilisateurs`);
  console.log(`- 2 profils fitness`);
  console.log(`- 2 programmes d'exemple`);
  console.log('');
  console.log('🆕 NOUVELLE ARCHITECTURE:');
  console.log(`- ${totalTemplates} templates de séances (modèles réutilisables)`);
  console.log(`- ${totalExerciseTemplates} exercices dans les templates`);
  console.log(`- ${totalInstances} instances (1 planifiée + 2 complétées)`);
  console.log(`- ${totalExerciceSessions} exercices dans les instances`);
  console.log(`- ${totalPerformances} performances enregistrées`);
  console.log('');
  console.log('🔗 Architecture:');
  console.log('  SessionTemplate → Modèle réutilisable');
  console.log('  ExerciseTemplate → Exercices du template');
  console.log('  TrainingSession → Instance/Historique');
  console.log('  ExerciceSession → Exercices de l\'instance');
  console.log('  SetPerformance → Performances par série');

}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
