import { secureTokenService } from '../api/services/secureTokenService';

export async function forceLogout() {
    await secureTokenService.clear();
    if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
    }
}


if (typeof window !== 'undefined') {
    (window as any).forceLogout = forceLogout;
}
