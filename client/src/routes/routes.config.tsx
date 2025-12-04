import Home from "../pages/home";
import FitnessProfiles from "../pages/profile";
import Program from "../pages/program";
import Sessions from "../pages/sessions";
import ActiveSession from "../pages/active-session";
import SocialPage from "../pages/social";
import Login from "../pages/login";
import Register from "../pages/register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyCode from "../pages/auth/VerifyCode";
import ResetPassword from "../pages/auth/ResetPassword";
import type { ReactNode } from "react";
import {
    HOME,
    PROFILES,
    PROGRAMS,
    ACTIVE_SESSION,
    SESSIONS,
    SOCIAL,
    LOGIN,
    REGISTER,
    FORGOT_PASSWORD,
    VERIFY_CODE,
    RESET_PASSWORD,
} from "../utils/paths";

export interface AppRouteConfig {
    path: string;
    element: ReactNode;
    protected?: boolean;
    redirectIfAuthenticated?: boolean;
    hideBottomNav?: boolean;
}

export const routes: AppRouteConfig[] = [

    {
        path: HOME,
        element: <Home />,
        protected: true
    },
    {
        path: PROFILES,
        element: <FitnessProfiles />,
        protected: true
    },
    {
        path: PROGRAMS,
        element: <Program />,
        protected: true
    },
    {
        path: ACTIVE_SESSION,
        element: <ActiveSession />,
        protected: true
    },
    {
        path: SESSIONS,
        element: <Sessions />,
        protected: true
    },
    {
        path: SOCIAL,
        element: <SocialPage />,
        protected: true
    },
    {
        path: LOGIN,
        element: <Login />,
        redirectIfAuthenticated: true,
        hideBottomNav: true
    },
    {
        path: REGISTER,
        element: <Register />,
        redirectIfAuthenticated: true,
        hideBottomNav: true
    },
    {
        path: FORGOT_PASSWORD,
        element: <ForgotPassword />,
        redirectIfAuthenticated: true,
        hideBottomNav: true
    },
    {
        path: VERIFY_CODE,
        element: <VerifyCode />,
        redirectIfAuthenticated: true,
        hideBottomNav: true
    },
    {
        path: RESET_PASSWORD,
        element: <ResetPassword />,
        redirectIfAuthenticated: true,
        hideBottomNav: true
    },
    {
        path: "*",
        element: <Home />,
        protected: true
    }

];
