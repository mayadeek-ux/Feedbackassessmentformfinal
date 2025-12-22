import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

/**
 * ✅ CORS MUST RUN BEFORE the OPTIONS handler
 * Otherwise the preflight returns 204 without Access-Control-Allow-Origin.
 */
app.use(
  "*",
  cors({
    // You can keep "*" for production, but localhost explicit is best for debugging.
    origin: ["http://localhost:3002", "http://127.0.0.1:3002", "*"],
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

/**
 * ✅ Strip /make-server prefix (so app routes like /health match)
 * This MUST happen before routes.
 */
app.use("*", async (c, next) => {
  const url = new URL(c.req.url);

  if (url.pathname.startsWith("/make-server")) {
    url.pathname = url.pathname.replace("/make-server", "") || "/";
    // @ts-ignore - Hono/Deno request mutation pattern
    c.req.raw = new Request(url.toString(), c.req.raw);
  }

  await next();
});

// ✅ Logger
app.use("*", logger(console.log));

// ✅ Preflight AFTER cors so headers are present
app.options("*", (c) => c.text("", 204));

/**
 * ✅ ENV VARS (Edge Function Secrets)
 * Use the keys you have in Dashboard → Edge Functions → Secrets:
 * - PUBLIC_SUPABASE_URL
 * - PUBLIC_SUPABASE_ANON_KEY
 * - SERVICE_ROLE_KEY  (your service role)
 */
const getServiceClient = () => {
  const url = Deno.env.get("PUBLIC_SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") || ""; // ✅ service role here
  return createClient(url, serviceKey);
};

const getUserClient = (token: string) => {
  const url = Deno.env.get("PUBLIC_SUPABASE_URL") || "";
  const anonKey = Deno.env.get("PUBLIC_SUPABASE_ANON_KEY") || ""; // ✅ anon here
  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

// Helper function to verify auth and get user
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    return { error: "No authorization header", user: null, token: null as any };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { error: "Invalid authorization header", user: null, token: null as any };
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: "Unauthorized", user: null, token: null as any };
  }

  // Get user profile from database
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    error: null,
    user: profile || {
      id: user.id,
      email: user.email,
      role: "assessor",
    },
    token,
  };
};

// ==================== HEALTH ====================
app.get("/health", (c) => c.json({ status: "ok" }));

// ==================== AUTH ENDPOINTS ====================

// Signup endpoint
app.post("/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getServiceClient();

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || "",
        role: role || "assessor",
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    // User profile will be automatically created by the trigger
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Fetch the created profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return c.json({
      success: true,
      user: profile || {
        id: data.user.id,
        email,
        name: name || "",
        role: role || "assessor",
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Get user profile
app.get("/auth/profile", async (c) => {
  const { error, user } = await verifyAuth(c.req.header("Authorization"));

  if (error) {
    return c.json({ error }, 401);
  }

  return c.json({ user });
});

// ==================== EVENT ENDPOINTS ====================

// Create event (admin only)
app.post("/events", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));

  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const { name, description, status, start_date, end_date } = await c.req.json();

    if (!name || !start_date || !end_date) {
      return c.json({ error: "Name, start_date, and end_date are required" }, 400);
    }

    const supabase = getUserClient(token);

    const { data: event, error: dbError } = await supabase
      .from("events")
      .insert({
        name,
        description: description || "",
        status: status || "upcoming",
        start_date,
        end_date,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating event:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ event });
  } catch (err) {
    console.error("Error creating event:", err);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

// Get all events
app.get("/events", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const supabase = getUserClient(token);

    const { data: events, error: dbError } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching events:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ events: events || [] });
  } catch (err) {
    console.error("Error fetching events:", err);
    return c.json({ error: "Failed to fetch events" }, 500);
  }
});

// Get single event
app.get("/events/:id", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const eventId = c.req.param("id");
    const supabase = getUserClient(token);

    const { data: event, error: dbError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (dbError) {
      console.error("Error fetching event:", dbError);
      return c.json({ error: "Event not found" }, 404);
    }

    return c.json({ event });
  } catch (err) {
    console.error("Error fetching event:", err);
    return c.json({ error: "Failed to fetch event" }, 500);
  }
});

// Update event (admin only)
app.put("/events/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const eventId = c.req.param("id");
    const updates = await c.req.json();
    const supabase = getUserClient(token);

    const { data: event, error: dbError } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .select()
      .single();

    if (dbError) {
      console.error("Error updating event:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ event });
  } catch (err) {
    console.error("Error updating event:", err);
    return c.json({ error: "Failed to update event" }, 500);
  }
});

