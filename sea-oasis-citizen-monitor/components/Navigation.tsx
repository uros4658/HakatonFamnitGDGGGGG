"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves, Compass, Camera, ClipboardList, BarChart3, FileText, BookOpen, Pi, Bot, Route } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Waves },
  { href: "/planner", label: "Planner", icon: Compass },
  { href: "/route-3d", label: "3D Drone Route", icon: Route },
  { href: "/checklist", label: "Checklist", icon: Camera },
  { href: "/observations", label: "Observations", icon: ClipboardList },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/report", label: "Report", icon: FileText },
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/math", label: "Math", icon: Pi },
  { href: "/advisor", label: "AI Advisor", icon: Bot },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                pathname === href
                  ? "bg-cyan-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
