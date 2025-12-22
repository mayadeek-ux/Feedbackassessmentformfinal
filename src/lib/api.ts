// src/lib/api.ts
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "./supabase";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server`;

// Get JWT if logged in, otherwise return null (DO NOT use anon key as Bearer)
const getJwt = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

// Helper for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const jwt = await getJwt();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Supabase Edge Functions require apikey header for browser calls
    apikey: publicAnonKey,
    ...(options.headers as Record<string, string>),
  };

  // Only attach Authorization if we have a real JWT
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
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
