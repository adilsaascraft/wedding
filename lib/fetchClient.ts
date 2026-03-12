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

      const token = localStorage.getItem("accessToken");

      /* logout ONLY if token does not exist */

      if (!token) {
        localStorage.removeItem("user");
        window.location.href = "/";
      }

    }

    throw new Error("Unauthorized");
  }

  if (!response.ok) {

    const error = await response.json().catch(() => null);

    throw new Error(error?.message || "Request failed");
  }

  return response;
}