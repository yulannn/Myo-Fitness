import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/home";
import FitnessProfiles from "./pages/profile";
import Login from "./pages/login";
import Register from "./pages/register";
import BottomNav from "./components/app/BottomNav";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const hideBottomNavRoutes = ["/auth/login", "/auth/register"];
  const shouldHideBottomNav = hideBottomNavRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen justify-center bg-slate-200/70">
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-slate-50 text-slate-900 shadow-xl">
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-6">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profiles"
              element={
                <ProtectedRoute>
                  <FitnessProfiles />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/auth/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
          </Routes>
        </main>

        {}
        {!shouldHideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
