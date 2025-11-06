import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  ArrowLeft,
  Users,
  User,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Settings,
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface NewAssessmentWizardProps {
  candidates: any[];
  groups: any[];
  caseStudies: any[];
  onBack: () => void;
  onCreateAssessment: (assessmentData: any) => void;
}

interface AssessmentConfig {
  description: string;
  type: 'individual' | 'group' | 'mixed';
  caseStudyId: string;
  selectedCandidates: string[];
  selectedGroups: string[];
  timeLimit?: number;
  dueDate?: Date;
  instructions: string;
  enableAutoSave: boolean;
  allowResubmission: boolean;
  notifyOnSubmission: boolean;
}

export function NewAssessmentWizard({
  candidates,
  groups,
  caseStudies,
  onBack,
  onCreateAssessment
}: NewAssessmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<AssessmentConfig>({
    description: '',
    type: 'individual',
    caseStudyId: '',
    selectedCandidates: [],
    selectedGroups: [],
    instructions: '',
    enableAutoSave: true,
    allowResubmission: false,
    notifyOnSubmission: true
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const totalSteps = 4;

  const updateConfig = (updates: Partial<AssessmentConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleCandidateToggle = (candidateId: string) => {
    const updated = config.selectedCandidates.includes(candidateId)
      ? config.selectedCandidates.filter(id => id !== candidateId)
      : [...config.selectedCandidates, candidateId];
    updateConfig({ selectedCandidates: updated });
  };

  const handleGroupToggle = (groupId: string) => {
    const updated = config.selectedGroups.includes(groupId)
      ? config.selectedGroups.filter(id => id !== groupId)
      : [...config.selectedGroups, groupId];
    updateConfig({ selectedGroups: updated });
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return config.type && config.caseStudyId;
      case 2:
        return (config.type === 'individual' && config.selectedCandidates.length > 0) ||
               (config.type === 'group' && config.selectedGroups.length > 0) ||
               (config.type === 'mixed' && (config.selectedCandidates.length > 0 || config.selectedGroups.length > 0));
      case 3:
        return true; // Optional configurations
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleCreateAssessment = () => {
    const assessmentData = {
      ...config,
      dueDate: selectedDate,
      createdAt: new Date(),
      status: 'active',
      id: `assessment-${Date.now()}`
    };

    onCreateAssessment(assessmentData);
    toast.success('Assessment created successfully!');
  };

  const selectedCaseStudy = caseStudies.find(cs => cs.id === config.caseStudyId);
  const totalParticipants = config.selectedCandidates.length + 
    config.selectedGroups.reduce((total, groupId) => {
      const group = groups.find(g => g.id === groupId);
      return total + (group?.memberIds.length || 0);
    }, 0);

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
                Create and configure a comprehensive assessment experience
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="glass rounded-2xl p-6 border-2 border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold gradient-text">Assessment Setup Progress</h3>
          <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                i + 1 < currentStep 
                  ? 'bg-emerald-600 text-white' 
                  : i + 1 === currentStep 
                  ? 'bg-slate-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {i + 1 < currentStep ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{i + 1}</span>
                )}
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                  i + 1 < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
          <CardHeader>
            <CardTitle className="gradient-text text-2xl flex items-center gap-3">
              <Eye className="w-6 h-6" />
              Assessment Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Assessment Type</Label>
                  <Badge className="ml-2 capitalize">{config.type}</Badge>
                </div>
                <div>
                  <Label className="font-semibold">Case Study</Label>
                  <p>{selectedCaseStudy?.name || 'Not selected'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Total Participants</Label>
                  <p className="text-2xl font-bold gradient-text">{totalParticipants}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Due Date</Label>
                  <p>{selectedDate ? selectedDate.toLocaleDateString('en-GB') : 'No due date'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Time Limit</Label>
                  <p>{config.timeLimit ? `${config.timeLimit} minutes` : 'Unlimited'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Auto-save</Label>
                  <Badge variant={config.enableAutoSave ? 'default' : 'secondary'}>
                    {config.enableAutoSave ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
            {config.description && (
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="mt-2 text-muted-foreground bg-slate-50 p-3 rounded-xl">{config.description}</p>
              </div>
            )}
            {config.instructions && (
              <div>
                <Label className="font-semibold">Instructions</Label>
                <p className="mt-2 text-muted-foreground bg-slate-50 p-3 rounded-xl">{config.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Setup Steps */
        <div className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text text-xl flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  Step 1: Assessment Configuration
                </CardTitle>
                <p className="text-muted-foreground">Configure the assessment type and case study</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold">Assessment Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                    placeholder="Brief description of the assessment purpose and objectives (optional)"
                    className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Assessment Type *</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { value: 'individual', label: 'Individual Only', icon: User, desc: 'Assess individual candidates' },
                      { value: 'group', label: 'Group Only', icon: Users, desc: 'Assess team dynamics' },
                      { value: 'mixed', label: 'Mixed Assessment', icon: Users, desc: 'Both individual and group' }
                    ].map((type) => (
                      <div
                        key={type.value}
                        onClick={() => updateConfig({ type: type.value as any })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
                          config.type === type.value
                            ? 'border-slate-600 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <type.icon className="w-6 h-6 mb-2" />
                        <h4 className="font-semibold">{type.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{type.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Case Study *</Label>
                  <Select value={config.caseStudyId} onValueChange={(value) => updateConfig({ caseStudyId: value })}>
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
                  {selectedCaseStudy && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-semibold text-slate-700 mb-2">{selectedCaseStudy.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedCaseStudy.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Participants Selection */}
          {currentStep === 2 && (
            <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text text-xl flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  Step 2: Select Participants
                </CardTitle>
                <p className="text-muted-foreground">Choose who will participate in this assessment</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue={config.type === 'group' ? 'groups' : 'individuals'} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 surface-luxury border-2 border-white/20 p-2 rounded-2xl">
                    <TabsTrigger 
                      value="individuals" 
                      disabled={config.type === 'group'}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-xl"
                    >
                      Individual Candidates ({config.selectedCandidates.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="groups"
                      disabled={config.type === 'individual'}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-xl"
                    >
                      Groups ({config.selectedGroups.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="individuals" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Available Candidates</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateConfig({ selectedCandidates: candidates.map(c => c.id) })}
                          className="rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateConfig({ selectedCandidates: [] })}
                          className="rounded-xl"
                        >
                          <Minus className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                      {candidates.map(candidate => (
                        <div
                          key={candidate.id}
                          className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200"
                        >
                          <Checkbox
                            id={`candidate-${candidate.id}`}
                            checked={config.selectedCandidates.includes(candidate.id)}
                            onCheckedChange={() => handleCandidateToggle(candidate.id)}
                            className="rounded-lg"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`candidate-${candidate.id}`} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{candidate.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {candidate.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{candidate.caseStudy}</p>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="groups" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Available Groups</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateConfig({ selectedGroups: groups.map(g => g.id) })}
                          className="rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateConfig({ selectedGroups: [] })}
                          className="rounded-xl"
                        >
                          <Minus className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 max-h-96 overflow-y-auto">
                      {groups.map(group => (
                        <div
                          key={group.id}
                          className="flex items-start space-x-3 p-4 hover:bg-slate-50 rounded-xl transition-all duration-200"
                        >
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={config.selectedGroups.includes(group.id)}
                            onCheckedChange={() => handleGroupToggle(group.id)}
                            className="rounded-lg mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`group-${group.id}`} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{group.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {group.memberIds.length} members
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                              <p className="text-xs text-muted-foreground">{group.caseStudy}</p>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <h4 className="font-semibold mb-2">Selection Summary</h4>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Individual Candidates:</span>
                      <p className="font-semibold">{config.selectedCandidates.length}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Groups:</span>
                      <p className="font-semibold">{config.selectedGroups.length}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Total Participants:</span>
                      <p className="font-semibold gradient-text">{totalParticipants}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Assessment Settings */}
          {currentStep === 3 && (
            <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text text-xl flex items-center gap-3">
                  <Target className="w-6 h-6" />
                  Step 3: Assessment Settings
                </CardTitle>
                <p className="text-muted-foreground">Configure timing, scoring, and behavioral settings</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={config.timeLimit || ''}
                        onChange={(e) => updateConfig({ timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="Leave empty for unlimited time"
                        className="surface-luxury border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Due Date</Label>
                      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal surface-luxury border-slate-200 rounded-xl"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? selectedDate.toLocaleDateString('en-GB') : "Select due date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              setShowCalendar(false);
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>


                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Assessment Behavior</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="autoSave"
                            checked={config.enableAutoSave}
                            onCheckedChange={(checked) => updateConfig({ enableAutoSave: checked as boolean })}
                          />
                          <Label htmlFor="autoSave" className="text-sm">Enable auto-save (recommended)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="resubmission"
                            checked={config.allowResubmission}
                            onCheckedChange={(checked) => updateConfig({ allowResubmission: checked as boolean })}
                          />
                          <Label htmlFor="resubmission" className="text-sm">Allow resubmission after completion</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notification"
                            checked={config.notifyOnSubmission}
                            onCheckedChange={(checked) => updateConfig({ notifyOnSubmission: checked as boolean })}
                          />
                          <Label htmlFor="notification" className="text-sm">Notify administrators on submission</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={config.instructions}
                    onChange={(e) => updateConfig({ instructions: e.target.value })}
                    placeholder="Any special instructions for participants (optional)"
                    className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review and Create */}
          {currentStep === 4 && (
            <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text text-xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6" />
                  Step 4: Review and Create
                </CardTitle>
                <p className="text-muted-foreground">Review your assessment configuration before creating</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold">Assessment Details</Label>
                      <div className="bg-slate-50 p-4 rounded-xl mt-2 space-y-2">
                        <p><span className="font-medium">Type:</span> <Badge className="ml-1 capitalize">{config.type}</Badge></p>
                        <p><span className="font-medium">Case Study:</span> {selectedCaseStudy?.name}</p>
                        {config.description && <p><span className="font-medium">Description:</span> {config.description}</p>}
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Participants</Label>
                      <div className="bg-slate-50 p-4 rounded-xl mt-2 space-y-2">
                        <p><span className="font-medium">Individual Candidates:</span> {config.selectedCandidates.length}</p>
                        <p><span className="font-medium">Groups:</span> {config.selectedGroups.length}</p>
                        <p><span className="font-medium">Total Participants:</span> <span className="font-bold text-lg gradient-text">{totalParticipants}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold">Settings</Label>
                      <div className="bg-slate-50 p-4 rounded-xl mt-2 space-y-2">
                        <p><span className="font-medium">Time Limit:</span> {config.timeLimit ? `${config.timeLimit} minutes` : 'Unlimited'}</p>
                        <p><span className="font-medium">Due Date:</span> {selectedDate ? selectedDate.toLocaleDateString('en-GB') : 'No due date'}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Behavior Settings</Label>
                      <div className="bg-slate-50 p-4 rounded-xl mt-2 space-y-2">
                        <p><span className="font-medium">Auto-save:</span> {config.enableAutoSave ? 'Enabled' : 'Disabled'}</p>
                        <p><span className="font-medium">Resubmission:</span> {config.allowResubmission ? 'Allowed' : 'Not allowed'}</p>
                        <p><span className="font-medium">Notifications:</span> {config.notifyOnSubmission ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {totalParticipants === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800">No Participants Selected</h4>
                      <p className="text-amber-700 text-sm">You need to select at least one participant to create the assessment.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center glass rounded-2xl p-6 border-2 border-white/20">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || previewMode}
          className="rounded-xl"
        >
          Previous
        </Button>

        <div className="flex gap-3">
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceedToNextStep() || previewMode}
              className="bg-slate-600 hover:bg-slate-700 rounded-xl px-8"
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleCreateAssessment}
              disabled={totalParticipants === 0 || previewMode}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl px-8"
            >
              <Play className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}