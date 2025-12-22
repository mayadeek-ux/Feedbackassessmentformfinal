// src/lib/api.ts
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "./supabase";

/**
 * Pick ONE base style and be consistent.
 *
 * Recommended (standard Supabase style):
 *   https://<project-ref>.supabase.co/functions/v1/<function-name>
 *
 * Alternative (works too):
 *   https://<project-ref>.functions.supabase.co/<function-name>
 *
 * Your deployed function name is: make-server
 */
const API_BASE =
  // If you ever want to override from .env:
  // (import.meta.env.VITE_FUNCTIONS_BASE_URL as string) ??
  `https://${projectId}.supabase.co/functions/v1/make-server`;

// If you prefer the functions domain instead, swap to this:
// const API_BASE = `https://${projectId}.functions.supabase.co/make-server`;

// Get user JWT if logged in (DO NOT use anon key as Bearer)
const getJwt = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
};

type ApiErrorPayload =
  | { error?: string; message?: string; code?: string }
  | Record<string, any>;

/**
 * Helper for API calls
 */
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const jwt = await getJwt();

  // Merge headers safely
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("apikey", publicAnonKey);

  // Only attach Authorization if we have a real user JWT
  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  } else {
    // IMPORTANT: if your endpoint is protected, it will 401.
    // We'll throw a clean error below if that happens.
    headers.delete("Authorization");
  }

  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-OK responses with useful messages
  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    // Try JSON first, otherwise fallback to text
    const contentType = response.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) {
        payload = (await response.json()) as ApiErrorPayload;
      } else {
        const text = await response.text();
        payload = { error: text };
      }
    } catch {
      payload = { error: "Request failed" };
    }

    const msg =
      (payload && (payload.error || payload.message)) ||
      `API call failed: ${response.status} ${response.statusText}`;

    // A very common case in your project:
    // profile/events/etc called before login => 401
    if (response.status === 401 && !jwt) {
      throw new Error("Not signed in (missing user session token). Please sign in again.");
    }

    throw new Error(msg);
  }

  // Some endpoints might return empty body (rare), so guard json parsing
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// ==================== EVENT API ====================
export const eventAPI = {
  create: (eventData: {
    name: string;
    description?: string;
    status?: "upcoming" | "active" | "completed";
    start_date: string;
    end_date: string;
  }) =>
    apiCall("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),

  getAll: () => apiCall("/events"),

  getById: (id: string) => apiCall(`/events/${id}`),

  update: (id: string, updates: any) =>
    apiCall(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  delete: (id: string) =>
    apiCall(`/events/${id}`, {
      method: "DELETE",
    }),
};

// ==================== CANDIDATE API ====================
export const candidateAPI = {
  create: (candidateData: {
    event_id: string;
    name: string;
    email?: string;
    group_id?: string;
    department?: string;
    position?: string;
  }) =>
    apiCall("/candidates", {
      method: "POST",
      body: JSON.stringify(candidateData),
    }),

  getByEvent: (eventId: string) => apiCall(`/events/${eventId}/candidates`),

  update: (id: string, updates: any) =>
    apiCall(`/candidates/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  delete: (id: string) =>
    apiCall(`/candidates/${id}`, {
      method: "DELETE",
    }),
};

// ==================== ASSIGNMENT API ====================
export const assignmentAPI = {
  create: (assignmentData: {
    event_id: string;
    assessor_id: string;
    candidate_id?: string;
    group_id?: string;
    type: "individual" | "group";
    case_study: string;
    due_date?: string;
  }) =>
    apiCall("/assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    }),

  getByAssessor: (eventId: string, assessorId: string) =>
    apiCall(`/events/${eventId}/assessor/${assessorId}/assignments`),

  getByEvent: (eventId: string) => apiCall(`/events/${eventId}/assignments`),

  update: (id: string, updates: any) =>
    apiCall(`/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  delete: (id: string) =>
    apiCall(`/assignments/${id}`, {
      method: "DELETE",
    }),
};

// ==================== ASSESSMENT API ====================
export const assessmentAPI = {
  save: (assessmentData: {
    assignment_id: string;
    scores: Record<string, boolean[]>;
    notes?: string;
    total_score: number;
    performance_band: string;
    submitted?: boolean;
  }) =>
    apiCall("/assessments", {
      method: "POST",
      body: JSON.stringify(assessmentData),
    }),

  getByAssignment: (assignmentId: string) => apiCall(`/assessments/${assignmentId}`),
};

// ==================== GROUP API ====================
export const groupAPI = {
  create: (groupData: {
    event_id: string;
    name: string;
    description?: string;
    member_ids?: string[];
    case_study?: string;
  }) =>
    apiCall("/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    }),

  getByEvent: (eventId: string) => apiCall(`/events/${eventId}/groups`),

  update: (id: string, updates: any) =>
    apiCall(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  delete: (id: string) =>
    apiCall(`/groups/${id}`, {
      method: "DELETE",
    }),
};

// ==================== CASE STUDY API ====================
export const caseStudyAPI = {
  create: (caseStudyData: { name: string; description?: string }) =>
    apiCall("/casestudies", {
      method: "POST",
      body: JSON.stringify(caseStudyData),
    }),

  getAll: () => apiCall("/casestudies"),

  update: (id: string, updates: any) =>
    apiCall(`/casestudies/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  delete: (id: string) =>
    apiCall(`/casestudies/${id}`, {
      method: "DELETE",
    }),
};

// ==================== INIT API ====================
export const initAPI = {
  initDemo: () =>
    apiCall("/init-demo", {
      method: "POST",
    }),
};

// ==================== USER API ====================
export const userAPI = {
  getProfile: () => apiCall("/auth/profile"),
};
