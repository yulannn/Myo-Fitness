import api from '../apiClient';
import type { User, UploadProfilePictureResponse } from '../../types/user.type';

export const UserFetchDataService = {
    async getUserByEmail(email: string): Promise<User> {
        const res = await api.get<User>(`/users/email/${email}`);
        return res.data;
    },

    async getUserById(userId: number): Promise<User> {
        const res = await api.get<User>(`/users/${userId}`);
        return res.data;
    },

    async uploadProfilePicture(file: File): Promise<UploadProfilePictureResponse> {
        const formData = new FormData();
        formData.append('profilePicture', file);
        const res = await api.post<UploadProfilePictureResponse>('/users/me/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    },
};

export default UserFetchDataService;
