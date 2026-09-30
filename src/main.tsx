/**
 * Routing: /play → phone controller; everything else (/, /tv) → the TV host.
 * The two surfaces are code-split so phones never download three.js.
 */
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.css";

const isPhone = location.pathname.startsWith("/play");
const App = isPhone
  ? lazy(async () => {
      await import("./styles/phone.css");
      return { default: (await import("./phone/PhoneApp.tsx")).PhoneApp };
    })
  : lazy(async () => {
      await import("./styles/tv.css");
      return { default: (await import("./tv/TvApp.tsx")).TvApp };
    });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
);