// Delete event (admin only)
app.delete("/events/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const eventId = c.req.param("id");
    const supabase = getUserClient(token);

    const { error: dbError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (dbError) {
      console.error("Error deleting event:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    return c.json({ error: "Failed to delete event" }, 500);
  }
});

// ==================== CANDIDATE ENDPOINTS ====================

// Create candidate
app.post("/candidates", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const { event_id, name, email, group_id, department, position } = await c.req.json();

    if (!event_id || !name) {
      return c.json({ error: "Event ID and name are required" }, 400);
    }

    const supabase = getUserClient(token);

    const { data: candidate, error: dbError } = await supabase
      .from("candidates")
      .insert({
        event_id,
        name,
        email: email || "",
        group_id: group_id || null,
        department: department || "",
        position: position || "",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating candidate:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ candidate });
  } catch (err) {
    console.error("Error creating candidate:", err);
    return c.json({ error: "Failed to create candidate" }, 500);
  }
});

// Get candidates for an event
app.get("/events/:eventId/candidates", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const eventId = c.req.param("eventId");
    const supabase = getUserClient(token);

    const { data: candidates, error: dbError } = await supabase
      .from("candidates")
      .select("*")
      .eq("event_id", eventId)
      .order("name");

    if (dbError) {
      console.error("Error fetching candidates:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ candidates: candidates || [] });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    return c.json({ error: "Failed to fetch candidates" }, 500);
  }
});

// Update candidate
app.put("/candidates/:id", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const candidateId = c.req.param("id");
    const updates = await c.req.json();
    const supabase = getUserClient(token);

    const { data: candidate, error: dbError } = await supabase
      .from("candidates")
      .update(updates)
      .eq("id", candidateId)
      .select()
      .single();

    if (dbError) {
      console.error("Error updating candidate:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ candidate });
  } catch (err) {
    console.error("Error updating candidate:", err);
    return c.json({ error: "Failed to update candidate" }, 500);
  }
});

// Delete candidate
app.delete("/candidates/:id", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const candidateId = c.req.param("id");
    const supabase = getUserClient(token);

    const { error: dbError } = await supabase
      .from("candidates")
      .delete()
      .eq("id", candidateId);

    if (dbError) {
      console.error("Error deleting candidate:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting candidate:", err);
    return c.json({ error: "Failed to delete candidate" }, 500);
  }
});

// ==================== ASSIGNMENT ENDPOINTS ====================

// Create assignment
app.post("/assignments", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const { event_id, assessor_id, candidate_id, group_id, type, case_study, due_date } =
      await c.req.json();

    if (!event_id || !assessor_id || !type || !case_study) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (type === "individual" && !candidate_id) {
      return c.json({ error: "Candidate ID required for individual assignment" }, 400);
    }

    if (type === "group" && !group_id) {
      return c.json({ error: "Group ID required for group assignment" }, 400);
    }

    const supabase = getUserClient(token);

    const { data: assignment, error: dbError } = await supabase
      .from("assignments")
      .insert({
        event_id,
        assessor_id,
        candidate_id: candidate_id || null,
        group_id: group_id || null,
        type,
        case_study,
        status: "not_started",
        due_date: due_date || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating assignment:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ assignment });
  } catch (err) {
    console.error("Error creating assignment:", err);
    return c.json({ error: "Failed to create assignment" }, 500);
  }
});

// Get assignments for an assessor
app.get("/events/:eventId/assessor/:assessorId/assignments", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const eventId = c.req.param("eventId");
    const assessorId = c.req.param("assessorId");

    if (user.role !== "admin" && user.id !== assessorId) {
      return c.json({ error: "Access denied" }, 403);
    }

    const supabase = getUserClient(token);

    const { data: assignments, error: dbError } = await supabase
      .from("assignments_with_details")
      .select("*")
      .eq("event_id", eventId)
      .eq("assessor_id", assessorId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching assignments:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    const transformedAssignments = (assignments || []).map((a: any) => ({
      id: a.id,
      event_id: a.event_id,
      assessor_id: a.assessor_id,
      candidate_id: a.candidate_id,
      group_id: a.group_id,
      type: a.type,
      case_study: a.case_study,
      status: a.status,
      due_date: a.due_date,
      created_at: a.created_at,
      updated_at: a.updated_at,
      candidate: a.candidate_name
        ? { id: a.candidate_id, name: a.candidate_name, email: a.candidate_email }
        : null,
      group: a.group_name ? { id: a.group_id, name: a.group_name } : null,
      assessment:
        a.total_score !== null
          ? {
              total_score: a.total_score,
              performance_band: a.performance_band,
              submitted_at: a.submitted_at,
            }
          : null,
    }));

    return c.json({ assignments: transformedAssignments });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    return c.json({ error: "Failed to fetch assignments" }, 500);
  }
});

