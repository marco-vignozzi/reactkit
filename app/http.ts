/**
 * HTTP client for a JSON API with Django-style session + CSRF protection.
 *
 * createApiClient() returns the single object through which an application
 * calls its backend: typed JSON in and out, the CSRF header on unsafe
 * methods, readable errors (ApiError) and a notification on 401.
 */

import { readCookie } from "./cookies";

/** HTTP methods the client sends. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Methods that change data: they carry the CSRF header. */
const UNSAFE_METHODS: ReadonlySet<HttpMethod> = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Error of an API call.
 *
 * Fields:
 *   status -> HTTP status; 0 when the server could not be reached.
 *   detail -> the backend's `detail` message ("" when the body has none,
 *             e.g. network error or non-JSON answer).
 *   errors -> per-field messages {field: [message, ...]} (422 / 409), or {}.
 *   body   -> the whole decoded body (impact, required, retry_at, ...), or null.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;
  readonly errors: Record<string, string[]>;
  readonly body: Record<string, unknown> | null;

  /**
   * @param status HTTP status (0 = network error).
   * @param body decoded JSON body, or null.
   */
  constructor(status: number, body: Record<string, unknown> | null) {
    const detail = typeof body?.detail === "string" ? body.detail : "";
    super(detail || `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.errors = isFieldErrors(body?.errors) ? body.errors : {};
    this.body = body;
  }

  /** Whether the server could not be reached at all. */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/**
 * Whether a value has the shape {field: string[]}.
 *
 * @param value any decoded JSON value.
 * @returns true for an object whose values are all string arrays.
 */
function isFieldErrors(value: unknown): value is Record<string, string[]> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((v) => Array.isArray(v) && v.every((m) => typeof m === "string"))
  );
}

/** Options of createApiClient. */
export interface ApiClientOptions {
  /** Prefix of every path, e.g. "/api". */
  baseUrl: string;
  /** Path (after baseUrl) that sets the CSRF cookie, e.g. "/auth/csrf". */
  csrfPath: string;
  /** Name of the CSRF cookie. Default "csrftoken". */
  csrfCookie?: string;
  /** Name of the CSRF request header. Default "X-CSRFToken". */
  csrfHeader?: string;
}

/** Listener called when a response is 401 (the session is gone). */
export type UnauthorizedListener = () => void;

/** The client returned by createApiClient. */
export interface ApiClient {
  /** Asks the server for the CSRF cookie; call once at start-up. */
  initCsrf(): Promise<void>;
  /**
   * Sends one request.
   *
   * @param method HTTP method.
   * @param path path after baseUrl, e.g. "/me".
   * @param body value sent as JSON (omitted -> no body).
   * @returns the decoded JSON, or undefined for 204 / empty bodies.
   * @throws ApiError for every non-2xx answer and for network errors.
   */
  request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T>;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  del<T>(path: string, body?: unknown): Promise<T>;
  /**
   * Registers a listener for 401 answers.
   *
   * @returns a function that removes the listener.
   */
  onUnauthorized(listener: UnauthorizedListener): () => void;
}

/**
 * Decodes a response body as JSON.
 *
 * @param response the fetch Response.
 * @returns the decoded value, or null for an empty or non-JSON body.
 */
async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Creates the API client of an application.
 *
 * @param options base URL and CSRF settings.
 * @returns the ApiClient.
 *
 * @example
 *   const api = createApiClient({ baseUrl: "/api", csrfPath: "/auth/csrf" });
 *   await api.initCsrf();
 *   const me = await api.get<User>("/me");
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const csrfCookie = options.csrfCookie ?? "csrftoken";
  const csrfHeader = options.csrfHeader ?? "X-CSRFToken";
  const listeners = new Set<UnauthorizedListener>();

  async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (UNSAFE_METHODS.has(method)) {
      const token = readCookie(csrfCookie);
      if (token !== null) headers[csrfHeader] = token;
    }
    let response: Response;
    try {
      response = await fetch(options.baseUrl + path, {
        method,
        headers,
        credentials: "same-origin",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, null);
    }
    const data = await readJson(response);
    if (!response.ok) {
      if (response.status === 401) listeners.forEach((listener) => listener());
      const errorBody = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
      throw new ApiError(response.status, errorBody);
    }
    return (data ?? undefined) as T;
  }

  return {
    async initCsrf() {
      await request<void>("GET", options.csrfPath);
    },
    request,
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    patch: (path, body) => request("PATCH", path, body),
    del: (path, body) => request("DELETE", path, body),
    onUnauthorized(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
