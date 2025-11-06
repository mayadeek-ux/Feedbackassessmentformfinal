import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { AssessmentData } from './AssessmentForm';
import { toast } from 'sonner@2.0.3';

interface AssessmentEditorProps {
  assessments: AssessmentData[];
  groups: string[];
  caseStudies: string[];
  onUpdate: (updatedAssessment: AssessmentData) => void;
  onDelete: (assessmentId: string) => void;
}

const skillCategories = [
  { key: 'analyticalThinking', label: 'Analytical Thinking' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'communication', label: 'Communication' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'leadershipPotential', label: 'Leadership Potential' },
  { key: 'publicSpeaking', label: 'Public Speaking' },
];

export function AssessmentEditor({ assessments, groups, caseStudies, onUpdate, onDelete }: AssessmentEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AssessmentData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all-groups');
  const [filterCaseStudy, setFilterCaseStudy] = useState('all-case-studies');

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

  const startEdit = (assessment: AssessmentData) => {
    setEditingId(assessment.id);
    setEditForm({ ...assessment });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
      onUpdate(editForm);
      setEditingId(null);
      setEditForm(null);
      toast.success('Assessment updated successfully!');
    }
  };

  const handleDelete = (assessment: AssessmentData) => {
    if (window.confirm(`Are you sure you want to delete the assessment for ${assessment.candidateName}?`)) {
      onDelete(assessment.id);
      toast.success('Assessment deleted successfully!');
    }
  };

  const updateEditForm = (field: keyof AssessmentData, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = searchTerm === '' || 
      assessment.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.assessorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = filterGroup === '' || filterGroup === 'all-groups' || assessment.groupId === filterGroup;
    const matchesCaseStudy = filterCaseStudy === '' || filterCaseStudy === 'all-case-studies' || assessment.caseStudy === filterCaseStudy;
    
    return matchesSearch && matchesGroup && matchesCaseStudy;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search candidates or assessors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Group</Label>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-groups">All groups</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filter by Case Study</Label>
              <Select value={filterCaseStudy} onValueChange={setFilterCaseStudy}>
                <SelectTrigger>
                  <SelectValue placeholder="All case studies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-case-studies">All case studies</SelectItem>
                  {caseStudies.map(study => (
                    <SelectItem key={study} value={study}>{study}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredAssessments.length} of {assessments.length} assessments
          </p>
        </CardContent>
      </Card>

      {/* Assessment List */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {assessments.length === 0 ? 'No assessments found.' : 'No assessments match your filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssessments.map(assessment => (
            <Card key={assessment.id}>
              <CardContent className="p-6">
                {editingId === assessment.id && editForm ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4>Editing Assessment</h4>
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Candidate Name</Label>
                        <Input
                          value={editForm.candidateName}
                          onChange={(e) => updateEditForm('candidateName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Assessor Name</Label>
                        <Input
                          value={editForm.assessorName}
                          onChange={(e) => updateEditForm('assessorName', e.target.value)}
                        />
                      </div>
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
                                  editForm[category.key as keyof AssessmentData] === score
                                    ? `${getScoreColor(score)} border-gray-800 text-white`
                                    : 'bg-gray-200 border-gray-300'
                                } transition-colors`}
                                onClick={() => updateEditForm(category.key as keyof AssessmentData, score)}
                              >
                                {score}
                              </button>
                            ))}
                            <span className="ml-2 text-sm">
                              {editForm[category.key as keyof AssessmentData] as number}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Comments</Label>
                      <Textarea
                        value={editForm.comments}
                        onChange={(e) => updateEditForm('comments', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4>{assessment.candidateName}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          <Badge variant="outline">{assessment.assessorName}</Badge>
                          <Badge variant="secondary">{assessment.groupId}</Badge>
                          <Badge variant="secondary">{assessment.caseStudy}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => startEdit(assessment)} variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(assessment)} 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {skillCategories.map(category => (
                        <div key={category.key} className="flex justify-between items-center">
                          <span className="text-sm">{category.label}:</span>
                          <Badge variant="outline">
                            {assessment[category.key as keyof AssessmentData] as number}/10
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {assessment.comments && (
                      <div className="mt-3 p-3 bg-muted/30 rounded">
                        <p className="text-sm">{assessment.comments}</p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-muted-foreground">
                      Submitted: {new Date(assessment.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}