import { useLocation, matchPath } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import BottomNav from "./components/app/BottomNav";
import ActiveSessionBubble from "./components/app/ActiveSessionBubble";
import { routes } from "./routes/routes.config";
import { usePageTracking } from "./api/hooks/analytics/usePageTracking";
import { useIOSBounceFix } from "./hooks/useIOSBounceFix";
import { useGlobalMessageListener } from "./api/hooks/chat/useGlobalMessageListener";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const location = useLocation();

  // Track page views in Firebase Analytics
  usePageTracking();

  // Listen for global chat messages
  useGlobalMessageListener();

  // Fix iOS rubber-band effect
  useIOSBounceFix();

  const shouldHideBottomNav = routes.some((r) =>
    r.hideBottomNav && matchPath({ path: r.path, end: true }, location.pathname)
  );

  return (
    <div className="flex min-h-screen justify-center bg-slate-200/70">
      <ScrollToTop />
      <div
        className="relative flex min-h-screen w-full max-w-md flex-col bg-[#121214] text-white shadow-xl"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <main className="flex-1 overflow-y-auto ">
          <AppRoutes />
        </main>

        {!shouldHideBottomNav && <BottomNav />}
        <ActiveSessionBubble />
      </div>
    </div>
  );
}
