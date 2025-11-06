import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from './supabase';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server`;

// Helper to get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || publicAnonKey;
};

// Helper for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
};

// ==================== EVENT API ====================

export const eventAPI = {
  create: async (eventData: {
    name: string;
    description?: string;
    status?: 'upcoming' | 'active' | 'completed';
    start_date: string;
    end_date: string;
  }) => {
    return apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  getAll: async () => {
    return apiCall('/events');
  },

  getById: async (id: string) => {
    return apiCall(`/events/${id}`);
  },

  update: async (id: string, updates: any) => {
    return apiCall(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CANDIDATE API ====================

export const candidateAPI = {
  create: async (candidateData: {
    event_id: string;
    name: string;
    email?: string;
    group_id?: string;
    department?: string;
    position?: string;
  }) => {
    return apiCall('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    });
  },

  getByEvent: async (eventId: string) => {
    return apiCall(`/events/${eventId}/candidates`);
  },

  update: async (id: string, updates: any) => {
    return apiCall(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/candidates/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ASSIGNMENT API ====================

export const assignmentAPI = {
  create: async (assignmentData: {
    event_id: string;
    assessor_id: string;
    candidate_id?: string;
    group_id?: string;
    type: 'individual' | 'group';
    case_study: string;
    due_date?: string;
  }) => {
    return apiCall('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  getByAssessor: async (eventId: string, assessorId: string) => {
    return apiCall(`/events/${eventId}/assessor/${assessorId}/assignments`);
  },

  getByEvent: async (eventId: string) => {
    return apiCall(`/events/${eventId}/assignments`);
  },

  update: async (id: string, updates: any) => {
    return apiCall(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ASSESSMENT API ====================

export const assessmentAPI = {
  save: async (assessmentData: {
    assignment_id: string;
    scores: Record<string, boolean[]>;
    notes?: string;
    total_score: number;
    performance_band: string;
    submitted?: boolean;
  }) => {
    return apiCall('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  },

  getByAssignment: async (assignmentId: string) => {
    return apiCall(`/assessments/${assignmentId}`);
  },
};

// ==================== GROUP API ====================

export const groupAPI = {
  create: async (groupData: {
    event_id: string;
    name: string;
    description?: string;
    member_ids?: string[];
    case_study?: string;
  }) => {
    return apiCall('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  },

  getByEvent: async (eventId: string) => {
    return apiCall(`/events/${eventId}/groups`);
  },

  update: async (id: string, updates: any) => {
    return apiCall(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/groups/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CASE STUDY API ====================

export const caseStudyAPI = {
  create: async (caseStudyData: {
    name: string;
    description?: string;
  }) => {
    return apiCall('/casestudies', {
      method: 'POST',
      body: JSON.stringify(caseStudyData),
    });
  },

  getAll: async () => {
    return apiCall('/casestudies');
  },

  update: async (id: string, updates: any) => {
    return apiCall(`/casestudies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/casestudies/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== INIT API ====================

export const initAPI = {
  initDemo: async () => {
    return apiCall('/init-demo', {
      method: 'POST',
    });
  },
};

// ==================== USER API ====================

export const userAPI = {
  getProfile: async () => {
    return apiCall('/auth/profile');
  },
};
