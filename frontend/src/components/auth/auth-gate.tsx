"use client";

import { useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LoginScreen } from "@/components/auth/login-screen";
import { useSessionStore } from "@/stores/session-store";

export function AuthGate() {
  const { accessToken, hasHydrated, hydrate } = useSessionStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hasHydrated) {
    return <main className="min-h-screen bg-background" />;
  }

  if (!accessToken) {
    return <LoginScreen />;
  }

  return <DashboardShell />;
}
