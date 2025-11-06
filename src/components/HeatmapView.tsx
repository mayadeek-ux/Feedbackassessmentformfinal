import { AssessmentData } from './AssessmentForm';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';

interface HeatmapViewProps {
  assessments: AssessmentData[];
  groups: string[];
  caseStudies: string[];
}

const skillCategories = [
  { key: 'analyticalThinking', label: 'Analytical Thinking' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'communication', label: 'Communication' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'leadershipPotential', label: 'Leadership Potential' },
  { key: 'publicSpeaking', label: 'Public Speaking' },
];

export function HeatmapView({ assessments, groups, caseStudies }: HeatmapViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || '');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string>(caseStudies[0] || '');

  const getScoreColor = (score: number) => {
    const colors = {
      1: 'bg-red-600 text-white', 2: 'bg-red-500 text-white',
      3: 'bg-orange-500 text-white', 4: 'bg-orange-400 text-white',
      5: 'bg-yellow-500 text-black', 6: 'bg-yellow-400 text-black',
      7: 'bg-lime-500 text-black', 8: 'bg-lime-400 text-black',
      9: 'bg-green-500 text-white', 10: 'bg-green-600 text-white'
    };
    return colors[score as keyof typeof colors] || 'bg-gray-200';
  };

  const getIntensityColor = (score: number) => {
    const intensities = {
      1: 'bg-red-200 border-red-400', 2: 'bg-red-150 border-red-350',
      3: 'bg-orange-150 border-orange-350', 4: 'bg-orange-100 border-orange-300',
      5: 'bg-yellow-150 border-yellow-350', 6: 'bg-yellow-100 border-yellow-300',
      7: 'bg-lime-150 border-lime-350', 8: 'bg-lime-100 border-lime-300',
      9: 'bg-green-150 border-green-350', 10: 'bg-green-100 border-green-300'
    };
    return intensities[score as keyof typeof intensities] || 'bg-gray-100 border-gray-300';
  };

  const filteredAssessments = assessments.filter(
    assessment => 
      assessment.groupId === selectedGroup && 
      assessment.caseStudy === selectedCaseStudy
  );

  const getAverageScore = (candidateName: string, skill: string) => {
    const candidateAssessments = filteredAssessments.filter(
      assessment => assessment.candidateName === candidateName
    );
    
    if (candidateAssessments.length === 0) return 0;
    
    const sum = candidateAssessments.reduce((acc, assessment) => {
      return acc + (assessment[skill as keyof AssessmentData] as number);
    }, 0);
    
    return Math.round((sum / candidateAssessments.length) * 10) / 10;
  };

  const uniqueCandidates = Array.from(
    new Set(filteredAssessments.map(assessment => assessment.candidateName))
  );

  const getCandidateAssessors = (candidateName: string) => {
    return filteredAssessments
      .filter(assessment => assessment.candidateName === candidateName)
      .map(assessment => assessment.assessorName);
  };

  const getOverallAverage = (candidateName: string) => {
    const scores = skillCategories.map(skill => getAverageScore(candidateName, skill.key));
    return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';
  };

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No assessments submitted yet. Start evaluating candidates to see the heatmap.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results Heatmap</CardTitle>
          <div className="flex gap-4">
            <div>
              <label className="block mb-2">Group:</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2">Case Study:</label>
              <Select value={selectedCaseStudy} onValueChange={setSelectedCaseStudy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {caseStudies.map(study => (
                    <SelectItem key={study} value={study}>{study}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No assessments found for {selectedGroup} - {selectedCaseStudy}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-muted">Candidate Name</th>
                    <th className="text-center p-3 bg-muted min-w-24">Assessors</th>
                    {skillCategories.map(skill => (
                      <th key={skill.key} className="text-center p-3 bg-muted min-w-32">
                        {skill.label}
                      </th>
                    ))}
                    <th className="text-center p-3 bg-muted min-w-20">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueCandidates.map(candidateName => (
                    <tr key={candidateName} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <div>{candidateName}</div>
                          <div className="text-xs text-muted-foreground">
                            {getCandidateAssessors(candidateName).length} assessment(s)
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getCandidateAssessors(candidateName).map((assessor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {assessor.split(' ')[0]}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      {skillCategories.map(skill => {
                        const avgScore = getAverageScore(candidateName, skill.key);
                        const roundedScore = Math.round(avgScore);
                        return (
                          <td key={skill.key} className="p-2">
                            <div className="flex justify-center">
                              <div 
                                className={`
                                  w-16 h-8 rounded flex items-center justify-center border-2
                                  ${getIntensityColor(roundedScore)}
                                `}
                              >
                                <span className="text-sm">{avgScore}</span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-2">
                        <div className="flex justify-center">
                          <div className="w-16 h-8 rounded flex items-center justify-center bg-gray-100 border-2 border-gray-300">
                            <span className="text-sm">{getOverallAverage(candidateName)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm">Score Scale (1-10):</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <div key={score} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded border ${getIntensityColor(score)}`}></div>
                  <span className="text-xs">{score}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Values shown are averages when multiple assessors have evaluated the same candidate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}