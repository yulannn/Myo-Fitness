import { PrismaClient } from '@prisma/client';
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
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Utilisateurs créés');

  // 2. Créer les groupes musculaires
  const muscleGroups = [
    { name: 'Pectoraux' },
    { name: 'Dorsaux' },
    { name: 'Épaules' },
    { name: 'Biceps' },
    { name: 'Triceps' },
    { name: 'Quadriceps' },
    { name: 'Ischio-jambiers' },
    { name: 'Fessiers' },
    { name: 'Mollets' },
    { name: 'Abdominaux' },
    { name: 'Obliques' },
    { name: 'Avant-bras' },
    { name: 'Trapèzes' },
    { name: 'Lombaires' },
  ];

  const createdMuscleGroups = await Promise.all(
    muscleGroups.map(group =>
      prisma.muscleGroup.create({ data: group })
    )
  );

  console.log('✅ Groupes musculaires créés');

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
        difficulty: exercice.difficulty,
        description: exercice.description,
        type: exercice.type as any,
        Materials: exercice.Materials,
        bodyWeight: exercice.bodyWeight,
        isDefault: exercice.isDefault,
      },
    });

    // Associer les groupes musculaires
    for (const muscleGroupName of exercice.muscleGroups) {
      const muscleGroup = createdMuscleGroups.find(mg => mg.name === muscleGroupName);
      if (muscleGroup) {
        await prisma.exerciceMuscleGroup.create({
          data: {
            exerciceId: createdExercice.id,
            groupeId: muscleGroup.id,
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
      goals: ['MUSCLE_GAIN', 'ENDURANCE'],
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
      goals: ['WEIGHT_LOSS', 'MAINTENANCE'],
      gender: 'FEMALE',
      bodyWeight: true, // Préfère le poids du corps
    },
  });

  console.log('✅ Profils fitness créés');

  // 6. Ajouter quelques programmes d'exemple
  const program1 = await prisma.trainingProgram.create({
    data: {
      fitnessProfileId: fitnessProfile1.id,
      name: 'Programme Intermédiaire 4x/semaine',
      description: 'Programme complet pour prise de masse',
      template: 'UPPER_LOWER',
      status: 'DRAFT',
    },
  });

  const program2 = await prisma.trainingProgram.create({
    data: {
      fitnessProfileId: fitnessProfile2.id,
      name: 'Programme Débutant 3x/semaine',
      description: 'Programme poids du corps pour débuter',
      template: 'FULL_BODY',
      status: 'DRAFT',
    },
  });

  console.log('✅ Programmes d\'exemple créés');

  console.log('🎉 Seeding terminé avec succès !');
  console.log(`📊 Résumé:`);
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
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
