import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { 
  Plus, 
  Users, 
  User, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft,
  UserPlus,
  UsersIcon,
  Target,
  BookOpen,
  Calendar,
  Clock,
  Archive,
  RotateCcw,
  AlertTriangle,
  Search
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { IndividualReportExport, GroupReportExport } from '../reports/ReportGenerator';

interface CandidateData {
  id: string;
  name: string;
  overallScore: number;
  criteriaScores: Record<string, number>;
  status: 'completed' | 'in_progress' | 'not_started';
  submissionDate?: Date;
  timeSpent: number;
  caseStudy: string;
  redFlags?: string[];
  email?: string;
  department?: string;
  position?: string;
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

interface DeletedCandidate extends CandidateData {
  deletedAt: Date;
  originalId: string;
}

interface CaseStudy {
  id: string;
  name: string;
  description: string;
}

interface CandidateGroupManagerProps {
  candidates: CandidateData[];
  groups: GroupData[];
  deletedCandidates: DeletedCandidate[];
  caseStudies: CaseStudy[];
  onAddCandidate: (candidateData: any) => void;
  onUpdateCandidate: (id: string, candidateData: any) => void;
  onDeleteCandidate: (id: string) => void;
  onRestoreCandidate: (originalId: string) => void;
  onPermanentlyDeleteCandidate: (originalId: string) => void;
  onAddGroup: (groupData: any) => void;
  onUpdateGroup: (id: string, groupData: any) => void;
  onDeleteGroup: (id: string) => void;
  onBackToDashboard: () => void;
}

export function CandidateGroupManager({
  candidates,
  groups,
  deletedCandidates,
  caseStudies,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  onRestoreCandidate,
  onPermanentlyDeleteCandidate,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onBackToDashboard
}: CandidateGroupManagerProps) {
  const [activeTab, setActiveTab] = useState('candidates');
  const [editingCandidate, setEditingCandidate] = useState<CandidateData | null>(null);
  const [editingGroup, setEditingGroup] = useState<GroupData | null>(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New candidate form state
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    caseStudy: 'Case Study 1'
  });

  // New group form state
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    memberIds: [] as string[],
    caseStudy: 'Case Study 1',
    targetScore: '',
    notes: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-600';
      case 'in_progress': return 'bg-amber-600';
      case 'not_started': return 'bg-slate-600';
      case 'active': return 'bg-blue-600';
      case 'archived': return 'bg-slate-600';
      default: return 'bg-slate-600';
    }
  };

  const handleAddCandidate = () => {
    if (!newCandidate.name.trim()) {
      toast.error('Please enter a candidate name');
      return;
    }

    const candidateData = {
      ...newCandidate,
      id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
      submissionDate: undefined,
      redFlags: []
    };

    onAddCandidate(candidateData);
    setNewCandidate({
      name: '',
      email: '',
      department: '',
      position: '',
      caseStudy: 'Case Study 1'
    });
    setShowAddCandidate(false);
    toast.success(`Candidate ${candidateData.name} added successfully`);
  };

  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (newGroup.memberIds.length === 0) {
      toast.error('Please select at least one candidate for the group');
      return;
    }

    const groupData = {
      ...newGroup,
      id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'active' as const,
      createdDate: new Date(),
      targetScore: newGroup.targetScore ? parseInt(newGroup.targetScore) : undefined
    };

    onAddGroup(groupData);
    setNewGroup({
      name: '',
      description: '',
      memberIds: [],
      caseStudy: 'Case Study 1',
      targetScore: '',
      notes: ''
    });
    setShowAddGroup(false);
    toast.success(`Group ${groupData.name} created successfully`);
  };

  const handleCandidateSelect = (candidateId: string, checked: boolean) => {
    setNewGroup(prev => ({
      ...prev,
      memberIds: checked 
        ? [...prev.memberIds, candidateId]
        : prev.memberIds.filter(id => id !== candidateId)
    }));
  };

  const getGroupMembers = (group: GroupData) => {
    return candidates.filter(candidate => group.memberIds.includes(candidate.id));
  };

  const handleEditCandidate = (candidate: CandidateData) => {
    setEditingCandidate(candidate);
  };

  const handleSaveEditCandidate = () => {
    if (editingCandidate) {
      onUpdateCandidate(editingCandidate.id, editingCandidate);
      setEditingCandidate(null);
    }
  };

  const handleEditGroup = (group: GroupData) => {
    setEditingGroup(group);
  };

  const handleSaveEditGroup = () => {
    if (editingGroup) {
      onUpdateGroup(editingGroup.id, editingGroup);
      setEditingGroup(null);
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeletedCandidates = deletedCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="glass rounded-3xl p-8 card-shadow-lg border-2 border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-red-200 hover:bg-red-50 transition-all duration-300 px-6 py-3 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="border-l border-red-200 pl-6">
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                <UsersIcon className="w-8 h-8" />
                Candidate & Group Management
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Add candidates, create groups, and manage assessment assignments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 surface-luxury border-2 border-white/20 p-2 rounded-2xl card-shadow-lg">
          <TabsTrigger 
            value="candidates" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
          >
            <User className="w-4 h-4 mr-2" />
            Active Candidates
          </TabsTrigger>
          <TabsTrigger 
            value="groups" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Groups
          </TabsTrigger>
          <TabsTrigger 
            value="archived" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
          >
            <Archive className="w-4 h-4 mr-2" />
            Archived ({deletedCandidates.length})
          </TabsTrigger>
        </TabsList>

        {/* Candidates Management */}
        <TabsContent value="candidates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold gradient-text-premium">Active Candidates ({candidates.length})</h2>
              <p className="text-lg text-muted-foreground">Manage individual candidates and their assessment status</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 surface-luxury border-slate-200"
                />
              </div>
              <Button
                onClick={() => setShowAddCandidate(true)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 rounded-2xl card-shadow-lg hover-lift"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add New Candidate
              </Button>
            </div>
          </div>

          {/* Add Candidate Form */}
          {showAddCandidate && (
            <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-3 text-xl">
                  <UserPlus className="w-6 h-6" />
                  Add New Candidate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="candidateName" className="text-base font-semibold">Full Name *</Label>
                    <Input
                      id="candidateName"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter candidate's full name"
                      className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="candidateEmail" className="text-base font-semibold">Email Address</Label>
                    <Input
                      id="candidateEmail"
                      type="email"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="candidate@company.com"
                      className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="candidateDepartment" className="text-base font-semibold">Department</Label>
                    <Input
                      id="candidateDepartment"
                      value={newCandidate.department}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g., Marketing, Engineering"
                      className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="candidatePosition" className="text-base font-semibold">Position</Label>
                    <Input
                      id="candidatePosition"
                      value={newCandidate.position}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Senior Manager, Developer"
                      className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="candidateCaseStudy" className="text-base font-semibold">Case Study Assignment</Label>
                  <Select value={newCandidate.caseStudy} onValueChange={(value) => setNewCandidate(prev => ({ ...prev, caseStudy: value }))}>
                    <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Case Study 1">Case Study 1 - Strategic Leadership</SelectItem>
                      <SelectItem value="Case Study 2">Case Study 2 - Innovation Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4 pt-6">
                  <Button onClick={handleAddCandidate} className="bg-slate-600 hover:bg-slate-700 px-6 py-3 rounded-xl card-shadow">
                    <Save className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddCandidate(false)} className="px-6 py-3 rounded-xl">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidates List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map(candidate => (
              <Card key={candidate.id} className="surface-luxury border-2 border-slate-200 rounded-3xl hover-lift transition-all duration-500 status-elite">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg gradient-text">{candidate.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{candidate.caseStudy}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(candidate.status)} text-white rounded-xl px-3 py-1`}>
                      {candidate.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Overall Score:</span>
                    <span className="font-bold text-xl gradient-text">{candidate.overallScore}/100</span>
                  </div>
                  {candidate.email && (
                    <div className="text-sm text-muted-foreground truncate">
                      📧 {candidate.email}
                    </div>
                  )}
                  {candidate.department && (
                    <div className="text-sm text-muted-foreground">
                      🏢 {candidate.department}
                    </div>
                  )}
                  {candidate.submissionDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {candidate.submissionDate.toLocaleDateString('en-GB')}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {candidate.timeSpent} minutes
                  </div>
                  <div className="divider-luxury my-4"></div>
                  
                  {candidate.status === 'completed' && (
                    <div className="mb-3">
                      <IndividualReportExport 
                        data={{
                          candidateName: candidate.name,
                          position: candidate.position,
                          department: candidate.department,
                          email: candidate.email,
                          overallScore: candidate.overallScore,
                          criteriaScores: candidate.criteriaScores,
                          caseStudy: candidate.caseStudy,
                          status: candidate.status,
                          timeSpent: candidate.timeSpent,
                          submissionDate: candidate.submissionDate,
                          redFlags: candidate.redFlags
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 hover-lift rounded-xl"
                          onClick={() => handleEditCandidate(candidate)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="surface-luxury rounded-2xl border-2 border-slate-200 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl gradient-text">Edit Candidate</DialogTitle>
                          <DialogDescription>
                            Update candidate information and settings.
                          </DialogDescription>
                        </DialogHeader>
                        {editingCandidate && (
                          <div className="space-y-6 py-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                  value={editingCandidate.name}
                                  onChange={(e) => setEditingCandidate(prev => prev ? {...prev, name: e.target.value} : null)}
                                  className="surface-luxury border-slate-200 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={editingCandidate.email || ''}
                                  onChange={(e) => setEditingCandidate(prev => prev ? {...prev, email: e.target.value} : null)}
                                  className="surface-luxury border-slate-200 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Department</Label>
                                <Input
                                  value={editingCandidate.department || ''}
                                  onChange={(e) => setEditingCandidate(prev => prev ? {...prev, department: e.target.value} : null)}
                                  className="surface-luxury border-slate-200 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Position</Label>
                                <Input
                                  value={editingCandidate.position || ''}
                                  onChange={(e) => setEditingCandidate(prev => prev ? {...prev, position: e.target.value} : null)}
                                  className="surface-luxury border-slate-200 rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Case Study</Label>
                              <Select 
                                value={editingCandidate.caseStudy} 
                                onValueChange={(value) => setEditingCandidate(prev => prev ? {...prev, caseStudy: value} : null)}
                              >
                                <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Case Study 1">Case Study 1 - Strategic Leadership</SelectItem>
                                  <SelectItem value="Case Study 2">Case Study 2 - Innovation Challenge</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button onClick={handleSaveEditCandidate} className="bg-slate-600 hover:bg-slate-700 rounded-xl">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </Button>
                              <Button variant="outline" onClick={() => setEditingCandidate(null)} className="rounded-xl">
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="surface-luxury rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="gradient-text flex items-center gap-2">
                            <Archive className="w-5 h-5" />
                            Archive Candidate
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            This will move <strong>{candidate.name}</strong> to the archived section. 
                            You can restore them later if needed. This action will also remove them from any groups.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDeleteCandidate(candidate.id)}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive Candidate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl gradient-text mb-2">No candidates found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Add your first candidate to get started'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Archived Candidates */}
        <TabsContent value="archived" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold gradient-text-premium">Archived Candidates ({deletedCandidates.length})</h2>
              <p className="text-lg text-muted-foreground">Review and restore previously archived candidates</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search archived candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 surface-luxury border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDeletedCandidates.map(candidate => (
              <Card key={candidate.originalId} className="surface-luxury border-2 border-orange-200 rounded-3xl hover-lift transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center">
                        <Archive className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg gradient-text">{candidate.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{candidate.caseStudy}</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 rounded-xl px-3 py-1">
                      Archived
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Overall Score:</span>
                    <span className="font-bold text-xl gradient-text">{candidate.overallScore}/100</span>
                  </div>
                  {candidate.email && (
                    <div className="text-sm text-muted-foreground truncate">
                      📧 {candidate.email}
                    </div>
                  )}
                  {candidate.department && (
                    <div className="text-sm text-muted-foreground">
                      🏢 {candidate.department}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Archive className="w-4 h-4" />
                    Archived: {candidate.deletedAt.toLocaleDateString('en-GB')}
                  </div>
                  <div className="divider-luxury my-4"></div>
                  <div className="flex gap-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1 hover-lift rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="surface-luxury rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="gradient-text flex items-center gap-2">
                            <RotateCcw className="w-5 h-5" />
                            Restore Candidate
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            This will restore <strong>{candidate.name}</strong> to the active candidates list. 
                            They will be available for assignment to groups again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onRestoreCandidate(candidate.originalId)}
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore Candidate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl">
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="surface-luxury rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="gradient-text flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Permanently Delete Candidate
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            <div className="space-y-3">
                              <p>This will <strong>permanently delete</strong> <strong>{candidate.name}</strong> from the system.</p>
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-red-800 font-semibold">⚠️ Warning: This action cannot be undone!</p>
                                <p className="text-red-700 text-sm mt-1">All assessment data and history will be lost forever.</p>
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onPermanentlyDeleteCandidate(candidate.originalId)}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Permanently Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDeletedCandidates.length === 0 && (
            <div className="text-center py-12">
              <Archive className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl gradient-text mb-2">No archived candidates</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No archived candidates match your search' : 'Archived candidates will appear here'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Groups Management */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold gradient-text-premium">Assessment Groups ({groups.length})</h2>
              <p className="text-lg text-muted-foreground">Create and manage assessment groups with selected candidates</p>
            </div>
            <Button
              onClick={() => setShowAddGroup(true)}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 rounded-2xl card-shadow-lg hover-lift"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Group
            </Button>
          </div>

          {/* Add Group Form */}
          {showAddGroup && (
            <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-3 text-xl">
                  <Users className="w-6 h-6" />
                  Create New Assessment Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="groupName" className="text-base font-semibold">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Team Alpha, Leadership Cohort 1"
                      className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="groupCaseStudy" className="text-base font-semibold">Case Study Assignment</Label>
                    <Select value={newGroup.caseStudy} onValueChange={(value) => setNewGroup(prev => ({ ...prev, caseStudy: value }))}>
                      <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {caseStudies.map(cs => (
                          <SelectItem key={cs.id} value={cs.name}>
                            {cs.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="groupDescription" className="text-base font-semibold">Description</Label>
                  <Textarea
                    id="groupDescription"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the group's purpose or focus area"
                    className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="groupTarget" className="text-base font-semibold">Target Score (Optional)</Label>
                  <Input
                    id="groupTarget"
                    type="number"
                    min="0"
                    max="100"
                    value={newGroup.targetScore}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, targetScore: e.target.value }))}
                    placeholder="e.g., 75"
                    className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Select Group Members * ({newGroup.memberIds.length} selected)</Label>
                  <div className="grid gap-3 md:grid-cols-2 max-h-64 overflow-y-auto p-6 surface-luxury rounded-2xl border-2 border-slate-200">
                    {candidates.map(candidate => (
                      <div key={candidate.id} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200">
                        <Checkbox
                          id={`candidate-${candidate.id}`}
                          checked={newGroup.memberIds.includes(candidate.id)}
                          onCheckedChange={(checked) => handleCandidateSelect(candidate.id, checked as boolean)}
                          className="rounded-lg"
                        />
                        <div className="flex-1">
                          <Label htmlFor={`candidate-${candidate.id}`} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold gradient-text">{candidate.name}</span>
                              <Badge variant="secondary" className="text-xs rounded-lg">
                                {candidate.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{candidate.caseStudy}</p>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="groupNotes" className="text-base font-semibold">Notes</Label>
                  <Textarea
                    id="groupNotes"
                    value={newGroup.notes}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or special instructions for this group"
                    className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    rows={2}
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <Button onClick={handleAddGroup} className="bg-slate-600 hover:bg-slate-700 px-6 py-3 rounded-xl card-shadow">
                    <Save className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddGroup(false)} className="px-6 py-3 rounded-xl">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Groups List */}
          <div className="grid gap-6 md:grid-cols-2">
            {groups.map(group => {
              const members = getGroupMembers(group);
              return (
                <Card key={group.id} className="surface-luxury border-2 border-slate-200 rounded-3xl hover-lift transition-all duration-500 status-elite">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl gradient-text">{group.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{group.caseStudy}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(group.status)} text-white rounded-xl px-3 py-1`}>
                        {group.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {group.description && (
                      <p className="text-muted-foreground bg-slate-50 p-3 rounded-xl">{group.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Members:</span>
                      <span className="font-bold text-lg gradient-text">{members.length} candidates</span>
                    </div>
                    {group.targetScore && (
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-slate-500" />
                        <span className="text-muted-foreground">Target Score:</span>
                        <span className="font-semibold">{group.targetScore}/100</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Created: {group.createdDate.toLocaleDateString('en-GB')}
                    </div>
                    <div className="space-y-3">
                      <Label className="font-semibold">Group Members:</Label>
                      <div className="flex flex-wrap gap-2">
                        {members.map(member => (
                          <Badge key={member.id} variant="secondary" className="rounded-lg px-3 py-1">
                            {member.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {group.notes && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Notes:</Label>
                        <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-xl">{group.notes}</p>
                      </div>
                    )}
                    <div className="divider-luxury my-4"></div>
                    
                    {group.status === 'completed' && (
                      <div className="mb-3">
                        <GroupReportExport 
                          data={{
                            groupName: group.name,
                            caseStudy: group.caseStudy,
                            teamMembers: members.map(m => m.name),
                            assessorName: 'Assessment System',
                            strategicApproach: 0,
                            innovationCreativity: 0,
                            teamDynamics: 0,
                            impactPracticality: 0,
                            businessAcumen: 0,
                            presentationSkills: 0,
                            overallGroupScore: 0,
                            strengths: group.notes || '',
                            areasForImprovement: '',
                            additionalComments: group.description || '',
                            createdAt: group.createdDate.toISOString()
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 hover-lift rounded-xl"
                            onClick={() => handleEditGroup(group)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Group
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="surface-luxury rounded-2xl border-2 border-slate-200 max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl gradient-text">Edit Assessment Group</DialogTitle>
                            <DialogDescription>
                              Update group information and settings.
                            </DialogDescription>
                          </DialogHeader>
                          {editingGroup && (
                            <div className="space-y-6 py-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Group Name</Label>
                                  <Input
                                    value={editingGroup.name}
                                    onChange={(e) => setEditingGroup(prev => prev ? {...prev, name: e.target.value} : null)}
                                    className="surface-luxury border-slate-200 rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Case Study</Label>
                                  <Select 
                                    value={editingGroup.caseStudy} 
                                    onValueChange={(value) => setEditingGroup(prev => prev ? {...prev, caseStudy: value} : null)}
                                  >
                                    <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {caseStudies.map(cs => (
                                        <SelectItem key={cs.id} value={cs.name}>
                                          {cs.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={editingGroup.description || ''}
                                  onChange={(e) => setEditingGroup(prev => prev ? {...prev, description: e.target.value} : null)}
                                  className="surface-luxury border-slate-200 rounded-xl"
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Target Score</Label>
                                <Input
                                  type="number"
                                  value={editingGroup.targetScore || ''}
                                  onChange={(e) => setEditingGroup(prev => prev ? {...prev, targetScore: parseInt(e.target.value) || undefined} : null)}
                                  className="surface-luxury border-slate-200 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                  value={editingGroup.notes || ''}
                                  onChange={(e) => setEditingGroup(prev => prev ? {...prev, notes: e.target.value} : null)}
                                  className="surface-luxury border-slate-200 rounded-xl"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-3 pt-4">
                                <Button onClick={handleSaveEditGroup} className="bg-slate-600 hover:bg-slate-700 rounded-xl">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setEditingGroup(null)} className="rounded-xl">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="surface-luxury rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="gradient-text flex items-center gap-2">
                              <Trash2 className="w-5 h-5" />
                              Delete Group
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-base">
                              This will permanently delete the group <strong>{group.name}</strong>. 
                              Group members will remain as individual candidates.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteGroup(group.id)}
                              className="bg-red-600 hover:bg-red-700 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl gradient-text mb-2">No groups created yet</h3>
              <p className="text-muted-foreground">Create your first assessment group to get started</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}