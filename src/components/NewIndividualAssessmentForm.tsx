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
import { User, Save, RotateCcw, Target } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface IndividualAssessmentData {
  id: string;
  candidateName: string;
  assessorName: string;
  groupId: string;
  caseStudy: string;
  // Competency scores (each out of 10)
  transformationCapacity: number;
  innovationCreativity: number;
  futureFocusedSkills: number;
  leadershipInfluence: number;
  aiLiteracyDigitalFluency: number;
  analyticalThinking: number;
  problemSolving: number;
  communication: number;
  collaboration: number;
  impactPracticality: number;
  // Total score out of 100
  totalScore: number;
  // Performance band
  performanceBand: 'Limited' | 'Developing' | 'Strong' | 'Exceptional';
  // Qualitative feedback
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

interface NewIndividualAssessmentFormProps {
  groups: string[];
  caseStudies: string[];
  onSubmit: (assessment: IndividualAssessmentData) => void;
  existingAssessments?: IndividualAssessmentData[];
}

export function NewIndividualAssessmentForm({ 
  groups, 
  caseStudies, 
  onSubmit, 
  existingAssessments = [] 
}: NewIndividualAssessmentFormProps) {
  const [formData, setFormData] = useState({
    candidateName: '',
    assessorName: '',
    groupId: '',
    caseStudy: '',
    observations: ''
  });

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    COMPETENCIES.forEach(comp => {
      initial[comp.key] = new Array(10).fill(false);
    });
    return initial;
  });

  const calculateCompetencyScore = (competencyKey: string): number => {
    return checkedItems[competencyKey]?.filter(Boolean).length || 0;
  };

  const calculateTotalScore = (): number => {
    return COMPETENCIES.reduce((total, comp) => total + calculateCompetencyScore(comp.key), 0);
  };

  const getPerformanceBand = (score: number): 'Limited' | 'Developing' | 'Strong' | 'Exceptional' => {
    if (score <= 39) return 'Limited';
    if (score <= 59) return 'Developing';
    if (score <= 79) return 'Strong';
    return 'Exceptional';
  };

  const getBandColor = (band: string) => {
    switch (band) {
      case 'Limited': return 'bg-red-100 text-red-800 border-red-200';
      case 'Developing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Strong': return 'bg-green-100 text-green-800 border-green-200';
      case 'Exceptional': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCheckboxChange = (competencyKey: string, index: number, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [competencyKey]: prev[competencyKey].map((item, i) => i === index ? checked : item)
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
    const resetChecked: Record<string, boolean[]> = {};
    COMPETENCIES.forEach(comp => {
      resetChecked[comp.key] = new Array(10).fill(false);
    });
    setCheckedItems(resetChecked);
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
      toast.error('You have already assessed this candidate for this group and case study');
      return;
    }

    const totalScore = calculateTotalScore();
    const performanceBand = getPerformanceBand(totalScore);

    const newAssessment: IndividualAssessmentData = {
      id: `individual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      transformationCapacity: calculateCompetencyScore('transformationCapacity'),
      innovationCreativity: calculateCompetencyScore('innovationCreativity'),
      futureFocusedSkills: calculateCompetencyScore('futureFocusedSkills'),
      leadershipInfluence: calculateCompetencyScore('leadershipInfluence'),
      aiLiteracyDigitalFluency: calculateCompetencyScore('aiLiteracyDigitalFluency'),
      analyticalThinking: calculateCompetencyScore('analyticalThinking'),
      problemSolving: calculateCompetencyScore('problemSolving'),
      communication: calculateCompetencyScore('communication'),
      collaboration: calculateCompetencyScore('collaboration'),
      impactPracticality: calculateCompetencyScore('impactPracticality'),
      totalScore,
      performanceBand,
      timestamp: new Date().toISOString()
    };

    onSubmit(newAssessment);
    toast.success(`Assessment submitted! Total Score: ${totalScore}/100 (${performanceBand})`);
    resetForm();
  };

  const totalScore = calculateTotalScore();
  const performanceBand = getPerformanceBand(totalScore);

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <User className="w-5 h-5" />
          Individual Assessment Form (100 Points)
        </CardTitle>
        <p className="text-sm text-red-700">
          Tick-box assessment across 10 competencies with 10 sub-competencies each
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
              <Label htmlFor="assessorName">Assessor Name *</Label>
              <Input
                id="assessorName"
                value={formData.assessorName}
                onChange={(e) => setFormData(prev => ({ ...prev, assessorName: e.target.value }))}
                placeholder="Your name"
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
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg border-2 border-red-200">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-900">{totalScore}</div>
                <div className="text-sm text-red-700">/ 100 Points</div>
              </div>
              <Target className="w-8 h-8 text-red-600" />
              <div className={`px-4 py-2 rounded-lg border-2 font-medium ${getBandColor(performanceBand)}`}>
                {performanceBand}
              </div>
            </div>
          </div>

          <Separator className="bg-red-200" />

          {/* Competency Assessment */}
          <div className="space-y-6">
            <h3 className="text-red-900">Competency Assessment</h3>
            
            {COMPETENCIES.map((competency) => {
              const score = calculateCompetencyScore(competency.key);
              return (
                <Card key={competency.key} className="border-red-100 bg-white/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-red-900">{competency.name}</CardTitle>
                      <Badge variant="outline" className={`border-red-300 ${score >= 7 ? 'bg-green-50 text-green-700' : score >= 4 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                        {score}/10
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {competency.subCompetencies.map((subComp, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${competency.key}-${index}`}
                            checked={checkedItems[competency.key][index] || false}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange(competency.key, index, checked as boolean)
                            }
                            className="border-red-300 data-[state=checked]:bg-red-600"
                          />
                          <Label 
                            htmlFor={`${competency.key}-${index}`}
                            className="text-sm text-red-800 cursor-pointer leading-tight"
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

          <Separator className="bg-red-200" />

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observations & Notes</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Additional qualitative observations about the candidate's performance..."
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