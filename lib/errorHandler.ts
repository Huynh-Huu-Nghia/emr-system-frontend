/**
 * Global Error Handler Utility
 *
 * Centralizes error handling logic across the application.
 * Provides consistent error messages and logging for better debugging.
 * Supports different error types: API errors, validation errors, network errors.
 */

/**
 * Error types for categorization
 */
export enum ErrorType {
  API = "API",
  VALIDATION = "VALIDATION",
  NETWORK = "NETWORK",
  UNKNOWN = "UNKNOWN",
}

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  type: ErrorType
  message: string
  details?: unknown
  statusCode?: number
}

type AxiosLikeError = {
  response?: {
    status: number
    data?: { message?: string }
  }
  request?: unknown
  message?: string
}

function getAxiosLike(error: unknown): AxiosLikeError | null {
  if (typeof error !== "object" || error === null) return null
  return error as AxiosLikeError
}

/**
 * Global error handler class
 * Provides methods to handle different types of errors consistently
 */
export class ErrorHandler {
  /**
   * Handles API-related errors
   */
  static handleApiError(error: unknown): ErrorResponse {
    console.error("API Error:", error)

    const ax = getAxiosLike(error)

    if (ax?.response) {
      const status = ax.response.status
      const message = ax.response.data?.message ?? "API request failed"

      return {
        type: ErrorType.API,
        message: this.getApiErrorMessage(status, message),
        statusCode: status,
        details: ax.response.data,
      }
    }

    if (ax?.request) {
      return {
        type: ErrorType.NETWORK,
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
        details: ax.request,
      }
    }

    const msg =
      error instanceof Error ? error.message : ax?.message
    return {
      type: ErrorType.UNKNOWN,
      message: msg || "Đã xảy ra lỗi không xác định",
      details: error,
    }
  }

  /**
   * Handles validation errors
   */
  static handleValidationError(error: unknown): ErrorResponse {
    console.warn("Validation Error:", error)

    const ax = getAxiosLike(error)

    const msg =
      error instanceof Error
        ? error.message
        : typeof ax?.message === "string"
          ? ax.message
          : "Dữ liệu không hợp lệ"

    return {
      type: ErrorType.VALIDATION,
      message: msg,
      details: error,
    }
  }

  /**
   * Gets user-friendly API error messages based on status code
   */
  private static getApiErrorMessage(
    status: number,
    defaultMessage: string
  ): string {
    switch (status) {
      case 400:
        return "Dữ liệu gửi không hợp lệ"
      case 401:
        return "Phiên đăng nhập đã hết hạn"
      case 403:
        return "Bạn không có quyền thực hiện thao tác này"
      case 404:
        return "Không tìm thấy tài nguyên yêu cầu"
      case 409:
        return "Dữ liệu đã tồn tại hoặc xung đột"
      case 422:
        return "Dữ liệu không thể xử lý"
      case 500:
        return "Lỗi máy chủ nội bộ"
      default:
        return defaultMessage || "Đã xảy ra lỗi"
    }
  }

  /**
   * Shows error toast with appropriate message
   */
  static showErrorToast(error: ErrorResponse): void {
    void import("sonner").then(({ toast }) => {
      toast.error(error.message)
    })
  }

  /**
   * Comprehensive error handler that processes and displays errors
   */
  static handle(error: unknown, context?: string): void {
    const errorResponse = this.handleApiError(error)

    if (context) {
      console.error(`Error in ${context}:`, errorResponse)
    }

    this.showErrorToast(errorResponse)
  }
}

/**
 * Hook for using error handler in React components
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    ErrorHandler.handle(error, context)
  }

  const handleApiError = (error: unknown) => ErrorHandler.handleApiError(error)
  const handleValidationError = (error: unknown) =>
    ErrorHandler.handleValidationError(error)

  return {
    handleError,
    handleApiError,
    handleValidationError,
  }
}
