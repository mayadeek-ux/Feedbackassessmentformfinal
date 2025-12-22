// src/App.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

import { supabase } from "./lib/supabase";

import { LoginForm } from "./components/auth/LoginForm";
import { TopBar } from "./components/layout/TopBar";
import { AssessorDashboard } from "./components/dashboard/AssessorDashboard";
import { IndividualScoringPage } from "./components/scoring/IndividualScoringPage";
import { GroupScoringPage } from "./components/scoring/GroupScoringPage";
import { AdminPanel } from "./components/admin/AdminPanel";
import { CaseStudyManager } from "./components/admin/CaseStudyManager";
import { HelpModal } from "./components/modals/HelpModal";
import { CandidateAnalytics } from "./components/analytics/CandidateAnalytics";
import { CandidateGroupManager } from "./components/management/CandidateGroupManager";
import { AddCandidateModal } from "./components/modals/AddCandidateModal";
import { QuickAssessmentLauncher } from "./components/assessment/QuickAssessmentLauncher";
import { Toaster } from "./components/ui/sonner";

interface AppUser {
  id: string;
  email: string;
  role: "assessor" | "admin";
  name?: string;
}

type CandidateStatus = "not_started" | "in_progress" | "completed";
type AssignmentStatus = "not_started" | "in_progress" | "submitted";

interface CandidateState {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;

  overallScore: number;
  criteriaScores: Record<string, number>;
  status: CandidateStatus;

  timeSpent: number; // minutes
  caseStudy: string;

  redFlags: string[];
  submissionDate?: Date;
}

interface Assignment {
  id: string;
  type: "individual" | "group";

  candidateId?: string;
  candidateName?: string;

  groupId?: string;
  groupName?: string;

  status: AssignmentStatus;
  currentScore?: number;
  maxScore: number;

  lastUpdated?: Date;
  dueDate?: Date;

  caseStudy: string;
  notes?: string;
}

interface GroupData {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  caseStudy: string;
  status: "active" | "completed" | "archived";
  createdDate: Date;
  targetScore?: number;
  notes?: string;
}

type AppView =
  | "dashboard"
  | "individual-scoring"
  | "group-scoring"
  | "admin"
  | "analytics"
  | "management"
  | "case-studies"
  | "new-assessment";

// -----------------------
// Analytics helpers
// -----------------------
const CRITERIA_KEYS = [
  "strategic-thinking",
  "leadership",
  "communication",
  "innovation",
  "problem-solving",
  "collaboration",
  "adaptability",
  "decision-making",
  "emotional-intelligence",
  "digital-fluency",
] as const;

const emptyCriteriaScores = (): Record<string, number> =>
  CRITERIA_KEYS.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as Record<string, number>);

const mergeCriteriaScores = (base: Record<string, number>, incoming: any) => {
  const merged = { ...base };
  if (!incoming || typeof incoming !== "object") return merged;
  for (const key of CRITERIA_KEYS) {
    const v = incoming[key];
    if (typeof v === "number" && Number.isFinite(v)) merged[key] = v;
    // allow strings like "7"
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) merged[key] = Number(v);
  }
  return merged;
};

/**
 * Extract criteriaScores from either:
 * - scoring page payload (data.criteriaScores or data.scores)
 * - assessment row (assessment.scores)
 */
const extractCriteriaScoresFromAny = (obj: any): Record<string, number> => {
  const base = emptyCriteriaScores();
  if (!obj) return base;

  if (obj.criteriaScores && typeof obj.criteriaScores === "object") {
    return mergeCriteriaScores(base, obj.criteriaScores);
  }

  if (obj.scores && typeof obj.scores === "object") {
    // If scores are keyed by criteria ids
    return mergeCriteriaScores(base, obj.scores);
  }

  return base;
};

const computeOverallScore = (obj: any, criteriaScores: Record<string, number>) => {
  if (typeof obj?.totalScore === "number" && Number.isFinite(obj.totalScore)) return obj.totalScore;
  if (typeof obj?.total_score === "number" && Number.isFinite(obj.total_score)) return obj.total_score;

  // default: sum criteria (out of 100 if each criterion is out of 10)
  return Object.values(criteriaScores).reduce((sum, n) => sum + (Number(n) || 0), 0);
};

const getBestAssessment = (assessments: any) => {
  // Supabase can return [] or object depending on relationship shape.
  const list = Array.isArray(assessments) ? assessments : assessments ? [assessments] : [];
  if (list.length === 0) return null;

  // Prefer submitted, then most recently updated
  const submitted = list.filter((a) => a?.submitted === true);
  const pool = submitted.length ? submitted : list;

  pool.sort((a, b) => {
    const ad = new Date(a?.updated_at || a?.submitted_at || 0).getTime();
    const bd = new Date(b?.updated_at || b?.submitted_at || 0).getTime();
    return bd - ad;
  });

  return pool[0] ?? null;
};

