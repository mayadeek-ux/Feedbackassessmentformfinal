import { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { TopBar } from './components/layout/TopBar';
import { AssessorDashboard } from './components/dashboard/AssessorDashboard';
import { IndividualScoringPage } from './components/scoring/IndividualScoringPage';
import { GroupScoringPage } from './components/scoring/GroupScoringPage';
import { AdminPanel } from './components/admin/AdminPanel';
import { CaseStudyManager } from './components/admin/CaseStudyManager';
import { HelpModal } from './components/modals/HelpModal';
import { CandidateAnalytics } from './components/analytics/CandidateAnalytics';
import { CandidateGroupManager } from './components/management/CandidateGroupManager';
import { AddCandidateModal } from './components/modals/AddCandidateModal';
import { QuickAssessmentLauncher } from './components/assessment/QuickAssessmentLauncher';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabase';
import { toast } from 'sonner@2.0.3';
import type { User } from '@supabase/supabase-js';
import { 
  userAPI, 
  eventAPI, 
  candidateAPI, 
  assignmentAPI, 
  assessmentAPI, 
  groupAPI, 
  caseStudyAPI,
  initAPI 
} from './lib/api';

interface AppUser {
  id: string;
  email: string;
  role: 'assessor' | 'admin';
  name?: string;
}

interface Assignment {
  id: string;
  type: 'individual' | 'group';
  candidateName?: string;
  groupName?: string;
  status: 'not_started' | 'in_progress' | 'submitted';
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
  status: 'active' | 'completed' | 'archived';
  createdDate: Date;
  targetScore?: number;
  notes?: string;
}

type AppView = 'dashboard' | 'individual-scoring' | 'group-scoring' | 'admin' | 'analytics' | 'management' | 'case-studies' | 'new-assessment';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showHelp, setShowHelp] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);

  // Data state from API
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [deletedCandidates, setDeletedCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Auth state monitoring
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user profile from KV store via API
        try {
          const { user: profile } = await userAPI.getProfile();
          setAppUser({
            id: profile.id,
            email: profile.email,
            role: profile.role === 'admin' ? 'admin' : 'assessor',
            name: profile.name || undefined
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Set default user profile
          setAppUser({
            id: session.user.id,
            email: session.user.email!,
            role: 'assessor',
            name: session.user.email?.split('@')[0]
          });
        }
      } else {
        setUser(null);
        setAppUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (appUser) {
      loadData();
    }
  }, [appUser]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // Load events
      const { events } = await eventAPI.getAll();
      setAvailableEvents(events || []);
      
      // Set current event (first active event or first event)
      const activeEvent = events?.find((e: any) => e.status === 'active') || events?.[0];
      if (activeEvent) {
        setCurrentEvent(activeEvent);
        
        // Load event-specific data
        await loadEventData(activeEvent.id);
      } else if (appUser.role === 'admin') {
        // If no events exist and user is admin, show init dialog
        setShowInitDialog(true);
      }

      // Load case studies
      const { caseStudies: studies } = await caseStudyAPI.getAll();
      setCaseStudies(studies || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data. You may need to initialize the system.');
      if (appUser?.role === 'admin') {
        setShowInitDialog(true);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadEventData = async (eventId: string) => {
    try {
      // Load candidates
      const { candidates: cands } = await candidateAPI.getByEvent(eventId);
      
      // Transform candidates to match expected format
      const transformedCandidates = (cands || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        department: c.department || '',
        position: c.position || '',
        overallScore: 0,
        criteriaScores: {
          'strategic-thinking': 0,
          'leadership': 0,
          'communication': 0,
          'innovation': 0,
          'problem-solving': 0,
          'collaboration': 0,
          'adaptability': 0,
          'decision-making': 0,
          'emotional-intelligence': 0,
          'digital-fluency': 0
        },
        status: 'not_started' as const,
        timeSpent: 0,
        caseStudy: '',
        redFlags: [],
        submissionDate: undefined
      }));
      
      setCandidates(transformedCandidates);

      // Load groups
      const { groups: grps } = await groupAPI.getByEvent(eventId);
      const transformedGroups = (grps || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        memberIds: g.member_ids || [],
        caseStudy: g.case_study || '',
        status: g.status || 'active',
        createdDate: new Date(g.created_at),
        targetScore: 0,
        notes: ''
      }));
      setGroups(transformedGroups);

      // Load assignments for current user
      if (appUser) {
        const { assignments: assigs } = await assignmentAPI.getByAssessor(eventId, appUser.id);
        
        // Transform assignments to match expected format
        const transformedAssignments = (assigs || []).map((a: any) => ({
          id: a.id,
          type: a.type,
          candidateName: a.candidate?.name,
          groupName: a.group?.name,
          status: a.status,
          currentScore: a.assessment?.total_score,
          maxScore: a.type === 'individual' ? 100 : 100,
          lastUpdated: a.updated_at ? new Date(a.updated_at) : undefined,
          dueDate: a.due_date ? new Date(a.due_date) : undefined,
          caseStudy: a.case_study,
          notes: a.assessment?.notes
        }));
        
        setAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error('Error loading event data:', error);
      toast.error('Failed to load event data');
    }
  };

  const handleInitializeDemo = async () => {
    try {
      setIsLoadingData(true);
      await initAPI.initDemo();
      toast.success('Demo data initialized successfully');
      setShowInitDialog(false);
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error initializing demo:', error);
      toast.error('Failed to initialize demo data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Online/offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline - some features may be limited');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleStartAssessment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setCurrentAssignment(assignment);
      if (assignment.type === 'individual') {
        setCurrentView('individual-scoring');
      } else {
        setCurrentView('group-scoring');
      }
    }
  };

  const handleResumeAssessment = (assignmentId: string) => {
    handleStartAssessment(assignmentId);
  };

  const handleSaveAssessment = async (data: any) => {
    console.log('Saving assessment:', data);
    
    try {
      // Save to API
      await assessmentAPI.save({
        assignment_id: data.assignmentId,
        scores: data.scores || {},
        notes: data.notes || '',
        total_score: data.totalScore || 0,
        performance_band: data.performanceBand || '',
        submitted: false
      });

      // Update local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === data.assignmentId 
          ? {
              ...assignment,
              status: 'in_progress',
              currentScore: data.totalScore,
              lastUpdated: new Date(),
              notes: data.notes || assignment.notes
            }
          : assignment
      ));

      if (currentAssignment && currentAssignment.id === data.assignmentId) {
        setCurrentAssignment(prev => prev ? {
          ...prev,
          status: 'in_progress',
          currentScore: data.totalScore,
          lastUpdated: new Date(),
          notes: data.notes || prev.notes
        } : null);
      }

      // Update candidate data for analytics
      if (currentAssignment?.candidateName) {
        setCandidates(prev => prev.map((candidate: any) => {
          if (candidate.name === currentAssignment.candidateName) {
            const criteriaScores = data.scores ? {
              'strategic-thinking': (data.scores['transformation'] || []).filter(Boolean).length,
              'leadership': (data.scores['leadership'] || []).filter(Boolean).length,
              'communication': (data.scores['communication'] || []).filter(Boolean).length,
              'innovation': (data.scores['innovation'] || []).filter(Boolean).length,
              'problem-solving': (data.scores['problem-solving'] || []).filter(Boolean).length,
              'collaboration': (data.scores['collaboration'] || []).filter(Boolean).length,
              'adaptability': (data.scores['future-skills'] || []).filter(Boolean).length,
              'decision-making': (data.scores['analytical'] || []).filter(Boolean).length,
              'emotional-intelligence': (data.scores['impact'] || []).filter(Boolean).length,
              'digital-fluency': (data.scores['ai-literacy'] || []).filter(Boolean).length
            } : candidate.criteriaScores;

            const totalScore = Object.values(criteriaScores).reduce((sum: number, score: any) => sum + score, 0);

            return {
              ...candidate,
              overallScore: totalScore,
              criteriaScores: criteriaScores,
              status: 'in_progress' as const,
              timeSpent: data.timeSpent || candidate.timeSpent,
              caseStudy: currentAssignment.caseStudy,
              redFlags: data.redFlags || candidate.redFlags
            };
          }
          return candidate;
        }));
      }
      
      toast.success('Assessment saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
      throw error;
    }
  };

  const handleSubmitAssessment = async (data: any) => {
    console.log('Submitting assessment:', data);
    
    try {
      // Submit to API
      await assessmentAPI.save({
        assignment_id: data.assignmentId,
        scores: data.scores || {},
        notes: data.notes || '',
        total_score: data.totalScore || 0,
        performance_band: data.performanceBand || '',
        submitted: true
      });

      // Update local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === data.assignmentId 
          ? {
              ...assignment,
              status: 'submitted',
              currentScore: data.totalScore,
              lastUpdated: new Date(),
              notes: data.notes || assignment.notes
            }
          : assignment
      ));

      if (currentAssignment && currentAssignment.id === data.assignmentId) {
        setCurrentAssignment(prev => prev ? {
          ...prev,
          status: 'submitted',
          currentScore: data.totalScore,
          lastUpdated: new Date(),
          notes: data.notes || prev.notes
        } : null);
      }

      // Update candidate data for analytics - FINAL SUBMISSION
      if (currentAssignment?.candidateName) {
        setCandidates(prev => prev.map((candidate: any) => {
          if (candidate.name === currentAssignment.candidateName) {
            const criteriaScores = data.scores ? {
              'strategic-thinking': (data.scores['transformation'] || []).filter(Boolean).length,
              'leadership': (data.scores['leadership'] || []).filter(Boolean).length,
              'communication': (data.scores['communication'] || []).filter(Boolean).length,
              'innovation': (data.scores['innovation'] || []).filter(Boolean).length,
              'problem-solving': (data.scores['problem-solving'] || []).filter(Boolean).length,
              'collaboration': (data.scores['collaboration'] || []).filter(Boolean).length,
              'adaptability': (data.scores['future-skills'] || []).filter(Boolean).length,
              'decision-making': (data.scores['analytical'] || []).filter(Boolean).length,
              'emotional-intelligence': (data.scores['impact'] || []).filter(Boolean).length,
              'digital-fluency': (data.scores['ai-literacy'] || []).filter(Boolean).length
            } : candidate.criteriaScores;

            const totalScore = data.totalScore || Object.values(criteriaScores).reduce((sum: number, score: any) => sum + score, 0);

            return {
              ...candidate,
              overallScore: totalScore,
              criteriaScores: criteriaScores,
              status: 'completed' as const,
              submissionDate: new Date(),
              timeSpent: data.timeSpent || candidate.timeSpent,
              caseStudy: currentAssignment.caseStudy,
              redFlags: data.redFlags || candidate.redFlags
            };
          }
          return candidate;
        }));
      }
      
      toast.success('Assessment submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
      throw error;
    }
  };

  const handleReopenAssessment = async (assignmentId: string) => {
    try {
      // Update assignment status
      await assignmentAPI.update(assignmentId, { status: 'in_progress' });

      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? {
              ...assignment,
              status: 'in_progress',
              lastUpdated: new Date()
            }
          : assignment
      ));

      if (currentAssignment && currentAssignment.id === assignmentId) {
        setCurrentAssignment(prev => prev ? {
          ...prev,
          status: 'in_progress',
          lastUpdated: new Date()
        } : null);
      }

      toast.success('Assessment reopened for editing');
      return true;
    } catch (error) {
      console.error('Error reopening assessment:', error);
      toast.error('Failed to reopen assessment');
      throw error;
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentAssignment(null);
  };

  const handleEventChange = async (eventId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    if (event) {
      setCurrentEvent(event);
      await loadEventData(eventId);
      toast.success('Event switched successfully');
    }
  };

  const handleShowHelp = () => {
    setShowHelp(true);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAppUser(null);
      setCurrentView('dashboard');
      setCurrentAssignment(null);
      setIsSignedOut(true);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleAddCandidate = async (candidateData: any) => {
    if (!currentEvent) {
      toast.error('No active event');
      return;
    }

    try {
      const { candidate } = await candidateAPI.create({
        event_id: currentEvent.id,
        name: candidateData.name,
        email: candidateData.email || '',
        department: candidateData.department || '',
        position: candidateData.position || ''
      });

      const newCandidate = {
        id: candidate.id,
        name: candidate.name,
        overallScore: 0,
        criteriaScores: {
          'strategic-thinking': 0,
          'leadership': 0,
          'communication': 0,
          'innovation': 0,
          'problem-solving': 0,
          'collaboration': 0,
          'adaptability': 0,
          'decision-making': 0,
          'emotional-intelligence': 0,
          'digital-fluency': 0
        },
        status: 'not_started' as const,
        timeSpent: 0,
        caseStudy: candidateData.caseStudy || 'Strategic Leadership Challenge',
        redFlags: [],
        email: candidate.email || '',
        department: candidate.department || '',
        position: candidate.position || '',
        submissionDate: undefined
      };
      
      setCandidates(prev => [...prev, newCandidate]);
      toast.success(`Candidate ${candidateData.name} added successfully`);
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
    }
  };

  const handleUpdateCandidate = async (id: string, candidateData: any) => {
    try {
      await candidateAPI.update(id, candidateData);
      setCandidates(prev => prev.map((candidate: any) => 
        candidate.id === id ? { ...candidate, ...candidateData } : candidate
      ));
      toast.success('Candidate updated successfully');
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      const candidateToDelete = candidates.find((candidate: any) => candidate.id === id);
      if (candidateToDelete) {
        await candidateAPI.delete(id);
        
        // Move to deleted candidates archive
        setDeletedCandidates(prev => [...prev, {
          ...candidateToDelete,
          deletedAt: new Date(),
          originalId: id
        }]);
        
        // Remove from active candidates
        setCandidates(prev => prev.filter((candidate: any) => candidate.id !== id));
        
        // Remove from any groups
        setGroups(prev => prev.map(group => ({
          ...group,
          memberIds: group.memberIds.filter(memberId => memberId !== id)
        })));
        
        toast.success('Candidate moved to archive');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleRestoreCandidate = async (originalId: string) => {
    const candidateToRestore = deletedCandidates.find((candidate: any) => candidate.originalId === originalId);
    if (candidateToRestore) {
      // In a real implementation, we'd restore via API
      // For now, just update local state
      const { deletedAt, originalId: _, ...restoredCandidate } = candidateToRestore;
      setCandidates(prev => [...prev, restoredCandidate]);
      setDeletedCandidates(prev => prev.filter((candidate: any) => candidate.originalId !== originalId));
      toast.success('Candidate restored successfully');
    }
  };

  const handlePermanentlyDeleteCandidate = (originalId: string) => {
    setDeletedCandidates(prev => prev.filter((candidate: any) => candidate.originalId !== originalId));
    toast.success('Candidate permanently deleted');
  };

  const handleAddGroup = async (groupData: any) => {
    if (!currentEvent) {
      toast.error('No active event');
      return;
    }

    try {
      const { group } = await groupAPI.create({
        event_id: currentEvent.id,
        name: groupData.name,
        description: groupData.description || '',
        member_ids: groupData.memberIds || [],
        case_study: groupData.caseStudy || ''
      });

      const newGroup = {
        id: group.id,
        name: group.name,
        description: group.description || '',
        memberIds: group.member_ids || [],
        caseStudy: group.case_study || '',
        status: 'active' as const,
        createdDate: new Date(group.created_at),
        targetScore: groupData.targetScore,
        notes: groupData.notes
      };
      
      setGroups(prev => [...prev, newGroup]);
      toast.success(`Group ${groupData.name} created successfully`);
    } catch (error) {
      console.error('Error adding group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleUpdateGroup = async (id: string, groupData: any) => {
    try {
      await groupAPI.update(id, {
        name: groupData.name,
        description: groupData.description,
        member_ids: groupData.memberIds,
        case_study: groupData.caseStudy
      });
      
      setGroups(prev => prev.map(group => 
        group.id === id ? { ...group, ...groupData } : group
      ));
      toast.success('Group updated successfully');
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await groupAPI.delete(id);
      setGroups(prev => prev.filter(group => group.id !== id));
      toast.success('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  const handleViewManagement = () => {
    setCurrentView('management');
  };

  const handleUpdateCaseStudy = async (id: string, updates: any) => {
    try {
      await caseStudyAPI.update(id, updates);
      setCaseStudies(prev => prev.map((cs: any) => 
        cs.id === id ? { ...cs, ...updates } : cs
      ));
      toast.success('Case study updated successfully');
    } catch (error) {
      console.error('Error updating case study:', error);
      toast.error('Failed to update case study');
    }
  };

  const handleAddCaseStudy = async (caseStudyData: any) => {
    try {
      const { caseStudy } = await caseStudyAPI.create(caseStudyData);
      setCaseStudies(prev => [...prev, caseStudy]);
      toast.success('Case study added successfully');
    } catch (error) {
      console.error('Error adding case study:', error);
      toast.error('Failed to add case study');
    }
  };

  const handleDeleteCaseStudy = async (id: string) => {
    try {
      await caseStudyAPI.delete(id);
      setCaseStudies(prev => prev.filter((cs: any) => cs.id !== id));
      toast.success('Case study deleted successfully');
    } catch (error) {
      console.error('Error deleting case study:', error);
      toast.error('Failed to delete case study');
    }
  };

  const handleStartIndividualAssessment = async (candidateName: string, caseStudy: string, isNewCandidate: boolean) => {
    if (!currentEvent || !appUser) {
      toast.error('No active event or user');
      return;
    }

    let candidateId = candidates.find((c: any) => c.name === candidateName)?.id;

    // If this is a new candidate, add them first
    if (isNewCandidate) {
      try {
        const { candidate } = await candidateAPI.create({
          event_id: currentEvent.id,
          name: candidateName,
          email: '',
          department: '',
          position: ''
        });

        candidateId = candidate.id;

        const newCandidate = {
          id: candidate.id,
          name: candidateName,
          overallScore: 0,
          criteriaScores: {
            'strategic-thinking': 0,
            'leadership': 0,
            'communication': 0,
            'innovation': 0,
            'problem-solving': 0,
            'collaboration': 0,
            'adaptability': 0,
            'decision-making': 0,
            'emotional-intelligence': 0,
            'digital-fluency': 0
          },
          status: 'not_started' as const,
          timeSpent: 0,
          caseStudy: caseStudy,
          redFlags: [],
          email: '',
          department: '',
          position: '',
          submissionDate: undefined
        };
        
        setCandidates(prev => [...prev, newCandidate]);
      } catch (error) {
        console.error('Error creating candidate:', error);
        toast.error('Failed to create candidate');
        return;
      }
    }

    // Create assignment
    try {
      const { assignment } = await assignmentAPI.create({
        event_id: currentEvent.id,
        assessor_id: appUser.id,
        candidate_id: candidateId,
        type: 'individual',
        case_study: caseStudy
      });

      const newAssignment: Assignment = {
        id: assignment.id,
        type: 'individual',
        candidateName: candidateName,
        status: 'not_started',
        maxScore: 100,
        caseStudy: caseStudy,
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      setCurrentAssignment(newAssignment);
      setCurrentView('individual-scoring');
      
      if (isNewCandidate) {
        toast.success(`Starting assessment for new candidate: ${candidateName}`);
      } else {
        toast.success(`Starting assessment for: ${candidateName}`);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleStartGroupAssessment = async (groupId: string, caseStudy: string) => {
    if (!currentEvent || !appUser) {
      toast.error('No active event or user');
      return;
    }

    const group = groups.find(g => g.id === groupId);
    if (!group) {
      toast.error('Group not found');
      return;
    }

    // Create assignment
    try {
      const { assignment } = await assignmentAPI.create({
        event_id: currentEvent.id,
        assessor_id: appUser.id,
        group_id: groupId,
        type: 'group',
        case_study: caseStudy
      });

      const newAssignment: Assignment = {
        id: assignment.id,
        type: 'group',
        groupName: group.name,
        status: 'not_started',
        maxScore: 100,
        caseStudy: caseStudy,
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      setCurrentAssignment(newAssignment);
      setCurrentView('group-scoring');
      toast.success(`Starting group assessment for: ${group.name}`);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

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
    return <LoginForm onSignIn={() => {
      setIsSignedOut(false);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 animate-fade-in">
      <TopBar
        user={appUser}
        currentEvent={currentEvent || { id: '', name: 'No Event' }}
        availableEvents={availableEvents}
        isOnline={isOnline}
        onEventChange={handleEventChange}
        onShowHelp={handleShowHelp}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto p-6">
        {/* Init Dialog for Admins */}
        {showInitDialog && appUser.role === 'admin' && (
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
                  {isLoadingData ? 'Initializing...' : 'Initialize Demo Data'}
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

        {/* Loading indicator */}
        {isLoadingData && (
          <div className="glass rounded-3xl p-6 card-shadow-xl mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading data...</span>
            </div>
          </div>
        )}

        {/* View Routing */}
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass rounded-3xl p-10 card-shadow-xl hover-lift">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold gradient-text-premium">
                    {appUser.role === 'admin' ? 'Executive Dashboard' : 'Assessment Console'}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {appUser.role === 'admin' 
                      ? 'Orchestrate comprehensive assessment operations and insights'
                      : 'Conduct sophisticated individual and group evaluations'
                    }
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentView('new-assessment')}
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
                  {appUser.role === 'admin' && (
                    <>
                      <button
                        onClick={() => setCurrentView('case-studies')}
                        className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                      >
                        <span className="font-semibold">Case Study Management</span>
                      </button>
                      <button
                        onClick={() => setCurrentView('admin')}
                        className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl hover:from-slate-800 hover:to-slate-900 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 card-shadow-lg hover:shadow-xl focus-elegant"
                      >
                        <span className="font-semibold">System Administration</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {appUser.role === 'assessor' ? (
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

        {currentView === 'individual-scoring' && currentAssignment && (
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
            isSubmitted={currentAssignment.status === 'submitted'}
          />
        )}

        {currentView === 'group-scoring' && currentAssignment && (
          <GroupScoringPage
            groupId="group-1"
            groupName={currentAssignment.groupName!}
            assignmentId={currentAssignment.id}
            caseStudy={currentAssignment.caseStudy}
            members={groups.find(g => g.id === 'group-1')?.memberIds.map(id => {
              const candidate = candidates.find((c: any) => c.id === id);
              return candidate ? { id: candidate.id, name: candidate.name } : { id, name: 'Unknown' };
            }) || []}
            onBack={handleBackToDashboard}
            onSave={handleSaveAssessment}
            onSubmit={handleSubmitAssessment}
            onReopen={handleReopenAssessment}
            isReadOnly={false}
            isSubmitted={currentAssignment.status === 'submitted'}
          />
        )}

        {currentView === 'analytics' && (
          <CandidateAnalytics 
            candidates={candidates}
            onAddCandidate={() => setShowAddCandidate(true)}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentView === 'management' && (
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

        {currentView === 'case-studies' && (
          <CaseStudyManager
            caseStudies={caseStudies}
            onUpdateCaseStudy={handleUpdateCaseStudy}
            onAddCaseStudy={handleAddCaseStudy}
            onDeleteCaseStudy={handleDeleteCaseStudy}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentView === 'new-assessment' && (
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

        {currentView === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Help Modal */}
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)}
        userRole={appUser?.role}
      />

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        onAddCandidate={handleAddCandidate}
      />

      <Toaster />
    </div>
  );
}
