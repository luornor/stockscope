// src/app/(auth)/login/page.tsx
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { Lock, Zap, LineChart, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.22),transparent_60%)] blur-2xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.16),transparent_60%)] blur-2xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.06),transparent)] dark:bg-[linear-gradient(to_bottom_right,rgba(0,0,0,0.3),transparent)]" />
      </div>

      {/* Container */}
      <div className="mx-auto max-w-screen-xl px-5 py-10 sm:px-6 md:px-8 md:py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14 md:items-center">
          {/* Left */}
          <section className="max-w-2xl md:max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200/60 px-3 py-1 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-300">
              <Zap className="h-3.5 w-3.5 text-brand" />
              Real-time stock dashboard
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-4xl lg:text-5xl">
              Track the market <span className="text-brand">live</span> with a polished, fast UI.
            </h1>

            <p className="mt-3 max-w-prose text-[0.95rem] text-neutral-600 dark:text-neutral-300 md:text-base">
              One secure sign-in. Near real-time updates. Beautiful charts. Build your watchlists in minutes.
            </p>

            <ul className="mt-5 grid gap-3 text-sm text-neutral-600 dark:text-neutral-300 md:mt-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                Google-only authentication — no passwords to manage
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                Near real-time quotes (10s polling) — WebSockets-ready
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                Clean, responsive interface (dark mode)
              </li>
            </ul>

            <div className="mt-7 md:mt-8">
              <GoogleLoginButton />
              <p className="mt-3 flex items-center gap-2 text-xs text-neutral-400 md:text-[0.8rem]">
                <Lock className="h-3.5 w-3.5" />
                We only use your email to create your account.
              </p>
            </div>
          </section>

          {/* Right: preview card */}
          <aside className="relative order-first md:order-none">
            <div className="card mx-auto max-w-md p-4 sm:p-5 md:max-w-md lg:max-w-lg">
              <header className="mb-3 flex items-center justify-between md:mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <LineChart className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium">AAPL</div>
                    <div className="text-xs text-neutral-500">Apple Inc.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold md:text-lg">229.15</div>
                  <div className="text-[11px] text-emerald-600 md:text-xs">+0.84%</div>
                </div>
              </header>

              {/* sparkline */}
              <div className="h-20 w-full md:h-24">
                <svg viewBox="0 0 400 100" className="h-full w-full text-brand">
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopOpacity="0.35" />
                      <stop offset="100%" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,70 C40,60 80,80 120,50 C160,20 200,40 240,30 C280,20 320,40 360,25"
                    className="stroke-current"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M0,70 C40,60 80,80 120,50 C160,20 200,40 240,30 C280,20 320,40 360,25 L360,100 L0,100 Z"
                    fill="url(#g)"
                  />
                </svg>
              </div>

              {/* mini grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5">
                {[
                  { s: "MSFT", p: "415.02", c: "+0.42%" },
                  { s: "GOOGL", p: "142.77", c: "-0.18%" },
                  { s: "AMZN", p: "178.01", c: "+0.91%" },
                  { s: "NVDA", p: "894.33", c: "+1.12%" },
                ].map((x) => (
                  <div key={x.s} className="rounded-xl border border-neutral-200/60 p-3 text-sm dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{x.s}</span>
                      <span className={x.c.startsWith("-") ? "text-red-600" : "text-emerald-600"}>{x.c}</span>
                    </div>
                    <div className="mt-1 text-base font-semibold">{x.p}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute left-2 -top-7 hidden rounded-full bg-white/80 px-3 py-1 text-xs shadow-soft backdrop-blur dark:bg-neutral-900/70 sm:block md:left-0">
              Demo preview
            </div>
          </aside>
        </div>
      </div>

      <footer className="px-5 pb-8 text-center text-[11px] text-neutral-400 md:text-xs">
        © {new Date().getFullYear()} Stock Dashboard — Built with Django & Next.js
      </footer>
    </main>
  );
}
