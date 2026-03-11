const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Refresh token function
async function refreshAccessToken() {
  try {
    const res = await fetch(`${BASE_URL}/api/event-admin/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // refreshToken cookie
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Refresh failed");

    localStorage.setItem("token", json.accessToken);
    return json.accessToken;
  } catch (err) {
    console.error("Refresh token failed:", err);

    // 🔥 FORCE LOGOUT WHEN REFRESH FAILS
    localStorage.removeItem("token");
    window.location.href = "/login";

    return null;
  }
}

/**
 * Global API helper
 * - Auto attaches accessToken
 * - Auto refreshes on 401 once
 * - Auto logout if refresh fails
 */
export async function api(endpoint: string, options: RequestInit = {}) {
  const publicEndpoints = ["/login", "/forgot-password", "/reset-password"];

  let token: string | null = null;

  // Protected route → requires token
  const isProtected = !publicEndpoints.some((path) =>
    endpoint.startsWith(path)
  );

  if (isProtected) {
    token = localStorage.getItem("token");

    // 🔥 No token available → logout immediately
    if (!token) {
      window.location.href = "/login";
      throw new Error("No token found. Redirecting to login.");
    }
  }

  const makeRequest = async () =>
    fetch(`${BASE_URL}/api/event-admin${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      ...options,
    });

  let res = await makeRequest();

  // 🔥 If token expired → try refresh ONCE
  if (res.status === 401 && isProtected) {
    token = await refreshAccessToken();
    if (token) {
      // retry API call with new token
      res = await makeRequest();
    } else {
      // refresh failed → already redirected in refreshAccessToken()
      throw new Error("Session expired. Redirecting to login.");
    }
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  // 🔥 If still unauthorized → force logout
  if (!res.ok && res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized. Redirecting to login.");
  }

  if (!res.ok) throw new Error(json?.message || "Request failed");

  return json;
}
