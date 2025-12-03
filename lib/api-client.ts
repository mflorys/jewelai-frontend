const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiGet(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`API GET ${path} failed with ${res.status}`);
  }
  return res.json();
}