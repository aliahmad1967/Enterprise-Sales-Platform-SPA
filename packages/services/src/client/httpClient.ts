import axios, { AxiosError, type AxiosInstance } from "axios";

const API_BASE =
  (import.meta as { env?: Record<string, string> } | undefined)?.env?.["VITE_API_URL"] ??
  "";

interface TokenPair {
  access: string;
  refresh: string;
}

const TOKEN_KEY = "esp.auth.tokens";
const REFRESH_KEY = "esp.auth.refresh";

function readTokens(): TokenPair | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as TokenPair) : null;
  } catch {
    return null;
  }
}

function writeTokens(tokens: TokenPair | null): void {
  if (tokens) localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(TOKEN_KEY);
}

/** Axios client with JWT + automatic refresh-token rotation. */
export const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const tokens = readTokens();
  if (tokens?.access) config.headers.Authorization = `Bearer ${tokens.access}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const tokens = readTokens();
  if (!tokens?.refresh) throw new Error("No refresh token");
  const res = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${API_BASE}/api/v1/auth/refresh`,
    { refreshToken: tokens.refresh },
  );
  writeTokens({ access: res.data.accessToken, refresh: res.data.refreshToken });
  return res.data.accessToken;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        refreshPromise ??= doRefresh().finally(() => {
          refreshPromise = null;
        });
        const access = await refreshPromise;
        original.headers.Authorization = `Bearer ${access}`;
        return http(original);
      } catch {
        writeTokens(null);
        window.dispatchEvent(new Event("esp:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export function setAuthTokens(tokens: TokenPair | null): void {
  writeTokens(tokens);
}

export function clearAuth(): void {
  writeTokens(null);
}

/** REST endpoint paths (contract with the ASP.NET Core API). */
export const endpoints = {
  auth: { login: "/api/v1/auth/login", refresh: "/api/v1/auth/refresh", me: "/api/v1/auth/me" },
  customers: "/api/v1/customers",
  contacts: "/api/v1/contacts",
  leads: "/api/v1/leads",
  activities: "/api/v1/activities",
  products: "/api/v1/products",
  warehouses: "/api/v1/warehouses",
  stock: { items: "/api/v1/stock/items", moves: "/api/v1/stock/moves" },
  quotations: "/api/v1/quotations",
  orders: "/api/v1/orders",
  invoices: "/api/v1/invoices",
  payments: "/api/v1/payments",
  creditNotes: "/api/v1/credit-notes",
  suppliers: "/api/v1/suppliers",
  purchaseOrders: "/api/v1/purchase-orders",
  bills: "/api/v1/bills",
  journal: "/api/v1/accounting/journal",
  users: "/api/v1/users",
  roles: "/api/v1/roles",
  branches: "/api/v1/branches",
  reports: "/api/v1/reports",
  dashboard: "/api/v1/dashboard",
  notifications: "/api/v1/notifications",
  audit: "/api/v1/audit",
  workflow: "/api/v1/workflows",
} as const;
