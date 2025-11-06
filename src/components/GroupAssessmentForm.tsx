import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Users, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface GroupAssessmentData {
  id: string;
  groupId: string;
  caseStudy: string;
  assessorName: string;
  teamMembers: string[];
  // Group-specific criteria (1-10 scale)
  strategicApproach: number;
  innovationCreativity: number;
  teamDynamics: number;
  impactPracticality: number;
  businessAcumen: number;
  presentationSkills: number;
  // Overall group performance
  overallGroupScore: number;
  // Additional feedback
  strengths: string;
  areasForImprovement: string;
  additionalComments: string;
  createdAt: string;
}

const GROUP_CRITERIA = [
  { key: 'strategicApproach', label: 'Strategic Approach', description: 'Problem-solving methodology and planning' },
  { key: 'innovationCreativity', label: 'Innovation & Creativity', description: 'Creative solutions and original thinking' },
  { key: 'teamDynamics', label: 'Team Dynamics', description: 'Collaboration and team cohesion' },
  { key: 'impactPracticality', label: 'Impact / Practicality', description: 'Feasibility and real-world application' },
  { key: 'businessAcumen', label: 'Business Acumen', description: 'Commercial understanding and viability' },
  { key: 'presentationSkills', label: 'Presentation Skills (Group)', description: 'Overall team presentation quality' }
] as const;

interface GroupAssessmentFormProps {
  groups: string[];
  caseStudies: string[];
  onSubmit: (assessment: GroupAssessmentData) => void;
  existingAssessments?: GroupAssessmentData[];
}

export function GroupAssessmentForm({ 
  groups, 
  caseStudies, 
  onSubmit, 
  existingAssessments = [] 
}: GroupAssessmentFormProps) {
  const [formData, setFormData] = useState({
    groupId: '',
    caseStudy: '',
    assessorName: '',
    teamMembers: [] as string[],
    strategicApproach: 5,
    innovationCreativity: 5,
    teamDynamics: 5,
    impactPracticality: 5,
    businessAcumen: 5,
    presentationSkills: 5,
    overallGroupScore: 5,
    strengths: '',
    areasForImprovement: '',
    additionalComments: ''
  });

  const [newTeamMember, setNewTeamMember] = useState('');

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

  const updateScore = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (score <= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score <= 9) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const calculateAverageScore = () => {
    const scores = [
      formData.strategicApproach,
      formData.innovationCreativity,
      formData.teamDynamics,
      formData.impactPracticality,
      formData.businessAcumen,
      formData.presentationSkills
    ];
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  };

  const resetForm = () => {
    setFormData({
      groupId: '',
      caseStudy: '',
      assessorName: '',
      teamMembers: [],
      strategicApproach: 5,
      innovationCreativity: 5,
      teamDynamics: 5,
      impactPracticality: 5,
      businessAcumen: 5,
      presentationSkills: 5,
      overallGroupScore: 5,
      strengths: '',
      areasForImprovement: '',
      additionalComments: ''
    });
    setNewTeamMember('');
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

    const newAssessment: GroupAssessmentData = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      createdAt: new Date().toISOString()
    };

    onSubmit(newAssessment);
    toast.success('Group assessment submitted successfully!');
    resetForm();
  };

  const averageScore = calculateAverageScore();

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <Users className="w-5 h-5" />
          Group Assessment Form
        </CardTitle>
        <p className="text-sm text-red-700">
          Evaluate team performance and group dynamics across key criteria
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

          <Separator className="bg-red-200" />

          {/* Group Assessment Criteria */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-red-900">Assessment Criteria (1-10 Scale)</h3>
              <div className={`px-3 py-1 rounded-lg border-2 ${getScoreColor(averageScore)}`}>
                Average: {averageScore}
              </div>
            </div>

            <div className="grid gap-6">
              {GROUP_CRITERIA.map(({ key, label, description }) => {
                const score = formData[key as keyof typeof formData] as number;
                return (
                  <div key={key} className="space-y-3 p-4 bg-white/60 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900">{label}</h4>
                        <p className="text-sm text-red-700">{description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg border-2 ${getScoreColor(score)}`}>
                        {score}/10
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600">1</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={score}
                        onChange={(e) => updateScore(key, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-red-100 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-sm text-red-600">10</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-600">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Group Score */}
            <div className="space-y-3 p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Overall Group Performance</h4>
                  <p className="text-sm text-red-700">Holistic assessment of the team's overall performance</p>
                </div>
                <div className={`px-3 py-1 rounded-lg border-2 ${getScoreColor(formData.overallGroupScore)}`}>
                  {formData.overallGroupScore}/10
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.overallGroupScore}
                  onChange={(e) => updateScore('overallGroupScore', parseInt(e.target.value))}
                  className="flex-1 h-3 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-red-600">10</span>
              </div>
            </div>
          </div>

          <Separator className="bg-red-200" />

          {/* Feedback Section */}
          <div className="space-y-4">
            <h3 className="text-red-900">Detailed Feedback</h3>
            
            <div className="space-y-2">
              <Label htmlFor="strengths">Team Strengths</Label>
              <Textarea
                id="strengths"
                value={formData.strengths}
                onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                placeholder="What did the team do well? Key strengths observed..."
                className="bg-white/80 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areasForImprovement">Areas for Improvement</Label>
              <Textarea
                id="areasForImprovement"
                value={formData.areasForImprovement}
                onChange={(e) => setFormData(prev => ({ ...prev, areasForImprovement: e.target.value }))}
                placeholder="What could the team improve on? Specific recommendations..."
                className="bg-white/80 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalComments">Additional Comments</Label>
              <Textarea
                id="additionalComments"
                value={formData.additionalComments}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                placeholder="Any other observations or notes..."
                className="bg-white/80 min-h-[60px]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
              <Save className="w-4 h-4 mr-2" />
              Submit Group Assessment
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