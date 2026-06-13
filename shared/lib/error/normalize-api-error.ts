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

function translateDatabaseError(message: string): string {
  if (!message) return message

  const msg = message.toLowerCase()

  if (
    msg.includes("patients_phone_key") ||
    msg.includes("patients.phone") ||
    (msg.includes("duplicate key") && msg.includes("(phone)="))
  ) {
    return "Số điện thoại này đã được sử dụng cho một bệnh nhân khác. Vui lòng kiểm tra lại."
  }
  if (
    msg.includes("patients_insurance_code_key") ||
    msg.includes("patients.insurance_code") ||
    (msg.includes("duplicate key") && msg.includes("(insurance_code)="))
  ) {
    return "Mã bảo hiểm y tế này đã tồn tại trên hệ thống."
  }
  if (
    msg.includes("users_username_key") ||
    msg.includes("users.username") ||
    (msg.includes("duplicate key") && msg.includes("(username)="))
  ) {
    return "Tên đăng nhập này đã tồn tại trên hệ thống. Vui lòng chọn tên khác."
  }
  if (
    msg.includes("doctors_phone_key") ||
    msg.includes("doctors.phone") ||
    (msg.includes("duplicate key") && msg.includes("doctors") && msg.includes("(phone)="))
  ) {
    return "Số điện thoại này đã được sử dụng cho một bác sĩ khác."
  }
  if (
    msg.includes("doctors_email_key") ||
    msg.includes("doctors.email") ||
    (msg.includes("duplicate key") && msg.includes("doctors") && msg.includes("(email)="))
  ) {
    return "Địa chỉ email này đã được sử dụng cho một bác sĩ khác."
  }
  if (
    msg.includes("receptionists_phone_key") ||
    msg.includes("receptionists.phone") ||
    (msg.includes("duplicate key") && msg.includes("receptionists") && msg.includes("(phone)="))
  ) {
    return "Số điện thoại này đã được sử dụng cho một nhân viên lễ tân khác."
  }
  if (
    msg.includes("receptionists_email_key") ||
    msg.includes("receptionists.email") ||
    (msg.includes("duplicate key") && msg.includes("receptionists") && msg.includes("(email)="))
  ) {
    return "Địa chỉ email này đã được sử dụng cho một nhân viên lễ tân khác."
  }
  if (
    msg.includes("duplicate key value violates unique constraint") ||
    msg.includes("unique constraint")
  ) {
    return "Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin nhập vào."
  }

  return message
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
  const rawMessage =
    trimmed && trimmed.length > 0 ? trimmed : statusFallback || "Đã xảy ra lỗi"
  const message = translateDatabaseError(rawMessage)

  return {
    message,
    status: response.status,
    cause: response,
  }
}

/** Normalize any thrown/rejected value for UI/toast. */
export function normalizeUnknownError(error: unknown): NormalizedAppError {
  let message = "Đã xảy ra lỗi không xác định"

  if (typeof error === "string") {
    message = error
  } else if (error instanceof DOMException && error.name === "AbortError") {
    message = "Yêu cầu bị huỷ hoặc hết thời gian chờ"
  } else if (error instanceof Error) {
    message = error.message || "Đã xảy ra lỗi không xác định"
  } else if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === "string" && msg.length > 0) {
      message = msg
    }
  }

  message = translateDatabaseError(message)

  return {
    message,
    cause: error,
  }
}
