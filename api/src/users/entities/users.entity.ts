import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  email: string;
  name: string;

  @Exclude()
  password: string;

  createdAt: Date;
  updatedAt: Date;
  refreshToken?: string | null;


}
