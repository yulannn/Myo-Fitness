import { Injectable } from "@nestjs/common";
import { CreateLevelDto } from "./dto/create-level.dto";
import { PrismaService } from "prisma/prisma.service";


@Injectable()
export class LevelService {
    constructor(private prisma: PrismaService) { }

   
    async getLevelByUserId(userId: number) {
        return this.prisma.leveling.findUnique({
            where: { userId },
        });
    } 

    async updateLevel(userId: number, experienceGained: number) {
        const levelData = await this.getLevelByUserId(userId);
        if (!levelData) {
            throw new Error('Level data not found for user');
        }
        let { level, experience, nextLevelExp } = levelData;
        experience += experienceGained;

        while (experience >= nextLevelExp) {
            experience -= nextLevelExp;
            level += 1;
            nextLevelExp = Math.floor(nextLevelExp * 1.2); 
        }
        return this.prisma.leveling.update({
            where: { userId },
            data: {
                level,
                experience,
                nextLevelExp,
            },
        });
    }

    async getxpToNextLevel(userId: number) {
        const levelData = await this.getLevelByUserId(userId);
        if (!levelData) {
            throw new Error('Level data not found for user');
        }
        return levelData.nextLevelExp - levelData.experience;
    }

    




}
