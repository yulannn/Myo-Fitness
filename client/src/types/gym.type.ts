export interface Gym {
    id: number;
    osmId: string;
    name: string;
    address: string;
    city?: string;
    lat: number;
    lng: number;
    distance?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface GymMember {
    id: number;
    name: string;
    email: string;
    profilePictureUrl?: string;
    fitnessProfileId: number;
}

export interface GymSharedSession {
    id: string;
    type: 'shared';
    title: string;
    description?: string;
    date: string;
    startTime: string;
    completed: boolean;
    maxParticipants?: number;
    user: {
        id: number;
        name: string;
        profilePictureUrl?: string;
    };
    participantsCount: number;
    participants: Array<{
        id: number;
        name: string;
        profilePictureUrl?: string;
    }>;
}

export interface GymDetails extends Gym {
    members: GymMember[];
    sessions: GymSharedSession[]; // Uniquement les séances partagées
    fitnessProfiles?: any[];
}

export interface FindOrCreateGymDto {
    osmId: string;
    name: string;
    address: string;
    city?: string;
    lat: number;
    lng: number;
}
