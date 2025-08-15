"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CRITICAL_ROUTES = [
  "/levels",
  "/practice", 
  "/arcade",
  "/ai-settings"
];

export default function RoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    // Preload critical routes after initial page load
    const preloadTimer = setTimeout(() => {
      CRITICAL_ROUTES.forEach(route => {
        router.prefetch(route);
      });
    }, 1000); // Wait 1 second after page load

    return () => clearTimeout(preloadTimer);
  }, [router]);

  return null; // This component doesn't render anything
} 