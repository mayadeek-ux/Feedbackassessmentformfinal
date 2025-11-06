import { useState, useEffect } from 'react';
import { NewIndividualAssessmentForm, IndividualAssessmentData } from './components/NewIndividualAssessmentForm';
import { NewGroupAssessmentForm, GroupAssessmentData } from './components/NewGroupAssessmentForm';
import { NewIndividualHeatmapView } from './components/NewIndividualHeatmapView';
import { NewGroupHeatmapView } from './components/NewGroupHeatmapView';
import { GroupManager } from './components/GroupManager';
import { FileSharingManager } from './components/FileSharingManager';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { ClipboardList, BarChart3, Settings, Users, Edit, QrCode, UserCheck, Target, FileText, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

const STORAGE_KEYS = {
  INDIVIDUAL_ASSESSMENTS: 'future-ready-individual-assessments',
  GROUP_ASSESSMENTS: 'future-ready-group-assessments',
  GROUPS: 'event-groups', 
  CASE_STUDIES: 'event-case-studies',
  ASSESSOR_INFO: 'assessor-info'
};

const DEFAULT_GROUPS = ['Group A', 'Group B', 'Group C'];
const DEFAULT_CASE_STUDIES = ['Case Study 1', 'Case Study 2'];

export default function App() {
  const [individualAssessments, setIndividualAssessments] = useState<IndividualAssessmentData[]>([]);
  const [groupAssessments, setGroupAssessments] = useState<GroupAssessmentData[]>([]);
  const [groups, setGroups] = useState<string[]>(DEFAULT_GROUPS);
  const [caseStudies, setCaseStudies] = useState<string[]>(DEFAULT_CASE_STUDIES);
  
  // File sharing specific state
  const [assessorName, setAssessorName] = useState<string>('');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedIndividualAssessments = localStorage.getItem(STORAGE_KEYS.INDIVIDUAL_ASSESSMENTS);
    const savedGroupAssessments = localStorage.getItem(STORAGE_KEYS.GROUP_ASSESSMENTS);
    const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
    const savedCaseStudies = localStorage.getItem(STORAGE_KEYS.CASE_STUDIES);
    const savedAssessorInfo = localStorage.getItem(STORAGE_KEYS.ASSESSOR_INFO);

    if (savedIndividualAssessments) {
      try {
        setIndividualAssessments(JSON.parse(savedIndividualAssessments));
      } catch (error) {
        console.error('Failed to parse saved individual assessments:', error);
      }
    }

    if (savedGroupAssessments) {
      try {
        setGroupAssessments(JSON.parse(savedGroupAssessments));
      } catch (error) {
        console.error('Failed to parse saved group assessments:', error);
      }
    }

    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch (error) {
        console.error('Failed to parse saved groups:', error);
      }
    }

    if (savedCaseStudies) {
      try {
        setCaseStudies(JSON.parse(savedCaseStudies));
      } catch (error) {
        console.error('Failed to parse saved case studies:', error);
      }
    }

    if (savedAssessorInfo) {
      try {
        const info = JSON.parse(savedAssessorInfo);
        setAssessorName(info.name || '');
        setLastSaveTime(info.lastSave ? new Date(info.lastSave) : null);
      } catch (error) {
        console.error('Failed to parse saved assessor info:', error);
      }
    }

    // Prompt for assessor name if not set
    if (!savedAssessorInfo) {
      setTimeout(() => {
        const name = prompt('Enter your name as an assessor (this will be used for file exports):');
        if (name?.trim()) {
          setAssessorName(name.trim());
          localStorage.setItem(STORAGE_KEYS.ASSESSOR_INFO, JSON.stringify({
            name: name.trim(),
            created: new Date().toISOString()
          }));
        }
      }, 1000);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INDIVIDUAL_ASSESSMENTS, JSON.stringify(individualAssessments));
    setHasUnsavedChanges(true);
    updateLastSaveTime();
  }, [individualAssessments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUP_ASSESSMENTS, JSON.stringify(groupAssessments));
    setHasUnsavedChanges(true);
    updateLastSaveTime();
  }, [groupAssessments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(caseStudies));
  }, [caseStudies]);

  // Update assessor info
  useEffect(() => {
    if (assessorName) {
      const info = {
        name: assessorName,
        lastSave: lastSaveTime?.toISOString(),
        created: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ASSESSOR_INFO, JSON.stringify(info));
    }
  }, [assessorName, lastSaveTime]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      toast.success('Back online - your data is safely stored locally');
    };
    
    const handleOffline = () => {
      setIsOfflineMode(true);
      toast.info('You are offline - all data is being saved locally');
    };

    setIsOfflineMode(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateLastSaveTime = () => {
    setLastSaveTime(new Date());
    setHasUnsavedChanges(false);
  };

  const handleSubmitIndividualAssessment = (newAssessment: IndividualAssessmentData) => {
    setIndividualAssessments(prev => [...prev, newAssessment]);
    toast.success('Individual assessment saved locally!');
  };

  const handleSubmitGroupAssessment = (newGroupAssessment: GroupAssessmentData) => {
    setGroupAssessments(prev => [...prev, newGroupAssessment]);
    toast.success('Group assessment saved locally!');
  };

  const handleImportData = (importedData: {
    individualAssessments?: IndividualAssessmentData[];
    groupAssessments?: GroupAssessmentData[];
    groups?: string[];
    caseStudies?: string[];
  }) => {
    if (importedData.individualAssessments) {
      setIndividualAssessments(importedData.individualAssessments);
    }
    if (importedData.groupAssessments) {
      setGroupAssessments(importedData.groupAssessments);
    }
    if (importedData.groups) {
      setGroups(importedData.groups);
    }
    if (importedData.caseStudies) {
      setCaseStudies(importedData.caseStudies);
    }
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
        {/* Header with File-based Mode Info */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Future Ready Assessment Platform
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Offline-ready assessment system with file-based data sharing. Work anywhere, share via files.
          </p>
          
          {/* Status Bar */}
          <div className="flex items-center justify-center gap-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">
                {assessorName || 'Unknown Assessor'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Online</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">File-Based</span>
            </div>
            {lastSaveTime && (
              <span className="text-xs text-red-600">
                Saved: {lastSaveTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* File Mode Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <FileText className="h-4 w-4" />
          <AlertTitle className="text-blue-900">File-Based Sharing Mode</AlertTitle>
          <AlertDescription className="text-blue-800">
            Your assessments are saved locally on this device. Use the "File Sharing" tab to export your data and import files from other assessors. 
            This mode works completely offline and doesn't require internet connectivity.
          </AlertDescription>
        </Alert>

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
            <TabsTrigger value="files" className="flex items-center gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4" />
              File Sharing
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

          <TabsContent value="files">
            <FileSharingManager
              individualAssessments={individualAssessments}
              groupAssessments={groupAssessments}
              groups={groups}
              caseStudies={caseStudies}
              onImportData={handleImportData}
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
              
              {/* Assessor Info Card */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-900">Assessor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="text-sm text-red-700">Assessor Name</div>
                        <div className="font-medium text-red-900">{assessorName || 'Not set'}</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="text-sm text-red-700">Storage Mode</div>
                        <div className="font-medium text-red-900">Local File-Based</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="text-sm text-red-700">Connection Status</div>
                        <div className={`font-medium ${isOfflineMode ? 'text-orange-700' : 'text-green-700'}`}>
                          {isOfflineMode ? 'Offline Ready' : 'Online'}
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="text-sm text-red-700">Last Saved</div>
                        <div className="font-medium text-red-900">
                          {lastSaveTime ? lastSaveTime.toLocaleString() : 'Never'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const newName = prompt('Enter your assessor name:', assessorName);
                          if (newName?.trim()) {
                            setAssessorName(newName.trim());
                            toast.success('Assessor name updated!');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Update Assessor Name
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Local Data Summary */}
              {(individualAssessments.length > 0 || groupAssessments.length > 0) && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-900">Local Assessment Data</CardTitle>
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