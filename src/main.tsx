import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { PaymentProvider } from "./context/PaymentContext";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <SettingsProvider>
        <PaymentProvider>
          <App />
        </PaymentProvider>
      </SettingsProvider>
    </AuthProvider>
  </BrowserRouter>
);
  