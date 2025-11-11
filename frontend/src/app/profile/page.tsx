"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(setUser)
      .catch((e) => setErr("Not signed in"));
  }, []);

  if (err)
    return (
      <div className="text-center text-sm text-gray-600">
        {err}. Go to{" "}
        <a className="text-blue-600" href="/auth/login">
          /auth/login
        </a>
      </div>
    );
  if (!user)
    return <div className="text-center text-sm text-gray-600">Loading…</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <div className="mt-4 text-sm">
        <div>
          <span className="text-gray-500">Email:</span> {user.email}
        </div>
        <div>
          <span className="text-gray-500">Username:</span> {user.username}
        </div>
      </div>
    </div>
  );
}
