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
import { Users, Save, RotateCcw, Target } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface GroupAssessmentData {
  id: string;
  groupId: string;
  caseStudy: string;
  assessorName: string;
  teamMembers: string[];
  // Criteria scores (each out of 20, total 100)
  strategicApproach: number;
  innovationCreativity: number;
  teamDynamicsCollaboration: number;
  communicationPresentation: number;
  impactPracticality: number;
  // Total score out of 100
  totalScore: number;
  // Performance band
  performanceBand: 'Limited' | 'Developing' | 'Strong' | 'Exceptional';
  // Qualitative feedback
  observations: string;
  createdAt: string;
}

const GROUP_CRITERIA = [
  {
    key: 'strategicApproach',
    name: 'Strategic Approach',
    maxPoints: 20,
    subCompetencies: [
      'Defines problem clearly',
      'Aligns with future trends',
      'Uses structured, logical approach',
      'Prioritizes key issues',
      'Identifies risks',
      'Considers short- and long-term impact',
      'Uses data/evidence effectively',
      'Explores multiple options',
      'Balances innovation with feasibility',
      'Presents a clear roadmap'
    ]
  },
  {
    key: 'innovationCreativity',
    name: 'Innovation & Creativity',
    maxPoints: 20,
    subCompetencies: [
      'Generates unique ideas',
      'Applies cross-disciplinary thinking',
      'Adapts ideas during collaboration',
      'Challenges conventional approaches',
      'Demonstrates risk-taking',
      'Adds novel value',
      'Uses creative presentation methods',
      'Tests/refines ideas',
      'Balances boldness with realism',
      'Ideas are memorable/impactful'
    ]
  },
  {
    key: 'teamDynamicsCollaboration',
    name: 'Team Dynamics & Collaboration',
    maxPoints: 20,
    subCompetencies: [
      'Equal participation across members',
      'Respectful listening',
      'Conflict resolution',
      'Role clarity in group',
      'Supports each other\'s strengths',
      'Includes diverse viewpoints',
      'Builds consensus effectively',
      'Demonstrates cohesion',
      'Shares credit fairly',
      'Maintains positive energy'
    ]
  },
  {
    key: 'communicationPresentation',
    name: 'Communication & Presentation',
    maxPoints: 20,
    subCompetencies: [
      'Clear structure',
      'Logical flow',
      'Storytelling impact',
      'Visual aids used well',
      'Engaging delivery',
      'Balanced speaking roles',
      'Professional tone',
      'Adapts to audience',
      'Handles Q&A effectively',
      'Communicates with confidence'
    ]
  },
  {
    key: 'impactPracticality',
    name: 'Impact & Practicality',
    maxPoints: 20,
    subCompetencies: [
      'Solutions are actionable',
      'Recommendations add clear value',
      'Shows measurable outcomes',
      'Considers implementation steps',
      'Demonstrates scalability',
      'Evaluates cost/benefit',
      'Provides evidence for impact',
      'Balances short- and long-term benefit',
      'Aligns with sustainability/ethics',
      'Offers realistic next steps'
    ]
  }
] as const;

interface NewGroupAssessmentFormProps {
  groups: string[];
  caseStudies: string[];
  onSubmit: (assessment: GroupAssessmentData) => void;
  existingAssessments?: GroupAssessmentData[];
}

