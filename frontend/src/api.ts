export type ApiUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  role: string;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: ApiUser;
};

export type RegistrationPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  gender: string;
};

export type ChatResponse = {
  user_id: string;
  message: string;
  penny: string;
};

export type VaultSetupResponse = {
  user_id: string;
  paypal_response: {
    payer_vault_setup_approval_link: string;
    vault_setup_token_id: string;
  };
};

export type VaultTokenResponse = {
  user_id: string;
  decrypted_paypal_token: string;
};

export type ApiOrderItem = {
  id?: string;
  product_description: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
};

export type SSEEventData = {
  user_id?: string;
  order_id?: string;
  message?: string;
  penny?: string;
  content?: string;
  text?: string;
  setup_token?: string;
  vault_setup_token_id?: string;
  approval_token_id?: string;
  event?: string;
  token?: string;
  [key: string]: unknown;
};

export type ApiOrder = {
  id: string;
  user_id: string;
  tag: string;
  paid_amount: number;
  paypal_order_id: string;
  is_autonomous: boolean;
  created_at: string;
  order_items: ApiOrderItem[];
};

export type ApiMessage = {
  id: string;
  chat_room_id: string;
  created_at: string;
  message: string;
  sender: string;
};

const baseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

function errorMessage(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "detail" in value &&
    Array.isArray(value.detail)
  ) {
    return value.detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String(item.msg)
          : "Invalid value",
      )
      .join(". ");
  }
  if (
    value &&
    typeof value === "object" &&
    "detail" in value &&
    typeof value.detail === "string"
  ) {
    return value.detail;
  }
  return "Penny couldn’t complete that request. Please try again.";
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  const activeToken =
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("penny_access_token") ||
        sessionStorage.getItem("penny_access_token") ||
        undefined
      : undefined);
  if (activeToken) headers.set("Authorization", `Bearer ${activeToken}`);
  if (
    init.body &&
    !(init.body instanceof URLSearchParams) &&
    !(init.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  } catch {
    throw new Error("Penny can’t reach the server. Check your connection.");
  }

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(errorMessage(body)) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return body as T;
}

export const api = {
  getBaseUrl() {
    return baseUrl;
  },

  register(payload: RegistrationPayload) {
    return request<ApiUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createUser(payload: RegistrationPayload) {
    return request<ApiUser>("/users/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(email: string, password: string) {
    const body = new URLSearchParams({
      grant_type: "password",
      username: email,
      password,
      scope: "",
    });
    return request<LoginResponse>("/auth/login", { method: "POST", body });
  },

  chat(query: string, token: string, file?: File | null) {
    const body = new FormData();
    body.append("query", query);
    if (file) {
      body.append("file", file);
    }
    return request<ChatResponse | string>(
      "/agent/chat",
      {
        method: "POST",
        body,
      },
      token,
    );
  },

  createVaultSetupToken(token: string) {
    return request<VaultSetupResponse>(
      "/vault/setup-token",
      { method: "POST" },
      token,
    );
  },

  exchangeVaultSetupToken(setupToken: string, token: string) {
    return request<{ id?: string; user_id?: string; message?: string }>(
      "/vault/setup-token-exchange",
      {
        method: "POST",
        body: JSON.stringify({ setup_token: setupToken }),
      },
      token,
    );
  },

  async getVault(token: string): Promise<VaultTokenResponse | null> {
    try {
      return await request<VaultTokenResponse>("/vault/own", {}, token);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        err.status === 404
      ) {
        return null;
      }
      return null;
    }
  },

  deleteVault(token: string) {
    return request<{ message: string }>(
      "/vault/own",
      { method: "DELETE" },
      token,
    );
  },

  async getOrders(token: string): Promise<ApiOrder[]> {
    const data = await request<any>("/orders/own", {}, token);
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.results)) return data.results;
    }
    return [];
  },

  async getOrder(orderId: string, token: string): Promise<ApiOrder> {
    const data = await request<any>(
      `/orders/own/${encodeURIComponent(orderId)}`,
      {},
      token,
    );
    if (data && typeof data === "object" && data.order) {
      return {
        ...data.order,
        order_items: data.order_items || data.order.order_items || [],
      };
    }
    return data as ApiOrder;
  },

  async getMessages(token: string): Promise<ApiMessage[]> {
    const data = await request<ApiMessage[]>("/messages/own", {}, token);
    if (Array.isArray(data)) return data;
    return [];
  },

  deleteMessages(token: string): Promise<string> {
    return request<string>("/messages/own", { method: "DELETE" }, token);
  },

  subscribeSSE(
    onMessage: (data: SSEEventData) => void,
    onError?: (err: Event) => void,
  ): () => void {
    const eventSource = new EventSource(`${baseUrl}/agent/sse-stream`);

    eventSource.onmessage = (event) => {
      if (!event.data) return;
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        const raw = String(event.data).trim();
        if (raw && !raw.startsWith(":")) {
          onMessage({ penny: raw });
        }
      }
    };

    if (onError) {
      eventSource.onerror = onError;
    }

    return () => {
      eventSource.close();
    };
  },
};
