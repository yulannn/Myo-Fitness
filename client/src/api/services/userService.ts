import api from '../apiClient';
import type { User, UploadProfilePictureResponse } from '../../types/user.type';

interface PresignedUrlResponse {
    uploadUrl: string;
    key: string;
    publicUrl: string;
}

export const UserFetchDataService = {
    async getUserByEmail(email: string): Promise<User> {
        const res = await api.get<User>(`/users/email/${email}`);
        return res.data;
    },

    async getUserById(userId: number): Promise<User> {
        const res = await api.get<User>(`/users/${userId}`);
        return res.data;
    },

    /**
     * Upload d'une photo de profil via URL présignée R2
     * 1. Demande une URL présignée au backend
     * 2. Upload le fichier directement vers R2
     * 3. Confirme l'upload au backend pour mettre à jour la BDD
     */
    async uploadProfilePicture(file: File): Promise<UploadProfilePictureResponse> {
        // Étape 1: Obtenir le type MIME et l'extension du fichier
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const contentType = file.type;

        // Validation côté client
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

        if (!allowedTypes.includes(contentType)) {
            throw new Error('Seules les images sont autorisées (JPEG, PNG, GIF)');
        }

        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error('Extension de fichier invalide');
        }

        // Vérifier la taille du fichier (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('Le fichier est trop volumineux (max 5 MB)');
        }

        try {
            // Étape 2: Demander une URL présignée au backend
            const presignedRes = await api.post<PresignedUrlResponse>(
                '/users/me/profile-picture/presigned-url',
                {
                    fileExtension,
                    contentType,
                }
            );

            const { uploadUrl, publicUrl } = presignedRes.data;

            // Étape 3: Upload du fichier directement vers R2 avec l'URL présignée
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': contentType,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error(`Échec de l'upload vers R2: ${uploadResponse.statusText}`);
            }

            // Étape 4: Confirmer l'upload au backend et mettre à jour la BDD
            const confirmRes = await api.post<UploadProfilePictureResponse>(
                '/users/me/profile-picture/confirm',
                {
                    publicUrl,
                }
            );

            return confirmRes.data;
        } catch (error: any) {
            console.error('Erreur lors de l\'upload de la photo de profil:', error);
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Erreur lors de l\'upload de la photo de profil'
            );
        }
    },

    /**
     * Supprimer la photo de profil
     */
    async deleteProfilePicture(): Promise<void> {
        await api.delete('/users/me/profile-picture');
    },
};

export default UserFetchDataService;

