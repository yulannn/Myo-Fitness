import { User, Leveling } from "@prisma/client";

export class LevelEntity {
    id : number;
    userId : number;
    level : number;
    experience : number;
    nextLevelExp : number;
    createdAt : Date;
    updatedAt : Date;

}