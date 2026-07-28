export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
};

/**
 * Same-origin BFF client. Auth is carried by the httpOnly session cookie —
 * never attach bearer tokens from the browser.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const { headers, ...rest } = options;

  const response = await fetch(`/api/backend${normalizedPath}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("peerpod:unauthorized"));
    }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function authRequest<T>(
  path: "/api/auth/login" | "/api/auth/register" | "/api/auth/logout" | "/api/auth/session" | "/api/auth/socket-token",
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function getErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as
      | { message?: string | string[] }
      | undefined;

    if (Array.isArray(payload?.message)) {
      return payload.message.join(", ");
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }
  } catch {
    return response.statusText || "Request failed";
  }

  return response.statusText || "Request failed";
}
