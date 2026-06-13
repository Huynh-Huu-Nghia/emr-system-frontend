/**
 * Thin HTTP adapter for when the backend is wired. Keeps callers decoupled from env + URL rules.
 * Automatically attaches Authorization header from stored auth token.
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

/**
 * Get the stored auth token (client-side only).
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

/**
 * Merge custom headers with Authorization bearer token.
 */
function buildHeaders(customHeaders?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {}

  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => { headers[key] = value })
    } else if (Array.isArray(customHeaders)) {
      for (const [key, value] of customHeaders) {
        headers[key] = value
      }
    } else {
      Object.assign(headers, customHeaders)
    }
  }

  return headers
}

/**
 * Fetch with timeout + automatic Authorization header.
 * On 401 response: clears auth state and redirects to login.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...rest } = init ?? {}
  const cacheBuster = `_t=${Date.now()}`
  const urlWithCacheBuster = path.includes("?") 
    ? resolveApiUrl(`${path}&${cacheBuster}`) 
    : resolveApiUrl(`${path}?${cacheBuster}`)

  const url = urlWithCacheBuster

  const controller = new AbortController()
  const onAbortExternal = () => controller.abort(signal?.reason)
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason)
    else signal.addEventListener("abort", onAbortExternal, { once: true })
  }

  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...rest,
      headers: buildHeaders(rest.headers),
      signal: controller.signal,
    })

    // Auto-redirect to login on 401 Unauthorized
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }

    return res
  } finally {
    globalThis.clearTimeout(timer)
    if (signal)
      signal.removeEventListener("abort", onAbortExternal)
  }
}
