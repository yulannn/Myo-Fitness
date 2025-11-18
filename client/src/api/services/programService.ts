import api from '../apiClient';

export const ProgramFetchDataService = {
    getProgramsById: async () => {
        const res = await api.get('/program');
        return res.data;
    },
};

export default ProgramFetchDataService;
