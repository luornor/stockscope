"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Local minimal ThemeProvider replacement to avoid dependency on `next-themes`.
 * It currently only forwards children and, when `enableSystem` is true, applies
 * a 'dark' or 'light' class to document.documentElement based on prefers-color-scheme.
 */
type ThemeProviderProps = PropsWithChildren<{
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}>;

function ThemeProvider({ children, enableSystem }: ThemeProviderProps) {
  useEffect(() => {
    if (!enableSystem) return;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = (isDark: boolean) => {
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.classList.toggle("light", !isDark);
    };
    apply(mq?.matches ?? false);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, [enableSystem]);

  return <>{children}</>;
}

export default function Providers({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
