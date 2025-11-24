import { useLocation, matchPath } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import BottomNav from "./components/app/BottomNav";
import { routes } from "./routes/routes.config";

export default function App() {
  const location = useLocation();

  const shouldHideBottomNav = routes.some((r) =>
    r.hideBottomNav && matchPath({ path: r.path, end: true }, location.pathname)
  );

  return (
    <div className="flex min-h-screen justify-center bg-slate-200/70">
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-slate-50 text-slate-900 shadow-xl">
        <main className="flex-1 overflow-y-auto ">
          <AppRoutes />
        </main>

        {!shouldHideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
