/**
 * Thin HTTP adapter for when the backend is wired. Keeps callers decoupled from env + URL rules.
 */

const DEFAULT_TIMEOUT_MS = 30_000

/** Returns base URL without trailing slash, or "" if unset (relative requests to Next.js). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL
  if (typeof raw !== "string" || !raw.trim()) return ""
  return raw.trim().replace(/\/$/, "")
}

/** Build absolute path from optional base + path. */
export function resolveApiUrl(path: string): string {
  const base = getApiBaseUrl()
  if (!base) return path.startsWith("/") ? path : `/${path}`
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}

/** Fetch with timeout; throws on non-OK with best-effort message from body/text. */
export async function apiFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...rest } = init ?? {}
  const url = resolveApiUrl(path)

  const controller = new AbortController()
  const onAbortExternal = () => controller.abort(signal?.reason)
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason)
    else signal.addEventListener("abort", onAbortExternal, { once: true })
  }

  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...rest, signal: controller.signal })
    return res
  } finally {
    globalThis.clearTimeout(timer)
    if (signal)
      signal.removeEventListener("abort", onAbortExternal)
  }
}
