import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export interface AssessmentData {
  id: string;
  candidateName: string;
  assessorName: string;
  groupId: string;
  caseStudy: string;
  analyticalThinking: number;
  problemSolving: number;
  communication: number;
  collaboration: number;
  leadershipPotential: number;
  publicSpeaking: number;
  comments: string;
  timestamp: Date;
}

interface AssessmentFormProps {
  groups: string[];
  caseStudies: string[];
  onSubmit: (data: AssessmentData) => void;
  existingAssessments: AssessmentData[];
}

const skillCategories = [
  { key: 'analyticalThinking', label: 'Analytical Thinking' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'communication', label: 'Communication' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'leadershipPotential', label: 'Leadership Potential' },
  { key: 'publicSpeaking', label: 'Public Speaking' },
];

export function AssessmentForm({ groups, caseStudies, onSubmit, existingAssessments }: AssessmentFormProps) {
  const [formData, setFormData] = useState<Partial<AssessmentData>>({
    candidateName: '',
    assessorName: '',
    groupId: '',
    caseStudy: '',
    analyticalThinking: 5,
    problemSolving: 5,
    communication: 5,
    collaboration: 5,
    leadershipPotential: 5,
    publicSpeaking: 5,
    comments: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.candidateName && formData.assessorName && formData.groupId && formData.caseStudy) {
      onSubmit({
        ...formData,
        id: Date.now().toString(),
        timestamp: new Date(),
      } as AssessmentData);
      
      // Reset form but keep assessor name and group/case study for convenience
      setFormData(prev => ({
        candidateName: '',
        assessorName: prev.assessorName,
        groupId: prev.groupId,
        caseStudy: prev.caseStudy,
        analyticalThinking: 5,
        problemSolving: 5,
        communication: 5,
        collaboration: 5,
        leadershipPotential: 5,
        publicSpeaking: 5,
        comments: '',
      }));
    }
  };

  const getScoreColor = (score: number) => {
    const colors = {
      1: 'bg-red-600', 2: 'bg-red-500', 
      3: 'bg-orange-500', 4: 'bg-orange-400',
      5: 'bg-yellow-500', 6: 'bg-yellow-400',
      7: 'bg-lime-500', 8: 'bg-lime-400',
      9: 'bg-green-500', 10: 'bg-green-600'
    };
    return colors[score as keyof typeof colors];
  };

  const getAssessmentsForCurrentGroup = () => {
    return existingAssessments.filter(
      assessment => 
        assessment.groupId === formData.groupId && 
        assessment.caseStudy === formData.caseStudy
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Assessment Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  value={formData.candidateName}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="assessorName">Assessor Name</Label>
                <Input
                  id="assessorName"
                  value={formData.assessorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, assessorName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupId">Group</Label>
                <Select value={formData.groupId} onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="caseStudy">Case Study</Label>
                <Select value={formData.caseStudy} onValueChange={(value) => setFormData(prev => ({ ...prev, caseStudy: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case study" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseStudies.map(study => (
                      <SelectItem key={study} value={study}>{study}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3>Assessment Categories (1-10 Scale)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillCategories.map(category => (
                  <div key={category.key} className="space-y-2">
                    <Label>{category.label}</Label>
                    <div className="flex gap-1 items-center flex-wrap">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                        <button
                          key={score}
                          type="button"
                          className={`w-7 h-7 rounded-full border-2 text-xs ${
                            formData[category.key as keyof AssessmentData] === score
                              ? `${getScoreColor(score)} border-gray-800 text-white`
                              : 'bg-gray-200 border-gray-300'
                          } transition-colors`}
                          onClick={() => setFormData(prev => ({ ...prev, [category.key]: score }))}
                        >
                          {score}
                        </button>
                      ))}
                      <span className="ml-2">
                        Score: {formData[category.key as keyof AssessmentData] || 5}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Additional comments about the candidate..."
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Assessment
            </Button>
          </form>
        </CardContent>
      </Card>

      {formData.groupId && formData.caseStudy && (
        <Card>
          <CardHeader>
            <CardTitle>Current Group Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Group: <Badge variant="outline">{formData.groupId}</Badge></p>
              <p>Case Study: <Badge variant="outline">{formData.caseStudy}</Badge></p>
              <p>Assessed Candidates: {getAssessmentsForCurrentGroup().length}</p>
              <div className="flex flex-wrap gap-1">
                {getAssessmentsForCurrentGroup().map(assessment => (
                  <Badge key={assessment.id} variant="secondary" className="text-xs">
                    {assessment.candidateName}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}