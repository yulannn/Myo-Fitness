import { PrismaClient, ExerciceType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Interface pour le CSV
interface CSVRow {
  categorie: string;
  nom_exercice: string;
  description: string;
  gif_url: string;
}

// Fonction pour parser le CSV manuellement
function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const results: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Parser plus robuste pour gérer les champs avec virgules
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    if (values.length >= headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.replace(/^"|"$/g, '') || '';
      });
      results.push(row as unknown as CSVRow);
    }
  }

  return results;
}

// Mapping des catégories vers les groupes musculaires
const categoryToMuscleGroups: Record<string, string[]> = {
  'Exercices epaules': ['Épaules', 'Trapèzes'],
  'Exercices biceps': ['Biceps', 'Avant-bras'],
  'Exercices triceps': ['Triceps'],
  'Exercices pectoraux': ['Pectoraux'],
  'Exercices dos': ['Dorsaux', 'Trapèzes'],
  'Exercices jambes': ['Quadriceps', 'Ischio-jambiers', 'Fessiers'],
  'Exercices fessiers': ['Fessiers', 'Ischio-jambiers'],
  'Exercices quadriceps': ['Quadriceps'],
  'Exercices ischio-jambiers': ['Ischio-jambiers'],
  'Exercices mollets': ['Mollets'],
  'Exercices abdos': ['Abdominaux'],
  'Exercices obliques': ['Obliques'],
  'Exercices lombaires': ['Lombaires'],
  'Exercices avant-bras': ['Avant-bras'],
  'Exercices cardio': ['Quadriceps', 'Fessiers'],
  'Exercices full body': ['Pectoraux', 'Dorsaux', 'Quadriceps'],
};

// Fonction pour déterminer le type d'exercice
function determineExerciceType(name: string, category: string): ExerciceType {
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes('cardio') || lowerName.includes('burpee') || lowerName.includes('sprint') || lowerName.includes('course')) {
    return 'CARDIO';
  }

  if (lowerName.includes('stretch') || lowerName.includes('étirement')) {
    return 'STRETCH';
  }

  if (lowerName.includes('mobilité') || lowerName.includes('mobility')) {
    return 'MOBILITY';
  }

  // Exercices d'isolation
  const isolationKeywords = [
    'curl', 'extension', 'élévation', 'elevation', 'fly', 'oiseau', 'écart', 
    'pec deck', 'face pull', 'concentré', 'tirage menton', 'mollet', 'calf',
    'rotation', 'crunch', 'planche', 'hollow', 'crunchs'
  ];

  for (const keyword of isolationKeywords) {
    if (lowerName.includes(keyword)) {
      return 'ISOLATION';
    }
  }

  // Exercices composés
  const compoundKeywords = [
    'développé', 'developpe', 'press', 'squat', 'fente', 'lunge', 'rowing',
    'traction', 'pull-up', 'chin-up', 'pompe', 'push-up', 'dip', 'soulevé',
    'deadlift', 'thruster', 'clean', 'snatch', 'jerk'
  ];

  for (const keyword of compoundKeywords) {
    if (lowerName.includes(keyword)) {
      return 'COMPOUND';
    }
  }

  return 'COMPOUND'; // Par défaut
}

// Fonction pour déterminer la difficulté
function determineDifficulty(name: string): number {
  const lowerName = name.toLowerCase();

  // Niveau 5 (Très difficile)
  const level5Keywords = [
    'handstand', 'muscle-up', 'pistol', 'dragon flag', 'front lever',
    'back lever', 'planche', 'l-sit avancé', 'archer', 'une main'
  ];

  // Niveau 4 (Difficile)
  const level4Keywords = [
    'militaire', 'military', 'soulevé de terre', 'deadlift', 'squat barre',
    'lest', 'weighted', 'avancé', 'explosif', 'clapping'
  ];

  // Niveau 1 (Facile)
  const level1Keywords = [
    'assisté', 'assisted', 'débutant', 'beginner', 'genou', 'knee',
    'incliné', 'incline', 'simple', 'basique', 'basic'
  ];

  // Niveau 2 (Facile-Moyen)
  const level2Keywords = [
    'classique', 'standard', 'base', 'basic', 'planche', 'pont', 'bridge'
  ];

  for (const keyword of level5Keywords) {
    if (lowerName.includes(keyword)) return 5;
  }

  for (const keyword of level4Keywords) {
    if (lowerName.includes(keyword)) return 4;
  }

  for (const keyword of level1Keywords) {
    if (lowerName.includes(keyword)) return 1;
  }

  for (const keyword of level2Keywords) {
    if (lowerName.includes(keyword)) return 2;
  }

  return 3; // Niveau moyen par défaut
}

