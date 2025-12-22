// src/App.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
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

type Role = "assessor" | "admin";

interface AppUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
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

type AssignmentStatus = "not_started" | "in_progress" | "submitted";
type GroupStatus = "active" | "completed" | "archived";

interface Assignment {
  id: string;
  type: "individual" | "group";
  status: AssignmentStatus;
  maxScore: number;
  caseStudy: string;

  // IMPORTANT: keep ids so we can show correct analytics + group scoring.
  candidateId?: string | null;
  groupId?: string | null;

  // Convenience display fields
  candidateName?: string;
  groupName?: string;

  currentScore?: number;
  lastUpdated?: Date;
  dueDate?: Date;

  notes?: string; // assessor notes from assessment
  scores?: Record<string, number>; // criteria scores from assessment
}

interface GroupData {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  caseStudy: string;
  status: GroupStatus;
  createdDate: Date;
  targetScore?: number;
  notes?: string;
}

type CandidateStatus = "not_started" | "in_progress" | "completed";

interface CandidateUI {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;

  overallScore: number;
  criteriaScores: Record<string, number>;
  status: CandidateStatus;
  timeSpent: number;
  caseStudy: string;

  // keep extras your analytics/report UI expects
  redFlags: string[];
  submissionDate?: Date;

  // NEW: store assessor notes so analytics summary can use it
  assessorNotes?: string;
}

// --- Criteria keys used by your analytics heatmap component
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

const emptyCriteriaScores = () =>
  CRITERIA_KEYS.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as Record<string, number>);

/**
 * Your scorer page might save `scores` with different keys depending on implementation.
 * This normalizes whatever comes back from Supabase into the exact keys the heatmap expects.
 */
function normalizeScores(input: any): Record<string, number> {
  const base = emptyCriteriaScores();
  if (!input || typeof input !== "object") return base;

  // Common aliases (add more if your scoring page uses different keys)
  const aliases: Record<string, (typeof CRITERIA_KEYS)[number]> = {
    strategicThinking: "strategic-thinking",
    strategic_thinking: "strategic-thinking",
    strategic: "strategic-thinking",

    problemSolving: "problem-solving",
    problem_solving: "problem-solving",

    decisionMaking: "decision-making",
    decision_making: "decision-making",

    emotionalIntelligence: "emotional-intelligence",
    emotional_intelligence: "emotional-intelligence",

    digitalFluency: "digital-fluency",
    digital_fluency: "digital-fluency",
  };

  for (const [rawKey, rawVal] of Object.entries(input)) {
    const key =
      (CRITERIA_KEYS as readonly string[]).includes(rawKey)
        ? (rawKey as (typeof CRITERIA_KEYS)[number])
        : aliases[rawKey];

    if (!key) continue;

    const num = typeof rawVal === "number" ? rawVal : Number(rawVal);
    base[key] = Number.isFinite(num) ? num : 0;
  }

  return base;
}

