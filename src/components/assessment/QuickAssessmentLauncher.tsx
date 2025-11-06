import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft,
  Users,
  User,
  BookOpen,
  Play,
  Search
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface QuickAssessmentLauncherProps {
  candidates: any[];
  groups: any[];
  caseStudies: any[];
  onBack: () => void;
  onStartIndividualAssessment: (candidateName: string, caseStudy: string, isNewCandidate: boolean) => void;
  onStartGroupAssessment: (groupId: string, caseStudy: string) => void;
  onAddCandidate: (candidateData: any) => void;
}

export function QuickAssessmentLauncher({
  candidates,
  groups,
  caseStudies,
  onBack,
  onStartIndividualAssessment,
  onStartGroupAssessment,
  onAddCandidate
}: QuickAssessmentLauncherProps) {
  const [assessmentType, setAssessmentType] = useState<'individual' | 'group'>('individual');
  const [candidateName, setCandidateName] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartAssessment = () => {
    if (!selectedCaseStudy) {
      toast.error('Please select a case study');
      return;
    }

    if (assessmentType === 'individual') {
      if (candidateName.trim()) {
        // Check if this is a new candidate
        const existingCandidate = candidates.find(c => 
          c.name.toLowerCase() === candidateName.trim().toLowerCase()
        );
        
        if (!existingCandidate) {
          // Create new candidate
          const newCandidateData = {
            name: candidateName.trim(),
            caseStudy: selectedCaseStudy,
            email: '',
            department: '',
            position: ''
          };
          onAddCandidate(newCandidateData);
          toast.success(`New candidate "${candidateName}" added to individuals`);
        }
        
        onStartIndividualAssessment(candidateName.trim(), selectedCaseStudy, !existingCandidate);
      } else if (selectedCandidateId) {
        const candidate = candidates.find(c => c.id === selectedCandidateId);
        if (candidate) {
          onStartIndividualAssessment(candidate.name, selectedCaseStudy, false);
        }
      } else {
        toast.error('Please enter a candidate name or select from existing candidates');
      }
    } else {
      if (!selectedGroupId) {
        toast.error('Please select a group');
        return;
      }
      onStartGroupAssessment(selectedGroupId, selectedCaseStudy);
    }
  };

  const selectedCase = caseStudies.find(cs => cs.id === selectedCaseStudy);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="glass rounded-3xl p-8 card-shadow-lg border-2 border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-red-200 hover:bg-red-50 transition-all duration-300 px-6 py-3 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="border-l border-red-200 pl-6">
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                <Play className="w-8 h-8" />
                Start New Assessment
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Quick launch for individual or group assessments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Type Selection */}
      <div className="glass rounded-2xl p-6 border-2 border-white/20">
        <h3 className="font-semibold gradient-text mb-4">Assessment Type</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            onClick={() => setAssessmentType('individual')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
              assessmentType === 'individual'
                ? 'border-slate-600 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <User className="w-6 h-6 mb-2" />
            <h4 className="font-semibold">Individual Assessment</h4>
            <p className="text-sm text-muted-foreground mt-1">Assess individual candidate performance</p>
          </div>
          <div
            onClick={() => setAssessmentType('group')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
              assessmentType === 'group'
                ? 'border-slate-600 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Users className="w-6 h-6 mb-2" />
            <h4 className="font-semibold">Group Assessment</h4>
            <p className="text-sm text-muted-foreground mt-1">Assess group dynamics and collaboration</p>
          </div>
        </div>
      </div>

      {/* Case Study Selection */}
      <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
        <CardHeader>
          <CardTitle className="gradient-text text-xl flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            Select Case Study
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedCaseStudy} onValueChange={setSelectedCaseStudy}>
            <SelectTrigger className="surface-luxury border-slate-200 rounded-xl focus-elegant">
              <SelectValue placeholder="Choose the case study for this assessment" />
            </SelectTrigger>
            <SelectContent>
              {caseStudies.map(cs => (
                <SelectItem key={cs.id} value={cs.id}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {cs.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCase && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-2">{selectedCase.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedCase.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participant Selection */}
      <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
        <CardHeader>
          <CardTitle className="gradient-text text-xl flex items-center gap-3">
            {assessmentType === 'individual' ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            Select {assessmentType === 'individual' ? 'Candidate' : 'Group'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessmentType === 'individual' ? (
            <Tabs defaultValue="new" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 surface-luxury border-2 border-white/20 p-2 rounded-2xl">
                <TabsTrigger 
                  value="new"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-xl"
                >
                  Enter New Candidate
                </TabsTrigger>
                <TabsTrigger 
                  value="existing"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-xl"
                >
                  Select Existing ({candidates.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="candidateName" className="text-base font-semibold">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    value={candidateName}
                    onChange={(e) => {
                      setCandidateName(e.target.value);
                      setSelectedCandidateId(''); // Clear existing selection
                    }}
                    placeholder="Enter candidate's full name"
                    className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                  />
                  <p className="text-sm text-muted-foreground">
                    New candidates will be automatically added to your individuals list
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="existing" className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search candidates..."
                      className="pl-10 surface-luxury border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 max-h-64 overflow-y-auto">
                    {filteredCandidates.map(candidate => (
                      <div
                        key={candidate.id}
                        onClick={() => {
                          setSelectedCandidateId(candidate.id);
                          setCandidateName(''); // Clear new candidate input
                        }}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedCandidateId === candidate.id
                            ? 'border-slate-600 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{candidate.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {candidate.status?.replace('_', ' ') || 'Ready'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{candidate.caseStudy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="pl-10 surface-luxury border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 max-h-64 overflow-y-auto">
                {filteredGroups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedGroupId === group.id
                        ? 'border-slate-600 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{group.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {group.memberIds.length} members
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                    <p className="text-xs text-muted-foreground">{group.caseStudy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Launch Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleStartAssessment}
          disabled={
            !selectedCaseStudy || 
            (assessmentType === 'individual' && !candidateName.trim() && !selectedCandidateId) ||
            (assessmentType === 'group' && !selectedGroupId)
          }
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl px-12 py-6 text-lg"
        >
          <Play className="w-5 h-5 mr-3" />
          Start {assessmentType === 'individual' ? 'Individual' : 'Group'} Assessment
        </Button>
      </div>
    </div>
  );
}