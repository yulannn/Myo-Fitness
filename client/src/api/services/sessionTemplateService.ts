import api from '../apiClient';

export interface ExerciseTemplateDto {
  id?: number;
  exerciseId: number;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // 🆕 Durée en minutes (pour cardio)
  notes?: string;
  orderInSession?: number;
  exercise?: {
    id: number;
    name: string;
    imageUrl?: string;
    bodyWeight: boolean;
    type?: 'COMPOUND' | 'ISOLATION' | 'CARDIO' | 'MOBILITY' | 'STRETCH'; // 🆕
  };
}

export interface SessionTemplateDto {
  id: number;
  name: string;
  description?: string;
  orderInProgram: number;
  exercises: ExerciseTemplateDto[];
  _count?: {
    instances: number;
  };
}

export interface CreateSessionTemplateDto {
  programId: number;
  name: string;
  description?: string;
  orderInProgram?: number;
  exercises: Omit<ExerciseTemplateDto, 'id' | 'exercise'>[];
}

export interface UpdateSessionTemplateDto {
  name?: string;
  description?: string;
  exercises?: Omit<ExerciseTemplateDto, 'id' | 'exercise'>[];
}

export interface ScheduleSessionDto {
  date?: string; // ISO string, null = now
}

const sessionTemplateService = {
  /**
   * Récupère un template par ID
   */
  getTemplate: async (templateId: number) => {
    const response = await api.get(`/session-templates/${templateId}`);
    return response.data;
  },

  /**
   * Crée un nouveau template
   */
  createTemplate: async (dto: CreateSessionTemplateDto) => {
    const response = await api.post('/session-templates', dto);
    return response.data;
  },

  /**
   * Met à jour un template
   */
  updateTemplate: async (templateId: number, dto: UpdateSessionTemplateDto) => {
    const response = await api.put(`/session-templates/${templateId}`, dto);
    return response.data;
  },

  /**
   * Supprime un template
   */
  deleteTemplate: async (templateId: number) => {
    const response = await api.delete(`/session-templates/${templateId}`);
    return response.data;
  },

  /**
   * Planifie une instance depuis un template (avec date choisie)
   */
  scheduleFromTemplate: async (templateId: number, dto: ScheduleSessionDto) => {
    const response = await api.post(`/session-templates/${templateId}/schedule`, dto);
    return response.data;
  },

  /**
   * Démarre immédiatement une instance depuis un template
   */
  startFromTemplate: async (templateId: number) => {
    const response = await api.post(`/session-templates/${templateId}/start`);
    return response.data;
  },
};

export default sessionTemplateService;
