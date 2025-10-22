import { User, GroupStatus } from '@prisma/client';
import { object } from 'zod';

export class GroupEntity {
    id : number;
    name : string;
    createdAt : Date;
    status : GroupStatus;
    members? : User[];

     constructor(partial: Partial<GroupEntity>) {
    Object.assign(this, partial);
  }
}  