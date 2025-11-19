import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes.config";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { HOME } from "../utils/paths";

export const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {routes.map(({ path, element, protected: isProtected, redirectIfAuthenticated }) => {
                // 1️ Cas : route protégée → nécessite un token
                if (isProtected) {
                    return (
                        <Route
                            key={path}
                            path={path}
                            element={<ProtectedRoute>{element}</ProtectedRoute>}
                        />
                    );
                }

                // 2️ Cas : route publique qui ne doit pas être visible si user connecté (login/register)
                if (redirectIfAuthenticated && isAuthenticated) {
                    return (
                        <Route
                            key={path}
                            path={path}
                            element={<Navigate to={HOME} replace />}
                        />
                    );
                }

                // 3️ Cas : route publique classique
                return <Route key={path} path={path} element={element} />;
            })}
        </Routes>
    );
};
