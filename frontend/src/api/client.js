// Keep every HTTP request in this file so API changes are easy to find.
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
const TOKEN_KEY = "access_token";

export class ApiError extends Error {
  constructor(message, status = 0, path = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

function readableDetail(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join(".") : "";
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .filter(Boolean)
      .join("; ");
  }
  return "";
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Could not connect to the API at ${API_BASE_URL}. Check that the backend is running.`,
      0,
      path,
    );
  }

  const responseText = await response.text();
  let data = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { detail: responseText };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth && token) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("auth:expired"));
    }
    const message =
      readableDetail(data?.detail) ||
      readableDetail(data?.message) ||
      `The request failed (${response.status}).`;
    throw new ApiError(message, response.status, path);
  }

  return data;
}

export function friendlyErrorMessage(error) {
  const detail = error?.message;
  switch (error?.status) {
    case 401:
      return error.path === "/auth/login"
        ? `Sign-in failed${detail ? `: ${detail}` : ". Check your username and password."}`
        : "Your sign-in may have expired. Please sign in again.";
    case 404:
      return `We couldn't find that item${detail ? `: ${detail}` : "."}`;
    case 409:
      return `This request conflicts with the current event or registration${detail ? `: ${detail}` : "."}`;
    case 422:
      return `Please check the information you entered${detail ? `: ${detail}` : "."}`;
    default:
      return detail || "Something went wrong. Please try again.";
  }
}

export const api = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
    });
  },

  listEvents({ skip = 0, limit = 10, title = "", date = "" } = {}) {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (title.trim()) params.set("title", title.trim());
    if (date) params.set("date", date);
    return request(`/events?${params.toString()}`);
  },

  getEvent(id) {
    return request(`/events/${encodeURIComponent(id)}`);
  },

  createEvent(event) {
    return request("/events", { method: "POST", body: event });
  },

  updateEvent(id, event) {
    return request(`/events/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: event,
    });
  },

  deleteEvent(id) {
    return request(`/events/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  listRegistrations(eventId) {
    return request(`/events/${encodeURIComponent(eventId)}/registrations`);
  },

  registerForEvent(eventId, registration) {
    return request(`/events/${encodeURIComponent(eventId)}/registrations`, {
      method: "POST",
      body: registration,
    });
  },

  cancelRegistration(registrationId) {
    return request(`/registrations/${encodeURIComponent(registrationId)}`, {
      method: "DELETE",
    });
  },
};
