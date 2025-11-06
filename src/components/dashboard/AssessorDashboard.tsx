import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ProgressTracker } from './ProgressTracker';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Search, 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  FileText,
  Play,
  AlertCircle,
  Filter
} from 'lucide-react';

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

interface AssessorDashboardProps {
  assignments: Assignment[];
  candidates: Array<{
    id: string;
    name: string;
    overallScore: number;
    status: 'not_started' | 'in_progress' | 'completed';
    timeSpent: number;
    submissionDate?: Date;
  }>;
  onStartAssessment: (assignmentId: string) => void;
  onResumeAssessment: (assignmentId: string) => void;
}

export function AssessorDashboard({ assignments, candidates, onStartAssessment, onResumeAssessment }: AssessorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'individuals' | 'groups'>('individuals');

  // Calculate real progress data based on case study completion
  // Each participant should complete 2 main case studies: Strategic Leadership Challenge & Innovation & Digital Transformation
  const targetCaseStudies = ['Strategic Leadership Challenge', 'Innovation & Digital Transformation'];
  const expectedParticipants = 100; // Target of 100 participants
  const totalExpectedAssessments = expectedParticipants * targetCaseStudies.length; // 200 total assessments

  const progressStats = {
    totalAssignments: totalExpectedAssessments, // Expected total based on 100 participants × 2 case studies
    completedAssignments: assignments.filter(a => a.status === 'submitted').length,
    inProgressAssignments: assignments.filter(a => a.status === 'in_progress').length,
    overdueAssignments: 0, // Could be calculated based on due dates
    averageCompletionTime: candidates.filter(c => c.status === 'completed' && c.timeSpent > 0).length > 0 
      ? Math.round(candidates.filter(c => c.status === 'completed' && c.timeSpent > 0)
          .reduce((sum, c) => sum + c.timeSpent, 0) / 
          candidates.filter(c => c.status === 'completed' && c.timeSpent > 0).length)
      : 0,
    averageScore: candidates.filter(c => c.status === 'completed' && c.overallScore > 0).length > 0
      ? Math.round(candidates.filter(c => c.status === 'completed' && c.overallScore > 0)
          .reduce((sum, c) => sum + c.overallScore, 0) / 
          candidates.filter(c => c.status === 'completed' && c.overallScore > 0).length)
      : 0,
    // Additional metrics for case study tracking
    currentParticipants: candidates.length,
    expectedParticipants: expectedParticipants,
    participantProgress: candidates.length > 0 ? Math.round((candidates.length / expectedParticipants) * 100) : 0
  };

  // Generate recent activity from real candidate and assignment data
  const recentActivity = candidates
    .filter(c => c.submissionDate || assignments.some(a => a.candidateName === c.name && a.lastUpdated))
    .sort((a, b) => {
      const aDate = a.submissionDate || assignments.find(assignment => assignment.candidateName === a.name)?.lastUpdated || new Date(0);
      const bDate = b.submissionDate || assignments.find(assignment => assignment.candidateName === b.name)?.lastUpdated || new Date(0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 5) // Show only the 5 most recent activities
    .map((candidate, index) => ({
      id: `activity-${candidate.id}`,
      type: candidate.status === 'completed' ? 'completed' as const : 
            candidate.status === 'in_progress' ? 'submitted' as const : 'started' as const,
      candidateName: candidate.name,
      timestamp: candidate.submissionDate || assignments.find(a => a.candidateName === candidate.name)?.lastUpdated || new Date(),
      score: candidate.status === 'completed' ? candidate.overallScore : undefined
    }));

  // Generate upcoming deadlines from assignments with due dates
  const upcomingDeadlines = assignments
    .filter(a => a.dueDate && a.status !== 'submitted')
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))
    .slice(0, 5) // Show only the 5 most urgent deadlines
    .map(assignment => ({
      id: assignment.id,
      name: `${assignment.candidateName || assignment.groupName} Assessment`,
      type: assignment.type,
      dueDate: assignment.dueDate!,
      priority: 'normal' as const // Could be calculated based on time remaining
    }));

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      // Type filter
      if (activeTab === 'individuals' && assignment.type !== 'individual') return false;
      if (activeTab === 'groups' && assignment.type !== 'group') return false;

      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        assignment.candidateName?.toLowerCase().includes(searchLower) ||
        assignment.groupName?.toLowerCase().includes(searchLower) ||
        assignment.caseStudy.toLowerCase().includes(searchLower);
      
      if (searchTerm && !matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && assignment.status !== statusFilter) return false;

      // Assignment type filter (assigned to me, etc.)
      if (assignmentFilter === 'assigned_to_me') {
        // In a real app, this would check if the assignment is specifically assigned to the current user
        return true; // For now, assume all are assigned to current user
      }
      if (assignmentFilter === 'incomplete' && assignment.status === 'submitted') return false;

      return true;
    });
  }, [assignments, searchTerm, statusFilter, assignmentFilter, activeTab]);

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'not_started':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'submitted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="secondary">Not Started</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'submitted':
        return <Badge className="bg-green-500 hover:bg-green-600">Submitted</Badge>;
    }
  };

  const getProgress = (assignment: Assignment) => {
    if (assignment.status === 'submitted') return 100;
    if (assignment.currentScore === undefined) return 0;
    return Math.round((assignment.currentScore / assignment.maxScore) * 100);
  };

  const getStats = () => {
    const typeFilter = activeTab === 'individuals' ? 'individual' : 'group';
    const filtered = assignments.filter(a => a.type === typeFilter);
    
    return {
      total: filtered.length,
      notStarted: filtered.filter(a => a.status === 'not_started').length,
      inProgress: filtered.filter(a => a.status === 'in_progress').length,
      submitted: filtered.filter(a => a.status === 'submitted').length,
      avgScore: filtered.filter(a => a.currentScore !== undefined).length > 0 
        ? Math.round(filtered.reduce((sum, a) => sum + (a.currentScore || 0), 0) / filtered.filter(a => a.currentScore !== undefined).length)
        : 0
    };
  };

  const stats = getStats();

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Card className="border-red-200 hover:border-red-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-white/80 backdrop-blur-sm animate-scale-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(assignment.status)}
            <h3 className="font-medium text-red-900">
              {assignment.candidateName || assignment.groupName}
            </h3>
          </div>
          {getStatusBadge(assignment.status)}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-red-700">Case Study:</span>
            <Badge variant="outline" className="border-red-200">
              {assignment.caseStudy}
            </Badge>
          </div>

          {assignment.status !== 'not_started' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-700">Progress:</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgress(assignment)}%` }}
                  />
                </div>
                <span className="text-red-900 font-medium">
                  {assignment.currentScore || 0}/{assignment.maxScore}
                </span>
              </div>
            </div>
          )}

          {assignment.lastUpdated && (
            <div className="text-xs text-muted-foreground">
              Last updated: {assignment.lastUpdated.toLocaleDateString('en-GB')} at {assignment.lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {assignment.status === 'not_started' ? (
            <Button 
              onClick={() => onStartAssessment(assignment.id)}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Assessment
            </Button>
          ) : assignment.status === 'in_progress' ? (
            <Button 
              onClick={() => onResumeAssessment(assignment.id)}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-md"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button 
                onClick={() => onResumeAssessment(assignment.id)}
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 transition-all duration-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button 
                onClick={() => onResumeAssessment(assignment.id)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md"
              >
                <Play className="w-4 h-4 mr-2" />
                Edit Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {activeTab === 'individuals' ? (
          <UserCheck className="w-8 h-8 text-red-500" />
        ) : (
          <Users className="w-8 h-8 text-red-500" />
        )}
      </div>
      <h3 className="text-lg font-medium text-red-900 mb-2">
        No {activeTab} assignments found
      </h3>
      <p className="text-red-700 mb-4">
        {searchTerm || statusFilter !== 'all' || assignmentFilter !== 'all'
          ? 'Try adjusting your filters to see more assignments.'
          : `You don't have any ${activeTab} assignments yet.`}
      </p>
      {(searchTerm || statusFilter !== 'all' || assignmentFilter !== 'all') && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setAssignmentFilter('all');
          }}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Progress Tracker */}
      <ProgressTracker 
        stats={progressStats}
        recentActivity={recentActivity}
        upcomingDeadlines={upcomingDeadlines}
      />

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4 animate-slide-up">
        <Card className="border-red-200 bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 card-shadow hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">Total</p>
                <p className="text-3xl font-bold gradient-text">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 card-shadow hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-600 to-orange-700 bg-clip-text">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 card-shadow hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Completed</p>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text">{stats.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 card-shadow hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Avg Score</p>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text">{stats.avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <TabsList className="bg-white border border-red-200">
            <TabsTrigger 
              value="individuals" 
              className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4" />
              Individuals
            </TabsTrigger>
            <TabsTrigger 
              value="groups" 
              className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              Groups
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-red-200"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                <SelectTrigger className="w-[150px] border-red-200 bg-white">
                  <SelectValue placeholder="Assignment">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span className="hidden md:block">
                        {assignmentFilter === 'all' ? 'All' : 
                         assignmentFilter === 'assigned_to_me' ? 'Assigned to me' : 
                         'Incomplete'}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  <SelectItem value="assigned_to_me">Assigned to me</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] border-red-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="individuals" className="space-y-4">
          {filteredAssignments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {filteredAssignments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
