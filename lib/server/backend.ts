import { getBackendBaseUrl } from "@/lib/server/env";

export class BackendError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type BackendRequestOptions = RequestInit & {
  token?: string | null;
};

export async function backendFetch(
  path: string,
  options: BackendRequestOptions = {},
) {
  const { token, headers, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${getBackendBaseUrl()}${normalizedPath}`, {
    ...rest,
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });
}

export async function backendJson<T>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<T> {
  const response = await backendFetch(path, options);

  if (!response.ok) {
    const { message, payload } = await readBackendError(response);
    throw new BackendError(message, response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readBackendError(response: Response) {
  try {
    const payload = (await response.json()) as
      | { message?: string | string[] }
      | undefined;

    if (Array.isArray(payload?.message)) {
      return { message: payload.message.join(", "), payload };
    }

    if (typeof payload?.message === "string") {
      return { message: payload.message, payload };
    }

    return {
      message: response.statusText || "Request failed",
      payload,
    };
  } catch {
    return {
      message: response.statusText || "Request failed",
      payload: undefined,
    };
  }
}