function safeDate(v: any): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default function App() {
  // ---------- AUTH ----------
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------- APP STATE ----------
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showHelp, setShowHelp] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);

  // ---------- DATA ----------
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);

  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [candidates, setCandidates] = useState<CandidateUI[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [deletedCandidates, setDeletedCandidates] = useState<any[]>([]);

  // =========================
  // AUTH HELPERS
  // =========================
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
    let mounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user ?? null;
        if (!mounted) return;

        if (sessionUser) {
          setUser(sessionUser);
          await fetchAndSetProfile(sessionUser);
        } else {
          setUser(null);
          setAppUser(null);
        }
      } catch (e) {
        console.error("Error initializing session:", e);
        if (!mounted) return;
        setUser(null);
        setAppUser(null);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      if (!mounted) return;

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
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchAndSetProfile]);

  // =========================
  // ONLINE/OFFLINE
  // =========================
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

  // =========================
  // DATA LOADING
  // =========================
  const loadData = useCallback(async () => {
    if (!appUser) return;

    setIsLoadingData(true);
    try {
      // 1) Events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("Error loading events:", eventsError);
        if (appUser.role === "admin") setShowInitDialog(true);
        return;
      }

      setAvailableEvents(events || []);
      const activeEvent = (events || []).find((e: any) => e.status === "active") || (events || [])[0];

      if (activeEvent) {
        setCurrentEvent(activeEvent);
        await loadEventData(activeEvent.id);
      } else if (appUser.role === "admin") {
        setShowInitDialog(true);
      }

      // 2) Case studies
      const { data: studies, error: studiesError } = await supabase
        .from("case_studies")
        .select("*")
        .order("created_at", { ascending: false });

      if (!studiesError) setCaseStudies(studies || []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load data. You may need to initialize the system.");
      if (appUser.role === "admin") setShowInitDialog(true);
    } finally {
      setIsLoadingData(false);
    }
  }, [appUser]);

  /**
   * IMPORTANT FIX:
   * - We now load candidates + groups + assignments + assessments
   * - We merge assessment scores into candidate objects so analytics heatmap shows values
   * - We also store assessment notes on the candidate (so summaries can consider assessor notes)
   */
  const loadEventData = useCallback(
    async (eventId: string) => {
      if (!appUser) return;

      try {
        // --- Candidates
        const { data: cands, error: candsError } = await supabase
          .from("candidates")
          .select("*")
          .eq("event_id", eventId);

        if (candsError) console.error("Error loading candidates:", candsError);

        const baseCandidates: CandidateUI[] = (cands || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email || "",
          department: c.department || "",
          position: c.position || "",

          overallScore: 0,
          criteriaScores: emptyCriteriaScores(),
          status: "not_started",
          timeSpent: 0,
          caseStudy: c.case_study || c.caseStudy || "",

          redFlags: [],
          submissionDate: undefined,
          assessorNotes: "",
        }));

        // --- Groups
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
          status: (g.status || "active") as GroupStatus,
          createdDate: new Date(g.created_at),
          targetScore: g.target_score ?? 0,
          notes: g.notes ?? "",
        }));

        // --- Assignments for current assessor (dashboard & scoring)
        const { data: assigs, error: assigsError } = await supabase
          .from("assignments")
          .select(
            `
            *,
            candidate:candidates(*),
            group:groups(*),
            assessments:assessments(*)
          `
          )
          .eq("event_id", eventId)
          .eq("assessor_id", appUser.id);

        if (assigsError) console.error("Error loading assignments:", assigsError);

        const transformedAssignments: Assignment[] = (assigs || []).map((a: any) => {
          const assessment = Array.isArray(a.assessments) ? a.assessments[0] : a.assessments;
          const normalizedScores = normalizeScores(assessment?.scores);

          return {
            id: a.id,
            type: a.type,
            status: (a.status || "not_started") as AssignmentStatus,
            maxScore: 100,
            caseStudy: a.case_study || "",

            candidateId: a.candidate_id ?? a.candidate?.id ?? null,
            groupId: a.group_id ?? a.group?.id ?? null,

            candidateName: a.candidate?.name,
            groupName: a.group?.name,

            currentScore: assessment?.total_score ?? undefined,
            lastUpdated: safeDate(a.updated_at),
            dueDate: safeDate(a.due_date),

            notes: assessment?.notes ?? "",
            scores: normalizedScores,
          };
        });

        // --- Analytics merge:
        // We want candidates to show the latest SUBMITTED assessment (across assessors or just current assessor?).
        // If you want it across ALL assessors, remove the .eq('assessor_id', appUser.id) below.
        const { data: submittedRows, error: submittedError } = await supabase
          .from("assignments")
          .select(
            `
            id,
            type,
            status,
            case_study,
            candidate_id,
            assessor_id,
            updated_at,
            assessments:assessments(*)
          `
          )
          .eq("event_id", eventId)
          .eq("type", "individual")
          .eq("status", "submitted")
          // ✅ change this line depending on desired analytics behavior:
          // .eq("assessor_id", appUser.id);

        if (submittedError) console.error("Error loading submitted assessments:", submittedError);

        const latestByCandidate = new Map<string, any>();

        for (const row of submittedRows || []) {
          const candidateId = row.candidate_id;
          if (!candidateId) continue;

          const assessment = Array.isArray(row.assessments) ? row.assessments[0] : row.assessments;
          if (!assessment) continue;

          const rowUpdated = new Date(row.updated_at || assessment.updated_at || assessment.submitted_at || 0).getTime();
          const prev = latestByCandidate.get(candidateId);
          const prevUpdated = prev?.__ts ?? -1;

          if (rowUpdated > prevUpdated) {
            latestByCandidate.set(candidateId, { ...assessment, __ts: rowUpdated, __caseStudy: row.case_study });
          }
        }

        const mergedCandidates: CandidateUI[] = baseCandidates.map((c) => {
          const latest = latestByCandidate.get(c.id);

          if (!latest) {
            // If not submitted, try to find an in-progress assignment for *this assessor* and show partial scores
            const inProg = transformedAssignments.find(
              (a) => a.type === "individual" && a.candidateId === c.id && a.status !== "not_started"
            );

            const status: CandidateStatus =
              inProg?.status === "submitted" ? "completed" : inProg?.status === "in_progress" ? "in_progress" : "not_started";

            return {
              ...c,
              status,
              overallScore: inProg?.currentScore ?? 0,
              criteriaScores: inProg?.scores ?? c.criteriaScores,
              assessorNotes: inProg?.notes ?? "",
              caseStudy: inProg?.caseStudy ?? c.caseStudy,
            };
          }

          const total = typeof latest.total_score === "number" ? latest.total_score : Number(latest.total_score) || 0;
          const scores = normalizeScores(latest.scores);
          const notes = latest.notes ?? "";

          return {
            ...c,
            status: "completed",
            overallScore: total,
            criteriaScores: scores,
            assessorNotes: notes,
            submissionDate: safeDate(latest.submitted_at),
            caseStudy: latest.__caseStudy ?? c.caseStudy,
          };
        });

        setCandidates(mergedCandidates);
        setGroups(transformedGroups);
        setAssignments(transformedAssignments);
      } catch (err) {
        console.error("Error loading event data:", err);
        toast.error("Failed to load event data");
      }
    },
    [appUser]
  );

  // Load data when authenticated
  useEffect(() => {
    if (!appUser) return;
    loadData();
  }, [appUser?.id, loadData]);

  // =========================
  // INIT DEMO
  // =========================
  const handleInitializeDemo = useCallback(async () => {
    try {
      if (!appUser) return;
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
        toast.error("Failed to create demo event: " + eventError.message);
        return;
      }

      const demoCandidates = [
        { name: "Alice Johnson", email: "alice@example.com", department: "Engineering", position: "Senior Developer" },
        { name: "Bob Smith", email: "bob@example.com", department: "Marketing", position: "Marketing Manager" },
        { name: "Carol Williams", email: "carol@example.com", department: "Sales", position: "Sales Lead" },
      ];

      await supabase.from("candidates").insert(demoCandidates.map((c) => ({ ...c, event_id: event.id })));

      const demoCaseStudies = [
        { title: "Strategic Leadership Challenge", description: "Evaluate leadership and strategic thinking capabilities", type: "individual", duration_minutes: 60 },
        { title: "Team Collaboration Scenario", description: "Assess teamwork and collaboration skills", type: "group", duration_minutes: 90 },
      ];

      await supabase.from("case_studies").insert(demoCaseStudies);

      toast.success("Demo data initialized successfully");
      setShowInitDialog(false);
      await loadData();
    } catch (err) {
      console.error("Error initializing demo:", err);
      toast.error("Failed to initialize demo data");
    } finally {
      setIsLoadingData(false);
    }
  }, [appUser, loadData]);

  // =========================
  // NAV / VIEW
  // =========================
  const handleBackToDashboard = useCallback(() => {
    setCurrentView("dashboard");
    setCurrentAssignment(null);
  }, []);

  const handleEventChange = useCallback(
    async (eventId: string) => {
      const event = availableEvents.find((e) => e.id === eventId);
      if (!event) return;
      setCurrentEvent(event);
      await loadEventData(eventId);
      toast.success("Event switched successfully");
    },
    [availableEvents, loadEventData]
  );

  const handleShowHelp = useCallback(() => setShowHelp(true), []);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAppUser(null);
      setCurrentView("dashboard");
      setCurrentAssignment(null);
      setIsSignedOut(true);
      toast.success("Signed out successfully");
    } catch (err) {
      console.error("Error signing out:", err);
      toast.error("Failed to sign out");
    }
  }, []);

  // =========================
  // ASSIGNMENT START/RESUME
  // =========================
  const handleStartAssessment = useCallback(
    (assignmentId: string) => {
      const a = assignments.find((x) => x.id === assignmentId);
      if (!a) return;

      setCurrentAssignment(a);
      setCurrentView(a.type === "individual" ? "individual-scoring" : "group-scoring");
    },
    [assignments]
  );

  const handleResumeAssessment = useCallback(
    (assignmentId: string) => {
      handleStartAssessment(assignmentId);
    },
    [handleStartAssessment]
  );

  // =========================
  // SAVE / SUBMIT / REOPEN (Supabase)
  // =========================
  const upsertAssessment = useCallback(async (payload: any, submitted: boolean) => {
    // payload expected from your scoring pages:
    // { assignmentId, totalScore, performanceBand, notes, scores }
    const assignmentId = payload.assignmentId;
    if (!assignmentId) throw new Error("Missing assignmentId");

    const scores = payload.scores || {};
    const normalizedScores = normalizeScores(scores);

    // Check existing
    const { data: existing, error: existingErr } = await supabase
      .from("assessments")
      .select("id")
      .eq("assignment_id", assignmentId)
      .maybeSingle();

    if (existingErr) {
      console.error("Error checking existing assessment:", existingErr);
      throw existingErr;
    }

    const assessmentRow = {
      assignment_id: assignmentId,
      scores: normalizedScores,
      notes: payload.notes || "",
      total_score: payload.totalScore || 0,
      performance_band: payload.performanceBand || "",
      submitted,
      submitted_at: submitted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase.from("assessments").update(assessmentRow).eq("assignment_id", assignmentId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("assessments").insert(assessmentRow);
      if (error) throw error;
    }

    // Update assignment status
    const nextStatus: AssignmentStatus = submitted ? "submitted" : "in_progress";
    const { error: aErr } = await supabase
      .from("assignments")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", assignmentId);

    if (aErr) throw aErr;

    // Update local state
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: nextStatus,
              currentScore: payload.totalScore,
              lastUpdated: new Date(),
              notes: payload.notes || a.notes,
              scores: normalizedScores,
            }
          : a
      )
    );

    setCurrentAssignment((prev) =>
      prev?.id === assignmentId
        ? {
            ...prev,
            status: nextStatus,
            currentScore: payload.totalScore,
            lastUpdated: new Date(),
            notes: payload.notes || prev.notes,
            scores: normalizedScores,
          }
        : prev
    );

    // 🔥 IMPORTANT: refresh event data so analytics immediately shows updated heatmap/values
    if (currentEvent?.id) {
      await loadEventData(currentEvent.id);
    }

    return true;
  }, [currentEvent?.id, loadEventData]);

  const handleSaveAssessment = useCallback(
    async (data: any) => {
      try {
        await upsertAssessment(data, false);
        toast.success("Assessment saved successfully");
        return true;
      } catch (err) {
        console.error("Error saving assessment:", err);
        toast.error("Failed to save assessment");
        throw err;
      }
    },
    [upsertAssessment]
  );

  const handleSubmitAssessment = useCallback(
    async (data: any) => {
      try {
        await upsertAssessment(data, true);
        toast.success("Assessment submitted successfully");
        return true;
      } catch (err) {
        console.error("Error submitting assessment:", err);
        toast.error("Failed to submit assessment");
        throw err;
      }
    },
    [upsertAssessment]
  );

  const handleReopenAssessment = useCallback(
    async (assignmentId: string) => {
      try {
        await supabase
          .from("assignments")
          .update({ status: "in_progress", updated_at: new Date().toISOString() })
          .eq("id", assignmentId);

        await supabase
          .from("assessments")
          .update({ submitted: false, updated_at: new Date().toISOString(), submitted_at: null })
          .eq("assignment_id", assignmentId);

        setAssignments((prev) =>
          prev.map((a) => (a.id === assignmentId ? { ...a, status: "in_progress", lastUpdated: new Date() } : a))
        );
        setCurrentAssignment((prev) =>
          prev?.id === assignmentId ? { ...prev, status: "in_progress", lastUpdated: new Date() } : prev
        );

        if (currentEvent?.id) await loadEventData(currentEvent.id);

        toast.success("Assessment reopened for editing");
        return true;
      } catch (err) {
        console.error("Error reopening assessment:", err);
        toast.error("Failed to reopen assessment");
        throw err;
      }
    },
    [currentEvent?.id, loadEventData]
  );

  // =========================
  // CANDIDATES CRUD
  // =========================
  const handleAddCandidate = useCallback(
    async (candidateData: any) => {
      if (!currentEvent) return toast.error("No active event");

      try {
        const { data: candidate, error } = await supabase
          .from("candidates")
          .insert({
            event_id: currentEvent.id,
            name: candidateData.name,
            email: candidateData.email || "",
            department: candidateData.department || "",
            position: candidateData.position || "",
            case_study: candidateData.caseStudy || "",
          })
          .select()
          .single();

        if (error) throw error;

        const newCandidate: CandidateUI = {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email || "",
          department: candidate.department || "",
          position: candidate.position || "",

          overallScore: 0,
          criteriaScores: emptyCriteriaScores(),
          status: "not_started",
          timeSpent: 0,
          caseStudy: candidate.case_study || candidateData.caseStudy || "",
          redFlags: [],
          submissionDate: undefined,
          assessorNotes: "",
        };

        setCandidates((prev) => [...prev, newCandidate]);
        toast.success(`Candidate ${candidateData.name} added successfully`);
      } catch (err) {
        console.error("Error adding candidate:", err);
        toast.error("Failed to add candidate");
      }
    },
    [currentEvent]
  );

  const handleUpdateCandidate = useCallback(async (id: string, candidateData: any) => {
    try {
      const { error } = await supabase.from("candidates").update(candidateData).eq("id", id);
      if (error) throw error;

      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...candidateData } : c)));
      toast.success("Candidate updated successfully");
    } catch (err) {
      console.error("Error updating candidate:", err);
      toast.error("Failed to update candidate");
    }
  }, []);

  const handleDeleteCandidate = useCallback(
    async (id: string) => {
      try {
        const candidateToDelete = candidates.find((c) => c.id === id);
        if (!candidateToDelete) return;

        const { error } = await supabase.from("candidates").delete().eq("id", id);
        if (error) throw error;

        setDeletedCandidates((prev) => [...prev, { ...candidateToDelete, deletedAt: new Date(), originalId: id }]);
        setCandidates((prev) => prev.filter((c) => c.id !== id));
        setGroups((prev) => prev.map((g) => ({ ...g, memberIds: g.memberIds.filter((mid) => mid !== id) })));

        toast.success("Candidate deleted");
      } catch (err) {
        console.error("Error deleting candidate:", err);
        toast.error("Failed to delete candidate");
      }
    },
    [candidates]
  );

  const handleRestoreCandidate = useCallback(
    async (originalId: string) => {
      const candidateToRestore = deletedCandidates.find((c: any) => c.originalId === originalId);
      if (!candidateToRestore) return;

      const { deletedAt, originalId: _, ...restoredCandidate } = candidateToRestore;
      setCandidates((prev) => [...prev, restoredCandidate]);
      setDeletedCandidates((prev) => prev.filter((c: any) => c.originalId !== originalId));
      toast.success("Candidate restored successfully");
    },
    [deletedCandidates]
  );

  const handlePermanentlyDeleteCandidate = useCallback((originalId: string) => {
    setDeletedCandidates((prev) => prev.filter((c: any) => c.originalId !== originalId));
    toast.success("Candidate permanently deleted");
  }, []);

  // =========================
  // GROUPS CRUD
  // =========================
  const handleAddGroup = useCallback(
    async (groupData: any) => {
      if (!currentEvent) return toast.error("No active event");

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
          targetScore: groupData.targetScore ?? 0,
          notes: groupData.notes ?? "",
        };

        setGroups((prev) => [...prev, newGroup]);
        toast.success(`Group ${groupData.name} created successfully`);
      } catch (err) {
        console.error("Error adding group:", err);
        toast.error("Failed to create group");
      }
    },
    [currentEvent]
  );

  const handleUpdateGroup = useCallback(async (id: string, groupData: any) => {
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
    } catch (err) {
      console.error("Error updating group:", err);
      toast.error("Failed to update group");
    }
  }, []);

  const handleDeleteGroup = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) throw error;

      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Group deleted successfully");
    } catch (err) {
      console.error("Error deleting group:", err);
      toast.error("Failed to delete group");
    }
  }, []);

  // =========================
  // CASE STUDIES CRUD
  // =========================
  const handleUpdateCaseStudy = useCallback(async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from("case_studies")
        .update({
          name: updates.name,
          description: updates.description,
        })
        .eq("id", id);

      if (error) throw error;

      setCaseStudies((prev) => prev.map((cs: any) => (cs.id === id ? { ...cs, ...updates } : cs)));
      toast.success("Case study updated successfully");
    } catch (err) {
      console.error("Error updating case study:", err);
      toast.error("Failed to update case study");
    }
  }, []);

  const handleAddCaseStudy = useCallback(async (caseStudyData: any) => {
    try {
      const { data: caseStudy, error } = await supabase.from("case_studies").insert(caseStudyData).select().single();
      if (error) throw error;

      setCaseStudies((prev) => [...prev, caseStudy]);
      toast.success("Case study added successfully");
    } catch (err) {
      console.error("Error adding case study:", err);
      toast.error("Failed to add case study");
    }
  }, []);

  const handleDeleteCaseStudy = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("case_studies").delete().eq("id", id);
      if (error) throw error;

      setCaseStudies((prev) => prev.filter((cs: any) => cs.id !== id));
      toast.success("Case study deleted successfully");
    } catch (err) {
      console.error("Error deleting case study:", err);
      toast.error("Failed to delete case study");
    }
  }, []);

  // =========================
  // QUICK LAUNCHER -> CREATE ASSIGNMENTS
  // =========================
  const handleStartIndividualAssessment = useCallback(
    async (candidateName: string, caseStudy: string, isNewCandidate: boolean) => {
      if (!currentEvent || !appUser) return toast.error("No active event or user");

      let candidateId = candidates.find((c) => c.name === candidateName)?.id;

      if (isNewCandidate) {
        const { data: candidate, error } = await supabase
          .from("candidates")
          .insert({
            event_id: currentEvent.id,
            name: candidateName,
            email: "",
            department: "",
            position: "",
            case_study: caseStudy,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating candidate:", error);
          toast.error("Failed to create candidate");
          return;
        }

        candidateId = candidate.id;

        setCandidates((prev) => [
          ...prev,
          {
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
            assessorNotes: "",
          },
        ]);
      }

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

      if (error) {
        console.error("Error creating assignment:", error);
        toast.error("Failed to create assignment");
        return;
      }

      const newAssignment: Assignment = {
        id: assignment.id,
        type: "individual",
        status: "not_started",
        maxScore: 100,
        caseStudy,
        candidateId,
        candidateName,
      };

      setAssignments((prev) => [...prev, newAssignment]);
      setCurrentAssignment(newAssignment);
      setCurrentView("individual-scoring");

      toast.success(isNewCandidate ? `Starting assessment for new candidate: ${candidateName}` : `Starting assessment for: ${candidateName}`);
    },
    [appUser, candidates, currentEvent]
  );

  const handleStartGroupAssessment = useCallback(
    async (groupId: string, caseStudy: string) => {
      if (!currentEvent || !appUser) return toast.error("No active event or user");

      const group = groups.find((g) => g.id === groupId);
      if (!group) return toast.error("Group not found");

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

      if (error) {
        console.error("Error creating assignment:", error);
        toast.error("Failed to create assignment");
        return;
      }

      const newAssignment: Assignment = {
        id: assignment.id,
        type: "group",
        status: "not_started",
        maxScore: 100,
        caseStudy,
        groupId,
        groupName: group.name,
      };

      setAssignments((prev) => [...prev, newAssignment]);
      setCurrentAssignment(newAssignment);
      setCurrentView("group-scoring");

      toast.success(`Starting group assessment for: ${group.name}`);
    },
    [appUser, currentEvent, groups]
  );

  // =========================
  // DERIVED HELPERS
  // =========================
  const currentGroupMembers = useMemo(() => {
    const gid = currentAssignment?.groupId;
    if (!gid) return [];
    const g = groups.find((x) => x.id === gid);
    if (!g) return [];
    return g.memberIds.map((id) => {
      const c = candidates.find((x) => x.id === id);
      return c ? { id: c.id, name: c.name } : { id, name: "Unknown" };
    });
  }, [candidates, currentAssignment?.groupId, groups]);

  // =========================
  // RENDER
  // =========================
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
                    onClick={() => setCurrentView("management")}
                    className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                  >
                    <span className="font-semibold">Candidate Management</span>
                  </button>

                  <button
                    onClick={() => setCurrentView("analytics")}
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
            candidateId={currentAssignment.candidateId || candidates.find((c) => c.name === currentAssignment.candidateName)?.id}
            candidateName={currentAssignment.candidateName || "Candidate"}
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
            members={currentGroupMembers}
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
            // ✅ candidates now carry real scores + notes from latest submitted assessment
            candidates={candidates.map((c) => ({
              ...c,
              // CandidateAnalytics expects Date object sometimes; we already store Date
              submissionDate: c.submissionDate,
              // If your analytics wants to consider notes, it can read:
              // (candidate as any).assessorNotes
            }))}
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

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} userRole={appUser.role} />

      <AddCandidateModal
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        onAddCandidate={handleAddCandidate}
      />

      <Toaster />
    </div>
  );
}
