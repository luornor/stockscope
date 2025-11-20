"use client";

import { useEffect, useRef, useState } from "react";
import Spinner from "@/components/Spinner";
import {apiPost} from "@/lib/api";

type GoogleCredentialResponse = { credential?: string };

interface GoogleAccountsId {
  initialize: (opts: {
    client_id: string;
    callback: (resp: GoogleCredentialResponse) => void | Promise<void>;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled" | string;
      size?: "large" | "medium" | "small" | string;
      shape?: "pill" | "rectangular" | string;
      width?: number;
    }
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

export default function GoogleLoginButton({ next = "/dashboard" }: { next?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);    // GSI ready
  const [loading, setLoading] = useState(false);  // we are posting to backend
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    let tries = 0;

    const ready = () =>
      !!window.google?.accounts?.id &&
      !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
      !!divRef.current;

    const boot = () => {
      const g = window.google!.accounts!.id!;
      g.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
        callback: async ({ credential }) => {
          if (!credential) return;
          setError(null);
          setLoading(true);
          try {
            const r = (await apiPost("/api/auth/google/onetap", { credential })) as Response;

            let data: { error?: string; detail?: string } | null = null;
            try { data = (await r.json()) as { error?: string; detail?: string } | null; } catch {}

            if (!r.ok) {
              setLoading(false);
              setError(data?.error || data?.detail || "Google sign-in failed");
              return;
            }

            // success: cookies are set -> go to dashboard
            window.location.href = next;
          } catch {
            setLoading(false);
            setError("Network error. Please try again.");
          }
        },
      });

      // Keep your visual style exactly:
      g.renderButton(divRef.current as HTMLElement, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 300,
      });

      setLoaded(true);
    };

    const tick = setInterval(() => {
      if (ready()) {
        clearInterval(tick);
        boot();
      } else if (++tries > 50) {
        clearInterval(tick); // ~5s timeout
        setError("Google script not loaded. Refresh and try again.");
      }
    }, 100);

    return () => clearInterval(tick);
  }, [next]);

  return (
    <div className="flex flex-col items-center">
      {/* Show the official GSI button until we start posting to backend */}
      {!loading && <div ref={divRef} className={`${loaded ? "" : "hidden"}`} />}
      {/* Fallback skeleton while GSI loads OR spinner while posting */}
      {(!loaded || loading) && (
        <div className="w-[320px] rounded-full bg-black text-white px-4 py-2 text-center">
          <Spinner label={loading ? "Signing you in..." : "Loading Google…"} />
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