export function NewGroupAssessmentForm({ 
  groups, 
  caseStudies, 
  onSubmit, 
  existingAssessments = [] 
}: NewGroupAssessmentFormProps) {
  const [formData, setFormData] = useState({
    groupId: '',
    caseStudy: '',
    assessorName: '',
    teamMembers: [] as string[],
    observations: ''
  });

  const [newTeamMember, setNewTeamMember] = useState('');

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    GROUP_CRITERIA.forEach(criteria => {
      initial[criteria.key] = new Array(10).fill(false);
    });
    return initial;
  });

  const calculateCriteriaScore = (criteriaKey: string): number => {
    const checkedCount = checkedItems[criteriaKey]?.filter(Boolean).length || 0;
    return checkedCount * 2; // Each tick = 2 points
  };

  const calculateTotalScore = (): number => {
    return GROUP_CRITERIA.reduce((total, criteria) => total + calculateCriteriaScore(criteria.key), 0);
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

  const addTeamMember = () => {
    if (newTeamMember.trim() && !formData.teamMembers.includes(newTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newTeamMember.trim()]
      }));
      setNewTeamMember('');
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m !== member)
    }));
  };

  const handleCheckboxChange = (criteriaKey: string, index: number, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [criteriaKey]: prev[criteriaKey].map((item, i) => i === index ? checked : item)
    }));
  };

  const resetForm = () => {
    setFormData({
      groupId: '',
      caseStudy: '',
      assessorName: '',
      teamMembers: [],
      observations: ''
    });
    setNewTeamMember('');
    const resetChecked: Record<string, boolean[]> = {};
    GROUP_CRITERIA.forEach(criteria => {
      resetChecked[criteria.key] = new Array(10).fill(false);
    });
    setCheckedItems(resetChecked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.groupId || !formData.caseStudy || !formData.assessorName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.teamMembers.length === 0) {
      toast.error('Please add at least one team member');
      return;
    }

    // Check for duplicate assessment
    const existingAssessment = existingAssessments.find(
      assessment => 
        assessment.groupId === formData.groupId && 
        assessment.caseStudy === formData.caseStudy &&
        assessment.assessorName === formData.assessorName
    );

    if (existingAssessment) {
      toast.error('You have already assessed this group for this case study');
      return;
    }

    const totalScore = calculateTotalScore();
    const performanceBand = getPerformanceBand(totalScore);

    const newAssessment: GroupAssessmentData = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      strategicApproach: calculateCriteriaScore('strategicApproach'),
      innovationCreativity: calculateCriteriaScore('innovationCreativity'),
      teamDynamicsCollaboration: calculateCriteriaScore('teamDynamicsCollaboration'),
      communicationPresentation: calculateCriteriaScore('communicationPresentation'),
      impactPracticality: calculateCriteriaScore('impactPracticality'),
      totalScore,
      performanceBand,
      createdAt: new Date().toISOString()
    };

    onSubmit(newAssessment);
    toast.success(`Group assessment submitted! Total Score: ${totalScore}/100 (${performanceBand})`);
    resetForm();
  };

  const totalScore = calculateTotalScore();
  const performanceBand = getPerformanceBand(totalScore);

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <Users className="w-5 h-5" />
          Group Assessment Form (100 Points)
        </CardTitle>
        <p className="text-sm text-red-700">
          Tick-box assessment across 5 criteria with 10 sub-competencies each (2 points per tick)
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Team Members */}
          <div className="space-y-3">
            <Label>Team Members *</Label>
            <div className="flex gap-2">
              <Input
                value={newTeamMember}
                onChange={(e) => setNewTeamMember(e.target.value)}
                placeholder="Enter team member name"
                className="bg-white/80"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
              />
              <Button type="button" onClick={addTeamMember} variant="outline" className="border-red-200">
                Add
              </Button>
            </div>
            {formData.teamMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.teamMembers.map((member, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeTeamMember(member)}
                  >
                    {member} ×
                  </Badge>
                ))}
              </div>
            )}
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

          {/* Criteria Assessment */}
          <div className="space-y-6">
            <h3 className="text-red-900">Group Assessment Criteria</h3>
            
            {GROUP_CRITERIA.map((criteria) => {
              const score = calculateCriteriaScore(criteria.key);
              const tickCount = checkedItems[criteria.key]?.filter(Boolean).length || 0;
              return (
                <Card key={criteria.key} className="border-red-100 bg-white/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-red-900">{criteria.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {tickCount} ticks
                        </Badge>
                        <Badge variant="outline" className={`border-red-300 ${score >= 14 ? 'bg-green-50 text-green-700' : score >= 8 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          {score}/{criteria.maxPoints}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {criteria.subCompetencies.map((subComp, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${criteria.key}-${index}`}
                            checked={checkedItems[criteria.key][index] || false}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange(criteria.key, index, checked as boolean)
                            }
                            className="border-red-300 data-[state=checked]:bg-red-600"
                          />
                          <Label 
                            htmlFor={`${criteria.key}-${index}`}
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
              placeholder="Additional qualitative observations about the group's performance..."
              className="bg-white/80 min-h-[100px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
              <Save className="w-4 h-4 mr-2" />
              Submit Group Assessment ({totalScore}/100)
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