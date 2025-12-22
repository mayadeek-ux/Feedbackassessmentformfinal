import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { 
  Calendar,
  Users,
  UserCheck,
  FileText,
  Target,
  List,
  Download,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed';
  start_date: string;
  end_date: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'assessor';
  created_at: string;
}

interface Candidate {
  id: string;
  event_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  created_at: string;
}

interface Group {
  id: string;
  event_id: string;
  name: string;
  description: string;
  member_ids: string[];
  case_study: string;
  status: string;
  created_at: string;
}

interface Assignment {
  id: string;
  event_id: string;
  assessor_id: string;
  candidate_id: string | null;
  group_id: string | null;
  type: 'individual' | 'group';
  case_study: string;
  status: 'not_started' | 'in_progress' | 'submitted';
  created_at: string;
}

interface CaseStudy {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// Custom Modal Component
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  description?: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);

  // Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  
  // Edit state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);

  // Form state
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'completed',
    start_date: '',
    end_date: ''
  });

  const [candidateForm, setCandidateForm] = useState({
    event_id: '',
    name: '',
    email: '',
    department: '',
    position: ''
  });

  const [groupForm, setGroupForm] = useState({
    event_id: '',
    name: '',
    description: '',
    case_study: ''
  });

  const [caseStudyForm, setCaseStudyForm] = useState({
    name: '',
    description: ''
  });

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadEvents(),
        loadUsers(),
        loadCandidates(),
        loadGroups(),
        loadAssignments(),
        loadCaseStudies()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load some data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading events:', error);
      return;
    }
    setEvents(data || []);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading users:', error);
      return;
    }
    setUsers(data || []);
  };

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading candidates:', error);
      return;
    }
    setCandidates(data || []);
  };

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading groups:', error);
      return;
    }
    setGroups(data || []);
  };

  const loadAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading assignments:', error);
      return;
    }
    setAssignments(data || []);
  };

  const loadCaseStudies = async () => {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading case studies:', error);
      return;
    }
    setCaseStudies(data || []);
  };

  // CRUD Operations for Events
  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            name: eventForm.name,
            description: eventForm.description,
            status: eventForm.status,
            start_date: eventForm.start_date,
            end_date: eventForm.end_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase
          .from('events')
          .insert({
            name: eventForm.name,
            description: eventForm.description,
            status: eventForm.status,
            start_date: eventForm.start_date,
            end_date: eventForm.end_date
          });

        if (error) throw error;
        toast.success('Event created successfully');
      }

      setShowEventModal(false);
      setEditingEvent(null);
      resetEventForm();
      loadEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all related candidates, groups, and assignments.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Event deleted successfully');
      loadEvents();
      loadCandidates();
      loadGroups();
      loadAssignments();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      description: event.description || '',
      status: event.status,
      start_date: event.start_date,
      end_date: event.end_date
    });
    setShowEventModal(true);
  };

  const resetEventForm = () => {
    setEventForm({
      name: '',
      description: '',
      status: 'upcoming',
      start_date: '',
      end_date: ''
    });
  };

  // CRUD Operations for Candidates
  const handleSaveCandidate = async () => {
    try {
      if (editingCandidate) {
        const { error } = await supabase
          .from('candidates')
          .update({
            name: candidateForm.name,
            email: candidateForm.email,
            department: candidateForm.department,
            position: candidateForm.position,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCandidate.id);

        if (error) throw error;
        toast.success('Candidate updated successfully');
      } else {
        const { error } = await supabase
          .from('candidates')
          .insert({
            event_id: candidateForm.event_id,
            name: candidateForm.name,
            email: candidateForm.email,
            department: candidateForm.department,
            position: candidateForm.position
          });

        if (error) throw error;
        toast.success('Candidate added successfully');
      }

      setShowCandidateModal(false);
      setEditingCandidate(null);
      resetCandidateForm();
      loadCandidates();
    } catch (error: any) {
      console.error('Error saving candidate:', error);
      toast.error(error.message || 'Failed to save candidate');
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Candidate deleted successfully');
      loadCandidates();
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast.error(error.message || 'Failed to delete candidate');
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      event_id: candidate.event_id,
      name: candidate.name,
      email: candidate.email || '',
      department: candidate.department || '',
      position: candidate.position || ''
    });
    setShowCandidateModal(true);
  };

  const resetCandidateForm = () => {
    setCandidateForm({
      event_id: events[0]?.id || '',
      name: '',
      email: '',
      department: '',
      position: ''
    });
  };

  // CRUD Operations for Groups/Teams
  const handleSaveGroup = async () => {
    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('groups')
          .update({
            name: groupForm.name,
            description: groupForm.description,
            case_study: groupForm.case_study,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGroup.id);

        if (error) throw error;
        toast.success('Team updated successfully');
      } else {
        const { error } = await supabase
          .from('groups')
          .insert({
            event_id: groupForm.event_id,
            name: groupForm.name,
            description: groupForm.description,
            case_study: groupForm.case_study,
            member_ids: []
          });

        if (error) throw error;
        toast.success('Team created successfully');
      }

      setShowGroupModal(false);
      setEditingGroup(null);
      resetGroupForm();
      loadGroups();
    } catch (error: any) {
      console.error('Error saving group:', error);
      toast.error(error.message || 'Failed to save team');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Team deleted successfully');
      loadGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupForm({
      event_id: group.event_id,
      name: group.name,
      description: group.description || '',
      case_study: group.case_study || ''
    });
    setShowGroupModal(true);
  };

  const resetGroupForm = () => {
    setGroupForm({
      event_id: events[0]?.id || '',
      name: '',
      description: '',
      case_study: ''
    });
  };

  // CRUD Operations for Case Studies
  const handleSaveCaseStudy = async () => {
    try {
      if (editingCaseStudy) {
        const { error } = await supabase
          .from('case_studies')
          .update({
            name: caseStudyForm.name,
            description: caseStudyForm.description
          })
          .eq('id', editingCaseStudy.id);

        if (error) throw error;
        toast.success('Case study updated successfully');
      } else {
        const { error } = await supabase
          .from('case_studies')
          .insert({
            name: caseStudyForm.name,
            description: caseStudyForm.description
          });

        if (error) throw error;
        toast.success('Case study created successfully');
      }

      setShowCaseStudyModal(false);
      setEditingCaseStudy(null);
      resetCaseStudyForm();
      loadCaseStudies();
    } catch (error: any) {
      console.error('Error saving case study:', error);
      toast.error(error.message || 'Failed to save case study');
    }
  };

  const handleDeleteCaseStudy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Case study deleted successfully');
      loadCaseStudies();
    } catch (error: any) {
      console.error('Error deleting case study:', error);
      toast.error(error.message || 'Failed to delete case study');
    }
  };

  const handleEditCaseStudy = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy);
    setCaseStudyForm({
      name: caseStudy.name,
      description: caseStudy.description || ''
    });
    setShowCaseStudyModal(true);
  };

  const resetCaseStudyForm = () => {
    setCaseStudyForm({
      name: '',
      description: ''
    });
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}.csv`);
  };

  // Stats calculation
  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'active').length,
    totalJudges: users.filter(u => u.role === 'assessor').length,
    totalCandidates: candidates.length,
    totalAssignments: assignments.length,
    completedAssessments: assignments.filter(a => a.status === 'submitted').length,
    pendingAssessments: assignments.filter(a => a.status !== 'submitted').length
  };

  // Filter functions
  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "red" }: any) => (
    <Card className={`border-${color}-200 bg-gradient-to-r from-${color}-50 to-pink-50`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-8 h-8 text-${color}-600`} />
          <div>
            <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
            <p className={`text-sm text-${color}-700`}>{title}</p>
            {subtitle && <p className={`text-xs text-${color}-600`}>{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="ml-2 text-muted-foreground">Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-red-900">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage events, assessors, participants, and view assessment analytics
          </p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            resetEventForm();
            setEditingEvent(null);
            setShowEventModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <StatCard 
          icon={Calendar} 
          title="Events" 
          value={stats.totalEvents} 
          subtitle={`${stats.activeEvents} active`}
        />
        <StatCard 
          icon={Users} 
          title="Assessors" 
          value={stats.totalJudges} 
          color="blue"
        />
        <StatCard 
          icon={UserCheck} 
          title="Candidates" 
          value={stats.totalCandidates} 
          color="green"
        />
        <StatCard 
          icon={FileText} 
          title="Assignments" 
          value={stats.totalAssignments} 
          color="purple"
        />
        <StatCard 
          icon={Target} 
          title="Completed" 
          value={stats.completedAssessments} 
          color="emerald"
        />
        <StatCard 
          icon={List} 
          title="Pending" 
          value={stats.pendingAssessments} 
          color="yellow"
        />
        <StatCard 
          icon={Download} 
          title="Export" 
          value="CSV/PDF" 
          subtitle="Download reports"
          color="indigo"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="bg-white border border-red-200">
          <TabsTrigger value="events" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Events
          </TabsTrigger>
          <TabsTrigger value="assessors" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Assessors
          </TabsTrigger>
          <TabsTrigger value="participants" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Participants
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Teams
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="case-studies" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Case Studies
          </TabsTrigger>
          <TabsTrigger value="exports" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Exports
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-red-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-red-200"
                onClick={() => exportToCSV(events, 'events')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  resetEventForm();
                  setEditingEvent(null);
                  setShowEventModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          <Card className="border-red-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-red-900">Event Name</th>
                      <th className="text-left p-4 font-medium text-red-900">Status</th>
                      <th className="text-left p-4 font-medium text-red-900">Candidates</th>
                      <th className="text-left p-4 font-medium text-red-900">Start Date</th>
                      <th className="text-left p-4 font-medium text-red-900">End Date</th>
                      <th className="text-left p-4 font-medium text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No events found. Create your first event to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100 hover:bg-red-50/50">
                          <td className="p-4">
                            <div className="font-medium text-red-900">{event.name}</div>
                            {event.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge className={
                              event.status === 'active' ? 'bg-green-500' :
                              event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
                            }>
                              {event.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-700">
                            {candidates.filter(c => c.event_id === event.id).length}
                          </td>
                          <td className="p-4 text-gray-700">
                            {event.start_date ? new Date(event.start_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-gray-700">
                            {event.end_date ? new Date(event.end_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessors Tab */}
        <TabsContent value="assessors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder="Search assessors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-red-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-red-200"
                onClick={() => exportToCSV(users.filter(u => u.role === 'assessor'), 'assessors')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <Card className="border-red-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-red-900">Name</th>
                      <th className="text-left p-4 font-medium text-red-900">Email</th>
                      <th className="text-left p-4 font-medium text-red-900">Role</th>
                      <th className="text-left p-4 font-medium text-red-900">Assignments</th>
                      <th className="text-left p-4 font-medium text-red-900">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => u.role === 'assessor').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No assessors found. Users who sign up will appear here.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.filter(u => u.role === 'assessor').map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-red-50/50">
                          <td className="p-4">
                            <div className="font-medium text-red-900">{user.name || 'Unnamed'}</div>
                          </td>
                          <td className="p-4 text-gray-700">{user.email}</td>
                          <td className="p-4">
                            <Badge className="bg-blue-500">{user.role}</Badge>
                          </td>
                          <td className="p-4 text-gray-700">
                            {assignments.filter(a => a.assessor_id === user.id).length}
                          </td>
                          <td className="p-4 text-gray-700">
                            {assignments.filter(a => a.assessor_id === user.id && a.status === 'submitted').length}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-red-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-red-200"
                onClick={() => exportToCSV(candidates, 'candidates')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  resetCandidateForm();
                  setEditingCandidate(null);
                  setShowCandidateModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>

          <Card className="border-red-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-red-900">Name</th>
                      <th className="text-left p-4 font-medium text-red-900">Email</th>
                      <th className="text-left p-4 font-medium text-red-900">Department</th>
                      <th className="text-left p-4 font-medium text-red-900">Position</th>
                      <th className="text-left p-4 font-medium text-red-900">Event</th>
                      <th className="text-left p-4 font-medium text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No candidates found. Add your first candidate to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b border-gray-100 hover:bg-red-50/50">
                          <td className="p-4">
                            <div className="font-medium text-red-900">{candidate.name}</div>
                          </td>
                          <td className="p-4 text-gray-700">{candidate.email || '-'}</td>
                          <td className="p-4 text-gray-700">{candidate.department || '-'}</td>
                          <td className="p-4 text-gray-700">{candidate.position || '-'}</td>
                          <td className="p-4 text-gray-700">
                            {events.find(e => e.id === candidate.event_id)?.name || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200"
                                onClick={() => handleEditCandidate(candidate)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteCandidate(candidate.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-red-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-red-200"
                onClick={() => exportToCSV(groups, 'teams')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  resetGroupForm();
                  setEditingGroup(null);
                  setShowGroupModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>

          <Card className="border-red-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-red-900">Team Name</th>
                      <th className="text-left p-4 font-medium text-red-900">Description</th>
                      <th className="text-left p-4 font-medium text-red-900">Members</th>
                      <th className="text-left p-4 font-medium text-red-900">Event</th>
                      <th className="text-left p-4 font-medium text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No teams found. Create your first team to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredGroups.map((group) => (
                        <tr key={group.id} className="border-b border-gray-100 hover:bg-red-50/50">
                          <td className="p-4">
                            <div className="font-medium text-red-900">{group.name}</div>
                          </td>
                          <td className="p-4 text-gray-700 max-w-xs truncate">
                            {group.description || '-'}
                          </td>
                          <td className="p-4 text-gray-700">
                            {group.member_ids?.length || 0} members
                          </td>
                          <td className="p-4 text-gray-700">
                            {events.find(e => e.id === group.event_id)?.name || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200"
                                onClick={() => handleEditGroup(group)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteGroup(group.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                className="pl-10 bg-white border-red-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-red-200"
                onClick={() => exportToCSV(assignments, 'assignments')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <Card className="border-red-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-red-900">Type</th>
                      <th className="text-left p-4 font-medium text-red-900">Assessor</th>
                      <th className="text-left p-4 font-medium text-red-900">Target</th>
                      <th className="text-left p-4 font-medium text-red-900">Case Study</th>
                      <th className="text-left p-4 font-medium text-red-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No assignments found. Assignments are created when assessors start assessments.
                        </td>
                      </tr>
                    ) : (
                      assignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b border-gray-100 hover:bg-red-50/50">
                          <td className="p-4">
                            <Badge className={assignment.type === 'individual' ? 'bg-blue-500' : 'bg-purple-500'}>
                              {assignment.type}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-700">
                            {users.find(u => u.id === assignment.assessor_id)?.name || 'Unknown'}
                          </td>
                          <td className="p-4 text-gray-700">
                            {assignment.candidate_id 
                              ? candidates.find(c => c.id === assignment.candidate_id)?.name 
                              : groups.find(g => g.id === assignment.group_id)?.name || '-'}
                          </td>
                          <td className="p-4 text-gray-700">{assignment.case_study || '-'}</td>
                          <td className="p-4">
                            <Badge className={
                              assignment.status === 'submitted' ? 'bg-green-500' :
                              assignment.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-500'
                            }>
                              {assignment.status.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Studies Tab */}
        <TabsContent value="case-studies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder="Search case studies..."
                className="pl-10 bg-white border-red-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-red-200"
                onClick={() => exportToCSV(caseStudies, 'case_studies')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  resetCaseStudyForm();
                  setEditingCaseStudy(null);
                  setShowCaseStudyModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Case Study
              </Button>
            </div>
          </div>

          <Card className="border-red-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-red-900">Name</th>
                      <th className="text-left p-4 font-medium text-red-900">Description</th>
                      <th className="text-left p-4 font-medium text-red-900">Created</th>
                      <th className="text-left p-4 font-medium text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseStudies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No case studies found. Add your first case study to get started.
                        </td>
                      </tr>
                    ) : (
                      caseStudies.map((cs) => (
                        <tr key={cs.id} className="border-b border-gray-100 hover:bg-red-50/50">
                          <td className="p-4">
                            <div className="font-medium text-red-900">{cs.name}</div>
                          </td>
                          <td className="p-4 text-gray-700 max-w-md truncate">
                            {cs.description || '-'}
                          </td>
                          <td className="p-4 text-gray-700">
                            {cs.created_at ? new Date(cs.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200"
                                onClick={() => handleEditCaseStudy(cs)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteCaseStudy(cs.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exports Tab */}
        <TabsContent value="exports">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Export & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">All Events</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export all events with their details
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200"
                      onClick={() => exportToCSV(events, 'all_events')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">All Candidates</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export all candidates across all events
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200"
                      onClick={() => exportToCSV(candidates, 'all_candidates')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">All Assessors</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export all assessors with their stats
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200"
                      onClick={() => exportToCSV(users.filter(u => u.role === 'assessor'), 'all_assessors')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">All Assignments</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export all assignments with status
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200"
                      onClick={() => exportToCSV(assignments, 'all_assignments')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">All Teams</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export all teams/groups
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200"
                      onClick={() => exportToCSV(groups, 'all_teams')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Case Studies</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export all case studies
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200"
                      onClick={() => exportToCSV(caseStudies, 'all_case_studies')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        description={editingEvent ? 'Update the event details below.' : 'Fill in the details for your new event.'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name *</Label>
            <Input
              id="event-name"
              value={eventForm.name}
              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              placeholder="e.g., Leadership Assessment 2024"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Brief description of the event..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-status">Status</Label>
            <Select 
              value={eventForm.status} 
              onValueChange={(value: 'upcoming' | 'active' | 'completed') => 
                setEventForm({ ...eventForm, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={eventForm.start_date}
                onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={eventForm.end_date}
                onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEventModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSaveEvent}
              disabled={!eventForm.name || !eventForm.start_date || !eventForm.end_date}
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Candidate Modal */}
      <Modal
        isOpen={showCandidateModal}
        onClose={() => {
          setShowCandidateModal(false);
          setEditingCandidate(null);
        }}
        title={editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
        description={editingCandidate ? 'Update the candidate details below.' : 'Fill in the details for the new candidate.'}
      >
        <div className="space-y-4">
          {!editingCandidate && (
            <div className="space-y-2">
              <Label htmlFor="candidate-event">Event *</Label>
              <Select 
                value={candidateForm.event_id} 
                onValueChange={(value) => setCandidateForm({ ...candidateForm, event_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="candidate-name">Name *</Label>
            <Input
              id="candidate-name"
              value={candidateForm.name}
              onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate-email">Email</Label>
            <Input
              id="candidate-email"
              type="email"
              value={candidateForm.email}
              onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidate-department">Department</Label>
              <Input
                id="candidate-department"
                value={candidateForm.department}
                onChange={(e) => setCandidateForm({ ...candidateForm, department: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-position">Position</Label>
              <Input
                id="candidate-position"
                value={candidateForm.position}
                onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                placeholder="e.g., Senior Manager"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCandidateModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSaveCandidate}
              disabled={!candidateForm.name || (!editingCandidate && !candidateForm.event_id)}
            >
              {editingCandidate ? 'Update Candidate' : 'Add Candidate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Group/Team Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
          setEditingGroup(null);
        }}
        title={editingGroup ? 'Edit Team' : 'Create New Team'}
        description={editingGroup ? 'Update the team details below.' : 'Fill in the details for your new team.'}
      >
        <div className="space-y-4">
          {!editingGroup && (
            <div className="space-y-2">
              <Label htmlFor="group-event">Event *</Label>
              <Select 
                value={groupForm.event_id} 
                onValueChange={(value) => setGroupForm({ ...groupForm, event_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="group-name">Team Name *</Label>
            <Input
              id="group-name"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="e.g., Team Alpha"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              placeholder="Brief description of the team..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-case-study">Case Study</Label>
            <Select 
              value={groupForm.case_study} 
              onValueChange={(value) => setGroupForm({ ...groupForm, case_study: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a case study" />
              </SelectTrigger>
              <SelectContent>
                {caseStudies.map(cs => (
                  <SelectItem key={cs.id} value={cs.name}>{cs.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowGroupModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSaveGroup}
              disabled={!groupForm.name || (!editingGroup && !groupForm.event_id)}
            >
              {editingGroup ? 'Update Team' : 'Create Team'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Case Study Modal */}
      <Modal
        isOpen={showCaseStudyModal}
        onClose={() => {
          setShowCaseStudyModal(false);
          setEditingCaseStudy(null);
        }}
        title={editingCaseStudy ? 'Edit Case Study' : 'Add New Case Study'}
        description={editingCaseStudy ? 'Update the case study details below.' : 'Fill in the details for your new case study.'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cs-name">Name *</Label>
            <Input
              id="cs-name"
              value={caseStudyForm.name}
              onChange={(e) => setCaseStudyForm({ ...caseStudyForm, name: e.target.value })}
              placeholder="e.g., Digital Transformation Challenge"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-description">Description</Label>
            <Textarea
              id="cs-description"
              value={caseStudyForm.description}
              onChange={(e) => setCaseStudyForm({ ...caseStudyForm, description: e.target.value })}
              placeholder="Describe the case study scenario and objectives..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCaseStudyModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSaveCaseStudy}
              disabled={!caseStudyForm.name}
            >
              {editingCaseStudy ? 'Update Case Study' : 'Add Case Study'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}