import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  ArrowLeft,
  Save,
  Send,
  Users,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Target,
  BookOpen,
  BarChart3,
  MessageSquare,
  Trophy,
  Star
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface GroupScoringPageProps {
  groupId: string;
  groupName: string;
  assignmentId: string;
  caseStudy: string;
  members: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
  onBack: () => void;
  onSave: (data: any) => Promise<boolean>;
  onSubmit: (data: any) => Promise<boolean>;
  onReopen?: (assignmentId: string) => Promise<boolean>;
  isReadOnly?: boolean;
  isSubmitted?: boolean;
}

const GROUP_CRITERIA = [
  {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    description: 'How effectively the group worked together and leveraged each member\'s strengths',
    maxScore: 20
  },
  {
    id: 'collective-decision-making',
    title: 'Collective Decision Making',
    description: 'Quality of group decisions and the process used to reach consensus',
    maxScore: 20
  },
  {
    id: 'communication-dynamics',
    title: 'Communication Dynamics',
    description: 'Clarity, inclusivity, and effectiveness of group communication',
    maxScore: 20
  },
  {
    id: 'shared-leadership',
    title: 'Shared Leadership',
    description: 'Distribution of leadership responsibilities and influence within the group',
    maxScore: 20
  },
  {
    id: 'innovation-synergy',
    title: 'Innovation & Synergy',
    description: 'Generation of creative solutions through collective intelligence',
    maxScore: 20
  }
];

