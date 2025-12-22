// src/lib/api.ts
import { supabase } from "./supabase";

/**
 * Wrapper around Supabase Edge Function "make-server"
 * Uses supabase.functions.invoke so:
 * - apikey is sent automatically
 * - Authorization is sent automatically if user is logged in
 * - no manual fetch, no CORS headaches
 */
const invoke = async <T = any>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
  } = {}
): Promise<T> => {
  const method = opts.method ?? "GET";

  // IMPORTANT: "path" here is for Hono routes inside the function
  // We pass it via the invoke options.
  const { data, error } = await supabase.functions.invoke("make-server", {
    method,
    path,
    body: opts.body,
  } as any);

  if (error) {
    // Supabase returns a FunctionsHttpError sometimes
    throw new Error(error.message || "Edge function request failed");
  }

  return data as T;
};

// ==================== EVENT API ====================
export const eventAPI = {
  create: (eventData: {
    name: string;
    description?: string;
    status?: "upcoming" | "active" | "completed";
    start_date: string;
    end_date: string;
  }) => invoke("/events", { method: "POST", body: eventData }),

  getAll: () => invoke("/events"),

  getById: (id: string) => invoke(`/events/${id}`),

  update: (id: string, updates: any) =>
    invoke(`/events/${id}`, { method: "PUT", body: updates }),

  delete: (id: string) => invoke(`/events/${id}`, { method: "DELETE" }),
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
  }) => invoke("/candidates", { method: "POST", body: candidateData }),

  getByEvent: (eventId: string) => invoke(`/events/${eventId}/candidates`),

  update: (id: string, updates: any) =>
    invoke(`/candidates/${id}`, { method: "PUT", body: updates }),

  delete: (id: string) => invoke(`/candidates/${id}`, { method: "DELETE" }),
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
  }) => invoke("/assignments", { method: "POST", body: assignmentData }),

  getByAssessor: (eventId: string, assessorId: string) =>
    invoke(`/events/${eventId}/assessor/${assessorId}/assignments`),

  getByEvent: (eventId: string) => invoke(`/events/${eventId}/assignments`),

  update: (id: string, updates: any) =>
    invoke(`/assignments/${id}`, { method: "PUT", body: updates }),

  delete: (id: string) => invoke(`/assignments/${id}`, { method: "DELETE" }),
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
  }) => invoke("/assessments", { method: "POST", body: assessmentData }),

  getByAssignment: (assignmentId: string) =>
    invoke(`/assessments/${assignmentId}`),
};

// ==================== GROUP API ====================
export const groupAPI = {
  create: (groupData: {
    event_id: string;
    name: string;
    description?: string;
    member_ids?: string[];
    case_study?: string;
  }) => invoke("/groups", { method: "POST", body: groupData }),

  getByEvent: (eventId: string) => invoke(`/events/${eventId}/groups`),

  update: (id: string, updates: any) =>
    invoke(`/groups/${id}`, { method: "PUT", body: updates }),

  delete: (id: string) => invoke(`/groups/${id}`, { method: "DELETE" }),
};

// ==================== CASE STUDY API ====================
export const caseStudyAPI = {
  create: (caseStudyData: { name: string; description?: string }) =>
    invoke("/casestudies", { method: "POST", body: caseStudyData }),

  getAll: () => invoke("/casestudies"),

  update: (id: string, updates: any) =>
    invoke(`/casestudies/${id}`, { method: "PUT", body: updates }),

  delete: (id: string) => invoke(`/casestudies/${id}`, { method: "DELETE" }),
};

// ==================== INIT API ====================
export const initAPI = {
  initDemo: () => invoke("/init-demo", { method: "POST" }),
};

// ==================== USER API ====================
export const userAPI = {
  getProfile: () => invoke("/auth/profile"),
};
