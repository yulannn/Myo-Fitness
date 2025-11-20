import api from '../apiClient';
import type { SessionPhoto, CreateSessionPhotoPayload } from '../../types/session-photo.type';

export const SessionPhotoFetchDataService = {
    async uploadSessionPhoto(payload: CreateSessionPhotoPayload): Promise<SessionPhoto> {
        const formData = new FormData();
        formData.append('sessionId', payload.sessionId.toString());
        if (payload.description) {
            formData.append('description', payload.description);
        }
        if (payload.photo) {
            formData.append('photo', payload.photo);
        }
        const res = await api.post<SessionPhoto>('/session-photo/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    },

    async getAllSessionPhotos(): Promise<SessionPhoto[]> {
        const res = await api.get<SessionPhoto[]>('/session-photo');
        return res.data;
    },

    async getTodaySessionPhotos(): Promise<SessionPhoto[]> {
        const res = await api.get<SessionPhoto[]>('/session-photo/today');
        return res.data;
    },

    async getSessionPhotoById(photoId: number): Promise<SessionPhoto> {
        const res = await api.get<SessionPhoto>(`/session-photo/${photoId}`);
        return res.data;
    },

    async getSessionPhotosByDay(date: string): Promise<SessionPhoto[]> {
        const res = await api.get<SessionPhoto[]>(`/session-photo/day/${date}`);
        return res.data;
    },

    async getTodaySessionPhotosFromFriends(): Promise<SessionPhoto[]> {
        const res = await api.get<SessionPhoto[]>('/session-photo/today/friends');
        return res.data;
    },
};

export default SessionPhotoFetchDataService;

