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
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;

export async function backendFetch(
  path: string,
  options: BackendRequestOptions = {},
) {
  const { token, headers, timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...rest } =
    options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    return await fetch(`${getBackendBaseUrl()}${normalizedPath}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      cache: "no-store",
    });
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new BackendError("Backend request timed out.", 504);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
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
