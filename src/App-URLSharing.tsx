import { useState, useEffect } from 'react';
import { NewIndividualAssessmentForm, IndividualAssessmentData } from './components/NewIndividualAssessmentForm';
import { NewGroupAssessmentForm, GroupAssessmentData } from './components/NewGroupAssessmentForm';
import { NewIndividualHeatmapView } from './components/NewIndividualHeatmapView';
import { NewGroupHeatmapView } from './components/NewGroupHeatmapView';
import { GroupManager } from './components/GroupManager';
import { URLSharingManager } from './components/URLSharingManager';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ClipboardList, BarChart3, Settings, Users, Edit, QrCode, UserCheck, Target, Share2, Wifi } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

const DEFAULT_GROUPS = ['Group A', 'Group B', 'Group C'];
const DEFAULT_CASE_STUDIES = ['Case Study 1', 'Case Study 2'];

// Simple cloud sync simulation (in real implementation, this would use a real API)
class CloudSync {
  private static STORAGE_URL = 'https://api.jsonbin.io/v3/b'; // Mock API endpoint
  private sessionId: string;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async saveData(data: any) {
    try {
      // In real implementation, save to cloud
      localStorage.setItem(`session-${this.sessionId}`, JSON.stringify({
        ...data,
        lastUpdated: Date.now(),
        sessionId: this.sessionId
      }));
      return true;
    } catch (error) {
      console.error('Failed to save to cloud:', error);
      return false;
    }
  }

