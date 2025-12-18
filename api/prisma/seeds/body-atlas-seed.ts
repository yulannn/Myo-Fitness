import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Body Atlas data...');

    // 1️⃣ Créer les groupes musculaires principaux
    const muscleGroups = [
        { name: 'Pectoraux', category: 'CHEST' },
        { name: 'Dorsaux', category: 'BACK' },
        { name: 'Lombaires', category: 'BACK' },
        { name: 'Épaules', category: 'SHOULDERS' },
        { name: 'Biceps', category: 'ARMS' },
        { name: 'Triceps', category: 'ARMS' },
        { name: 'Avant-bras', category: 'ARMS' },
        { name: 'Quadriceps', category: 'LEGS' },
        { name: 'Ischio-jambiers', category: 'LEGS' },
        { name: 'Mollets', category: 'LEGS' },
        { name: 'Fessiers', category: 'LEGS' },
        { name: 'Abdominaux', category: 'CORE' },
        { name: 'Obliques', category: 'CORE' },
        { name: 'Trapèzes', category: 'BACK' },
    ];

    console.log('📦 Creating muscle groups...');
    for (const group of muscleGroups) {
        await prisma.muscleGroup.upsert({
            where: { name: group.name },
            update: { category: group.category as any },
            create: group as any,
        });
    }
    console.log('✅ Muscle groups created');

    console.log('🎉 Body Atlas seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
