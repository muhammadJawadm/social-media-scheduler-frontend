// Simple API helper - with detailed debugging
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';

export async function apiCall(method: string, endpoint: string, data?: any) {
  const token = localStorage.getItem('token');

  // Clean the endpoint to ensure no duplicate slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${API_URL}${cleanEndpoint}`;

  // 🔍 Debugging output
  console.log("🛰️ API CALL STARTED");
  console.log("Full URL:", fullUrl);
  console.log("Method:", method);
  console.log("Token exists:", !!token);
  console.log("Request body:", data || "None");

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    // Try to parse JSON safely
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn("⚠️ API Warning:", result.message || "Request failed", response.status);
      return { error: true, message: result.message || `Request failed (${response.status})` };
    }

    console.log("✅ API Response Success:", result);
    return result;
  } catch (error: any) {
    console.error("❌ Network or Fetch Error:", error);
    return { error: true, message: "Network error: Unable to connect to server" };
  }
}
