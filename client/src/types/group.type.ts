export type GroupStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Group {
    id: number;
    name: string;
    description?: string;
    status?: GroupStatus;
    createdAt?: string;
    members?: any[];
}

export interface CreateGroupPayload {
    name: string;
    description?: string;
}

export interface SendGroupRequestPayload {
    receiverId: number;
}

