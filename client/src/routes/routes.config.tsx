import Home from "../pages/home";
import MyProfile from "../pages/my-profile";
import Settings from "../pages/settings";
import Program from "../pages/program";
import Sessions from "../pages/sessions";
import ActiveSession from "../pages/active-session";
import SocialPage from "../pages/social";
import Login from "../pages/login";
import Register from "../pages/register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyCode from "../pages/auth/VerifyCode";
import ResetPassword from "../pages/auth/ResetPassword";
import ChangePassword from "../pages/change-password";
import Premium from "../pages/premium";
import PremiumSuccess from "../pages/premium/success";
import VerifyEmail from "../pages/verify-email";
import Privacy from "../pages/privacy";
import Onboarding from "../pages/onboarding";
import ChatsPage from "../pages/social/ChatsPage";
import FriendsPage from "../pages/social/FriendsPage";
import NotificationsPage from "../pages/social/NotificationsPage";
import SentryTestPage from "../pages/sentry-test";
import type { ReactNode } from "react";
import {
    HOME,
    SETTINGS,
    MY_PROFILE,
    PROGRAMS,
    ACTIVE_SESSION,
    SESSIONS,
    SOCIAL,
    LOGIN,
    REGISTER,
    FORGOT_PASSWORD,
    VERIFY_CODE,
    RESET_PASSWORD,
    CHANGE_PASSWORD,
    PREMIUM,
    PREMIUM_SUCCESS,
    VERIFY_EMAIL,
    PRIVACY,
    ONBOARDING,
    SOCIAL_CHATS,
    SOCIAL_FRIENDS,
    SOCIAL_NOTIFICATIONS,
    SENTRY_TEST,
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
        path: ONBOARDING,
        element: <Onboarding />,
        protected: true,
        hideBottomNav: true
    },
    {
        path: SETTINGS,
        element: <Settings />,
        protected: true
    },
    {
        path: MY_PROFILE,
        element: <MyProfile />,
        protected: true
    },
    {
        path: PRIVACY,
        element: <Privacy />,
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
        path: CHANGE_PASSWORD,
        element: <ChangePassword />,
        protected: true
    },
    {
        path: PREMIUM,
        element: <Premium />,
        protected: true
    },
    {
        path: PREMIUM_SUCCESS,
        element: <PremiumSuccess />,
        protected: true,
        hideBottomNav: true
    },
    {
        path: SOCIAL,
        element: <SocialPage />,
        protected: true
    },
    {
        path: SOCIAL_CHATS,
        element: <ChatsPage />,
        protected: true
    },
    {
        path: SOCIAL_FRIENDS,
        element: <FriendsPage />,
        protected: true
    },
    {
        path: SOCIAL_NOTIFICATIONS,
        element: <NotificationsPage />,
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
        path: VERIFY_EMAIL,
        element: <VerifyEmail />,
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
        path: SENTRY_TEST,
        element: <SentryTestPage />,
        protected: false,
        hideBottomNav: true
    },
    {
        path: "*",
        element: <Home />,
        protected: true
    }
];
