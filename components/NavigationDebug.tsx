"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavigationDebug() {
  const router = useRouter();

  const testRoutes = [
    { path: "/", name: "Home" },
    { path: "/levels", name: "Levels" },
    { path: "/practice", name: "Practice" },
    { path: "/arcade", name: "Arcade" },
    { path: "/ai-settings", name: "AI Settings" }
  ];

  return (
    <div className="card p-4 grid gap-3">
      <h3 className="font-bold text-yellow-400">🐛 Navigation Debug</h3>
      <p className="text-sm text-white/70">Test navigation methods:</p>
      
      <div className="grid gap-2">
        <h4 className="text-sm font-semibold">Router.push() (Programmatic):</h4>
        <div className="grid grid-cols-2 gap-2">
          {testRoutes.map(route => (
            <button
              key={route.path}
              onClick={() => {
                console.log('Navigating to:', route.path);
                router.push(route.path);
              }}
              className="btn btn-secondary text-xs"
            >
              {route.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <h4 className="text-sm font-semibold">Link Components:</h4>
        <div className="grid grid-cols-2 gap-2">
          {testRoutes.map(route => (
            <Link
              key={route.path}
              href={route.path}
              className="btn btn-secondary text-xs text-center"
              onClick={() => console.log('Link clicked:', route.path)}
            >
              {route.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="text-xs text-white/60">
        Check browser console for navigation logs
      </div>
    </div>
  );
} 