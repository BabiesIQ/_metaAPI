import "./lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { loadConfig } from "./lib/config";
import { verifyDomain } from "./lib/domain-verify";
import { UnauthorizedScreen } from "./components/UnauthorizedScreen";
import { initializeTheme } from "./hooks/useThemeMode";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Restore the user's day/night choice before the first screen renders.
initializeTheme();

async function bootstrap() {
  // Load runtime config first — domain verify needs the backend URL
  await loadConfig();

  // Verify that this deployment is authorized
  const result = await verifyDomain();

  const root = ReactDOM.createRoot(document.getElementById("root")!);

  if (!result.trusted) {
    // Block the entire app — render only the unauthorized screen
    root.render(<UnauthorizedScreen />);
    return;
  }

  // Domain is trusted — boot normally
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

bootstrap();
