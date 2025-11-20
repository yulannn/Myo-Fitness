import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useLogout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return useCallback(async () => {
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login', { replace: true });
        }
    }, [logout, navigate]);
}

export default useLogout;