  async loadData() {
    try {
      // In real implementation, load from cloud
      const data = localStorage.getItem(`session-${this.sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      return null;
    }
  }

  startSync(onDataUpdate: (data: any) => void) {
    this.syncInterval = setInterval(async () => {
      const cloudData = await this.loadData();
      if (cloudData && cloudData.lastUpdated) {
        onDataUpdate(cloudData);
      }
    }, 5000); // Sync every 5 seconds
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export default function App() {
  const [individualAssessments, setIndividualAssessments] = useState<IndividualAssessmentData[]>([]);
  const [groupAssessments, setGroupAssessments] = useState<GroupAssessmentData[]>([]);
  const [groups, setGroups] = useState<string[]>(DEFAULT_GROUPS);
  const [caseStudies, setCaseStudies] = useState<string[]>(DEFAULT_CASE_STUDIES);
  
  // URL Sharing specific state
  const [currentSession, setCurrentSession] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [connectedAssessors, setConnectedAssessors] = useState<number>(1);
  const [cloudSync, setCloudSync] = useState<CloudSync | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Initialize session from URL or create new one
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get('session');
    
    if (sessionParam) {
      // Joining existing session
      setCurrentSession(sessionParam);
      setIsHost(false);
      toast.success(`Joined session: ${sessionParam}`);
    } else {
      // Create new session
      const newSessionId = generateSessionId();
      setCurrentSession(newSessionId);
      setIsHost(true);
      
      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set('session', newSessionId);
      window.history.replaceState({}, '', url.toString());
      
      toast.success(`New session created: ${newSessionId}`);
    }

    // Track recent sessions
    const recentSessions = JSON.parse(localStorage.getItem('recent-sessions') || '[]');
    if (sessionParam && !recentSessions.includes(sessionParam)) {
      recentSessions.unshift(sessionParam);
      localStorage.setItem('recent-sessions', JSON.stringify(recentSessions.slice(0, 5)));
    }
  }, []);

  // Initialize cloud sync when session changes
  useEffect(() => {
    if (currentSession) {
      const sync = new CloudSync(currentSession);
      setCloudSync(sync);

      // Load existing data from session
      sync.loadData().then(sessionData => {
        if (sessionData && sessionData.data) {
          const data = sessionData.data;
          if (data.individualAssessments) setIndividualAssessments(data.individualAssessments);
          if (data.groupAssessments) setGroupAssessments(data.groupAssessments);
          if (data.groups) setGroups(data.groups);
          if (data.caseStudies) setCaseStudies(data.caseStudies);
          setLastSyncTime(new Date(sessionData.lastUpdated));
          toast.success('Loaded existing session data');
        }
      });

      // Start real-time sync
      sync.startSync((sessionData) => {
        if (sessionData && sessionData.data) {
          const data = sessionData.data;
          setIndividualAssessments(data.individualAssessments || []);
          setGroupAssessments(data.groupAssessments || []);
          setGroups(data.groups || DEFAULT_GROUPS);
          setCaseStudies(data.caseStudies || DEFAULT_CASE_STUDIES);
          setLastSyncTime(new Date(sessionData.lastUpdated));
          setConnectedAssessors(sessionData.connectedUsers || 1);
        }
      });

      return () => {
        sync.stopSync();
      };
    }
  }, [currentSession]);

  // Save data to cloud whenever it changes
  useEffect(() => {
    if (cloudSync && currentSession) {
      const sessionData = {
        data: {
          individualAssessments,
          groupAssessments,
          groups,
          caseStudies
        },
        connectedUsers: connectedAssessors,
        lastUpdated: Date.now()
      };
      
      cloudSync.saveData(sessionData).then(success => {
        if (success) {
          setLastSyncTime(new Date());
        }
      });
    }
  }, [individualAssessments, groupAssessments, groups, caseStudies, cloudSync, currentSession, connectedAssessors]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online - syncing data...');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline - data will sync when reconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateSessionId = () => {
    const adjectives = ['Red', 'Blue', 'Green', 'Gold', 'Silver', 'Fast', 'Smart', 'Bold', 'Swift', 'Bright'];
    const nouns = ['Lion', 'Eagle', 'Tiger', 'Wolf', 'Bear', 'Shark', 'Phoenix', 'Dragon', 'Falcon', 'Panther'];
    const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}${numbers}`;
  };

  const handleSessionChange = (newSessionId: string) => {
    setCurrentSession(newSessionId);
    setIsHost(true); // Assume host when creating new session
    
    // Track recent sessions
    const recentSessions = JSON.parse(localStorage.getItem('recent-sessions') || '[]');
    if (!recentSessions.includes(newSessionId)) {
      recentSessions.unshift(newSessionId);
      localStorage.setItem('recent-sessions', JSON.stringify(recentSessions.slice(0, 5)));
    }
  };

  const handleSubmitIndividualAssessment = (newAssessment: IndividualAssessmentData) => {
    setIndividualAssessments(prev => [...prev, newAssessment]);
    toast.success('Assessment saved and synced to all assessors!');
  };

  const handleSubmitGroupAssessment = (newGroupAssessment: GroupAssessmentData) => {
    setGroupAssessments(prev => [...prev, newGroupAssessment]);
    toast.success('Group assessment saved and synced to all assessors!');
  };

  const getStats = () => {
    const uniqueCandidates = new Set(individualAssessments.map(a => a.candidateName)).size;
    const uniqueAssessors = new Set([
      ...individualAssessments.map(a => a.assessorName),
      ...groupAssessments.map(a => a.assessorName)
    ]).size;
    const assessedIndividualGroups = new Set(
      individualAssessments.map(a => `${a.groupId}-${a.caseStudy}`)
    ).size;
    const assessedGroups = new Set(
      groupAssessments.map(a => `${a.groupId}-${a.caseStudy}`)
    ).size;

    // Calculate performance distribution
    const individualBands = individualAssessments.reduce((acc, a) => {
      acc[a.performanceBand] = (acc[a.performanceBand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const groupBands = groupAssessments.reduce((acc, a) => {
      acc[a.performanceBand] = (acc[a.performanceBand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIndividualAssessments: individualAssessments.length,
      totalGroupAssessments: groupAssessments.length,
      uniqueCandidates,
      uniqueAssessors,
      assessedIndividualGroups,
      assessedGroups,
      totalPossibleCombinations: groups.length * caseStudies.length,
      individualBands,
      groupBands,
      avgIndividualScore: individualAssessments.length > 0 
        ? Math.round((individualAssessments.reduce((sum, a) => sum + a.totalScore, 0) / individualAssessments.length) * 10) / 10 
        : 0,
      avgGroupScore: groupAssessments.length > 0 
        ? Math.round((groupAssessments.reduce((sum, a) => sum + a.totalScore, 0) / groupAssessments.length) * 10) / 10 
        : 0
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Session Info */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Future Ready Assessment Platform
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Collaborative real-time assessment system with live data sharing across all assessors.
          </p>
          
          {/* Session Status Bar */}
          <div className="flex items-center justify-center gap-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Session: {currentSession}</span>
              {isHost && <Badge className="bg-red-600 text-xs">Host</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{connectedAssessors} assessor{connectedAssessors !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {lastSyncTime && (
              <span className="text-xs text-red-600">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Individual Assessment Stats */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <UserCheck className="w-5 h-5" />
                Individual Assessment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.totalIndividualAssessments}</div>
                  <div className="text-sm text-red-700">Assessments</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.uniqueCandidates}</div>
                  <div className="text-sm text-red-700">Candidates</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.avgIndividualScore}</div>
                  <div className="text-sm text-red-700">Avg Score / 100</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.individualBands?.Exceptional || 0}</div>
                  <div className="text-sm text-red-700">Exceptional</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Assessment Stats */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Users className="w-5 h-5" />
                Group Assessment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.totalGroupAssessments}</div>
                  <div className="text-sm text-red-700">Assessments</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.assessedGroups}</div>
                  <div className="text-sm text-red-700">Groups Assessed</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.avgGroupScore}</div>
                  <div className="text-sm text-red-700">Avg Score / 100</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.groupBands?.Exceptional || 0}</div>
                  <div className="text-sm text-red-700">Exceptional</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 border border-red-200">
            <TabsTrigger value="individual" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <UserCheck className="w-4 h-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Group
            </TabsTrigger>
            <TabsTrigger value="individual-results" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              Individual Heatmap
            </TabsTrigger>
            <TabsTrigger value="group-results" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              Group Heatmap
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Share2 className="w-4 h-4" />
              Session
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <QrCode className="w-4 h-4" />
              QR Access
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <NewIndividualAssessmentForm
              groups={groups}
              caseStudies={caseStudies}
              onSubmit={handleSubmitIndividualAssessment}
              existingAssessments={individualAssessments}
            />
          </TabsContent>

          <TabsContent value="group">
            <NewGroupAssessmentForm
              groups={groups}
              caseStudies={caseStudies}
              onSubmit={handleSubmitGroupAssessment}
              existingAssessments={groupAssessments}
            />
          </TabsContent>

          <TabsContent value="individual-results">
            <NewIndividualHeatmapView
              assessments={individualAssessments}
              groups={groups}
              caseStudies={caseStudies}
            />
          </TabsContent>

          <TabsContent value="group-results">
            <NewGroupHeatmapView
              groupAssessments={groupAssessments}
              groups={groups}
              caseStudies={caseStudies}
            />
          </TabsContent>

          <TabsContent value="session">
            <URLSharingManager
              onSessionChange={handleSessionChange}
              currentSession={currentSession}
              isHost={isHost}
              connectedAssessors={connectedAssessors}
            />
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeGenerator />
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-6">
              <GroupManager
                groups={groups}
                caseStudies={caseStudies}
                onUpdateGroups={setGroups}
                onUpdateCaseStudies={setCaseStudies}
              />
              
              {(individualAssessments.length > 0 || groupAssessments.length > 0) && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-900">Live Session Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {individualAssessments.length > 0 && (
                        <div>
                          <h4 className="mb-3 font-medium text-red-900">Recent Individual Assessments</h4>
                          <div className="space-y-2">
                            {individualAssessments.slice(-3).reverse().map((assessment) => (
                              <div key={assessment.id} className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded border border-red-100">
                                <Badge variant="outline" className="border-red-300">{assessment.candidateName}</Badge>
                                <span className="text-red-700">by {assessment.assessorName}</span>
                                <Badge variant="secondary">{assessment.groupId}</Badge>
                                <Badge variant="secondary">{assessment.caseStudy}</Badge>
                                <Badge className={`${assessment.performanceBand === 'Exceptional' ? 'bg-emerald-600' : 
                                  assessment.performanceBand === 'Strong' ? 'bg-green-600' : 
                                  assessment.performanceBand === 'Developing' ? 'bg-orange-600' : 'bg-red-600'}`}>
                                  {assessment.totalScore}/100
                                </Badge>
                              </div>
                            ))}
                            {individualAssessments.length > 3 && (
                              <p className="text-xs text-red-600">
                                ...and {individualAssessments.length - 3} more individual assessments
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {groupAssessments.length > 0 && (
                        <div>
                          <h4 className="mb-3 font-medium text-red-900">Recent Group Assessments</h4>
                          <div className="space-y-2">
                            {groupAssessments.slice(-3).reverse().map((assessment) => (
                              <div key={assessment.id} className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded border border-red-100">
                                <Badge variant="outline" className="border-red-300">
                                  {assessment.groupId} Team
                                </Badge>
                                <span className="text-red-700">by {assessment.assessorName}</span>
                                <Badge variant="secondary">{assessment.caseStudy}</Badge>
                                <Badge variant="outline" className="border-blue-300 text-blue-700">
                                  {assessment.teamMembers.length} members
                                </Badge>
                                <Badge className={`${assessment.performanceBand === 'Exceptional' ? 'bg-emerald-600' : 
                                  assessment.performanceBand === 'Strong' ? 'bg-green-600' : 
                                  assessment.performanceBand === 'Developing' ? 'bg-orange-600' : 'bg-red-600'}`}>
                                  {assessment.totalScore}/100
                                </Badge>
                              </div>
                            ))}
                            {groupAssessments.length > 3 && (
                              <p className="text-xs text-red-600">
                                ...and {groupAssessments.length - 3} more group assessments
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}