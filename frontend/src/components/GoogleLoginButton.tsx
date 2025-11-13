// src/components/GoogleLoginButton.tsx
"use client";

export default function GoogleLoginButton() {
  const startLogin = () => {
    const api = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const nextAbs = `${window.location.origin}/auth/success`; // or "/profile"
    window.location.href = `${api}/api/auth/google/login?next=${encodeURIComponent(nextAbs)}`;
  };

  return (
    <button
      onClick={startLogin}
      className="w-full rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
    >
      Sign in with Google
    </button>
  );
}
