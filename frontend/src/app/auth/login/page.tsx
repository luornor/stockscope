"use client";

export default function Login() {
  const login = () => {
    const nextUrl = window.location.origin + "/auth/success";
    window.location.href = `${
      process.env.NEXT_PUBLIC_API_BASE_URL
    }/api/auth/google/login?next=${encodeURIComponent(nextUrl)}`;
  };
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow p-6 text-center">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="text-sm text-gray-600 mt-2">
        Use your Google account to continue.
      </p>
      <button
        onClick={login}
        className="mt-6 w-full rounded-xl bg-black text-white py-2"
      >
        Sign in with Google
      </button>
    </div>
  );
}
