"use client";

export async function fetchClient(
  url: string,
  options: RequestInit = {}
) {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  /* avoid setting content-type for FormData */

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  /* ================= HANDLE UNAUTHORIZED ================= */

  if (response.status === 401) {

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      window.location.href = "/";
    }

    throw new Error("Session expired");
  }

  if (!response.ok) {

    const error = await response.json().catch(() => null);

    throw new Error(error?.message || "Request failed");
  }

  return response;
}