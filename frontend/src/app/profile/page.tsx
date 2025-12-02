"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Mail,
  User2,
  ShieldCheck,
  KeyRound,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";

type Me = { email: string; username: string };

export default function Profile() {
  const router = useRouter();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/api/auth/me"),
    retry: false,
  });

  const logout = async () => {
    await apiPost("/api/auth/logout");
    router.push("/auth/login");
  };

    const deleteAccount = async () => {
    setDeleting(true);
    try {
      await fetch("/api/auth/delete", {
        method: "DELETE",
        credentials: "include",
      });

      router.push("/auth/login");
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-slate-950">
        <div className="w-full max-w-lg mx-auto rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-white/10 rounded"></div>
            <div className="h-4 w-64 bg-white/10 rounded"></div>
            <div className="h-4 w-52 bg-white/10 rounded"></div>
            <div className="h-10 w-32 bg-white/10 rounded mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-slate-950 px-4">
        <div className="w-full max-w-lg mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="text-slate-300 text-sm">Not signed in.</div>
          <a
            href="/auth/login"
            className="mt-3 inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-cyan-200 hover:bg-cyan-500/20"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const initials = (
    data.username?.trim()?.[0] ||
    data.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();



  return (
    <div className="min-h-[80vh] bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(34,211,238,0.15),transparent),radial-gradient(1000px_600px_at_-10%_0%,rgba(168,85,247,0.10),transparent)] bg-slate-950 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header Card */}
         {
    showConfirm && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
          <h2 className="text-slate-100 text-lg font-semibold">
            Delete Account?
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            This action is permanent and cannot be undone.
          </p>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>

            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-sm text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    )
  }
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-white text-xl font-semibold shadow-lg">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-100 text-lg font-semibold tracking-tight">
                Account
              </div>
              <div className="text-slate-400 text-sm truncate">
                Manage your Stock-Scope profile and security
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <User2 className="size-4 text-cyan-300" />
              <div className="font-medium text-slate-100">Profile</div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-slate-400" />
                <div className="text-sm">
                  <div className="text-slate-400">Email</div>
                  <div className="text-slate-100">{data.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User2 className="size-4 text-slate-400" />
                <div className="text-sm">
                  <div className="text-slate-400">Username</div>
                  <div className="text-slate-100">{data.username}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-300" />
                <div className="font-medium text-slate-100">Security</div>
              </div>
              <div className="p-5 space-y-3">
                <button
                  className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                  disabled
                  title="Managed by Google Sign-In"
                >
                  <KeyRound className="inline size-4 mr-2 text-slate-400" />
                  Password (managed by Google)
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <LinkIcon className="size-4 text-fuchsia-300" />
                <div className="font-medium text-slate-100">
                  Connected Accounts
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-sm flex-1 min-w-0">
                    <div className="text-slate-100">Google</div>
                    <div className="text-slate-500 text-xs truncate">
                      Signed in with {data.email}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 ml-3 rounded-full border border-emerald-400/30 text-emerald-300 bg-emerald-500/10 shrink-0 whitespace-nowrap self-center">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone (optional) */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div className="text-slate-200 font-medium">Danger Zone</div>
          <div className="text-slate-400 text-sm mt-1">
            Delete account and all associated data. This action cannot be
            undone.
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-300 hover:bg-rose-500/20"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
