// src/components/SessionProviderWrapper.tsx (fix the path - should be components, not component)
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function SessionProviderWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}