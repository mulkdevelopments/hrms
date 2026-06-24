import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { resolveApiBaseUrl } from "../lib/api-config";

const TOKEN_KEY = "hrms_token";

const isWeb = Platform.OS === "web";

async function storageGet(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string): Promise<void> {
  if (isWeb) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function resolveBaseUrl(): string {
  return resolveApiBaseUrl();
}

function apiBase(): string {
  return resolveApiBaseUrl();
}

export const API_BASE_URL = resolveBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  cachedToken = await storageGet(TOKEN_KEY);
  return cachedToken;
}

export async function setToken(token: string | null): Promise<void> {
  cachedToken = token;
  if (token) {
    await storageSet(TOKEN_KEY, token);
  } else {
    await storageDelete(TOKEN_KEY);
  }
}

export interface ApiError extends Error {
  status?: number;
  payload?: unknown;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Is the backend running?");
    }
    throw new Error(error instanceof Error ? error.message : "Network request failed");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    const message =
      (payload as { message?: string } | null)?.message ??
      (Array.isArray((payload as { issues?: { message?: string }[] } | null)?.issues)
        ? (payload as { issues: { message?: string }[] }).issues[0]?.message
        : null) ??
      `Request failed (${response.status})`;
    const error: ApiError = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function parseContentDispositionFilename(header: string | null, fallback: string) {
  if (!header) return fallback;
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? fallback;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      const base64 = result.includes(",") ? result.slice(result.indexOf(",") + 1) : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(blob);
  });
}

export async function apiDownload(path: string, fallbackFileName: string): Promise<string> {
  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${apiBase()}${path}`, { headers });
  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      const payload = await response.json();
      message = (payload as { message?: string }).message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const fileName = parseContentDispositionFilename(response.headers.get("Content-Disposition"), fallbackFileName);

  if (isWeb) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return fileName;
  }

  const base64 = await blobToBase64(blob);
  const uri = `${FileSystem.cacheDirectory ?? ""}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: response.headers.get("Content-Type") ?? undefined });
  }
  return fileName;
}

export async function apiImportExcel(path: string, fileName: string, dataBase64: string, extra?: Record<string, unknown>) {
  return api(path, {
    method: "POST",
    body: JSON.stringify({ fileName, dataBase64, ...extra }),
  });
}
