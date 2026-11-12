interface ApiErrorBody {
  message: string
  code?: string
  details?: unknown
}

declare class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;
}