// Get all assignments for an event (admin only)
app.get("/events/:eventId/assignments", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const eventId = c.req.param("eventId");
    const supabase = getUserClient(token);

    const { data: assignments, error: dbError } = await supabase
      .from("assignments")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching assignments:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ assignments: assignments || [] });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    return c.json({ error: "Failed to fetch assignments" }, 500);
  }
});

// Update assignment
app.put("/assignments/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const assignmentId = c.req.param("id");
    const updates = await c.req.json();
    const supabase = getUserClient(token);

    const { data: existing } = await supabase
      .from("assignments")
      .select("assessor_id")
      .eq("id", assignmentId)
      .single();

    if (!existing) return c.json({ error: "Assignment not found" }, 404);
    if (user.role !== "admin" && user.id !== existing.assessor_id) {
      return c.json({ error: "Access denied" }, 403);
    }

    const { data: assignment, error: dbError } = await supabase
      .from("assignments")
      .update(updates)
      .eq("id", assignmentId)
      .select()
      .single();

    if (dbError) {
      console.error("Error updating assignment:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ assignment });
  } catch (err) {
    console.error("Error updating assignment:", err);
    return c.json({ error: "Failed to update assignment" }, 500);
  }
});

// Delete assignment (admin only)
app.delete("/assignments/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const assignmentId = c.req.param("id");
    const supabase = getUserClient(token);

    const { error: dbError } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);

    if (dbError) {
      console.error("Error deleting assignment:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return c.json({ error: "Failed to delete assignment" }, 500);
  }
});

// ==================== ASSESSMENT ENDPOINTS ====================

// Save/update assessment
app.post("/assessments", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const { assignment_id, scores, notes, total_score, performance_band, submitted } =
      await c.req.json();

    if (!assignment_id) return c.json({ error: "Assignment ID required" }, 400);

    const supabase = getUserClient(token);

    const { data: assignment } = await supabase
      .from("assignments")
      .select("assessor_id, status")
      .eq("id", assignment_id)
      .single();

    if (!assignment) return c.json({ error: "Assignment not found" }, 404);
    if (user.id !== assignment.assessor_id) return c.json({ error: "Access denied" }, 403);

    const { data: assessment, error: dbError } = await supabase
      .from("assessments")
      .upsert(
        {
          assignment_id,
          scores: scores || {},
          notes: notes || "",
          total_score: total_score || 0,
          performance_band: performance_band || "",
          submitted_at: submitted ? new Date().toISOString() : null,
        },
        { onConflict: "assignment_id" },
      )
      .select()
      .single();

    if (dbError) {
      console.error("Error saving assessment:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    const newStatus =
      submitted ? "submitted" : (assignment.status === "not_started" ? "in_progress" : assignment.status);

    await supabase.from("assignments").update({ status: newStatus }).eq("id", assignment_id);

    return c.json({ assessment });
  } catch (err) {
    console.error("Error saving assessment:", err);
    return c.json({ error: "Failed to save assessment" }, 500);
  }
});

// Get assessment by assignment ID
app.get("/assessments/:assignmentId", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const assignmentId = c.req.param("assignmentId");
    const supabase = getUserClient(token);

    const { data: assignment } = await supabase
      .from("assignments")
      .select("assessor_id")
      .eq("id", assignmentId)
      .single();

    if (!assignment) return c.json({ error: "Assignment not found" }, 404);
    if (user.role !== "admin" && user.id !== assignment.assessor_id) {
      return c.json({ error: "Access denied" }, 403);
    }

    const { data: assessment, error: dbError } = await supabase
      .from("assessments")
      .select("*")
      .eq("assignment_id", assignmentId)
      .maybeSingle();

    if (dbError) {
      console.error("Error fetching assessment:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ assessment });
  } catch (err) {
    console.error("Error fetching assessment:", err);
    return c.json({ error: "Failed to fetch assessment" }, 500);
  }
});

// ==================== GROUP ENDPOINTS ====================

// Create group (admin only)
app.post("/groups", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const { event_id, name, description, member_ids, case_study } = await c.req.json();

    if (!event_id || !name) return c.json({ error: "Event ID and name are required" }, 400);

    const supabase = getUserClient(token);

    const { data: group, error: dbError } = await supabase
      .from("groups")
      .insert({
        event_id,
        name,
        description: description || "",
        member_ids: member_ids || [],
        case_study: case_study || "",
        status: "active",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating group:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    if (member_ids && member_ids.length > 0) {
      await supabase.from("candidates").update({ group_id: group.id }).in("id", member_ids);
    }

    return c.json({ group });
  } catch (err) {
    console.error("Error creating group:", err);
    return c.json({ error: "Failed to create group" }, 500);
  }
});

