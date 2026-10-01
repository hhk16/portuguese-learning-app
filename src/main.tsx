/**
 * Routing: /play → phone controller; everything else (/, /tv) → the TV host.
 * The two surfaces are code-split so phones never download three.js.
 */
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.css";

const isPhone = location.pathname.startsWith("/play");

// The phone controller is installable ("Adicionar ao ecrã principal") — a full-screen app icon
// on Android and iPhone without an app store.
if (isPhone) {
  const add = (tag: string, attrs: Record<string, string>) => document.head.appendChild(Object.assign(document.createElement(tag), attrs));
  add("link", { rel: "manifest", href: "/manifest.webmanifest" });
  add("link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" });
  add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
  add("meta", { name: "mobile-web-app-capable", content: "yes" });
  add("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" });
  add("meta", { name: "apple-mobile-web-app-title", content: "Party PT" });
}
const App = isPhone
  ? lazy(async () => {
      await import("./styles/phone.css");
      return { default: (await import("./phone/PhoneApp.tsx")).PhoneApp };
    })
  : lazy(async () => {
      await import("./styles/tv.css");
      return { default: (await import("./tv/TvApp.tsx")).TvApp };
    });

// Walkthrough recordings (?clock=1): a shared wall clock in the corner, so the TV and phone videos can be lined up.
if (new URLSearchParams(location.search).get("clock") === "1") {
  const el = Object.assign(document.createElement("div"), { id: "rec-clock" });
  el.style.cssText = "position:fixed;right:6px;bottom:4px;z-index:99999;font:700 13px monospace;color:#fff;background:rgba(0,0,0,.55);padding:1px 6px;border-radius:6px;pointer-events:none";
  document.body.appendChild(el);
  setInterval(() => (el.textContent = `⏱ ${((Date.now() / 1000) % 10000).toFixed(1)}`), 100);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
);