// Fonction pour déterminer si l'exercice nécessite du matériel
function requiresMaterial(name: string): boolean {
  const lowerName = name.toLowerCase();

  const materialKeywords = [
    'haltère', 'dumbbell', 'barre', 'barbell', 'kettlebell', 'machine',
    'poulie', 'cable', 'smith', 'landmine', 'banc', 'rack', 'presse',
    'press machine', 'leg press', 'pec deck', 'guidée', 'guided'
  ];

  for (const keyword of materialKeywords) {
    if (lowerName.includes(keyword)) return true;
  }

  return false;
}

// Fonction pour déterminer les équipements nécessaires
function determineEquipments(name: string): string[] {
  const lowerName = name.toLowerCase();
  const equipments: string[] = [];

  if (lowerName.includes('haltère') || lowerName.includes('dumbbell')) {
    equipments.push('Haltères');
  }

  if (lowerName.includes('barre') && !lowerName.includes('barre parallèle') && !lowerName.includes('barre de traction')) {
    equipments.push('Barre');
  }

  if (lowerName.includes('kettlebell')) {
    equipments.push('Kettlebell');
  }

  if (lowerName.includes('poulie') || lowerName.includes('cable')) {
    equipments.push('Câbles');
  }

  if (lowerName.includes('banc')) {
    equipments.push('Banc de musculation');
  }

  if (lowerName.includes('rack') || lowerName.includes('smith') || lowerName.includes('guidée') || lowerName.includes('machine') || lowerName.includes('presse')) {
    equipments.push('Rack à squats');
  }

  if (lowerName.includes('traction') || lowerName.includes('pull-up') || lowerName.includes('chin-up')) {
    equipments.push('Barre de traction');
  }

  if (lowerName.includes('trx') || lowerName.includes('suspension') || lowerName.includes('sangles')) {
    equipments.push('TRX');
  }

  if (lowerName.includes('anneau') || lowerName.includes('rings')) {
    equipments.push('Anneaux');
  }

  if (lowerName.includes('landmine')) {
    if (!equipments.includes('Barre')) {
      equipments.push('Barre');
    }
  }

  if (lowerName.includes('élastique') || lowerName.includes('band') || lowerName.includes('resistance')) {
    // On pourrait ajouter "Élastique" aux équipements si on l'a dans la DB
  }

  if (lowerName.includes('matelas') || lowerName.includes('tapis') || lowerName.includes('sol')) {
    equipments.push('Matelas');
  }

  return equipments;
}

