"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

type Me = { email: string; username: string };

export default function Profile() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/api/auth/me"),
    retry: false,
  });

  const logout = async () => {
    await apiPost("/api/auth/logout");
    router.push("/auth/login");
  };

  if (isLoading) return <div className="text-center text-sm text-gray-600">Loading…</div>;
  if (isError) return (
    <div className="text-center text-sm text-gray-600">
      Not signed in. <a className="text-blue-600" href="/auth/login">Sign in</a>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <div className="mt-4 text-sm space-y-1">
        <div><span className="text-gray-500">Email:</span> {data!.email}</div>
        <div><span className="text-gray-500">Username:</span> {data!.username}</div>
      </div>
      <button onClick={logout} className="mt-6 rounded-xl bg-black text-white px-4 py-2">Log out</button>
    </div>
  );
}
