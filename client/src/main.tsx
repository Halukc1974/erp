import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  // Don't prevent default to let Vite's overlay work
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Don't prevent default to let Vite's overlay work
});

createRoot(document.getElementById("root")!).render(<App />);
