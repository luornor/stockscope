"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export default function Success() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<{ email: string; username: string }>("/api/auth/me"),
  });

  if (isLoading) return <div className="text-center">Finishing sign-in…</div>;
  if (isError) return (
    <div className="text-center">
      Sign-in failed. <a className="text-blue-600" href="/auth/login">Try again</a>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6 text-center">
      <h1 className="text-xl font-semibold">Signed in ✅</h1>
      <p className="text-sm text-gray-600 mt-2">
        Welcome, <span className="font-medium">{data!.email}</span>.
      </p>
      <a className="inline-block mt-4 rounded-xl bg-black text-white px-4 py-2" href="/profile">
        Go to profile
      </a>
    </div>
  );
}
