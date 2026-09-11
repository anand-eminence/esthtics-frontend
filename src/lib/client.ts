"use client";

import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./config";

/**
 * Browser-side axios instance. It talks to the admin API directly, and
 * `withCredentials` sends the httpOnly session cookie the API set at login —
 * the token itself is never readable from JavaScript.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export type ApiError = {
  message: string;
  status: number;
  fieldErrors?: Record<string, string>;
};

type ErrorBody = {
  error?: string;
  fieldErrors?: Record<string, string>;
  details?: { fieldErrors?: Record<string, string> };
};

/** Turns any axios failure into the same shape, so forms can rely on it. */
export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<ErrorBody>;
    const body = axiosError.response?.data;
    const status = axiosError.response?.status ?? 0;

    return {
      status,
      message:
        body?.error ||
        (status === 0
          ? "Could not reach the admin API"
          : `Request failed (${status})`),
      fieldErrors: body?.fieldErrors || body?.details?.fieldErrors,
    };
  }
  return { message: "Something went wrong", status: 0 };
}

// Every rejection leaves the instance already normalised.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const { data } = await api.request<T>({ url: path, method, data: body });
  return data;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const { data } = await api.get<T>(path);
  return data;
}
