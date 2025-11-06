import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ChevronLeft, 
  Save, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  User,
  Edit
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ScoringValidation } from './ScoringValidation';

const INDIVIDUAL_CAPABILITIES = [
  {
    id: 'transformation',
    name: 'Transformation Capacity',
    items: [
      'Demonstrates adaptability to change',
      'Shows resilience in uncertain situations',
      'Embraces new ways of working',
      'Learns from setbacks and failures',
      'Anticipates future challenges',
      'Drives organizational change',
      'Influences transformation initiatives',
      'Builds change capability in others',
      'Manages resistance to change effectively',
      'Creates compelling vision for transformation'
    ]
  },
  {
    id: 'innovation',
    name: 'Innovation & Creativity',
    items: [
      'Generates original ideas and solutions',
      'Challenges conventional thinking',
      'Experiments with new approaches',
      'Combines ideas in novel ways',
      'Takes calculated risks',
      'Learns from experimentation',
      'Encourages creative thinking in others',
      'Implements innovative solutions',
      'Scales successful innovations',
      'Creates culture of innovation'
    ]
  },
  {
    id: 'future-skills',
    name: 'Future-Focused Skills',
    items: [
      'Anticipates future trends and disruptions',
      'Develops skills for emerging needs',
      'Embraces lifelong learning mindset',
      'Adapts to technological advances',
      'Builds future-ready capabilities',
      'Prepares organization for future challenges',
      'Invests in emerging technologies',
      'Develops others for future roles',
      'Creates future-focused strategies',
      'Leads forward-thinking initiatives'
    ]
  },
  {
    id: 'leadership',
    name: 'Leadership & Influence',
    items: [
      'Inspires and motivates others',
      'Builds trust and credibility',
      'Communicates compelling vision',
      'Empowers team members',
      'Makes difficult decisions',
      'Takes accountability for results',
      'Develops leadership in others',
      'Navigates complex stakeholder relationships',
      'Influences without authority',
      'Builds high-performing teams'
    ]
  },
  {
    id: 'ai-literacy',
    name: 'AI Literacy & Digital Fluency',
    items: [
      'Understands AI capabilities and limitations',
      'Uses digital tools effectively',
      'Adapts to new technologies quickly',
      'Leverages data for decision making',
      'Understands digital transformation',
      'Applies AI to solve problems',
      'Stays current with digital trends',
      'Builds digital capabilities in others',
      'Manages digital risks and ethics',
      'Integrates technology with business strategy'
    ]
  },
  {
    id: 'analytical',
    name: 'Analytical Thinking',
    items: [
      'Breaks down complex problems systematically',
      'Uses data to support conclusions',
      'Identifies patterns and trends',
      'Evaluates multiple perspectives',
      'Tests assumptions rigorously',
      'Draws logical inferences',
      'Synthesizes information from multiple sources',
      'Applies structured problem-solving methods',
      'Makes evidence-based decisions',
      'Challenges own and others\' thinking'
    ]
  },
  {
    id: 'problem-solving',
    name: 'Problem-Solving',
    items: [
      'Defines problems clearly and accurately',
      'Generates multiple solution options',
      'Evaluates solutions objectively',
      'Implements solutions effectively',
      'Monitors solution effectiveness',
      'Adapts approach based on feedback',
      'Involves others in problem-solving',
      'Prevents problems from recurring',
      'Addresses root causes',
      'Learns from problem-solving experiences'
    ]
  },
  {
    id: 'communication',
    name: 'Communication',
    items: [
      'Communicates clearly and concisely',
      'Adapts communication style to audience',
      'Listens actively and empathetically',
      'Facilitates productive discussions',
      'Presents ideas persuasively',
      'Provides constructive feedback',
      'Manages difficult conversations',
      'Uses multiple communication channels',
      'Builds rapport with diverse stakeholders',
      'Communicates across cultural boundaries'
    ]
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    items: [
      'Works effectively in diverse teams',
      'Builds strong working relationships',
      'Shares knowledge and resources',
      'Supports team goals over personal agenda',
      'Resolves conflicts constructively',
      'Facilitates team decision-making',
      'Creates inclusive team environment',
      'Leverages diverse perspectives',
      'Builds networks across boundaries',
      'Contributes to team learning'
    ]
  },
  {
    id: 'impact',
    name: 'Impact & Practicality',
    items: [
      'Delivers measurable results',
      'Focuses on practical solutions',
      'Balances ambition with realism',
      'Manages resources efficiently',
      'Meets deadlines consistently',
      'Scales impact across organization',
      'Measures and reports on outcomes',
      'Aligns actions with strategic goals',
      'Creates lasting organizational value',
      'Demonstrates return on investment'
    ]
  }
];

