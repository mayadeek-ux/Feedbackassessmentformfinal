import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, TrendingUp, Award, Target } from 'lucide-react';
import { IndividualAssessmentData } from './NewIndividualAssessmentForm';

interface NewIndividualHeatmapViewProps {
  assessments: IndividualAssessmentData[];
  groups: string[];
  caseStudies: string[];
}

const COMPETENCY_LABELS = [
  'Transformation Capacity',
  'Innovation & Creativity',
  'Future-Focused Skills',
  'Leadership & Influence',
  'AI Literacy & Digital Fluency',
  'Analytical Thinking',
  'Problem-Solving',
  'Communication',
  'Collaboration',
  'Impact & Practicality'
];

export function NewIndividualHeatmapView({ assessments, groups, caseStudies }: NewIndividualHeatmapViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string>('all');

  const filteredAssessments = assessments.filter(assessment => {
    const groupMatch = selectedGroup === 'all' || assessment.groupId === selectedGroup;
    const caseMatch = selectedCaseStudy === 'all' || assessment.caseStudy === selectedCaseStudy;
    return groupMatch && caseMatch;
  });

  // Get heat map color based on score (0-10 scale)
  const getHeatmapColor = (score: number): string => {
    if (score === 0) return 'bg-gray-100';
    if (score <= 2) return 'bg-red-600';
    if (score <= 3) return 'bg-red-500';
    if (score <= 4) return 'bg-orange-500';
    if (score <= 5) return 'bg-yellow-500';
    if (score <= 6) return 'bg-yellow-400';
    if (score <= 7) return 'bg-green-400';
    if (score <= 8) return 'bg-green-500';
    if (score <= 9) return 'bg-green-600';
    return 'bg-green-700';
  };

  const getTextColor = (score: number): string => {
    if (score === 0) return 'text-gray-600';
    if (score <= 6) return 'text-white';
    return 'text-white';
  };

  // Calculate average scores for heatmap
  const getAverageScores = () => {
    if (filteredAssessments.length === 0) return {};

    const candidates = [...new Set(filteredAssessments.map(a => a.candidateName))];
    const caseStudyGroups = [...new Set(filteredAssessments.map(a => `${a.caseStudy}_${a.groupId}`))];
    
    const heatmapData: Record<string, Record<string, number>> = {};

    COMPETENCY_LABELS.forEach(competency => {
      heatmapData[competency] = {};
      
      caseStudyGroups.forEach(caseGroup => {
        const [caseStudy, group] = caseGroup.split('_');
        const relevantAssessments = filteredAssessments.filter(
          a => a.caseStudy === caseStudy && a.groupId === group
        );
        
        if (relevantAssessments.length > 0) {
          const competencyKey = getCompetencyKey(competency);
          const scores = relevantAssessments.map(a => a[competencyKey] as number);
          const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          heatmapData[competency][caseGroup] = Math.round(average * 10) / 10;
        }
      });
    });

    return { heatmapData, caseStudyGroups };
  };

  const getCompetencyKey = (label: string): keyof IndividualAssessmentData => {
    const mapping: Record<string, keyof IndividualAssessmentData> = {
      'Transformation Capacity': 'transformationCapacity',
      'Innovation & Creativity': 'innovationCreativity',
      'Future-Focused Skills': 'futureFocusedSkills',
      'Leadership & Influence': 'leadershipInfluence',
      'AI Literacy & Digital Fluency': 'aiLiteracyDigitalFluency',
      'Analytical Thinking': 'analyticalThinking',
      'Problem-Solving': 'problemSolving',
      'Communication': 'communication',
      'Collaboration': 'collaboration',
      'Impact & Practicality': 'impactPracticality'
    };
    return mapping[label];
  };

  const getTopPerformers = () => {
    if (filteredAssessments.length === 0) return [];
    
    const candidateScores: Record<string, { total: number, count: number, assessments: IndividualAssessmentData[] }> = {};
    
    filteredAssessments.forEach(assessment => {
      if (!candidateScores[assessment.candidateName]) {
        candidateScores[assessment.candidateName] = { total: 0, count: 0, assessments: [] };
      }
      candidateScores[assessment.candidateName].total += assessment.totalScore;
      candidateScores[assessment.candidateName].count += 1;
      candidateScores[assessment.candidateName].assessments.push(assessment);
    });

    return Object.entries(candidateScores)
      .map(([name, data]) => ({
        name,
        averageScore: Math.round((data.total / data.count) * 10) / 10,
        assessmentCount: data.count,
        topPerformanceBand: data.assessments.reduce((best, curr) => 
          curr.totalScore > best.totalScore ? curr : best
        ).performanceBand
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
  };

  const { heatmapData, caseStudyGroups } = getAverageScores();
  const topPerformers = getTopPerformers();

  if (assessments.length === 0) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardContent className="p-12 text-center">
          <User className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-red-900 mb-2">No Individual Assessments Yet</h3>
          <p className="text-red-700">
            Start by conducting individual assessments to see the heatmap visualization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <User className="w-5 h-5" />
              Individual Assessment Heatmap
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-700">Group:</span>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-40 bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-700">Case Study:</span>
                <Select value={selectedCaseStudy} onValueChange={setSelectedCaseStudy}>
                  <SelectTrigger className="w-48 bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Case Studies</SelectItem>
                    {caseStudies.map(study => (
                      <SelectItem key={study} value={study}>{study}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList className="bg-white/80 border border-red-200">
          <TabsTrigger value="heatmap" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Competency Heatmap
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Top Performers
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Performance Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Individual Performance Across Competencies</CardTitle>
              <p className="text-sm text-red-700">
                Average scores (0-10) showing {filteredAssessments.length} assessments across {caseStudyGroups?.length || 0} group-case combinations
              </p>
            </CardHeader>
            <CardContent>
              {caseStudyGroups && caseStudyGroups.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <table className="w-full border-collapse rounded-lg overflow-hidden shadow-lg">
                      <thead>
                        <tr>
                          <th className="p-3 text-left bg-red-600 text-white font-medium border border-red-500">
                            Competency
                          </th>
                          {caseStudyGroups.map((caseGroup) => {
                            const [caseStudy, group] = caseGroup.split('_');
                            return (
                              <th key={caseGroup} className="p-3 text-center bg-red-600 text-white font-medium border border-red-500 min-w-[100px]">
                                <div className="text-xs">{caseStudy}</div>
                                <div className="text-sm">{group}</div>
                              </th>
                            );
                          })}
                          <th className="p-3 text-center bg-red-700 text-white font-medium border border-red-500">
                            Avg Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPETENCY_LABELS.map((competency) => {
                          const competencyScores = caseStudyGroups.map(caseGroup => 
                            heatmapData[competency]?.[caseGroup] || 0
                          ).filter(score => score > 0);
                          
                          const avgScore = competencyScores.length > 0 
                            ? competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length 
                            : 0;

                          return (
                            <tr key={competency}>
                              <td className="p-3 border border-gray-300 font-medium bg-red-50 text-red-900 text-sm">
                                {competency}
                              </td>
                              {caseStudyGroups.map((caseGroup) => {
                                const score = heatmapData[competency]?.[caseGroup];
                                if (score === undefined) {
                                  return (
                                    <td key={caseGroup} className="p-3 border border-gray-300 text-center bg-gray-50">
                                      <span className="text-gray-400">-</span>
                                    </td>
                                  );
                                }
                                return (
                                  <td key={caseGroup} className="p-3 border border-gray-300 text-center">
                                    <div className={`px-2 py-1 rounded ${getHeatmapColor(score)} ${getTextColor(score)} font-medium text-sm`}>
                                      {score.toFixed(1)}
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="p-3 border border-gray-300 text-center bg-red-100">
                                <div className="font-medium text-red-900">
                                  {avgScore > 0 ? avgScore.toFixed(1) : '-'}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-red-600">
                  No data available for the selected filters.
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-3">Score Scale (0-10 Points)</h4>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <div key={score} className="flex items-center gap-1">
                      <div className={`w-8 h-6 rounded text-xs font-medium flex items-center justify-center ${getHeatmapColor(score)} ${getTextColor(score)}`}>
                        {score}
                      </div>
                      {score === 0 && <span className="text-xs text-red-600">No Data</span>}
                      {score === 3 && <span className="text-xs text-red-600">Low</span>}
                      {score === 7 && <span className="text-xs text-red-600">Good</span>}
                      {score === 10 && <span className="text-xs text-red-600">Excellent</span>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Award className="w-5 h-5" />
                Top Individual Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((performer, index) => (
                  <div key={performer.name} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-red-300">#{index + 1}</Badge>
                        <span className="font-medium text-red-900">{performer.name}</span>
                        <Badge className={`${performer.topPerformanceBand === 'Exceptional' ? 'bg-emerald-600' : 
                          performer.topPerformanceBand === 'Strong' ? 'bg-green-600' : 
                          performer.topPerformanceBand === 'Developing' ? 'bg-orange-600' : 'bg-red-600'}`}>
                          {performer.topPerformanceBand}
                        </Badge>
                      </div>
                      <Badge className="bg-red-600">
                        {performer.averageScore}/100
                      </Badge>
                    </div>
                    <div className="text-sm text-red-700">
                      Based on {performer.assessmentCount} assessment{performer.assessmentCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-red-600">
                  No performance data available for the selected filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <TrendingUp className="w-5 h-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white/80 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-900 mb-2">Assessment Summary</h4>
                  <div className="space-y-1 text-sm text-red-700">
                    <div>Total Assessments: {filteredAssessments.length}</div>
                    <div>Unique Candidates: {[...new Set(filteredAssessments.map(a => a.candidateName))].length}</div>
                    <div>Unique Assessors: {[...new Set(filteredAssessments.map(a => a.assessorName))].length}</div>
                  </div>
                </div>

                <div className="p-4 bg-white/80 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-900 mb-2">Performance Distribution</h4>
                  <div className="space-y-1 text-sm text-red-700">
                    {['Exceptional', 'Strong', 'Developing', 'Limited'].map(band => {
                      const count = filteredAssessments.filter(a => a.performanceBand === band).length;
                      const percentage = filteredAssessments.length > 0 ? Math.round((count / filteredAssessments.length) * 100) : 0;
                      return (
                        <div key={band} className="flex justify-between">
                          <span>{band}:</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}