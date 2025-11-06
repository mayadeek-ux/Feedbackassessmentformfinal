import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { CaseStudyManager } from './CaseStudyManager';
import { 
  Calendar,
  Users,
  UserCheck,
  UsersIcon,
  FileText,
  Target,
  List,
  Download,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  BookOpen
} from 'lucide-react';

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock case studies data
  const [caseStudies, setCaseStudies] = useState([
    {
      id: 'cs-1',
      name: 'Digital Transformation Case',
      description: 'Navigate a complex digital transformation initiative while maintaining team morale and customer satisfaction.',
      difficulty: 'Advanced' as const,
      estimatedDuration: 120,
      isActive: true,
      createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      usageCount: 15
    },
    {
      id: 'cs-2',
      name: 'Innovation Strategy Case',
      description: 'Develop and implement an innovation strategy for a traditional manufacturing company entering new markets.',
      difficulty: 'Intermediate' as const,
      estimatedDuration: 90,
      isActive: true,
      createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      usageCount: 8
    },
    {
      id: 'cs-3',
      name: 'Leadership Crisis Case',
      description: 'Handle a leadership crisis involving team conflicts and declining performance metrics.',
      difficulty: 'Advanced' as const,
      estimatedDuration: 105,
      isActive: true,
      createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      usageCount: 12
    },
    {
      id: 'cs-4',
      name: 'Future Workspace Design',
      description: 'Design the future of work for a hybrid organization balancing remote and in-person collaboration.',
      difficulty: 'Intermediate' as const,
      estimatedDuration: 75,
      isActive: false,
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      usageCount: 3
    }
  ]);

  // Mock data
  const stats = {
    totalEvents: 3,
    activeEvents: 1,
    totalJudges: 12,
    totalCandidates: 45,
    totalAssignments: 156,
    completedAssessments: 89,
    pendingAssessments: 67
  };

  const events = [
    { id: 1, name: 'Future Ready Leadership 2024', status: 'active', judges: 12, candidates: 45, startDate: '2024-01-15' },
    { id: 2, name: 'Innovation Challenge 2024', status: 'upcoming', judges: 8, candidates: 32, startDate: '2024-02-20' },
    { id: 3, name: 'Digital Transformation Summit', status: 'completed', judges: 10, candidates: 38, startDate: '2023-12-10' }
  ];

  const judges = [
    { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah.wilson@company.com', assignedEvents: 2, completedAssessments: 15 },
    { id: 2, name: 'Michael Chen', email: 'michael.chen@company.com', assignedEvents: 1, completedAssessments: 8 },
    { id: 3, name: 'Lisa Rodriguez', email: 'lisa.rodriguez@company.com', assignedEvents: 3, completedAssessments: 22 }
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-red-900">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage events, judges, participants, and view assessment analytics
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
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
          title="Judges" 
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
          <TabsTrigger value="judges" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Judges
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
          <TabsTrigger value="capabilities" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Capabilities
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
              <Button variant="outline" className="border-red-200">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
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
                      <th className="text-left p-4 font-medium text-red-900">Judges</th>
                      <th className="text-left p-4 font-medium text-red-900">Candidates</th>
                      <th className="text-left p-4 font-medium text-red-900">Start Date</th>
                      <th className="text-left p-4 font-medium text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-gray-100 hover:bg-red-50/50">
                        <td className="p-4">
                          <div className="font-medium text-red-900">{event.name}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={
                            event.status === 'active' ? 'bg-green-500' :
                            event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
                          }>
                            {event.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-700">{event.judges}</td>
                        <td className="p-4 text-gray-700">{event.candidates}</td>
                        <td className="p-4 text-gray-700">{new Date(event.startDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-red-200">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Judges Tab */}
        <TabsContent value="judges" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                placeholder="Search judges..."
                className="pl-10 bg-white border-red-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="border-red-200">
                <Upload className="w-4 h-4 mr-2" />
                Import Judges
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Judge
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
                      <th className="text-left p-4 font-medium text-red-900">Assigned Events</th>
                      <th className="text-left p-4 font-medium text-red-900">Completed Assessments</th>
                      <th className="text-left p-4 font-medium text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {judges.map((judge) => (
                      <tr key={judge.id} className="border-b border-gray-100 hover:bg-red-50/50">
                        <td className="p-4">
                          <div className="font-medium text-red-900">{judge.name}</div>
                        </td>
                        <td className="p-4 text-gray-700">{judge.email}</td>
                        <td className="p-4 text-gray-700">{judge.assignedEvents}</td>
                        <td className="p-4 text-gray-700">{judge.completedAssessments}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-red-200">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="participants">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Participants Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Participant management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Teams Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Assignments Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Assignment management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Capabilities Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Capability configuration interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Studies Tab */}
        <TabsContent value="case-studies" className="space-y-4">
          <CaseStudyManager 
            caseStudies={caseStudies}
            onUpdateCaseStudies={setCaseStudies}
          />
        </TabsContent>

        <TabsContent value="exports">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Export & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Individual Leaderboard</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export ranking of all individual candidates with scores
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-red-200">
                        Export CSV
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200">
                        Export PDF
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Group Leaderboard</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export ranking of all teams with group assessment scores
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-red-200">
                        Export CSV
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200">
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}