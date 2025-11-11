"use client";
import { useEffect, useState } from "react";

export default function Success() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    // Just ping /me to ensure cookie works
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
      credentials: "include",
    })
      .then((r) => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow p-6 text-center">
      <h1 className="text-xl font-semibold">
        {ok ? "Signed in ✅" : "Finishing sign-in…"}
      </h1>
      <p className="text-sm text-gray-600 mt-2">
        You can now access your profile and personalized features.
      </p>
    </div>
  );
}
