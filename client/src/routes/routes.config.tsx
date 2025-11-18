import Home from "../pages/home";
import FitnessProfiles from "../pages/profile";
import Program from "../pages/program";
import ComingSoon from "../pages/placeHolder";
import Login from "../pages/login";
import Register from "../pages/register";
import type { ReactNode } from "react";
import { HOME, PROFILES, PROGRAMS, COACH, SESSIONS, LOGIN, REGISTER } from "../utils/paths";

export interface AppRouteConfig {
    path: string;
    element: ReactNode;
    protected?: boolean;
    hideBottomNav?: boolean;
}

export const routes: AppRouteConfig[] = [
    {
        path: HOME,
        element: <Home />,
        protected: true,
    },
    {
        path: PROFILES,
        element: <FitnessProfiles />,
        protected: true,
    },
    {
        path: PROGRAMS,
        element: <Program />,
        protected: true,
    },
    {
        path: COACH,
        element: <ComingSoon />,
        protected: true,
    },
    {
        path: SESSIONS,
        element: <ComingSoon />,
        protected: true,
    },
    {
        path: LOGIN,
        element: <Login />,
        hideBottomNav: true,
    },
    {
        path: REGISTER,
        element: <Register />,
        hideBottomNav: true,
    },
];
