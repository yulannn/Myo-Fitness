/**
 * Helper pour gérer les URLs d'images entre le stockage local et Cloudflare R2
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Détermine l'URL complète d'une image en fonction de son format
 * Supporte à la fois les URLs R2 (https://...) et les chemins locaux (/uploads/...)
 * 
 * @param imageUrl - URL de l'image (peut être null/undefined)
 * @param fallbackPath - Chemin par défaut si imageUrl est null
 * @returns URL complète de l'image
 */
export function getImageUrl(
    imageUrl: string | null | undefined,
    fallbackPath: string = '/uploads/profile-pictures/default.png'
): string {
    // Si pas d'URL, utiliser le fallback
    if (!imageUrl) {
        return `${API_BASE_URL}${fallbackPath}`;
    }

    // Si l'URL commence par http(s), c'est une URL complète (probablement R2)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Sinon, c'est un chemin local, ajouter l'URL de base
    return `${API_BASE_URL}${imageUrl}`;
}

/**
 * Vérifie si une URL d'image provient de Cloudflare R2
 * 
 * @param imageUrl - URL de l'image
 * @returns true si l'image est sur R2
 */
export function isR2Image(imageUrl: string | null | undefined): boolean {
    if (!imageUrl) return false;

    return (
        imageUrl.includes('.r2.cloudflarestorage.com') ||
        imageUrl.includes('r2.dev') // Format de dev R2
    );
}

/**
 * Extrait le nom de fichier depuis une URL
 * 
 * @param imageUrl - URL de l'image
 * @returns Nom du fichier ou null
 */
export function getImageFilename(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;

    try {
        const url = new URL(imageUrl);
        const pathname = url.pathname;
        const parts = pathname.split('/');
        return parts[parts.length - 1] || null;
    } catch {
        // Si ce n'est pas une URL valide, essayer en tant que chemin
        const parts = imageUrl.split('/');
        return parts[parts.length - 1] || null;
    }
}

/**
 * Valide une image avant l'upload
 * 
 * @param file - Fichier à valider
 * @returns Object avec isValid et errorMessage
 */
export function validateImageFile(file: File): {
    isValid: boolean;
    errorMessage?: string;
} {
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

    // Vérifier le type MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            isValid: false,
            errorMessage: `Type de fichier non autorisé. Formats acceptés: ${ALLOWED_TYPES.join(', ')}`,
        };
    }

    // Vérifier l'extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            isValid: false,
            errorMessage: `Extension de fichier non autorisée. Extensions acceptées: ${ALLOWED_EXTENSIONS.join(', ')}`,
        };
    }

    // Vérifier la taille
    if (file.size > MAX_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
            isValid: false,
            errorMessage: `Fichier trop volumineux (${sizeMB} MB). Taille maximale: 5 MB`,
        };
    }

    return { isValid: true };
}
