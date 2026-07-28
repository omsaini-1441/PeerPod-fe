import { API_BASE_URL } from "./env";

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
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
