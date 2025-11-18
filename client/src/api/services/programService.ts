import api from '../apiClient';
import type { Program } from '../../types/program.type';

export const ProgramFetchDataService = {
    getProgramsById: async (): Promise<Program[]> => {
        const res = await api.get<Program[]>('/program');
        return res.data;
    },
};

export default ProgramFetchDataService;