interface IndividualScoringPageProps {
  candidateId?: string;
  candidateName: string;
  assignmentId: string;
  caseStudy: string;
  onBack: () => void;
  onSave: (data: any) => void;
  onSubmit: (data: any) => void;
  onReopen?: (assignmentId: string) => void;
  initialData?: any;
  isReadOnly?: boolean;
  isSubmitted?: boolean;
  timeLimit?: number; // in minutes
}

export function IndividualScoringPage({
  candidateId,
  candidateName,
  assignmentId,
  caseStudy,
  onBack,
  onSave,
  onSubmit,
  onReopen,
  initialData,
  isReadOnly = false,
  isSubmitted = false,
  timeLimit
}: IndividualScoringPageProps) {
  const [selectedCapability, setSelectedCapability] = useState(INDIVIDUAL_CAPABILITIES[0].id);
  const [scores, setScores] = useState<Record<string, boolean[]>>({});
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [validationReady, setValidationReady] = useState(false);

  // Initialize scores from initial data
  useEffect(() => {
    if (initialData) {
      setScores(initialData.scores || {});
      setNotes(initialData.notes || '');
    } else {
      // Initialize empty scores
      const initialScores: Record<string, boolean[]> = {};
      INDIVIDUAL_CAPABILITIES.forEach(comp => {
        initialScores[comp.id] = new Array(10).fill(false);
      });
      setScores(initialScores);
    }
  }, [initialData]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Auto-save
  useEffect(() => {
    if (!isReadOnly && (Object.keys(scores).length > 0 || notes)) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [scores, notes]);

  const handleTickChange = (capabilityId: string, itemIndex: number, checked: boolean) => {
    if (isReadOnly) return;

    setScores(prev => ({
      ...prev,
      [capabilityId]: prev[capabilityId]?.map((tick, index) => 
        index === itemIndex ? checked : tick
      ) || new Array(10).fill(false).map((_, index) => index === itemIndex ? checked : false)
    }));
  };

  const handleSave = async () => {
    const data = {
      assignmentId,
      candidateId,
      scores,
      notes,
      lastUpdated: new Date(),
      status: 'in_progress',
      totalScore: getTotalScore(),
      timeSpent: Math.floor((Date.now() - startTime.getTime()) / 60000) // minutes since start
    };

    try {
      await onSave(data);
      setLastSaved(new Date());
      toast.success('Autosaved at ' + new Date().toLocaleTimeString());
    } catch (error) {
      toast.error('Failed to save assessment');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const data = {
      assignmentId,
      candidateId,
      scores,
      notes,
      completedAt: new Date(),
      status: 'submitted',
      totalScore: getTotalScore(),
      timeSpent: Math.floor((Date.now() - startTime.getTime()) / 60000) // minutes since start
    };

    try {
      await onSubmit(data);
      toast.success('Assessment submitted successfully!');
      onBack();
    } catch (error) {
      toast.error('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirmation(false);
    }
  };

  const getCapabilityScore = (capabilityId: string) => {
    const capabilityScores = scores[capabilityId] || [];
    return capabilityScores.filter(Boolean).length;
  };

  const getTotalScore = () => {
    return INDIVIDUAL_CAPABILITIES.reduce((total, comp) => 
      total + getCapabilityScore(comp.id), 0
    );
  };

  const getCapabilityProgress = (capabilityId: string) => {
    return getCapabilityScore(capabilityId);
  };

  const getPerformanceBand = (score: number) => {
    if (score >= 80) return { label: 'Exceptional', color: 'bg-emerald-500' };
    if (score >= 60) return { label: 'Strong', color: 'bg-green-500' };
    if (score >= 40) return { label: 'Developing', color: 'bg-yellow-500' };
    return { label: 'Limited', color: 'bg-red-500' };
  };

  const totalScore = getTotalScore();
  const performanceBand = getPerformanceBand(totalScore);
  const currentCapability = INDIVIDUAL_CAPABILITIES.find(c => c.id === selectedCapability);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 animate-fade-in">
      {/* Header */}
      <div className="glass border-b border-red-200 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-red-700 hover:bg-red-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Dashboard → Individual Assessment
              </div>
            </div>

            <div className="flex items-center gap-4">
              {timeLimit && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-red-700">
                    {formatTime(elapsedTime)} / {timeLimit}m
                  </span>
                </div>
              )}

              {lastSaved && (
                <div className="text-sm text-green-700">
                  Autosaved at {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">{candidateName}</h1>
              <Badge variant="outline" className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                {caseStudy}
              </Badge>
              {isSubmitted && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  ✓ Submitted
                </Badge>
              )}
              {isReadOnly && (
                <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                  Read Only
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-8 animate-slide-up">
          {/* Left Sidebar - Section Navigation */}
          <div className="col-span-3 space-y-3">
            <h3 className="font-semibold text-lg gradient-text mb-6">Capabilities</h3>
            
            {INDIVIDUAL_CAPABILITIES.map((capability) => {
              const progress = getCapabilityProgress(capability.id);
              const isActive = selectedCapability === capability.id;
              
              return (
                <button
                  key={capability.id}
                  onClick={() => setSelectedCapability(capability.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg' 
                      : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-red-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      {capability.name}
                    </span>
                    {progress === 10 && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(progress / 10) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {progress}/10
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center - Tick-box Grid */}
          <div className="col-span-6">
            {currentCapability && (
              <Card className="border-red-200 card-shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
                  <CardTitle className="text-xl gradient-text">
                    {currentCapability.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCapability.items.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-red-200 transition-all duration-300 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    >
                      <button
                        onClick={() => handleTickChange(
                          currentCapability.id, 
                          index, 
                          !scores[currentCapability.id]?.[index]
                        )}
                        disabled={isReadOnly}
                        className={`w-7 h-7 border-2 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                          scores[currentCapability.id]?.[index]
                            ? 'border-red-500 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
                            : 'border-gray-300 hover:border-red-400 bg-white'
                        } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {scores[currentCapability.id]?.[index] && (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                      </button>
                      <span className="flex-1 text-sm text-gray-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Score and Actions */}
          <div className="col-span-3 space-y-8">
            {/* Live Score */}
            <Card className="border-red-200 bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 card-shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl gradient-text">Live Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold gradient-text mb-2">
                    {totalScore}
                  </div>
                  <div className="text-lg text-red-700 font-medium">out of 100</div>
                </div>

                <div className="flex justify-center">
                  <Badge className={`${performanceBand.color} text-white px-4 py-2 text-sm font-semibold rounded-full shadow-lg`}>
                    {performanceBand.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Progress value={totalScore} className="h-4 bg-gray-200" />
                  <div className="text-xs text-center text-muted-foreground">
                    {Math.round((totalScore / 100) * 100)}% Complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add assessment notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isReadOnly}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-red-200 card-shadow">
              <CardContent className="p-6 space-y-4">
                {isSubmitted && onReopen && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Assessment Submitted</span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      This assessment has been submitted. You can still edit it if needed.
                    </p>
                    <Button 
                      onClick={() => onReopen(assignmentId)}
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Reopen for Editing
                    </Button>
                  </div>
                )}

                {!isReadOnly && (
                  <>
                    <Button 
                      onClick={handleSave}
                      variant="outline" 
                      className="w-full border-red-200 text-red-700 hover:bg-red-50 transition-all duration-300"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>

                    <Button 
                      onClick={() => setShowSubmitConfirmation(true)}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      disabled={totalScore === 0}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitted ? 'Update Assessment' : 'Submit Assessment'}
                    </Button>

                    {totalScore === 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Score at least 1 point to submit
                      </p>
                    )}
                  </>
                )}

                {isReadOnly && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      This assessment is in read-only mode
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Confirm Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Submit locks this assessment and you won't be able to make further changes. 
                Continue?
              </p>
              
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm text-red-900">
                  <strong>Final Score:</strong> {totalScore}/100 ({performanceBand.label})
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSubmitConfirmation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}