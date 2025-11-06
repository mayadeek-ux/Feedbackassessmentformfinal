import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { 
  UserCheck, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ArrowLeft,
  BookOpen,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Judge {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'senior' | 'junior' | 'guest';
  specialties: string[];
  status: 'active' | 'inactive' | 'busy';
  totalAssignments: number;
  completedAssignments: number;
  avgScore: number;
  lastActive: Date;
}

interface Assignment {
  id: string;
  judgeId: string;
  candidateId?: string;
  groupId?: string;
  type: 'individual' | 'group';
  caseStudy: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  assignedDate: Date;
  dueDate: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface JudgeAssignmentsProps {
  judges: Judge[];
  assignments: Assignment[];
  candidates: any[];
  groups: any[];
  caseStudies: any[];
  onAddJudge: (judgeData: any) => void;
  onUpdateJudge: (id: string, updates: any) => void;
  onDeleteJudge: (id: string) => void;
  onCreateAssignment: (assignmentData: any) => void;
  onUpdateAssignment: (id: string, updates: any) => void;
  onDeleteAssignment: (id: string) => void;
  onBackToDashboard: () => void;
}

export function JudgeAssignments({
  judges,
  assignments,
  candidates,
  groups,
  caseStudies,
  onAddJudge,
  onUpdateJudge,
  onDeleteJudge,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onBackToDashboard
}: JudgeAssignmentsProps) {
  const [activeTab, setActiveTab] = useState('judges');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
  const [showAddJudge, setShowAddJudge] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  const [newJudge, setNewJudge] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'junior' as const,
    specialties: [] as string[],
    status: 'active' as const
  });

  const [newAssignment, setNewAssignment] = useState({
    judgeId: '',
    type: 'individual' as const,
    candidateId: '',
    groupId: '',
    caseStudy: '',
    dueDate: '',
    priority: 'normal' as const
  });

  const specialtyOptions = [
    'Strategic Leadership',
    'Innovation & Technology',
    'Communication Skills',
    'Team Management',
    'Crisis Management',
    'Digital Transformation',
    'Emotional Intelligence',
    'Problem Solving'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-600';
      case 'inactive': return 'bg-slate-600';
      case 'busy': return 'bg-amber-600';
      case 'assigned': return 'bg-blue-600';
      case 'in_progress': return 'bg-amber-600';
      case 'completed': return 'bg-emerald-600';
      case 'overdue': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-500';
      case 'normal': return 'bg-blue-500';
      case 'high': return 'bg-amber-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const handleAddJudge = () => {
    if (!newJudge.name.trim() || !newJudge.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    onAddJudge({
      ...newJudge,
      totalAssignments: 0,
      completedAssignments: 0,
      avgScore: 0,
      lastActive: new Date()
    });

    setNewJudge({
      name: '',
      email: '',
      phone: '',
      role: 'junior',
      specialties: [],
      status: 'active'
    });
    setShowAddJudge(false);
  };

  const handleEditJudge = (judge: Judge) => {
    setEditingJudge(judge);
  };

  const handleSaveEditJudge = () => {
    if (editingJudge) {
      onUpdateJudge(editingJudge.id, editingJudge);
      setEditingJudge(null);
    }
  };

  const handleCreateAssignment = () => {
    if (!newAssignment.judgeId || !newAssignment.caseStudy || !newAssignment.dueDate) {
      toast.error('Judge, case study, and due date are required');
      return;
    }

    if (newAssignment.type === 'individual' && !newAssignment.candidateId) {
      toast.error('Candidate is required for individual assignments');
      return;
    }

    if (newAssignment.type === 'group' && !newAssignment.groupId) {
      toast.error('Group is required for group assignments');
      return;
    }

    onCreateAssignment({
      ...newAssignment,
      assignedDate: new Date(),
      status: 'assigned'
    });

    setNewAssignment({
      judgeId: '',
      type: 'individual',
      candidateId: '',
      groupId: '',
      caseStudy: '',
      dueDate: '',
      priority: 'normal'
    });
    setShowAddAssignment(false);
  };

  const filteredJudges = judges.filter(judge => {
    const matchesSearch = judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         judge.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || judge.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getJudgeAssignments = (judgeId: string) => {
    return assignments.filter(assignment => assignment.judgeId === judgeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 animate-fade-in">
      {/* Header */}
      <div className="glass border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBackToDashboard}
                className="rounded-xl hover-lift"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="divider-luxury"></div>
              <div>
                <h1 className="text-3xl font-bold gradient-text-premium">Judge & Assignment Management</h1>
                <p className="text-lg text-muted-foreground">Manage assessors and their evaluation assignments</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold gradient-text">{judges.length}</div>
                <div className="text-sm text-muted-foreground">Active Judges</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Search and Filters */}
        <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search judges or assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 surface-luxury border-slate-200 rounded-xl focus-elegant"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 surface-luxury border-slate-200 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="surface-luxury border-2 border-slate-200 p-2 rounded-2xl card-shadow">
            <TabsTrigger 
              value="judges" 
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-xl font-semibold"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Judge Management
            </TabsTrigger>
            <TabsTrigger 
              value="assignments" 
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-xl font-semibold"
            >
              <Target className="w-4 h-4 mr-2" />
              Assignment Management
            </TabsTrigger>
          </TabsList>

          {/* Judges Tab */}
          <TabsContent value="judges" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold gradient-text">Judge Management</h2>
              <Button
                onClick={() => setShowAddJudge(true)}
                className="bg-slate-600 hover:bg-slate-700 rounded-xl card-shadow hover-lift"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Judge
              </Button>
            </div>

            {/* Add Judge Form */}
            {showAddJudge && (
              <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl gradient-text flex items-center gap-3">
                    <UserCheck className="w-6 h-6" />
                    Add New Judge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Full Name *</Label>
                      <Input
                        value={newJudge.name}
                        onChange={(e) => setNewJudge(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Judge's full name"
                        className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Email Address *</Label>
                      <Input
                        type="email"
                        value={newJudge.email}
                        onChange={(e) => setNewJudge(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="judge@company.com"
                        className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Phone Number</Label>
                      <Input
                        value={newJudge.phone}
                        onChange={(e) => setNewJudge(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                      />
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Judge Role</Label>
                      <Select value={newJudge.role} onValueChange={(value: any) => setNewJudge(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="senior">Senior Judge</SelectItem>
                          <SelectItem value="junior">Junior Judge</SelectItem>
                          <SelectItem value="guest">Guest Judge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Status</Label>
                      <Select value={newJudge.status} onValueChange={(value: any) => setNewJudge(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleAddJudge} className="bg-slate-600 hover:bg-slate-700 rounded-xl">
                      <Save className="w-4 h-4 mr-2" />
                      Add Judge
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddJudge(false)} className="rounded-xl">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Judges List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJudges.map(judge => (
                <Card key={judge.id} className="surface-luxury border-2 border-slate-200 rounded-3xl hover-lift transition-all duration-500 status-elite">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg gradient-text">{judge.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">{judge.role} Judge</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(judge.status)} text-white rounded-xl px-3 py-1`}>
                        {judge.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{judge.email}</span>
                    </div>
                    {judge.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{judge.phone}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold gradient-text">{judge.totalAssignments}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold gradient-text">{judge.completedAssignments}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 hover-lift rounded-xl"
                            onClick={() => handleEditJudge(judge)}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="surface-luxury rounded-2xl border-2 border-slate-200 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl gradient-text">Edit Judge</DialogTitle>
                            <DialogDescription>
                              Update judge information and settings.
                            </DialogDescription>
                          </DialogHeader>
                          {editingJudge && (
                            <div className="space-y-6 py-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    value={editingJudge.name}
                                    onChange={(e) => setEditingJudge(prev => prev ? {...prev, name: e.target.value} : null)}
                                    className="surface-luxury border-slate-200 rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input
                                    value={editingJudge.email}
                                    onChange={(e) => setEditingJudge(prev => prev ? {...prev, email: e.target.value} : null)}
                                    className="surface-luxury border-slate-200 rounded-xl"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-3 pt-4">
                                <Button onClick={handleSaveEditJudge} className="bg-slate-600 hover:bg-slate-700 rounded-xl">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setEditingJudge(null)} className="rounded-xl">
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
                              Remove Judge
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-base">
                              Are you sure you want to remove <strong>{judge.name}</strong>? 
                              This will also remove all their assignments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteJudge(judge.id)}
                              className="bg-red-600 hover:bg-red-700 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Judge
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold gradient-text">Assignment Management</h2>
              <Button
                onClick={() => setShowAddAssignment(true)}
                className="bg-slate-600 hover:bg-slate-700 rounded-xl card-shadow hover-lift"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>

            {/* Add Assignment Form */}
            {showAddAssignment && (
              <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl gradient-text flex items-center gap-3">
                    <Target className="w-6 h-6" />
                    Create New Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Select Assessor *</Label>
                      <Select value={newAssignment.judgeId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, judgeId: value }))}>
                        <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                          <SelectValue placeholder="Choose an assessor" />
                        </SelectTrigger>
                        <SelectContent>
                          {judges.map(judge => (
                            <SelectItem key={judge.id} value={judge.id}>
                              {judge.name} ({judge.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Assignment Type *</Label>
                      <Select value={newAssignment.type} onValueChange={(value: any) => setNewAssignment(prev => ({ ...prev, type: value, candidateId: '', groupId: '' }))}>
                        <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual Assessment</SelectItem>
                          <SelectItem value="group">Group Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newAssignment.type === 'individual' && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Select Candidate *</Label>
                      <Select value={newAssignment.candidateId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, candidateId: value }))}>
                        <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                          <SelectValue placeholder="Choose a candidate" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidates.map((candidate: any) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newAssignment.type === 'group' && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Select Group *</Label>
                      <Select value={newAssignment.groupId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, groupId: value }))}>
                        <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                          <SelectValue placeholder="Choose a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((group: any) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Case Study *
                    </Label>
                    <Select value={newAssignment.caseStudy} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, caseStudy: value }))}>
                      <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                        <SelectValue placeholder="Select a case study for this assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {caseStudies.map((cs: any) => (
                          <SelectItem key={cs.id} value={cs.name}>
                            {cs.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newAssignment.caseStudy && caseStudies.find((cs: any) => cs.name === newAssignment.caseStudy)?.description && (
                      <p className="text-sm text-muted-foreground pl-1">
                        {caseStudies.find((cs: any) => cs.name === newAssignment.caseStudy)?.description}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Due Date *</Label>
                      <Input
                        type="date"
                        value={newAssignment.dueDate}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Priority</Label>
                      <Select value={newAssignment.priority} onValueChange={(value: any) => setNewAssignment(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="surface-luxury border-slate-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button onClick={handleCreateAssignment} className="bg-slate-600 hover:bg-slate-700 rounded-xl">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Assignment
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddAssignment(false)} className="rounded-xl">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assignments List */}
            <div className="grid gap-6">
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl gradient-text mb-2">No Assignments Yet</h3>
                  <p className="text-muted-foreground">Click "Create Assignment" to get started</p>
                </div>
              ) : (
                assignments.map(assignment => {
                  const judge = judges.find(j => j.id === assignment.judgeId);
                  const candidate = candidates.find((c: any) => c.id === assignment.candidateId);
                  const group = groups.find((g: any) => g.id === assignment.groupId);
                  
                  return (
                    <Card key={assignment.id} className="surface-luxury border-2 border-slate-200 rounded-3xl hover-lift transition-all duration-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <Badge className={`${getStatusColor(assignment.status)} text-white rounded-xl px-3 py-1`}>
                                {assignment.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={`${getPriorityColor(assignment.priority)} text-white rounded-xl px-3 py-1`}>
                                {assignment.priority}
                              </Badge>
                              <Badge variant="outline" className="rounded-xl">
                                {assignment.type}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold">{judge?.name || 'Unknown Assessor'}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {assignment.type === 'individual' ? (
                                  <>
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span>{candidate?.name || 'Unknown Candidate'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span>{group?.name || 'Unknown Group'}</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{assignment.caseStudy}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="rounded-xl">
                              <Edit3 className="w-4 h-4" />
                            </Button>
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
                                    Delete Assignment
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-base">
                                    Are you sure you want to delete this assignment? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onDeleteAssignment(assignment.id)}
                                    className="bg-red-600 hover:bg-red-700 rounded-xl"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}