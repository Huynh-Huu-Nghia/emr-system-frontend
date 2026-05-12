export type NormalizedAppError = {
  message: string
  /** HTTP status when known (e.g. from fetch response). */
  status?: number
  cause?: unknown
}

/** Map known HTTP statuses to Vietnamese copy (aligned with backend-style UX). */
function messageFromStatus(status: number, fallback?: string): string | undefined {
  switch (status) {
    case 400:
      return "Dữ liệu gửi không hợp lệ"
    case 401:
      return "Phiên đăng nhập đã hết hạn"
    case 403:
      return "Bạn không có quyền thực hiện thao tác này"
    case 404:
      return "Không tìm thấy tài nguyên"
    case 409:
      return "Dữ liệu đã tồn tại hoặc xung đột"
    case 422:
      return "Dữ liệu không thể xử lý"
    case 500:
      return "Lỗi máy chủ nội bộ"
    default:
      return fallback
  }
}

export async function normalizeResponseError(
  response: Response
): Promise<NormalizedAppError> {
  let parsedMessage: string | undefined

  try {
    const bodyText = await response.clone().text()
    if (bodyText) {
      try {
        const json = JSON.parse(bodyText) as { message?: string; error?: string }
        parsedMessage = json.message ?? json.error
      } catch {
        parsedMessage = bodyText.slice(0, 200)
      }
    }
  } catch {
    parsedMessage = undefined
  }

  const statusFallback =
    messageFromStatus(response.status) ?? response.statusText

  const trimmed = parsedMessage?.trim()
  const message =
    trimmed && trimmed.length > 0 ? trimmed : statusFallback || "Đã xảy ra lỗi"

  return {
    message,
    status: response.status,
    cause: response,
  }
}

/** Normalize any thrown/rejected value for UI/toast. */
export function normalizeUnknownError(error: unknown): NormalizedAppError {
  if (typeof error === "string") {
    return { message: error, cause: error }
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return { message: "Yêu cầu bị huỷ hoặc hết thời gian chờ", cause: error }
  }

  if (error instanceof Error) {
    return { message: error.message || "Đã xảy ra lỗi không xác định", cause: error }
  }

  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === "string" && msg.length > 0) {
      return { message: msg, cause: error }
    }
  }

  return {
    message: "Đã xảy ra lỗi không xác định",
    cause: error,
  }
}
