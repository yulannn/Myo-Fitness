import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes.config";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { HOME, LOGIN, REGISTER } from "../utils/paths";

export const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {routes.map(({ path, element, protected: isProtected }) => {
                const Page = element;

                if (isProtected) {
                    return (
                        <Route
                            key={path}
                            path={path}
                            element={<ProtectedRoute>{Page}</ProtectedRoute>}
                        />
                    );
                }

                if ((path === LOGIN || path === REGISTER) && isAuthenticated) {
                    return (
                        <Route
                            key={path}
                            path={path}
                            element={<Navigate to={HOME} replace />}
                        />
                    );
                }

                return <Route key={path} path={path} element={Page} />;
            })}
        </Routes>
    );
};
