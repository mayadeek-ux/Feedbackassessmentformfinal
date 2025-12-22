// src/App.tsx
import { useState, useEffect, useCallback } from "react";
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
import { supabase } from "./lib/supabase";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface AppUser {
  id: string;
  email: string;
  role: "assessor" | "admin";
  name?: string;
}

interface Assignment {
  id: string;
  type: "individual" | "group";
  candidateName?: string;
  groupName?: string;
  status: "not_started" | "in_progress" | "submitted";
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showHelp, setShowHelp] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);

  // Data state
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [deletedCandidates, setDeletedCandidates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // ---------- AUTH HELPERS ----------
  // FIXED: Use session user data directly instead of calling Edge Function
  const fetchAndSetProfile = useCallback(async (sessionUser: User) => {
    const role = sessionUser.user_metadata?.role || 'assessor';
    setAppUser({
      id: sessionUser.id,
      email: sessionUser.email ?? '',
      role: role === 'admin' ? 'admin' : 'assessor',
      name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
    });
  }, []);

  // Robust auth initialization + listener
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

  // Load data when user is authenticated
  useEffect(() => {
    if (appUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser?.id]);

  // FIXED: Load data directly from Supabase instead of Edge Functions
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // Load events directly from Supabase
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Error loading events:', eventsError);
        // If no events table or error, show init dialog for admin
        if (appUser?.role === 'admin') {
          setShowInitDialog(true);
        }
        setIsLoadingData(false);
        return;
      }

      setAvailableEvents(events || []);

      const activeEvent = events?.find((e: any) => e.status === 'active') || events?.[0];
      if (activeEvent) {
        setCurrentEvent(activeEvent);
        await loadEventData(activeEvent.id);
      } else if (appUser?.role === 'admin') {
        setShowInitDialog(true);
      }

      // Load case studies directly from Supabase
      const { data: studies, error: studiesError } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (!studiesError) {
        setCaseStudies(studies || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. You may need to initialize the system.");
      if (appUser?.role === 'admin') setShowInitDialog(true);
    } finally {
      setIsLoadingData(false);
    }
  };

  // FIXED: Load event data directly from Supabase
  const loadEventData = async (eventId: string) => {
    try {
      // Load candidates
      const { data: cands, error: candsError } = await supabase
        .from('candidates')
        .select('*')
        .eq('event_id', eventId);

      if (candsError) {
        console.error('Error loading candidates:', candsError);
      }

      const transformedCandidates = (cands || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email || "",
        department: c.department || "",
        position: c.position || "",
        overallScore: 0,
        criteriaScores: {
          "strategic-thinking": 0,
          leadership: 0,
          communication: 0,
          innovation: 0,
          "problem-solving": 0,
          collaboration: 0,
          adaptability: 0,
          "decision-making": 0,
          "emotional-intelligence": 0,
          "digital-fluency": 0,
        },
        status: "not_started" as const,
        timeSpent: 0,
        caseStudy: "",
        redFlags: [],
        submissionDate: undefined,
      }));

      setCandidates(transformedCandidates);

      // Load groups
      const { data: grps, error: grpsError } = await supabase
        .from('groups')
        .select('*')
        .eq('event_id', eventId);

      if (grpsError) {
        console.error('Error loading groups:', grpsError);
      }

      const transformedGroups = (grps || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description || "",
        memberIds: g.member_ids || [],
        caseStudy: g.case_study || "",
        status: (g.status || "active") as GroupData["status"],
        createdDate: new Date(g.created_at),
        targetScore: 0,
        notes: "",
      }));
      setGroups(transformedGroups);

      // Load assignments for current user
      if (appUser) {
        const { data: assigs, error: assigsError } = await supabase
          .from('assignments')
          .select(`
            *,
            candidate:candidates(*),
            group:groups(*),
            assessment:assessments(*)
          `)
          .eq('event_id', eventId)
          .eq('assessor_id', appUser.id);

        if (assigsError) {
          console.error('Error loading assignments:', assigsError);
        }

        const transformedAssignments = (assigs || []).map((a: any) => ({
          id: a.id,
          type: a.type,
          candidateName: a.candidate?.name,
          groupName: a.group?.name,
          status: a.status || 'not_started',
          currentScore: a.assessment?.[0]?.total_score,
          maxScore: 100,
          lastUpdated: a.updated_at ? new Date(a.updated_at) : undefined,
          dueDate: a.due_date ? new Date(a.due_date) : undefined,
          caseStudy: a.case_study || '',
          notes: a.assessment?.[0]?.notes,
        }));

        setAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Failed to load event data");
    }
  };

  // FIXED: Initialize demo data directly via Supabase
  const handleInitializeDemo = async () => {
    try {
      setIsLoadingData(true);
      
      // Create a demo event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          name: 'Demo Assessment Event',
          description: 'A demo event for testing the assessment platform',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (eventError) {
        console.error('Error creating demo event:', eventError);
        toast.error('Failed to create demo event: ' + eventError.message);
        return;
      }

      // Create demo candidates
      const demoCandidates = [
        { name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering', position: 'Senior Developer' },
        { name: 'Bob Smith', email: 'bob@example.com', department: 'Marketing', position: 'Marketing Manager' },
        { name: 'Carol Williams', email: 'carol@example.com', department: 'Sales', position: 'Sales Lead' },
      ];

      const { error: candsError } = await supabase
        .from('candidates')
        .insert(demoCandidates.map(c => ({ ...c, event_id: event.id })));

      if (candsError) {
        console.error('Error creating demo candidates:', candsError);
      }

      // Create demo case studies
      const demoCaseStudies = [
        { 
          title: 'Strategic Leadership Challenge', 
          description: 'Evaluate leadership and strategic thinking capabilities',
          type: 'individual',
          duration_minutes: 60,
        },
        { 
          title: 'Team Collaboration Scenario', 
          description: 'Assess teamwork and collaboration skills',
          type: 'group',
          duration_minutes: 90,
        },
      ];

      const { error: csError } = await supabase
        .from('case_studies')
        .insert(demoCaseStudies);

      if (csError) {
        console.error('Error creating demo case studies:', csError);
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

  // Online/offline status monitoring
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

  const handleStartAssessment = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      setCurrentAssignment(assignment);
      setCurrentView(assignment.type === "individual" ? "individual-scoring" : "group-scoring");
    }
  };

  const handleResumeAssessment = (assignmentId: string) => {
    handleStartAssessment(assignmentId);
  };

  // FIXED: Save assessment directly to Supabase
  const handleSaveAssessment = async (data: any) => {
    try {
      // Check if assessment exists
      const { data: existing } = await supabase
        .from('assessments')
        .select('id')
        .eq('assignment_id', data.assignmentId)
        .single();

      if (existing) {
        // Update existing
        await supabase
          .from('assessments')
          .update({
            scores: data.scores || {},
            notes: data.notes || '',
            total_score: data.totalScore || 0,
            performance_band: data.performanceBand || '',
            submitted: false,
            updated_at: new Date().toISOString(),
          })
          .eq('assignment_id', data.assignmentId);
      } else {
        // Create new
        await supabase
          .from('assessments')
          .insert({
            assignment_id: data.assignmentId,
            scores: data.scores || {},
            notes: data.notes || '',
            total_score: data.totalScore || 0,
            performance_band: data.performanceBand || '',
            submitted: false,
          });
      }

      // Update assignment status
      await supabase
        .from('assignments')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', data.assignmentId);

      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === data.assignmentId
            ? {
                ...assignment,
                status: "in_progress",
                currentScore: data.totalScore,
                lastUpdated: new Date(),
                notes: data.notes || assignment.notes,
              }
            : assignment
        )
      );

      if (currentAssignment?.id === data.assignmentId) {
        setCurrentAssignment((prev) =>
          prev
            ? {
                ...prev,
                status: "in_progress",
                currentScore: data.totalScore,
                lastUpdated: new Date(),
                notes: data.notes || prev.notes,
              }
            : null
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

  // FIXED: Submit assessment directly to Supabase
  const handleSubmitAssessment = async (data: any) => {
    try {
      // Check if assessment exists
      const { data: existing } = await supabase
        .from('assessments')
        .select('id')
        .eq('assignment_id', data.assignmentId)
        .single();

      if (existing) {
        // Update existing
        await supabase
          .from('assessments')
          .update({
            scores: data.scores || {},
            notes: data.notes || '',
            total_score: data.totalScore || 0,
            performance_band: data.performanceBand || '',
            submitted: true,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('assignment_id', data.assignmentId);
      } else {
        // Create new
        await supabase
          .from('assessments')
          .insert({
            assignment_id: data.assignmentId,
            scores: data.scores || {},
            notes: data.notes || '',
            total_score: data.totalScore || 0,
            performance_band: data.performanceBand || '',
            submitted: true,
            submitted_at: new Date().toISOString(),
          });
      }

      // Update assignment status
      await supabase
        .from('assignments')
        .update({ status: 'submitted', updated_at: new Date().toISOString() })
        .eq('id', data.assignmentId);

      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === data.assignmentId
            ? {
                ...assignment,
                status: "submitted",
                currentScore: data.totalScore,
                lastUpdated: new Date(),
                notes: data.notes || assignment.notes,
              }
            : assignment
        )
      );

      if (currentAssignment?.id === data.assignmentId) {
        setCurrentAssignment((prev) =>
          prev
            ? {
                ...prev,
                status: "submitted",
                currentScore: data.totalScore,
                lastUpdated: new Date(),
                notes: data.notes || prev.notes,
              }
            : null
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

  // FIXED: Reopen assessment directly via Supabase
  const handleReopenAssessment = async (assignmentId: string) => {
    try {
      await supabase
        .from('assignments')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', assignmentId);

      await supabase
        .from('assessments')
        .update({ submitted: false, updated_at: new Date().toISOString() })
        .eq('assignment_id', assignmentId);

      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? { ...assignment, status: "in_progress", lastUpdated: new Date() }
            : assignment
        )
      );

      if (currentAssignment?.id === assignmentId) {
        setCurrentAssignment((prev) =>
          prev ? { ...prev, status: "in_progress", lastUpdated: new Date() } : null
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

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setCurrentAssignment(null);
  };

  const handleEventChange = async (eventId: string) => {
    const event = availableEvents.find((e) => e.id === eventId);
    if (event) {
      setCurrentEvent(event);
      await loadEventData(eventId);
      toast.success("Event switched successfully");
    }
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

  // FIXED: Add candidate directly via Supabase
  const handleAddCandidate = async (candidateData: any) => {
    if (!currentEvent) {
      toast.error("No active event");
      return;
    }

    try {
      const { data: candidate, error } = await supabase
        .from('candidates')
        .insert({
          event_id: currentEvent.id,
          name: candidateData.name,
          email: candidateData.email || '',
          department: candidateData.department || '',
          position: candidateData.position || '',
        })
        .select()
        .single();

      if (error) throw error;

      const newCandidate = {
        id: candidate.id,
        name: candidate.name,
        overallScore: 0,
        criteriaScores: {
          "strategic-thinking": 0,
          leadership: 0,
          communication: 0,
          innovation: 0,
          "problem-solving": 0,
          collaboration: 0,
          adaptability: 0,
          "decision-making": 0,
          "emotional-intelligence": 0,
          "digital-fluency": 0,
        },
        status: "not_started" as const,
        timeSpent: 0,
        caseStudy: candidateData.caseStudy || "Strategic Leadership Challenge",
        redFlags: [],
        email: candidate.email || "",
        department: candidate.department || "",
        position: candidate.position || "",
        submissionDate: undefined,
      };

      setCandidates((prev) => [...prev, newCandidate]);
      toast.success(`Candidate ${candidateData.name} added successfully`);
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    }
  };

  // FIXED: Update candidate directly via Supabase
  const handleUpdateCandidate = async (id: string, candidateData: any) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update(candidateData)
        .eq('id', id);

      if (error) throw error;

      setCandidates((prev) => prev.map((c: any) => (c.id === id ? { ...c, ...candidateData } : c)));
      toast.success("Candidate updated successfully");
    } catch (error) {
      console.error("Error updating candidate:", error);
      toast.error("Failed to update candidate");
    }
  };

  // FIXED: Delete candidate directly via Supabase
  const handleDeleteCandidate = async (id: string) => {
    try {
      const candidateToDelete = candidates.find((c: any) => c.id === id);
      if (!candidateToDelete) return;

      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDeletedCandidates((prev) => [
        ...prev,
        { ...candidateToDelete, deletedAt: new Date(), originalId: id },
      ]);

      setCandidates((prev) => prev.filter((c: any) => c.id !== id));

      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          memberIds: group.memberIds.filter((memberId) => memberId !== id),
        }))
      );

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

  // FIXED: Add group directly via Supabase
  const handleAddGroup = async (groupData: any) => {
    if (!currentEvent) {
      toast.error("No active event");
      return;
    }

    try {
      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          event_id: currentEvent.id,
          name: groupData.name,
          description: groupData.description || '',
          member_ids: groupData.memberIds || [],
          case_study: groupData.caseStudy || '',
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

  // FIXED: Update group directly via Supabase
  const handleUpdateGroup = async (id: string, groupData: any) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: groupData.name,
          description: groupData.description,
          member_ids: groupData.memberIds,
          case_study: groupData.caseStudy,
        })
        .eq('id', id);

      if (error) throw error;

      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...groupData } : g)));
      toast.success("Group updated successfully");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    }
  };

  // FIXED: Delete group directly via Supabase
  const handleDeleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleViewAnalytics = () => setCurrentView("analytics");
  const handleViewManagement = () => setCurrentView("management");

  // FIXED: Update case study directly via Supabase
  const handleUpdateCaseStudy = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setCaseStudies((prev) => prev.map((cs: any) => (cs.id === id ? { ...cs, ...updates } : cs)));
      toast.success("Case study updated successfully");
    } catch (error) {
      console.error("Error updating case study:", error);
      toast.error("Failed to update case study");
    }
  };

  // FIXED: Add case study directly via Supabase
  const handleAddCaseStudy = async (caseStudyData: any) => {
    try {
      const { data: caseStudy, error } = await supabase
        .from('case_studies')
        .insert(caseStudyData)
        .select()
        .single();

      if (error) throw error;

      setCaseStudies((prev) => [...prev, caseStudy]);
      toast.success("Case study added successfully");
    } catch (error) {
      console.error("Error adding case study:", error);
      toast.error("Failed to add case study");
    }
  };

  // FIXED: Delete case study directly via Supabase
  const handleDeleteCaseStudy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCaseStudies((prev) => prev.filter((cs: any) => cs.id !== id));
      toast.success("Case study deleted successfully");
    } catch (error) {
      console.error("Error deleting case study:", error);
      toast.error("Failed to delete case study");
    }
  };

  // FIXED: Start individual assessment directly via Supabase
  const handleStartIndividualAssessment = async (
    candidateName: string,
    caseStudy: string,
    isNewCandidate: boolean
  ) => {
    if (!currentEvent || !appUser) {
      toast.error("No active event or user");
      return;
    }

    let candidateId = candidates.find((c: any) => c.name === candidateName)?.id;

    if (isNewCandidate) {
      try {
        const { data: candidate, error } = await supabase
          .from('candidates')
          .insert({
            event_id: currentEvent.id,
            name: candidateName,
            email: '',
            department: '',
            position: '',
          })
          .select()
          .single();

        if (error) throw error;

        candidateId = candidate.id;

        const newCandidate = {
          id: candidate.id,
          name: candidateName,
          overallScore: 0,
          criteriaScores: {
            "strategic-thinking": 0,
            leadership: 0,
            communication: 0,
            innovation: 0,
            "problem-solving": 0,
            collaboration: 0,
            adaptability: 0,
            "decision-making": 0,
            "emotional-intelligence": 0,
            "digital-fluency": 0,
          },
          status: "not_started" as const,
          timeSpent: 0,
          caseStudy,
          redFlags: [],
          email: "",
          department: "",
          position: "",
          submissionDate: undefined,
        };

        setCandidates((prev) => [...prev, newCandidate]);
      } catch (error) {
        console.error("Error creating candidate:", error);
        toast.error("Failed to create candidate");
        return;
      }
    }

    try {
      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert({
          event_id: currentEvent.id,
          assessor_id: appUser.id,
          candidate_id: candidateId,
          type: 'individual',
          case_study: caseStudy,
          status: 'not_started',
        })
        .select()
        .single();

      if (error) throw error;

      const newAssignment: Assignment = {
        id: assignment.id,
        type: "individual",
        candidateName,
        status: "not_started",
        maxScore: 100,
        caseStudy,
      };

      setAssignments((prev) => [...prev, newAssignment]);
      setCurrentAssignment(newAssignment);
      setCurrentView("individual-scoring");

      toast.success(
        isNewCandidate
          ? `Starting assessment for new candidate: ${candidateName}`
          : `Starting assessment for: ${candidateName}`
      );
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    }
  };

  // FIXED: Start group assessment directly via Supabase
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
        .from('assignments')
        .insert({
          event_id: currentEvent.id,
          assessor_id: appUser.id,
          group_id: groupId,
          type: 'group',
          case_study: caseStudy,
          status: 'not_started',
        })
        .select()
        .single();

      if (error) throw error;

      const newAssignment: Assignment = {
        id: assignment.id,
        type: "group",
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
            <h2 className="text-2xl font-semibold gradient-text-premium">
              Loading Assessment Platform
            </h2>
            <p className="text-muted-foreground text-lg">
              Preparing your sophisticated experience...
            </p>
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
                It looks like this is a fresh installation. Would you like to initialize the system
                with demo data?
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
            candidateId={candidates.find((c: any) => c.name === currentAssignment.candidateName)?.id}
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
            groupId="group-1"
            groupName={currentAssignment.groupName!}
            assignmentId={currentAssignment.id}
            caseStudy={currentAssignment.caseStudy}
            members={
              groups
                .find((g) => g.id === "group-1")
                ?.memberIds.map((id) => {
                  const candidate = candidates.find((c: any) => c.id === id);
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

      <AddCandidateModal
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        onAddCandidate={handleAddCandidate}
      />

      <Toaster />
    </div>
  );
}