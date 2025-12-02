export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function doFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
}

// minimal: call refresh once if a request comes back 401 / expired
async function tryRefresh() {
  const r = await doFetch("/api/auth/refresh", { method: "POST" });
  return r.ok;
}

// shared handler with one retry
async function handle<T>(
  path: string,
  init: RequestInit | undefined,
  retried = false
): Promise<T> {
  const res = await doFetch(path, init);
  if (res.ok) return res.json() as Promise<T>;

  const text = await res.text(); // read once
  const expired =
    res.status === 401 ||
    text.includes("token_not_valid") ||
    text.includes("Token is expired");

  if (expired && !retried && (await tryRefresh())) {
    // retry once after successful refresh
    const again = await doFetch(path, init);
    if (again.ok) return again.json() as Promise<T>;
    const againText = await again.text();
    throw new Error(againText || `HTTP ${again.status}`);
  }

  throw new Error(text || `HTTP ${res.status}`);
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  return handle<T>(path, undefined);
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  const init: RequestInit = body
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    : { method: "POST" };
  return handle<T>(path, init);
}