// Fonction pour mapper la catégorie aux groupes musculaires
function getMuscleGroupsFromCategory(category: string, name: string): string[] {
  const lowerName = name.toLowerCase();
  let muscleGroups: string[] = [];

  // Mapping basé sur la catégorie
  const categoryKey = Object.keys(categoryToMuscleGroups).find(
    key => category.toLowerCase().includes(key.toLowerCase())
  );

  if (categoryKey) {
    muscleGroups = [...categoryToMuscleGroups[categoryKey]];
  }

  // Ajouter des groupes musculaires basés sur le nom
  if (lowerName.includes('triceps')) {
    if (!muscleGroups.includes('Triceps')) muscleGroups.push('Triceps');
  }

  if (lowerName.includes('biceps')) {
    if (!muscleGroups.includes('Biceps')) muscleGroups.push('Biceps');
  }

  if (lowerName.includes('pectoraux') || lowerName.includes('chest') || lowerName.includes('poitrine')) {
    if (!muscleGroups.includes('Pectoraux')) muscleGroups.push('Pectoraux');
  }

  if (lowerName.includes('dorsaux') || lowerName.includes('dos') || lowerName.includes('back')) {
    if (!muscleGroups.includes('Dorsaux')) muscleGroups.push('Dorsaux');
  }

  if (lowerName.includes('épaule') || lowerName.includes('shoulder') || lowerName.includes('deltoïde')) {
    if (!muscleGroups.includes('Épaules')) muscleGroups.push('Épaules');
  }

  if (lowerName.includes('abdo') || lowerName.includes('abs') || lowerName.includes('core')) {
    if (!muscleGroups.includes('Abdominaux')) muscleGroups.push('Abdominaux');
  }

  if (lowerName.includes('oblique')) {
    if (!muscleGroups.includes('Obliques')) muscleGroups.push('Obliques');
  }

  if (lowerName.includes('quadriceps') || lowerName.includes('quad') || lowerName.includes('cuisse')) {
    if (!muscleGroups.includes('Quadriceps')) muscleGroups.push('Quadriceps');
  }

  if (lowerName.includes('ischio') || lowerName.includes('hamstring')) {
    if (!muscleGroups.includes('Ischio-jambiers')) muscleGroups.push('Ischio-jambiers');
  }

  if (lowerName.includes('fessier') || lowerName.includes('glute')) {
    if (!muscleGroups.includes('Fessiers')) muscleGroups.push('Fessiers');
  }

  if (lowerName.includes('mollet') || lowerName.includes('calf')) {
    if (!muscleGroups.includes('Mollets')) muscleGroups.push('Mollets');
  }

  if (lowerName.includes('trapèze') || lowerName.includes('trap')) {
    if (!muscleGroups.includes('Trapèzes')) muscleGroups.push('Trapèzes');
  }

  if (lowerName.includes('lombaire') || lowerName.includes('lower back')) {
    if (!muscleGroups.includes('Lombaires')) muscleGroups.push('Lombaires');
  }

  if (lowerName.includes('avant-bras') || lowerName.includes('forearm')) {
    if (!muscleGroups.includes('Avant-bras')) muscleGroups.push('Avant-bras');
  }

  // Si aucun groupe musculaire n'est trouvé, utiliser un groupe par défaut basé sur la catégorie
  if (muscleGroups.length === 0) {
    if (category.toLowerCase().includes('epaule')) muscleGroups = ['Épaules'];
    else if (category.toLowerCase().includes('biceps')) muscleGroups = ['Biceps'];
    else if (category.toLowerCase().includes('triceps')) muscleGroups = ['Triceps'];
    else if (category.toLowerCase().includes('pectoraux')) muscleGroups = ['Pectoraux'];
    else if (category.toLowerCase().includes('dos')) muscleGroups = ['Dorsaux'];
    else if (category.toLowerCase().includes('jambes')) muscleGroups = ['Quadriceps', 'Fessiers'];
    else if (category.toLowerCase().includes('abdos')) muscleGroups = ['Abdominaux'];
    else muscleGroups = ['Abdominaux']; // Fallback
  }

  return muscleGroups;
}

