/**
 * Backend base URL (no trailing slash).
 * Server and client: set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3000).
 */
export function getApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3000"
  );
}
