export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function get(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function post(path: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
