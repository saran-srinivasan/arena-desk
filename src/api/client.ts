/**
 * Base HTTP client wrapping fetch() for API calls.
 * All requests go to /api (proxied by Vite to the backend server).
 */

const BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  conflicts?: unknown[];
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public conflicts?: unknown[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const body: ApiResponse<T> = await response.json();

  if (!response.ok || !body.success) {
    throw new ApiError(
      response.status,
      body.error || `Request failed with status ${response.status}`,
      (body as any).code,
      (body as any).conflicts,
    );
  }

  return body.data as T;
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<T>(response);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export { ApiError };
