import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { User, Save, RotateCcw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface IndividualAssessmentData {
  id: string;
  candidateName: string;
  assessorName: string;
  groupId: string;
  caseStudy: string;
  // Competency scores (0-10 points each, 100 total)
  transformationCapacity: number[];
  innovationCreativity: number[];
  futureFocusedSkills: number[];
  leadershipInfluence: number[];
  aiLiteracyDigitalFluency: number[];
  analyticalThinking: number[];
  problemSolving: number[];
  communication: number[];
  collaboration: number[];
  impactPracticality: number[];
  // Total score and band
  totalScore: number;
  performanceBand: string;
  // Feedback
  observations: string;
  timestamp: string;
}

const COMPETENCIES = [
  {
    key: 'transformationCapacity',
    name: 'Transformation Capacity',
    subCompetencies: [
      'Adapts quickly to new challenges',
      'Seeks opportunities for change',
      'Questions existing processes',
      'Encourages others to embrace change',
      'Stays resilient under uncertainty',
      'Balances short- and long-term transformation',
      'Identifies systemic barriers and suggests solutions',
      'Integrates new ideas into practice',
      'Demonstrates flexibility in roles/tasks',
      'Champions continuous improvement'
    ]
  },
  {
    key: 'innovationCreativity',
    name: 'Innovation & Creativity',
    subCompetencies: [
      'Proposes unique ideas',
      'Connects unrelated concepts',
      'Thinks "out of the box"',
      'Uses creative problem-solving methods',
      'Builds on others\' ideas constructively',
      'Balances creativity with practicality',
      'Open to experimentation/failure',
      'Identifies novel opportunities',
      'Applies creativity across disciplines',
      'Demonstrates originality in approach'
    ]
  },
  {
    key: 'futureFocusedSkills',
    name: 'Future-Focused Skills',
    subCompetencies: [
      'Uses digital tools effectively',
      'Demonstrates global/cultural awareness',
      'Practices systems thinking',
      'Shows adaptability to emerging roles',
      'Applies critical thinking to new contexts',
      'Displays growth mindset',
      'Uses collaboration tools',
      'Demonstrates agility in learning',
      'Integrates sustainability/responsibility',
      'Keeps updated with future trends'
    ]
  },
  {
    key: 'leadershipInfluence',
    name: 'Leadership & Influence',
    subCompetencies: [
      'Provides clear direction',
      'Inspires others with vision',
      'Delegates effectively',
      'Encourages inclusivity',
      'Resolves conflict constructively',
      'Takes initiative',
      'Motivates peers positively',
      'Builds trust with the team',
      'Shows accountability in decisions',
      'Supports others\' development'
    ]
  },
  {
    key: 'aiLiteracyDigitalFluency',
    name: 'AI Literacy & Digital Fluency',
    subCompetencies: [
      'Understands AI basics',
      'Identifies ethical issues in AI use',
      'Applies AI tools effectively',
      'Uses data responsibly',
      'Evaluates AI outputs critically',
      'Integrates digital tools in workflows',
      'Seeks opportunities for AI use',
      'Recognizes bias/limitations in AI',
      'Communicates AI insights clearly',
      'Stays curious about emerging tech'
    ]
  },
  {
    key: 'analyticalThinking',
    name: 'Analytical Thinking',
    subCompetencies: [
      'Identifies key elements in problems',
      'Uses evidence/data in decisions',
      'Recognizes assumptions',
      'Draws logical conclusions',
      'Prioritizes effectively',
      'Spots gaps or inconsistencies',
      'Identifies root causes',
      'Structures analysis clearly',
      'Links cause-effect relationships',
      'Applies analytical frameworks'
    ]
  },
  {
    key: 'problemSolving',
    name: 'Problem-Solving',
    subCompetencies: [
      'Defines the problem clearly',
      'Generates multiple solutions',
      'Chooses the most feasible option',
      'Applies structured steps',
      'Tests solutions before implementation',
      'Learns from past solutions',
      'Involves others in solving',
      'Evaluates risks and trade-offs',
      'Stays solution-oriented under pressure',
      'Implements solutions effectively'
    ]
  },
  {
    key: 'communication',
    name: 'Communication',
    subCompetencies: [
      'Speaks with clarity',
      'Uses persuasive arguments',
      'Listens actively',
      'Adapts to audience',
      'Uses non-verbal cues effectively',
      'Communicates confidently',
      'Structures ideas logically',
      'Uses data/stories to support points',
      'Responds effectively in discussions',
      'Writes concisely and clearly'
    ]
  },
  {
    key: 'collaboration',
    name: 'Collaboration',
    subCompetencies: [
      'Actively contributes in teams',
      'Listens respectfully',
      'Values diverse perspectives',
      'Shares credit fairly',
      'Provides constructive feedback',
      'Seeks input before deciding',
      'Supports team goals over personal',
      'Builds positive team climate',
      'Resolves disagreements respectfully',
      'Demonstrates reliability'
    ]
  },
  {
    key: 'impactPracticality',
    name: 'Impact & Practicality',
    subCompetencies: [
      'Aligns work with real needs',
      'Recommends actionable steps',
      'Demonstrates feasibility',
      'Adds measurable value',
      'Links ideas to outcomes',
      'Provides evidence for recommendations',
      'Balances innovation with practicality',
      'Identifies short- vs long-term impact',
      'Evaluates sustainability of solutions',
      'Ensures recommendations are implementable'
    ]
  }
] as const;

const getPerformanceBand = (score: number): string => {
  if (score >= 80) return 'Exceptional';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Developing';
  return 'Limited';
};

const getBandColor = (band: string): string => {
  switch (band) {
    case 'Exceptional': return 'bg-emerald-600';
    case 'Strong': return 'bg-green-500';
    case 'Developing': return 'bg-yellow-500';
    case 'Limited': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

interface NewAssessmentFormProps {
  groups: string[];
  caseStudies: string[];
  onSubmit: (assessment: IndividualAssessmentData) => void;
  existingAssessments?: IndividualAssessmentData[];
}

export function NewAssessmentForm({ 
  groups, 
  caseStudies, 
  onSubmit, 
  existingAssessments = [] 
}: NewAssessmentFormProps) {
  const [formData, setFormData] = useState({
    candidateName: '',
    assessorName: '',
    groupId: '',
    caseStudy: '',
    observations: ''
  });

  // Initialize competency scores as arrays of booleans (converted to numbers when calculating)
  const [competencyScores, setCompetencyScores] = useState<Record<string, boolean[]>>(
    Object.fromEntries(
      COMPETENCIES.map(comp => [comp.key, new Array(10).fill(false)])
    )
  );

  const calculateTotalScore = (): number => {
    return Object.values(competencyScores).reduce((total, scores) => {
      return total + scores.filter(Boolean).length;
    }, 0);
  };

  const calculateCompetencyScore = (competencyKey: string): number => {
    return competencyScores[competencyKey]?.filter(Boolean).length || 0;
  };

  const toggleSubCompetency = (competencyKey: string, index: number) => {
    setCompetencyScores(prev => ({
      ...prev,
      [competencyKey]: prev[competencyKey].map((checked, i) => 
        i === index ? !checked : checked
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      candidateName: '',
      assessorName: '',
      groupId: '',
      caseStudy: '',
      observations: ''
    });
    setCompetencyScores(
      Object.fromEntries(
        COMPETENCIES.map(comp => [comp.key, new Array(10).fill(false)])
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.candidateName || !formData.assessorName || !formData.groupId || !formData.caseStudy) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for duplicate assessment
    const existingAssessment = existingAssessments.find(
      assessment => 
        assessment.candidateName === formData.candidateName && 
        assessment.groupId === formData.groupId && 
        assessment.caseStudy === formData.caseStudy &&
        assessment.assessorName === formData.assessorName
    );

    if (existingAssessment) {
      toast.error('This candidate has already been assessed by you for this group and case study');
      return;
    }

    const totalScore = calculateTotalScore();
    const performanceBand = getPerformanceBand(totalScore);

    const newAssessment: IndividualAssessmentData = {
      id: `ind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      transformationCapacity: competencyScores.transformationCapacity.map(checked => checked ? 1 : 0),
      innovationCreativity: competencyScores.innovationCreativity.map(checked => checked ? 1 : 0),
      futureFocusedSkills: competencyScores.futureFocusedSkills.map(checked => checked ? 1 : 0),
      leadershipInfluence: competencyScores.leadershipInfluence.map(checked => checked ? 1 : 0),
      aiLiteracyDigitalFluency: competencyScores.aiLiteracyDigitalFluency.map(checked => checked ? 1 : 0),
      analyticalThinking: competencyScores.analyticalThinking.map(checked => checked ? 1 : 0),
      problemSolving: competencyScores.problemSolving.map(checked => checked ? 1 : 0),
      communication: competencyScores.communication.map(checked => checked ? 1 : 0),
      collaboration: competencyScores.collaboration.map(checked => checked ? 1 : 0),
      impactPracticality: competencyScores.impactPracticality.map(checked => checked ? 1 : 0),
      totalScore,
      performanceBand,
      timestamp: new Date().toISOString()
    };

    onSubmit(newAssessment);
    toast.success(`Assessment submitted! Total: ${totalScore}/100 (${performanceBand})`);
    resetForm();
  };

  const totalScore = calculateTotalScore();
  const performanceBand = getPerformanceBand(totalScore);

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <User className="w-5 h-5" />
          Individual Assessment Form
        </CardTitle>
        <p className="text-sm text-red-700">
          Future Ready Assessment Framework - Tick competencies demonstrated by the candidate
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidateName">Candidate Name *</Label>
              <Input
                id="candidateName"
                value={formData.candidateName}
                onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                placeholder="Enter candidate name"
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId">Group *</Label>
              <Select value={formData.groupId} onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseStudy">Case Study *</Label>
              <Select value={formData.caseStudy} onValueChange={(value) => setFormData(prev => ({ ...prev, caseStudy: value }))}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue placeholder="Select case study" />
                </SelectTrigger>
                <SelectContent>
                  {caseStudies.map(study => (
                    <SelectItem key={study} value={study}>{study}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessorName">Assessor Name *</Label>
              <Input
                id="assessorName"
                value={formData.assessorName}
                onChange={(e) => setFormData(prev => ({ ...prev, assessorName: e.target.value }))}
                placeholder="Your name"
                className="bg-white/80"
              />
            </div>
          </div>

          {/* Score Summary */}
          <Card className="bg-gradient-to-r from-red-100 to-pink-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">Current Score</h3>
                  <p className="text-sm text-red-700">Tick demonstrated sub-competencies</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-900">{totalScore}/100</div>
                  <Badge className={`${getBandColor(performanceBand)} text-white`}>
                    {performanceBand}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-red-200" />

          {/* Competency Assessment Grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <h3 className="text-red-900">Assessment Criteria</h3>
              <span className="text-sm text-red-600">(10 competencies × 10 sub-competencies = 100 points)</span>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {COMPETENCIES.map((competency) => {
                  const competencyScore = calculateCompetencyScore(competency.key);
                  return (
                    <Card key={competency.key} className="bg-white/60 border border-red-100">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-red-900">{competency.name}</CardTitle>
                          <Badge variant="outline" className="border-red-300">
                            {competencyScore}/10
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {competency.subCompetencies.map((subComp, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${competency.key}-${index}`}
                                checked={competencyScores[competency.key]?.[index] || false}
                                onCheckedChange={() => toggleSubCompetency(competency.key, index)}
                                className="border-red-300 data-[state=checked]:bg-red-600"
                              />
                              <Label 
                                htmlFor={`${competency.key}-${index}`}
                                className="text-sm text-red-800 cursor-pointer"
                              >
                                {subComp}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <Separator className="bg-red-200" />

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observations & Notes</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Additional observations, strengths, areas for development..."
              className="bg-white/80 min-h-[100px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
              <Save className="w-4 h-4 mr-2" />
              Submit Assessment ({totalScore}/100)
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="border-red-200">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}