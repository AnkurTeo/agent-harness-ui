import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import "./index.css";

window.addEventListener("error", (e) => {
  console.error("[window.error]", e.error ?? e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[unhandledrejection]", e.reason);
});

// NOTE: StrictMode disabled intentionally. @assistant-ui/react-opencode@0.0.3
// disposes its shared event source on effect cleanup and reuses the same
// (now-stopped) registry instance on re-mount, which blackholes the /event
// SSE stream and leaves agent replies stuck "running" forever.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
