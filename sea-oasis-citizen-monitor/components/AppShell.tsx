"use client";
import Navigation from "./Navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        SeaOasis Citizen Monitor - Hackathon prototype. Demo data only.
      </footer>
    </div>
  );
}
