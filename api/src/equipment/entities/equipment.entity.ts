import { Equipment } from "@prisma/client";

export class EquipmentEntity implements Equipment {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<EquipmentEntity>) {
    Object.assign(this, partial);
  }

}