// Get groups for an event
app.get("/events/:eventId/groups", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const eventId = c.req.param("eventId");
    const supabase = getUserClient(token);

    const { data: groups, error: dbError } = await supabase
      .from("groups")
      .select("*")
      .eq("event_id", eventId)
      .order("name");

    if (dbError) {
      console.error("Error fetching groups:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ groups: groups || [] });
  } catch (err) {
    console.error("Error fetching groups:", err);
    return c.json({ error: "Failed to fetch groups" }, 500);
  }
});

// Update group (admin only)
app.put("/groups/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const groupId = c.req.param("id");
    const updates = await c.req.json();
    const supabase = getUserClient(token);

    const { data: group, error: dbError } = await supabase
      .from("groups")
      .update(updates)
      .eq("id", groupId)
      .select()
      .single();

    if (dbError) {
      console.error("Error updating group:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ group });
  } catch (err) {
    console.error("Error updating group:", err);
    return c.json({ error: "Failed to update group" }, 500);
  }
});

// Delete group (admin only)
app.delete("/groups/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const groupId = c.req.param("id");
    const supabase = getUserClient(token);

    const { data: group } = await supabase
      .from("groups")
      .select("member_ids")
      .eq("id", groupId)
      .single();

    if (group && group.member_ids && group.member_ids.length > 0) {
      await supabase.from("candidates").update({ group_id: null }).in("id", group.member_ids);
    }

    const { error: dbError } = await supabase.from("groups").delete().eq("id", groupId);

    if (dbError) {
      console.error("Error deleting group:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting group:", err);
    return c.json({ error: "Failed to delete group" }, 500);
  }
});

// ==================== CASE STUDY ENDPOINTS ====================

// Create case study (admin only)
app.post("/casestudies", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const { name, description } = await c.req.json();
    if (!name) return c.json({ error: "Name is required" }, 400);

    const supabase = getUserClient(token);

    const { data: caseStudy, error: dbError } = await supabase
      .from("case_studies")
      .insert({ name, description: description || "" })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating case study:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ caseStudy });
  } catch (err) {
    console.error("Error creating case study:", err);
    return c.json({ error: "Failed to create case study" }, 500);
  }
});

// Get all case studies
app.get("/casestudies", async (c) => {
  const { error, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);

  try {
    const supabase = getUserClient(token);

    const { data: caseStudies, error: dbError } = await supabase
      .from("case_studies")
      .select("*")
      .order("name");

    if (dbError) {
      console.error("Error fetching case studies:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ caseStudies: caseStudies || [] });
  } catch (err) {
    console.error("Error fetching case studies:", err);
    return c.json({ error: "Failed to fetch case studies" }, 500);
  }
});

// Update case study (admin only)
app.put("/casestudies/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const caseStudyId = c.req.param("id");
    const updates = await c.req.json();
    const supabase = getUserClient(token);

    const { data: caseStudy, error: dbError } = await supabase
      .from("case_studies")
      .update(updates)
      .eq("id", caseStudyId)
      .select()
      .single();

    if (dbError) {
      console.error("Error updating case study:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ caseStudy });
  } catch (err) {
    console.error("Error updating case study:", err);
    return c.json({ error: "Failed to update case study" }, 500);
  }
});

// Delete case study (admin only)
app.delete("/casestudies/:id", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const caseStudyId = c.req.param("id");
    const supabase = getUserClient(token);

    const { error: dbError } = await supabase.from("case_studies").delete().eq("id", caseStudyId);

    if (dbError) {
      console.error("Error deleting case study:", dbError);
      return c.json({ error: dbError.message }, 500);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting case study:", err);
    return c.json({ error: "Failed to delete case study" }, 500);
  }
});

// ==================== INITIALIZATION ENDPOINT ====================

app.post("/init-demo", async (c) => {
  const { error, user, token } = await verifyAuth(c.req.header("Authorization"));
  if (error) return c.json({ error }, 401);
  if (user.role !== "admin") return c.json({ error: "Admin access required" }, 403);

  try {
    const supabase = getUserClient(token);

    const { data: existingEvents } = await supabase.from("events").select("id").limit(1);
    if (existingEvents && existingEvents.length > 0) {
      return c.json({ success: true, message: "Demo data already exists" });
    }

    const { data: events } = await supabase.from("events").select("id").limit(1).single();

    if (events) {
      await supabase.from("candidates").insert([
        {
          event_id: events.id,
          name: "Sarah Chen",
          email: "sarah.chen@company.com",
          department: "Operations",
          position: "Senior Manager",
        },
        {
          event_id: events.id,
          name: "Michael Rodriguez",
          email: "michael.rodriguez@company.com",
          department: "Technology",
          position: "Director of Engineering",
        },
      ]);
    }

    return c.json({ success: true, message: "Demo candidates created" });
  } catch (err) {
    console.error("Error initializing demo data:", err);
    return c.json({ error: "Failed to initialize demo data" }, 500);
  }
});

Deno.serve(app.fetch);
