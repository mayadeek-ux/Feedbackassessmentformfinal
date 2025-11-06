import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, TrendingUp, Award, Target } from 'lucide-react';
import { GroupAssessmentData } from './NewGroupAssessmentForm';

interface NewGroupHeatmapViewProps {
  groupAssessments: GroupAssessmentData[];
  groups: string[];
  caseStudies: string[];
}

const CRITERIA_LABELS = [
  'Strategic Approach',
  'Innovation & Creativity',
  'Team Dynamics & Collaboration',
  'Communication & Presentation',
  'Impact & Practicality'
];

export function NewGroupHeatmapView({ groupAssessments, groups, caseStudies }: NewGroupHeatmapViewProps) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string>('all');

  const filteredAssessments = selectedCaseStudy === 'all' 
    ? groupAssessments 
    : groupAssessments.filter(assessment => assessment.caseStudy === selectedCaseStudy);

  // Get heat map color based on score (0-20 scale)
  const getHeatmapColor = (score: number): string => {
    if (score === 0) return 'bg-gray-100';
    if (score <= 4) return 'bg-red-600';
    if (score <= 6) return 'bg-red-500';
    if (score <= 8) return 'bg-orange-500';
    if (score <= 10) return 'bg-yellow-500';
    if (score <= 12) return 'bg-yellow-400';
    if (score <= 14) return 'bg-green-400';
    if (score <= 16) return 'bg-green-500';
    if (score <= 18) return 'bg-green-600';
    return 'bg-green-700';
  };

  const getTextColor = (score: number): string => {
    if (score === 0) return 'text-gray-600';
    if (score <= 12) return 'text-white';
    return 'text-white';
  };

  // Calculate average scores for heatmap
  const getAverageScores = () => {
    if (filteredAssessments.length === 0) return {};

    const caseStudyGroups = [...new Set(filteredAssessments.map(a => `${a.caseStudy}_${a.groupId}`))];
    
    const heatmapData: Record<string, Record<string, number>> = {};

    CRITERIA_LABELS.forEach(criteria => {
      heatmapData[criteria] = {};
      
      caseStudyGroups.forEach(caseGroup => {
        const [caseStudy, group] = caseGroup.split('_');
        const relevantAssessments = filteredAssessments.filter(
          a => a.caseStudy === caseStudy && a.groupId === group
        );
        
        if (relevantAssessments.length > 0) {
          const criteriaKey = getCriteriaKey(criteria);
          const scores = relevantAssessments.map(a => a[criteriaKey] as number);
          const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          heatmapData[criteria][caseGroup] = Math.round(average * 10) / 10;
        }
      });
    });

    return { heatmapData, caseStudyGroups };
  };

  const getCriteriaKey = (label: string): keyof GroupAssessmentData => {
    const mapping: Record<string, keyof GroupAssessmentData> = {
      'Strategic Approach': 'strategicApproach',
      'Innovation & Creativity': 'innovationCreativity',
      'Team Dynamics & Collaboration': 'teamDynamicsCollaboration',
      'Communication & Presentation': 'communicationPresentation',
      'Impact & Practicality': 'impactPracticality'
    };
    return mapping[label];
  };

  const getTopPerformingGroups = () => {
    if (filteredAssessments.length === 0) return [];
    
    const groupScores: Record<string, { total: number, count: number, assessments: GroupAssessmentData[] }> = {};
    
    filteredAssessments.forEach(assessment => {
      const groupKey = `${assessment.groupId}_${assessment.caseStudy}`;
      if (!groupScores[groupKey]) {
        groupScores[groupKey] = { total: 0, count: 0, assessments: [] };
      }
      groupScores[groupKey].total += assessment.totalScore;
      groupScores[groupKey].count += 1;
      groupScores[groupKey].assessments.push(assessment);
    });

    return Object.entries(groupScores)
      .map(([groupKey, data]) => {
        const [groupId, caseStudy] = groupKey.split('_');
        return {
          groupId,
          caseStudy,
          averageScore: Math.round((data.total / data.count) * 10) / 10,
          assessmentCount: data.count,
          topPerformanceBand: data.assessments.reduce((best, curr) => 
            curr.totalScore > best.totalScore ? curr : best
          ).performanceBand,
          teamMembers: data.assessments[0].teamMembers
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
  };

  const getCriteriaPerformance = () => {
    if (filteredAssessments.length === 0) return [];

    return CRITERIA_LABELS.map(criteria => {
      const criteriaKey = getCriteriaKey(criteria);
      const allScores = filteredAssessments.map(a => a[criteriaKey] as number);
      const average = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
      const maxScore = Math.max(...allScores);
      
      return {
        criteria,
        average: Math.round(average * 10) / 10,
        maxScore,
        assessmentCount: allScores.length
      };
    }).sort((a, b) => b.average - a.average);
  };

  const { heatmapData, caseStudyGroups } = getAverageScores();
  const topGroups = getTopPerformingGroups();
  const criteriaPerformance = getCriteriaPerformance();

  if (groupAssessments.length === 0) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-red-900 mb-2">No Group Assessments Yet</h3>
          <p className="text-red-700">
            Start by conducting group assessments to see the heatmap visualization.
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
              <Users className="w-5 h-5" />
              Group Assessment Heatmap
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-700">Filter by Case Study:</span>
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
        </CardHeader>
      </Card>

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList className="bg-white/80 border border-red-200">
          <TabsTrigger value="heatmap" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Criteria Heatmap
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Top Groups
          </TabsTrigger>
          <TabsTrigger value="criteria" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Criteria Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Performance Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Group Performance Across Criteria</CardTitle>
              <p className="text-sm text-red-700">
                Average scores (0-20) showing {filteredAssessments.length} assessments across {caseStudyGroups?.length || 0} group-case combinations
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
                            Assessment Criteria
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
                        {CRITERIA_LABELS.map((criteria) => {
                          const criteriaScores = caseStudyGroups.map(caseGroup => 
                            heatmapData[criteria]?.[caseGroup] || 0
                          ).filter(score => score > 0);
                          
                          const avgScore = criteriaScores.length > 0 
                            ? criteriaScores.reduce((sum, score) => sum + score, 0) / criteriaScores.length 
                            : 0;

                          return (
                            <tr key={criteria}>
                              <td className="p-3 border border-gray-300 font-medium bg-red-50 text-red-900 text-sm">
                                {criteria}
                              </td>
                              {caseStudyGroups.map((caseGroup) => {
                                const score = heatmapData[criteria]?.[caseGroup];
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
                <h4 className="font-medium text-red-900 mb-3">Score Scale (0-20 Points per Criteria)</h4>
                <div className="flex flex-wrap gap-2">
                  {[0, 4, 8, 12, 16, 20].map(score => (
                    <div key={score} className="flex items-center gap-1">
                      <div className={`w-10 h-6 rounded text-xs font-medium flex items-center justify-center ${getHeatmapColor(score)} ${getTextColor(score)}`}>
                        {score}
                      </div>
                      {score === 0 && <span className="text-xs text-red-600">No Data</span>}
                      {score === 8 && <span className="text-xs text-red-600">Low</span>}
                      {score === 16 && <span className="text-xs text-red-600">Good</span>}
                      {score === 20 && <span className="text-xs text-red-600">Excellent</span>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Award className="w-5 h-5" />
                Top Performing Groups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topGroups.length > 0 ? (
                topGroups.map((group, index) => (
                  <div key={`${group.groupId}_${group.caseStudy}`} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-red-300">#{index + 1}</Badge>
                        <span className="font-medium text-red-900">{group.groupId}</span>
                        <Badge variant="secondary">{group.caseStudy}</Badge>
                        <Badge className={`${group.topPerformanceBand === 'Exceptional' ? 'bg-emerald-600' : 
                          group.topPerformanceBand === 'Strong' ? 'bg-green-600' : 
                          group.topPerformanceBand === 'Developing' ? 'bg-orange-600' : 'bg-red-600'}`}>
                          {group.topPerformanceBand}
                        </Badge>
                      </div>
                      <Badge className="bg-red-600">
                        {group.averageScore}/100
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-red-700">
                      <div>Team Size: {group.teamMembers.length} members</div>
                      <div>Assessments: {group.assessmentCount}</div>
                      <div className="col-span-2">
                        <span className="font-medium">Team: </span>
                        {group.teamMembers.slice(0, 3).join(', ')}
                        {group.teamMembers.length > 3 && ` +${group.teamMembers.length - 3} more`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-red-600">
                  No group performance data available for the selected filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Target className="w-5 h-5" />
                Criteria Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {criteriaPerformance.length > 0 ? (
                criteriaPerformance.map((criteria, index) => (
                  <div key={criteria.criteria} className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-red-300">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium text-red-900">{criteria.criteria}</div>
                        <div className="text-sm text-red-600">{criteria.assessmentCount} assessments</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-red-700">Avg: {criteria.average}/20</div>
                        <div className="text-xs text-red-600">Max: {criteria.maxScore}/20</div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg ${getHeatmapColor(criteria.average)} ${getTextColor(criteria.average)} font-medium`}>
                        {criteria.average}/20
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-red-600">
                  No criteria performance data available.
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
                Group Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white/80 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-900 mb-2">Assessment Summary</h4>
                  <div className="space-y-1 text-sm text-red-700">
                    <div>Total Group Assessments: {filteredAssessments.length}</div>
                    <div>Unique Groups: {[...new Set(filteredAssessments.map(a => a.groupId))].length}</div>
                    <div>Unique Assessors: {[...new Set(filteredAssessments.map(a => a.assessorName))].length}</div>
                    <div>Case Studies: {[...new Set(filteredAssessments.map(a => a.caseStudy))].length}</div>
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

              {filteredAssessments.length > 0 && (
                <div className="p-4 bg-white/80 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-900 mb-2">Score Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-red-700">
                    <div className="text-center">
                      <div className="font-medium">Average Score</div>
                      <div>{Math.round((filteredAssessments.reduce((sum, a) => sum + a.totalScore, 0) / filteredAssessments.length) * 10) / 10}/100</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Highest Score</div>
                      <div>{Math.max(...filteredAssessments.map(a => a.totalScore))}/100</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Lowest Score</div>
                      <div>{Math.min(...filteredAssessments.map(a => a.totalScore))}/100</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Score Range</div>
                      <div>{Math.max(...filteredAssessments.map(a => a.totalScore)) - Math.min(...filteredAssessments.map(a => a.totalScore))}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}