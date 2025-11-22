export function forceLogout() {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('myo.auth.accessToken');
    }
    if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
    }
}


if (typeof window !== 'undefined') {
    (window as any).forceLogout = forceLogout;
}
