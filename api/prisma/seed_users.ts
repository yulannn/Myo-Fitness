import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting user seeding...');

    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users: any[] = [];

        console.log('Generating user data...');
        for (let i = 0; i < 1000; i++) {
            // Generate a random string for uniqueness
            const randomStr = Math.random().toString(36).substring(2, 8);

            users.push({
                name: `User_${randomStr}`,
                email: `user_${randomStr}_${i}@test.com`,
                password: hashedPassword,
                emailVerified: true,
                // Optional: varies levels slightly if needed, but keeping simple for now
                level: 1,
                xp: 0
            });
        }

        console.log(`Inserting ${users.length} users into the database...`);

        // Using createMany for better performance
        const result = await prisma.user.createMany({
            data: users,
            skipDuplicates: true, // In case of random collision
        });

        console.log(`✅ ${result.count} users successfully created!`);

    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