export function GroupScoringPage({
  groupId,
  groupName,
  assignmentId,
  caseStudy,
  members,
  onBack,
  onSave,
  onSubmit,
  onReopen,
  isReadOnly = false,
  isSubmitted = false
}: GroupScoringPageProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showAllCriteria, setShowAllCriteria] = useState(true);
  const [activeTab, setActiveTab] = useState('scoring');

  // Initialize scores
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    const initialNotes: Record<string, string> = {};
    
    GROUP_CRITERIA.forEach(criteria => {
      initialScores[criteria.id] = 0;
      initialNotes[criteria.id] = '';
    });
    
    setScores(initialScores);
    setNotes(initialNotes);
  }, []);

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxTotalScore = GROUP_CRITERIA.reduce((sum, criteria) => sum + criteria.maxScore, 0);
  const completionPercentage = (totalScore / maxTotalScore) * 100;

  const getPerformanceBand = (score: number) => {
    const percentage = (score / maxTotalScore) * 100;
    if (percentage >= 80) return { label: 'Exceptional', color: 'bg-emerald-600', textColor: 'text-emerald-600' };
    if (percentage >= 60) return { label: 'Strong', color: 'bg-blue-600', textColor: 'text-blue-600' };
    if (percentage >= 40) return { label: 'Developing', color: 'bg-amber-600', textColor: 'text-amber-600' };
    return { label: 'Limited', color: 'bg-red-600', textColor: 'text-red-600' };
  };

  const performanceBand = getPerformanceBand(totalScore);

  const handleScoreChange = (criteriaId: string, value: number[]) => {
    if (isReadOnly) return;
    
    setScores(prev => ({
      ...prev,
      [criteriaId]: value[0]
    }));
  };

  const handleNotesChange = (criteriaId: string, value: string) => {
    if (isReadOnly) return;
    
    setNotes(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const assessmentData = {
        assignmentId,
        groupId,
        scores,
        notes,
        generalNotes,
        totalScore,
        timestamp: new Date()
      };

      const success = await onSave(assessmentData);
      if (success) {
        setLastSaved(new Date());
        toast.success('Assessment saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save assessment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const assessmentData = {
        assignmentId,
        groupId,
        scores,
        notes,
        generalNotes,
        totalScore,
        completionPercentage,
        performanceBand: performanceBand.label,
        timestamp: new Date()
      };

      const success = await onSubmit(assessmentData);
      if (success) {
        toast.success('Assessment submitted successfully');
      }
    } catch (error) {
      toast.error('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopen = async () => {
    if (onReopen) {
      try {
        await onReopen(assignmentId);
      } catch (error) {
        toast.error('Failed to reopen assessment');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 animate-fade-in">
      {/* Header */}
      <div className="glass border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="rounded-xl hover-lift"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="divider-luxury"></div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Users className="w-6 h-6 text-slate-600" />
                  <h1 className="text-2xl font-bold gradient-text-premium">{groupName}</h1>
                  {isSubmitted && (
                    <Badge className="bg-emerald-600 text-white rounded-xl">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Submitted
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {caseStudy}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {members.length} members
                  </div>
                  {lastSaved && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold gradient-text">
                  {totalScore}/{maxTotalScore}
                </div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              
              {!isReadOnly && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="outline"
                    className="rounded-xl hover-lift"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  
                  {!isSubmitted && (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || totalScore === 0}
                      className="bg-slate-600 hover:bg-slate-700 rounded-xl hover-lift"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </Button>
                  )}
                  
                  {isSubmitted && onReopen && (
                    <Button
                      onClick={handleReopen}
                      variant="outline"
                      className="rounded-xl hover-lift"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reopen for Editing
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Progress Overview */}
        <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg hover-lift mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl gradient-text">
              <Trophy className="w-6 h-6" />
              Assessment Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{Math.round(completionPercentage)}%</div>
                <div className="text-muted-foreground">Completion</div>
                <Progress value={completionPercentage} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${performanceBand.textColor} mb-2`}>
                  {performanceBand.label}
                </div>
                <div className="text-muted-foreground">Performance Band</div>
                <Badge className={`${performanceBand.color} text-white rounded-xl mt-2`}>
                  {totalScore}/{maxTotalScore} points
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{members.length}</div>
                <div className="text-muted-foreground">Team Members</div>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {members.map(member => (
                    <Badge key={member.id} variant="secondary" className="rounded-lg text-xs">
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="surface-luxury border-2 border-slate-200 p-2 rounded-2xl card-shadow">
            <TabsTrigger 
              value="scoring" 
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-xl font-semibold"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Group Scoring
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-xl font-semibold"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Assessment Notes
            </TabsTrigger>
          </TabsList>

          {/* Scoring Tab */}
          <TabsContent value="scoring" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold gradient-text">Group Assessment Criteria</h2>
              <Button
                variant="outline"
                onClick={() => setShowAllCriteria(!showAllCriteria)}
                className="rounded-xl"
              >
                {showAllCriteria ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showAllCriteria ? 'Compact View' : 'Detailed View'}
              </Button>
            </div>

            <div className="grid gap-6">
              {GROUP_CRITERIA.map(criteria => (
                <Card 
                  key={criteria.id} 
                  className="surface-luxury border-2 border-slate-200 rounded-3xl hover-lift transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 text-lg gradient-text">
                          <Target className="w-5 h-5" />
                          {criteria.title}
                        </CardTitle>
                        {showAllCriteria && (
                          <p className="text-muted-foreground mt-2">{criteria.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold gradient-text">
                          {scores[criteria.id]}/{criteria.maxScore}
                        </div>
                        <div className="text-sm text-muted-foreground">points</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Score: {scores[criteria.id]} points</span>
                        <span>{Math.round((scores[criteria.id] / criteria.maxScore) * 100)}%</span>
                      </div>
                      <Slider
                        value={[scores[criteria.id]]}
                        onValueChange={(value) => handleScoreChange(criteria.id, value)}
                        max={criteria.maxScore}
                        step={1}
                        className="slider"
                        disabled={isReadOnly}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>{criteria.maxScore}</span>
                      </div>
                    </div>
                    
                    {showAllCriteria && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Criteria Notes</label>
                        <Textarea
                          value={notes[criteria.id]}
                          onChange={(e) => handleNotesChange(criteria.id, e.target.value)}
                          placeholder={`Add specific observations about ${criteria.title.toLowerCase()}...`}
                          className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                          rows={2}
                          disabled={isReadOnly}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card className="surface-luxury border-2 border-slate-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl gradient-text">
                  <MessageSquare className="w-6 h-6" />
                  General Assessment Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Add overall observations about the group's performance, dynamics, and recommendations..."
                  className="surface-luxury border-slate-200 rounded-xl focus-elegant min-h-[200px]"
                  disabled={isReadOnly}
                />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {GROUP_CRITERIA.map(criteria => (
                <Card key={criteria.id} className="surface-luxury border-2 border-slate-200 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg gradient-text">{criteria.title}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score: {scores[criteria.id]}/{criteria.maxScore}</span>
                      <Badge variant="secondary" className="rounded-lg">
                        {Math.round((scores[criteria.id] / criteria.maxScore) * 100)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes[criteria.id]}
                      onChange={(e) => handleNotesChange(criteria.id, e.target.value)}
                      placeholder={`Detailed notes about ${criteria.title.toLowerCase()}...`}
                      className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                      rows={3}
                      disabled={isReadOnly}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}