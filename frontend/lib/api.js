import { getApiBase } from "./config";

/**
 * @param {string} path - e.g. /api/v1/recommendations
 * @param {RequestInit & { token?: string | null }} [options]
 */
export async function apiJson(path, options = {}) {
  const { token, headers: hdr, ...rest } = options;
  const headers = new Headers(hdr);
  if (!headers.has("Content-Type") && rest.body != null) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    ...rest,
    headers,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || "Invalid response" };
  }

  if (!res.ok) {
    const err = new Error(
      typeof data?.message === "string"
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(", ")
          : res.statusText || "Request failed"
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
