import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Trash2, Users } from 'lucide-react';
import { AssessmentData } from './AssessmentForm';
import { toast } from 'sonner@2.0.3';

interface BatchCandidate {
  id: string;
  name: string;
  analyticalThinking: number;
  problemSolving: number;
  communication: number;
  collaboration: number;
  leadershipPotential: number;
  publicSpeaking: number;
  comments: string;
}

interface BatchAssessmentFormProps {
  groups: string[];
  caseStudies: string[];
  onSubmit: (assessments: AssessmentData[]) => void;
}

const skillCategories = [
  { key: 'analyticalThinking', label: 'Analytical Thinking' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'communication', label: 'Communication' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'leadershipPotential', label: 'Leadership Potential' },
  { key: 'publicSpeaking', label: 'Public Speaking' },
];

export function BatchAssessmentForm({ groups, caseStudies, onSubmit }: BatchAssessmentFormProps) {
  const [assessorName, setAssessorName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [caseStudy, setCaseStudy] = useState('');
  const [candidates, setCandidates] = useState<BatchCandidate[]>([
    {
      id: '1',
      name: '',
      analyticalThinking: 5,
      problemSolving: 5,
      communication: 5,
      collaboration: 5,
      leadershipPotential: 5,
      publicSpeaking: 5,
      comments: '',
    }
  ]);

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

  const addCandidate = () => {
    const newCandidate: BatchCandidate = {
      id: Date.now().toString(),
      name: '',
      analyticalThinking: 5,
      problemSolving: 5,
      communication: 5,
      collaboration: 5,
      leadershipPotential: 5,
      publicSpeaking: 5,
      comments: '',
    };
    setCandidates([...candidates, newCandidate]);
  };

  const removeCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const updateCandidate = (id: string, field: keyof BatchCandidate, value: any) => {
    setCandidates(candidates.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assessorName || !groupId || !caseStudy) {
      toast.error('Please fill in assessor name, group, and case study');
      return;
    }

    const validCandidates = candidates.filter(c => c.name.trim());
    if (validCandidates.length === 0) {
      toast.error('Please add at least one candidate with a name');
      return;
    }

    const assessments: AssessmentData[] = validCandidates.map(candidate => ({
      id: `${Date.now()}-${candidate.id}`,
      candidateName: candidate.name,
      assessorName,
      groupId,
      caseStudy,
      analyticalThinking: candidate.analyticalThinking,
      problemSolving: candidate.problemSolving,
      communication: candidate.communication,
      collaboration: candidate.collaboration,
      leadershipPotential: candidate.leadershipPotential,
      publicSpeaking: candidate.publicSpeaking,
      comments: candidate.comments,
      timestamp: new Date(),
    }));

    onSubmit(assessments);
    toast.success(`Successfully submitted ${assessments.length} assessments!`);
    
    // Reset candidates but keep assessor info
    setCandidates([{
      id: Date.now().toString(),
      name: '',
      analyticalThinking: 5,
      problemSolving: 5,
      communication: 5,
      collaboration: 5,
      leadershipPotential: 5,
      publicSpeaking: 5,
      comments: '',
    }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Batch Assessment Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessor Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <Label htmlFor="assessorName">Assessor Name</Label>
              <Input
                id="assessorName"
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="groupId">Group</Label>
              <Select value={groupId} onValueChange={setGroupId}>
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
              <Select value={caseStudy} onValueChange={setCaseStudy}>
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

          {/* Candidates */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3>Candidates ({candidates.length})</h3>
              <Button type="button" onClick={addCandidate} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </div>

            {candidates.map((candidate, index) => (
              <Card key={candidate.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4>Candidate {index + 1}</h4>
                    {candidates.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeCandidate(candidate.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Candidate Name</Label>
                    <Input
                      value={candidate.name}
                      onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                      placeholder="Enter candidate name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillCategories.map(category => (
                      <div key={category.key} className="space-y-2">
                        <Label>{category.label}</Label>
                        <div className="flex gap-1 items-center flex-wrap">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                            <button
                              key={score}
                              type="button"
                              className={`w-6 h-6 rounded-full border text-xs ${
                                candidate[category.key as keyof BatchCandidate] === score
                                  ? `${getScoreColor(score)} border-gray-800 text-white`
                                  : 'bg-gray-200 border-gray-300'
                              } transition-colors`}
                              onClick={() => updateCandidate(candidate.id, category.key as keyof BatchCandidate, score)}
                            >
                              {score}
                            </button>
                          ))}
                          <span className="ml-2 text-sm">
                            {candidate[category.key as keyof BatchCandidate]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      value={candidate.comments}
                      onChange={(e) => updateCandidate(candidate.id, 'comments', e.target.value)}
                      placeholder="Additional comments..."
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Submit All {candidates.filter(c => c.name.trim()).length} Assessments
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}