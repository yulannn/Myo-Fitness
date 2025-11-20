export interface Equipment {
    id: number;
    name: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEquipmentPayload {
    name: string;
    description?: string;
}

export interface UpdateEquipmentPayload {
    name?: string;
    description?: string;
}

