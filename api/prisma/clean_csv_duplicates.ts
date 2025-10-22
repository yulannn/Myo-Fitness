import * as fs from 'fs';
import * as path from 'path';

// Lire le CSV
const csvPath = path.join(__dirname, 'fitness_final.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

console.log('🧹 Nettoyage des doublons du CSV...');
console.log(`📊 Total de lignes: ${lines.length}`);

const header = lines[0];
const seen = new Set<string>();
const uniqueLines: string[] = [header];

let duplicates = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Extraire le nom de l'exercice (2ème colonne)
  const match = line.match(/^([^,]+),([^,]+),/);
  if (!match) continue;

  const exerciseName = match[2].replace(/^"|"$/g, '').trim();
  
  if (seen.has(exerciseName)) {
    console.log(`  ⏭️  Doublon ignoré: ${exerciseName}`);
    duplicates++;
  } else {
    seen.add(exerciseName);
    uniqueLines.push(line);
  }
}

console.log(`\n✅ Exercices uniques: ${seen.size}`);
console.log(`❌ Doublons supprimés: ${duplicates}`);

// Créer un nouveau CSV nettoyé
const cleanedCsvPath = path.join(__dirname, 'fitness_final_clean.csv');
fs.writeFileSync(cleanedCsvPath, uniqueLines.join('\n'), 'utf-8');

console.log(`\n💾 Fichier nettoyé créé: fitness_final_clean.csv`);
console.log(`\n📋 Pour utiliser le fichier nettoyé:`);
console.log(`   1. Sauvegardez l'ancien: Rename-Item fitness_final.csv fitness_final_backup.csv`);
console.log(`   2. Utilisez le nouveau: Rename-Item fitness_final_clean.csv fitness_final.csv`);
console.log(`   3. Réexécutez le seed: npm run prisma:seed:exercices`);