async function main() {
  console.log('🌱 Début du seeding des exercices depuis le CSV...');

  // 1. Lire le fichier CSV
  const csvPath = path.join(__dirname, 'fitness_final.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  console.log('📖 Lecture du fichier CSV...');
  const exercises = parseCSV(csvContent);
  console.log(`✅ ${exercises.length} exercices trouvés dans le CSV`);

  // 2. Récupérer ou créer les groupes musculaires et équipements
  const muscleGroupNames = [
    'Pectoraux', 'Dorsaux', 'Épaules', 'Biceps', 'Triceps',
    'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets',
    'Abdominaux', 'Obliques', 'Avant-bras', 'Trapèzes', 'Lombaires'
  ];

  console.log('🔍 Vérification des groupes musculaires...');
  const muscleGroups = new Map<string, number>();
  
  for (const name of muscleGroupNames) {
    let group = await prisma.muscleGroup.findUnique({ where: { name } });
    if (!group) {
      group = await prisma.muscleGroup.create({ data: { name } });
      console.log(`  ✅ Groupe musculaire créé: ${name}`);
    }
    muscleGroups.set(name, group.id);
  }

  const equipmentNames = [
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

  console.log('🔍 Vérification des équipements...');
  const equipments = new Map<string, number>();
  
  for (const eq of equipmentNames) {
    let equipment = await prisma.equipment.findUnique({ where: { name: eq.name } });
    if (!equipment) {
      equipment = await prisma.equipment.create({ data: eq });
      console.log(`  ✅ Équipement créé: ${eq.name}`);
    }
    equipments.set(eq.name, equipment.id);
  }

  // 3. Créer les exercices
  console.log('\n💪 Création des exercices...');
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const exercise of exercises) {
    try {
      const name = exercise.nom_exercice?.trim();
      const category = exercise.categorie?.trim();
      const description = exercise.description?.trim() || null;
      const imageUrl = exercise.gif_url?.trim() || null;

      if (!name || !category) {
        console.log(`  ⚠️  Exercice ignoré (données manquantes): ${name || 'sans nom'}`);
        skipped++;
        continue;
      }

      // Vérifier si l'exercice existe déjà
      const existing = await prisma.exercice.findFirst({
        where: { name }
      });

      if (existing) {
        console.log(`  ⏭️  Exercice déjà existant: ${name}`);
        skipped++;
        continue;
      }

      // Déterminer les propriétés de l'exercice
      const type = determineExerciceType(name, category);
      const difficulty = determineDifficulty(name);
      const materials = requiresMaterial(name);
      const bodyWeight = !materials;
      const equipmentsList = determineEquipments(name);
      const muscleGroupsList = getMuscleGroupsFromCategory(category, name);

      // Créer l'exercice
      const createdExercice = await prisma.exercice.create({
        data: {
          name,
          difficulty,
          description,
          type,
          Materials: materials,
          bodyWeight,
          isDefault: true,
        },
      });

      // Associer les groupes musculaires
      for (const muscleGroupName of muscleGroupsList) {
        const groupId = muscleGroups.get(muscleGroupName);
        if (groupId) {
          await prisma.exerciceMuscleGroup.create({
            data: {
              exerciceId: createdExercice.id,
              groupeId: groupId,
            },
          });
        }
      }

      // Associer les équipements
      for (const equipmentName of equipmentsList) {
        const equipmentId = equipments.get(equipmentName);
        if (equipmentId) {
          await prisma.exerciceEquipment.create({
            data: {
              exerciceId: createdExercice.id,
              equipmentId: equipmentId,
            },
          });
        }
      }

      created++;
      if (created % 50 === 0) {
        console.log(`  ✅ ${created} exercices créés...`);
      }
    } catch (error) {
      console.error(`  ❌ Erreur lors de la création de l'exercice "${exercise.nom_exercice}":`, error);
      errors++;
    }
  }

  console.log('\n🎉 Seeding des exercices terminé !');
  console.log(`📊 Résumé:`);
  console.log(`  - ✅ ${created} exercices créés`);
  console.log(`  - ⏭️  ${skipped} exercices ignorés (déjà existants ou données manquantes)`);
  console.log(`  - ❌ ${errors} erreurs`);

  // Statistiques
  const totalExercices = await prisma.exercice.count();
  const bodyWeightCount = await prisma.exercice.count({ where: { bodyWeight: true } });
  const materialCount = await prisma.exercice.count({ where: { Materials: true } });

  console.log(`\n📈 Statistiques de la base de données:`);
  console.log(`  - Total d'exercices: ${totalExercices}`);
  console.log(`  - Exercices au poids du corps: ${bodyWeightCount}`);
  console.log(`  - Exercices avec matériel: ${materialCount}`);

  const difficultyStats = await prisma.exercice.groupBy({
    by: ['difficulty'],
    _count: true,
  });

  console.log(`\n📊 Répartition par difficulté:`);
  difficultyStats.sort((a, b) => a.difficulty - b.difficulty).forEach(stat => {
    console.log(`  - Niveau ${stat.difficulty}: ${stat._count} exercices`);
  });

  const typeStats = await prisma.exercice.groupBy({
    by: ['type'],
    _count: true,
  });

  console.log(`\n📊 Répartition par type:`);
  typeStats.forEach(stat => {
    console.log(`  - ${stat.type}: ${stat._count} exercices`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