const safeDate = (v: any): Date | undefined => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

// -----------------------
// App
// -----------------------
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showHelp, setShowHelp] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);

  // Data state
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [deletedCandidates, setDeletedCandidates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<CandidateState[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // ---------- AUTH ----------
  const fetchAndSetProfile = useCallback(async (sessionUser: User) => {
    const role = sessionUser.user_metadata?.role || "assessor";
    setAppUser({
      id: sessionUser.id,
      email: sessionUser.email ?? "",
      role: role === "admin" ? "admin" : "assessor",
      name: sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0],
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user ?? null;
        if (!isMounted) return;

        if (sessionUser) {
          setUser(sessionUser);
          await fetchAndSetProfile(sessionUser);
        } else {
          setUser(null);
          setAppUser(null);
        }
      } catch (e) {
        console.error("Error initializing session:", e);
        if (!isMounted) return;
        setUser(null);
        setAppUser(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      if (!isMounted) return;

      if (sessionUser) {
        setUser(sessionUser);
        await fetchAndSetProfile(sessionUser);
      } else {
        setUser(null);
        setAppUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchAndSetProfile]);

  // ---------- ONLINE/OFFLINE ----------
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline - some features may be limited");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ---------- DATA LOADING ----------
  const loadEventData = useCallback(
    async (eventId: string) => {
      try {
        // 1) Load candidates
        const { data: cands, error: candsError } = await supabase
          .from("candidates")
          .select("*")
          .eq("event_id", eventId);

        if (candsError) console.error("Error loading candidates:", candsError);

        // 2) Load groups
        const { data: grps, error: grpsError } = await supabase
          .from("groups")
          .select("*")
          .eq("event_id", eventId);

        if (grpsError) console.error("Error loading groups:", grpsError);

        const transformedGroups: GroupData[] = (grps || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description || "",
          memberIds: g.member_ids || [],
          caseStudy: g.case_study || "",
          status: (g.status || "active") as GroupData["status"],
          createdDate: new Date(g.created_at),
          targetScore: g.targetScore ?? 0,
          notes: g.notes ?? "",
        }));
        setGroups(transformedGroups);

        // 3) Load ALL assignments for the event (used to hydrate candidate analytics)
        //    We include assessments so we can compute scores/status on refresh.
        const { data: allAssigs, error: allAssigsError } = await supabase
          .from("assignments")
          .select(
            `
            id,
            type,
            status,
            case_study,
            updated_at,
            due_date,
            assessor_id,
            candidate_id,
            group_id,
            candidate:candidates(id,name,email,department,position),
            group:groups(id,name,member_ids,case_study,description,status,created_at),
            assessments:assessments(*)
          `
          )
          .eq("event_id", eventId);

        if (allAssigsError) console.error("Error loading event assignments:", allAssigsError);

        // Build a map: candidateId -> best assessment + assignment info
        const candidateHydration = new Map<
          string,
          {
            status: CandidateStatus;
            overallScore: number;
            criteriaScores: Record<string, number>;
            submissionDate?: Date;
            timeSpent: number;
            caseStudy: string;
          }
        >();

        for (const a of allAssigs || []) {
          if (a.type !== "individual" || !a.candidate_id) continue;

          const best = getBestAssessment(a.assessments);
          const criteriaScores = best ? extractCriteriaScoresFromAny(best) : emptyCriteriaScores();
          const overall = best ? computeOverallScore(best, criteriaScores) : 0;

          const isSubmitted = best?.submitted === true || a.status === "submitted";
          const status: CandidateStatus = isSubmitted ? "completed" : a.status === "in_progress" ? "in_progress" : "not_started";

          // keep the most recent / best record
          const existing = candidateHydration.get(a.candidate_id);
          const candidateUpdatedAt = new Date(a.updated_at || 0).getTime();
          const existingUpdatedAt = existing ? new Date(existing.submissionDate || 0).getTime() : -1;

          const record = {
            status,
            overallScore: overall,
            criteriaScores,
            submissionDate: safeDate(best?.submitted_at) || (isSubmitted ? safeDate(a.updated_at) : undefined),
            timeSpent:
              typeof best?.time_spent === "number"
                ? best.time_spent
                : typeof best?.timeSpent === "number"
                ? best.timeSpent
                : 0,
            caseStudy: a.case_study || "",
          };

          if (!existing) {
            candidateHydration.set(a.candidate_id, record);
          } else {
            // Prefer submitted over not submitted, otherwise prefer newer assignment update
            const prefer =
              (record.status === "completed" && existing.status !== "completed") ||
              (record.status === existing.status && candidateUpdatedAt > existingUpdatedAt);
            if (prefer) candidateHydration.set(a.candidate_id, record);
          }
        }

        const transformedCandidates: CandidateState[] = (cands || []).map((c: any) => {
          const hyd = candidateHydration.get(c.id);

          return {
            id: c.id,
            name: c.name,
            email: c.email || "",
            department: c.department || "",
            position: c.position || "",

            overallScore: hyd?.overallScore ?? 0,
            criteriaScores: hyd?.criteriaScores ?? emptyCriteriaScores(),
            status: hyd?.status ?? "not_started",

            timeSpent: hyd?.timeSpent ?? 0,
            caseStudy: hyd?.caseStudy ?? "",

            redFlags: (c.red_flags || c.redFlags || []) as string[],
            submissionDate: hyd?.submissionDate,
          };
        });

        setCandidates(transformedCandidates);

        // 4) Load assignments for current assessor (dashboard)
        if (appUser) {
          const { data: myAssigs, error: myAssigsError } = await supabase
            .from("assignments")
            .select(
              `
              id,
              type,
              status,
              case_study,
              updated_at,
              due_date,
              candidate_id,
              group_id,
              candidate:candidates(id,name,email,department,position),
              group:groups(id,name,member_ids),
              assessments:assessments(*)
            `
            )
            .eq("event_id", eventId)
            .eq("assessor_id", appUser.id);

          if (myAssigsError) console.error("Error loading assessor assignments:", myAssigsError);

          const transformedAssignments: Assignment[] = (myAssigs || []).map((a: any) => {
            const best = getBestAssessment(a.assessments);
            const criteriaScores = best ? extractCriteriaScoresFromAny(best) : emptyCriteriaScores();
            const total = best ? computeOverallScore(best, criteriaScores) : undefined;

            return {
              id: a.id,
              type: a.type,
              candidateId: a.candidate_id ?? undefined,
              candidateName: a.candidate?.name,
              groupId: a.group_id ?? undefined,
              groupName: a.group?.name,
              status: (a.status || "not_started") as AssignmentStatus,
              currentScore: typeof total === "number" ? total : undefined,
              maxScore: 100,
              lastUpdated: safeDate(a.updated_at),
              dueDate: safeDate(a.due_date),
              caseStudy: a.case_study || "",
              notes: best?.notes,
            };
          });

          setAssignments(transformedAssignments);
        } else {
          setAssignments([]);
        }
      } catch (error) {
        console.error("Error loading event data:", error);
        toast.error("Failed to load event data");
      }
    },
    [appUser]
  );

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Load events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("Error loading events:", eventsError);
        if (appUser?.role === "admin") setShowInitDialog(true);
        return;
      }

      setAvailableEvents(events || []);

      const activeEvent = (events || []).find((e: any) => e.status === "active") || (events || [])[0];

      if (activeEvent) {
        setCurrentEvent(activeEvent);
        await loadEventData(activeEvent.id);
      } else if (appUser?.role === "admin") {
        setShowInitDialog(true);
      }

      // Load case studies
      const { data: studies, error: studiesError } = await supabase
        .from("case_studies")
        .select("*")
        .order("created_at", { ascending: false });

      if (!studiesError) setCaseStudies(studies || []);
      else console.error("Error loading case studies:", studiesError);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. You may need to initialize the system.");
      if (appUser?.role === "admin") setShowInitDialog(true);
    } finally {
      setIsLoadingData(false);
    }
  }, [appUser?.role, loadEventData]);

  useEffect(() => {
    if (appUser?.id) {
      loadData();
    }
  }, [appUser?.id, loadData]);

  // ---------- INIT DEMO ----------
  const handleInitializeDemo = async () => {
    try {
      setIsLoadingData(true);

      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          name: "Demo Assessment Event",
          description: "A demo event for testing the assessment platform",
          status: "active",
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (eventError) {
        console.error("Error creating demo event:", eventError);
        toast.error("Failed to create demo event: " + eventError.message);
        return;
      }

      const demoCandidates = [
        { name: "Alice Johnson", email: "alice@example.com", department: "Engineering", position: "Senior Developer" },
        { name: "Bob Smith", email: "bob@example.com", department: "Marketing", position: "Marketing Manager" },
        { name: "Carol Williams", email: "carol@example.com", department: "Sales", position: "Sales Lead" },
      ];

      const { error: candsError } = await supabase
        .from("candidates")
        .insert(demoCandidates.map((c) => ({ ...c, event_id: event.id })));

      if (candsError) console.error("Error creating demo candidates:", candsError);

      // IMPORTANT: your schema might use "title" or "name". We insert both safely by trying one, then fallback.
      const demoCaseStudies = [
        {
          title: "Strategic Leadership Challenge",
          name: "Strategic Leadership Challenge",
          description: "Evaluate leadership and strategic thinking capabilities",
          type: "individual",
          duration_minutes: 60,
        },
        {
          title: "Team Collaboration Scenario",
          name: "Team Collaboration Scenario",
          description: "Assess teamwork and collaboration skills",
          type: "group",
          duration_minutes: 90,
        },
      ];

      // Try inserting as-is; if schema rejects a column, admin can adjust in DB,
      // but we also try a narrower insert automatically.
      let csError: any = null;
      const csInsert1 = await supabase.from("case_studies").insert(demoCaseStudies);
      csError = csInsert1.error;

      if (csError) {
        console.warn("Case study insert attempt #1 failed, retrying with minimal fields:", csError);
        const minimal = demoCaseStudies.map((cs) => ({
          title: cs.title,
          description: cs.description,
          type: cs.type,
          duration_minutes: cs.duration_minutes,
        }));
        const csInsert2 = await supabase.from("case_studies").insert(minimal);
        if (csInsert2.error) console.error("Error creating demo case studies:", csInsert2.error);
      }

      toast.success("Demo data initialized successfully");
      setShowInitDialog(false);
      await loadData();
    } catch (error) {
      console.error("Error initializing demo:", error);
      toast.error("Failed to initialize demo data");
    } finally {
      setIsLoadingData(false);
    }
  };

  // ---------- NAV ----------
  const handleStartAssessment = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    setCurrentAssignment(assignment);
    setCurrentView(assignment.type === "individual" ? "individual-scoring" : "group-scoring");
  };

  const handleResumeAssessment = (assignmentId: string) => handleStartAssessment(assignmentId);

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setCurrentAssignment(null);
  };

  const handleEventChange = async (eventId: string) => {
    const event = availableEvents.find((e) => e.id === eventId);
    if (!event) return;

    setCurrentEvent(event);
    await loadEventData(eventId);
    toast.success("Event switched successfully");
  };

  const handleShowHelp = () => setShowHelp(true);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAppUser(null);
      setCurrentView("dashboard");
      setCurrentAssignment(null);
      setIsSignedOut(true);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // ---------- SAVE / SUBMIT / REOPEN ----------
  const upsertAssessment = async (payload: {
    assignmentId: string;
    scores?: any;
    criteriaScores?: any;
    notes?: string;
    totalScore?: number;
    performanceBand?: string;
    submitted: boolean;
    submittedAt?: string;
    timeSpent?: number;
  }) => {
    const criteriaScores = extractCriteriaScoresFromAny(payload);
    const totalScore = computeOverallScore(payload, criteriaScores);

    const scoresToStore = payload.scores && typeof payload.scores === "object" ? payload.scores : criteriaScores;

    const { data: existing, error: existingError } = await supabase
      .from("assessments")
      .select("id")
      .eq("assignment_id", payload.assignmentId)
      .single();

    // If "single()" fails because none exists, Supabase can return error; we treat that as "no record"
    const hasExisting = !!existing?.id && !existingError;

    if (hasExisting) {
      const { error } = await supabase
        .from("assessments")
        .update({
          scores: scoresToStore || {},
          notes: payload.notes || "",
          total_score: totalScore || 0,
          performance_band: payload.performanceBand || "",
          submitted: payload.submitted,
          submitted_at: payload.submitted ? payload.submittedAt || new Date().toISOString() : null,
          time_spent: typeof payload.timeSpent === "number" ? payload.timeSpent : null,
          updated_at: new Date().toISOString(),
        })
        .eq("assignment_id", payload.assignmentId);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("assessments").insert({
        assignment_id: payload.assignmentId,
        scores: scoresToStore || {},
        notes: payload.notes || "",
        total_score: totalScore || 0,
        performance_band: payload.performanceBand || "",
        submitted: payload.submitted,
        submitted_at: payload.submitted ? payload.submittedAt || new Date().toISOString() : null,
        time_spent: typeof payload.timeSpent === "number" ? payload.timeSpent : null,
      });

      if (error) throw error;
    }

    return { criteriaScores, totalScore };
  };

  const handleSaveAssessment = async (data: any) => {
    try {
      if (!currentAssignment) throw new Error("No active assignment");

      const { criteriaScores, totalScore } = await upsertAssessment({
        assignmentId: data.assignmentId,
        scores: data.scores,
        criteriaScores: data.criteriaScores,
        notes: data.notes,
        totalScore: data.totalScore,
        performanceBand: data.performanceBand,
        submitted: false,
        timeSpent: data.timeSpent,
      });

      await supabase
        .from("assignments")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", data.assignmentId);

      // Update assignments state
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === data.assignmentId
            ? { ...a, status: "in_progress", currentScore: totalScore, lastUpdated: new Date(), notes: data.notes || a.notes }
            : a
        )
      );

      // Update current assignment state
      if (currentAssignment?.id === data.assignmentId) {
        setCurrentAssignment((prev) =>
          prev ? { ...prev, status: "in_progress", currentScore: totalScore, lastUpdated: new Date(), notes: data.notes || prev.notes } : null
        );
      }

      // ✅ Update candidate analytics state (so dashboard analytics is never stuck at 0)
      if (currentAssignment.type === "individual" && currentAssignment.candidateId) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === currentAssignment.candidateId
              ? {
                  ...c,
                  overallScore: totalScore,
                  criteriaScores,
                  status: "in_progress",
                  timeSpent: typeof data?.timeSpent === "number" ? data.timeSpent : c.timeSpent,
                  caseStudy: currentAssignment.caseStudy || c.caseStudy,
                }
              : c
          )
        );
      }

      toast.success("Assessment saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment");
      throw error;
    }
  };

  const handleSubmitAssessment = async (data: any) => {
    try {
      if (!currentAssignment) throw new Error("No active assignment");

      const { criteriaScores, totalScore } = await upsertAssessment({
        assignmentId: data.assignmentId,
        scores: data.scores,
        criteriaScores: data.criteriaScores,
        notes: data.notes,
        totalScore: data.totalScore,
        performanceBand: data.performanceBand,
        submitted: true,
        submittedAt: new Date().toISOString(),
        timeSpent: data.timeSpent,
      });

      await supabase
        .from("assignments")
        .update({ status: "submitted", updated_at: new Date().toISOString() })
        .eq("id", data.assignmentId);

      // Update assignments state
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === data.assignmentId
            ? { ...a, status: "submitted", currentScore: totalScore, lastUpdated: new Date(), notes: data.notes || a.notes }
            : a
        )
      );

      // Update current assignment state
      if (currentAssignment?.id === data.assignmentId) {
        setCurrentAssignment((prev) =>
          prev ? { ...prev, status: "submitted", currentScore: totalScore, lastUpdated: new Date(), notes: data.notes || prev.notes } : null
        );
      }

      // ✅ Update candidate analytics state on submit
      if (currentAssignment.type === "individual" && currentAssignment.candidateId) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === currentAssignment.candidateId
              ? {
                  ...c,
                  overallScore: totalScore,
                  criteriaScores,
                  status: "completed",
                  submissionDate: new Date(),
                  timeSpent: typeof data?.timeSpent === "number" ? data.timeSpent : c.timeSpent,
                  caseStudy: currentAssignment.caseStudy || c.caseStudy,
                }
              : c
          )
        );
      }

      toast.success("Assessment submitted successfully");
      return true;
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
      throw error;
    }
  };

  const handleReopenAssessment = async (assignmentId: string) => {
    try {
      await supabase
        .from("assignments")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", assignmentId);

      await supabase
        .from("assessments")
        .update({ submitted: false, updated_at: new Date().toISOString() })
        .eq("assignment_id", assignmentId);

      setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, status: "in_progress", lastUpdated: new Date() } : a)));

      if (currentAssignment?.id === assignmentId) {
        setCurrentAssignment((prev) => (prev ? { ...prev, status: "in_progress", lastUpdated: new Date() } : null));
      }

      // If it's an individual assignment, reflect that in candidate status too
      const reopened = assignments.find((a) => a.id === assignmentId);
      if (reopened?.type === "individual" && reopened?.candidateId) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === reopened.candidateId ? { ...c, status: "in_progress", submissionDate: undefined } : c
          )
        );
      }

      toast.success("Assessment reopened for editing");
      return true;
    } catch (error) {
      console.error("Error reopening assessment:", error);
      toast.error("Failed to reopen assessment");
      throw error;
    }
  };

  // ---------- CANDIDATES ----------
  const handleAddCandidate = async (candidateData: any) => {
    if (!currentEvent) {
      toast.error("No active event");
      return;
    }

    try {
      const { data: candidate, error } = await supabase
        .from("candidates")
        .insert({
          event_id: currentEvent.id,
          name: candidateData.name,
          email: candidateData.email || "",
          department: candidateData.department || "",
          position: candidateData.position || "",
        })
        .select()
        .single();

      if (error) throw error;

      const newCandidate: CandidateState = {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email || "",
        department: candidate.department || "",
        position: candidate.position || "",

        overallScore: 0,
        criteriaScores: emptyCriteriaScores(),
        status: "not_started",

        timeSpent: 0,
        caseStudy: candidateData.caseStudy || "",

        redFlags: [],
        submissionDate: undefined,
      };

      setCandidates((prev) => [...prev, newCandidate]);
      toast.success(`Candidate ${candidateData.name} added successfully`);
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    }
  };

  const handleUpdateCandidate = async (id: string, candidateData: any) => {
    try {
      const { error } = await supabase.from("candidates").update(candidateData).eq("id", id);
      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...candidateData,
              }
            : c
        )
      );
      toast.success("Candidate updated successfully");
    } catch (error) {
      console.error("Error updating candidate:", error);
      toast.error("Failed to update candidate");
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      const candidateToDelete = candidates.find((c) => c.id === id);
      if (!candidateToDelete) return;

      const { error } = await supabase.from("candidates").delete().eq("id", id);
      if (error) throw error;

      setDeletedCandidates((prev) => [...prev, { ...candidateToDelete, deletedAt: new Date(), originalId: id }]);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      setGroups((prev) => prev.map((g) => ({ ...g, memberIds: g.memberIds.filter((mid) => mid !== id) })));

      toast.success("Candidate deleted");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  const handleRestoreCandidate = async (originalId: string) => {
    const candidateToRestore = deletedCandidates.find((c: any) => c.originalId === originalId);
    if (!candidateToRestore) return;

    const { deletedAt, originalId: _, ...restoredCandidate } = candidateToRestore;
    setCandidates((prev) => [...prev, restoredCandidate]);
    setDeletedCandidates((prev) => prev.filter((c: any) => c.originalId !== originalId));
    toast.success("Candidate restored successfully");
  };

  const handlePermanentlyDeleteCandidate = (originalId: string) => {
    setDeletedCandidates((prev) => prev.filter((c: any) => c.originalId !== originalId));
    toast.success("Candidate permanently deleted");
  };

  // ---------- GROUPS ----------
  const handleAddGroup = async (groupData: any) => {
    if (!currentEvent) {
      toast.error("No active event");
      return;
    }

    try {
      const { data: group, error } = await supabase
        .from("groups")
        .insert({
          event_id: currentEvent.id,
          name: groupData.name,
          description: groupData.description || "",
          member_ids: groupData.memberIds || [],
          case_study: groupData.caseStudy || "",
        })
        .select()
        .single();

      if (error) throw error;

      const newGroup: GroupData = {
        id: group.id,
        name: group.name,
        description: group.description || "",
        memberIds: group.member_ids || [],
        caseStudy: group.case_study || "",
        status: "active",
        createdDate: new Date(group.created_at),
        targetScore: groupData.targetScore,
        notes: groupData.notes,
      };

      setGroups((prev) => [...prev, newGroup]);
      toast.success(`Group ${groupData.name} created successfully`);
    } catch (error) {
      console.error("Error adding group:", error);
      toast.error("Failed to create group");
    }
  };

  const handleUpdateGroup = async (id: string, groupData: any) => {
    try {
      const { error } = await supabase
        .from("groups")
        .update({
          name: groupData.name,
          description: groupData.description,
          member_ids: groupData.memberIds,
          case_study: groupData.caseStudy,
        })
        .eq("id", id);

      if (error) throw error;

      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...groupData } : g)));
      toast.success("Group updated successfully");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) throw error;

      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  // ---------- CASE STUDIES ----------
  const handleUpdateCaseStudy = async (id: string, updates: any) => {
    try {
      // Your project has mixed usage (name vs title). We try name first, then title.
      const attempt1 = await supabase
        .from("case_studies")
        .update({
          name: updates.name ?? updates.title,
          description: updates.description,
        })
        .eq("id", id);

      if (attempt1.error) {
        const attempt2 = await supabase
          .from("case_studies")
          .update({
            title: updates.title ?? updates.name,
            description: updates.description,
          })
          .eq("id", id);

        if (attempt2.error) throw attempt2.error;
      }

      setCaseStudies((prev) => prev.map((cs: any) => (cs.id === id ? { ...cs, ...updates } : cs)));
      toast.success("Case study updated successfully");
    } catch (error) {
      console.error("Error updating case study:", error);
      toast.error("Failed to update case study");
    }
  };

  const handleAddCaseStudy = async (caseStudyData: any) => {
    try {
      const { data: caseStudy, error } = await supabase.from("case_studies").insert(caseStudyData).select().single();
      if (error) throw error;

      setCaseStudies((prev) => [...prev, caseStudy]);
      toast.success("Case study added successfully");
    } catch (error) {
      console.error("Error adding case study:", error);
      toast.error("Failed to add case study");
    }
  };

  const handleDeleteCaseStudy = async (id: string) => {
    try {
      const { error } = await supabase.from("case_studies").delete().eq("id", id);
      if (error) throw error;

      setCaseStudies((prev) => prev.filter((cs: any) => cs.id !== id));
      toast.success("Case study deleted successfully");
    } catch (error) {
      console.error("Error deleting case study:", error);
      toast.error("Failed to delete case study");
    }
  };

  // ---------- START NEW ASSESSMENTS ----------
  const handleStartIndividualAssessment = async (candidateName: string, caseStudy: string, isNewCandidate: boolean) => {
    if (!currentEvent || !appUser) {
      toast.error("No active event or user");
      return;
    }

    let candidateId = candidates.find((c) => c.name === candidateName)?.id;

    if (isNewCandidate) {
      try {
        const { data: candidate, error } = await supabase
          .from("candidates")
          .insert({
            event_id: currentEvent.id,
            name: candidateName,
            email: "",
            department: "",
            position: "",
          })
          .select()
          .single();

        if (error) throw error;

        candidateId = candidate.id;

        const newCandidate: CandidateState = {
          id: candidate.id,
          name: candidateName,
          email: "",
          department: "",
          position: "",
          overallScore: 0,
          criteriaScores: emptyCriteriaScores(),
          status: "not_started",
          timeSpent: 0,
          caseStudy,
          redFlags: [],
          submissionDate: undefined,
        };

        setCandidates((prev) => [...prev, newCandidate]);
      } catch (error) {
        console.error("Error creating candidate:", error);
        toast.error("Failed to create candidate");
        return;
      }
    }

    if (!candidateId) {
      toast.error("Candidate not found / not created");
      return;
    }

    try {
      const { data: assignment, error } = await supabase
        .from("assignments")
        .insert({
          event_id: currentEvent.id,
          assessor_id: appUser.id,
          candidate_id: candidateId,
          type: "individual",
          case_study: caseStudy,
          status: "not_started",
        })
        .select()
        .single();

      if (error) throw error;

      const newAssignment: Assignment = {
        id: assignment.id,
        type: "individual",
        candidateId,
        candidateName,
        status: "not_started",
        maxScore: 100,
        caseStudy,
      };

      setAssignments((prev) => [...prev, newAssignment]);
      setCurrentAssignment(newAssignment);
      setCurrentView("individual-scoring");

      toast.success(isNewCandidate ? `Starting assessment for new candidate: ${candidateName}` : `Starting assessment for: ${candidateName}`);
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    }
  };

  const handleStartGroupAssessment = async (groupId: string, caseStudy: string) => {
    if (!currentEvent || !appUser) {
      toast.error("No active event or user");
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      toast.error("Group not found");
      return;
    }

    try {
      const { data: assignment, error } = await supabase
        .from("assignments")
        .insert({
          event_id: currentEvent.id,
          assessor_id: appUser.id,
          group_id: groupId,
          type: "group",
          case_study: caseStudy,
          status: "not_started",
        })
        .select()
        .single();

      if (error) throw error;

      const newAssignment: Assignment = {
        id: assignment.id,
        type: "group",
        groupId,
        groupName: group.name,
        status: "not_started",
        maxScore: 100,
        caseStudy,
      };

      setAssignments((prev) => [...prev, newAssignment]);
      setCurrentAssignment(newAssignment);
      setCurrentView("group-scoring");

      toast.success(`Starting group assessment for: ${group.name}`);
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    }
  };

  // ---------- VIEW HELPERS ----------
  const handleViewAnalytics = () => setCurrentView("analytics");
  const handleViewManagement = () => setCurrentView("management");

  const currentGroupForScoring = useMemo(() => {
    if (!currentAssignment?.groupId) return null;
    return groups.find((g) => g.id === currentAssignment.groupId) || null;
  }, [currentAssignment?.groupId, groups]);

  // ---------- RENDER ----------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full mx-auto" />
            <div className="w-20 h-20 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto absolute top-0" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold gradient-text-premium">Loading Assessment Platform</h2>
            <p className="text-muted-foreground text-lg">Preparing your sophisticated experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !appUser || isSignedOut) {
    return (
      <LoginForm
        onSignIn={() => {
          setIsSignedOut(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 animate-fade-in">
      <TopBar
        user={appUser}
        currentEvent={currentEvent || { id: "", name: "No Event" }}
        availableEvents={availableEvents}
        isOnline={isOnline}
        onEventChange={handleEventChange}
        onShowHelp={handleShowHelp}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto p-6">
        {showInitDialog && appUser.role === "admin" && (
          <div className="glass rounded-3xl p-10 card-shadow-xl mb-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold gradient-text-premium">Initialize System</h2>
              <p className="text-muted-foreground">
                It looks like this is a fresh installation. Would you like to initialize the system with demo data?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleInitializeDemo}
                  disabled={isLoadingData}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoadingData ? "Initializing..." : "Initialize Demo Data"}
                </button>
                <button
                  onClick={() => setShowInitDialog(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoadingData && (
          <div className="glass rounded-3xl p-6 card-shadow-xl mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading data...</span>
            </div>
          </div>
        )}

        {currentView === "dashboard" && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass rounded-3xl p-10 card-shadow-xl hover-lift">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold gradient-text-premium">
                    {appUser.role === "admin" ? "Executive Dashboard" : "Assessment Console"}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {appUser.role === "admin"
                      ? "Orchestrate comprehensive assessment operations and insights"
                      : "Conduct sophisticated individual and group evaluations"}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentView("new-assessment")}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                  >
                    <span className="font-semibold">Start New Assessment</span>
                  </button>

                  <button
                    onClick={handleViewManagement}
                    className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                  >
                    <span className="font-semibold">Candidate Management</span>
                  </button>

                  <button
                    onClick={handleViewAnalytics}
                    className="px-8 py-4 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-2xl hover:from-slate-600 hover:to-slate-700 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                  >
                    <span className="font-semibold">Performance Analytics</span>
                  </button>

                  {appUser.role === "admin" && (
                    <>
                      <button
                        onClick={() => setCurrentView("case-studies")}
                        className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                      >
                        <span className="font-semibold">Case Study Management</span>
                      </button>
                      <button
                        onClick={() => setCurrentView("admin")}
                        className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl hover:from-slate-800 hover:to-slate-900 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                      >
                        <span className="font-semibold">System Administration</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {appUser.role === "assessor" ? (
              <AssessorDashboard
                assignments={assignments}
                candidates={candidates}
                onStartAssessment={handleStartAssessment}
                onResumeAssessment={handleResumeAssessment}
              />
            ) : (
              <AdminPanel />
            )}
          </div>
        )}

        {currentView === "individual-scoring" && currentAssignment && (
          <IndividualScoringPage
            candidateId={
              currentAssignment.candidateId ||
              candidates.find((c) => c.name === currentAssignment.candidateName)?.id
            }
            candidateName={currentAssignment.candidateName!}
            assignmentId={currentAssignment.id}
            caseStudy={currentAssignment.caseStudy}
            onBack={handleBackToDashboard}
            onSave={handleSaveAssessment}
            onSubmit={handleSubmitAssessment}
            onReopen={handleReopenAssessment}
            isReadOnly={false}
            isSubmitted={currentAssignment.status === "submitted"}
          />
        )}

        {currentView === "group-scoring" && currentAssignment && (
          <GroupScoringPage
            groupId={currentAssignment.groupId || ""}
            groupName={currentAssignment.groupName || "Group"}
            assignmentId={currentAssignment.id}
            caseStudy={currentAssignment.caseStudy}
            members={
              currentGroupForScoring?.memberIds.map((id) => {
                const candidate = candidates.find((c) => c.id === id);
                return candidate ? { id: candidate.id, name: candidate.name } : { id, name: "Unknown" };
              }) || []
            }
            onBack={handleBackToDashboard}
            onSave={handleSaveAssessment}
            onSubmit={handleSubmitAssessment}
            onReopen={handleReopenAssessment}
            isReadOnly={false}
            isSubmitted={currentAssignment.status === "submitted"}
          />
        )}

        {currentView === "analytics" && (
          <CandidateAnalytics
            candidates={candidates}
            onAddCandidate={() => setShowAddCandidate(true)}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentView === "management" && (
          <CandidateGroupManager
            candidates={candidates}
            groups={groups}
            deletedCandidates={deletedCandidates}
            caseStudies={caseStudies}
            onAddCandidate={handleAddCandidate}
            onUpdateCandidate={handleUpdateCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            onRestoreCandidate={handleRestoreCandidate}
            onPermanentlyDeleteCandidate={handlePermanentlyDeleteCandidate}
            onAddGroup={handleAddGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentView === "case-studies" && (
          <CaseStudyManager
            caseStudies={caseStudies}
            onUpdateCaseStudy={handleUpdateCaseStudy}
            onAddCaseStudy={handleAddCaseStudy}
            onDeleteCaseStudy={handleDeleteCaseStudy}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentView === "new-assessment" && (
          <QuickAssessmentLauncher
            candidates={candidates}
            groups={groups}
            caseStudies={caseStudies}
            onBack={handleBackToDashboard}
            onStartIndividualAssessment={handleStartIndividualAssessment}
            onStartGroupAssessment={handleStartGroupAssessment}
            onAddCandidate={handleAddCandidate}
          />
        )}

        {currentView === "admin" && <AdminPanel />}
      </main>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} userRole={appUser?.role} />

      <AddCandidateModal isOpen={showAddCandidate} onClose={() => setShowAddCandidate(false)} onAddCandidate={handleAddCandidate} />

      <Toaster />
    </div>
  );
}
