import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, TrendingUp, Award, Target } from 'lucide-react';
import { GroupAssessmentData } from './GroupAssessmentForm';
import { GroupReportExport } from './reports/ReportGenerator';

interface GroupHeatmapViewProps {
  groupAssessments: GroupAssessmentData[];
  groups: string[];
  caseStudies: string[];
}

const GROUP_CRITERIA = [
  { key: 'strategicApproach', label: 'Strategic Approach' },
  { key: 'innovationCreativity', label: 'Innovation & Creativity' },
  { key: 'teamDynamics', label: 'Team Dynamics' },
  { key: 'impactPracticality', label: 'Impact / Practicality' },
  { key: 'businessAcumen', label: 'Business Acumen' },
  { key: 'presentationSkills', label: 'Presentation Skills' },
  { key: 'overallGroupScore', label: 'Overall Group Score' }
] as const;

export function GroupHeatmapView({ groupAssessments, groups, caseStudies }: GroupHeatmapViewProps) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string>('all');

  const filteredAssessments = selectedCaseStudy === 'all' 
    ? groupAssessments 
    : groupAssessments.filter(assessment => assessment.caseStudy === selectedCaseStudy);

  const getScoreColor = (score: number) => {
    if (score <= 2) return 'bg-red-600';
    if (score <= 3) return 'bg-red-500';
    if (score <= 4) return 'bg-red-400';
    if (score <= 5) return 'bg-orange-400';
    if (score <= 6) return 'bg-yellow-400';
    if (score <= 7) return 'bg-yellow-300';
    if (score <= 8) return 'bg-green-400';
    if (score <= 9) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getTextColor = (score: number) => {
    return score <= 6 ? 'text-white' : 'text-gray-800';
  };

  const calculateGroupAverage = (groupId: string, criteriaKey: string) => {
    const groupAssessments = filteredAssessments.filter(a => a.groupId === groupId);
    if (groupAssessments.length === 0) return null;
    
    const scores = groupAssessments.map(a => a[criteriaKey as keyof GroupAssessmentData] as number);
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  };

  const getGroupStats = (groupId: string) => {
    const groupAssessments = filteredAssessments.filter(a => a.groupId === groupId);
    if (groupAssessments.length === 0) return null;

    const allScores = groupAssessments.flatMap(assessment => 
      GROUP_CRITERIA.slice(0, -1).map(criteria => 
        assessment[criteria.key as keyof GroupAssessmentData] as number
      )
    );

    const overallScores = groupAssessments.map(a => a.overallGroupScore);
    
    return {
      assessmentCount: groupAssessments.length,
      averageScore: Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10,
      overallAverage: Math.round((overallScores.reduce((a, b) => a + b, 0) / overallScores.length) * 10) / 10,
      highestScore: Math.max(...allScores),
      lowestScore: Math.min(...allScores),
      assessors: [...new Set(groupAssessments.map(a => a.assessorName))]
    };
  };

  const getTopPerformingGroups = () => {
    return groups
      .map(group => ({
        group,
        stats: getGroupStats(group)
      }))
      .filter(item => item.stats !== null)
      .sort((a, b) => (b.stats?.averageScore || 0) - (a.stats?.averageScore || 0))
      .slice(0, 3);
  };

  const getCriteriaStats = () => {
    return GROUP_CRITERIA.slice(0, -1).map(criteria => {
      const allScores = filteredAssessments.map(a => a[criteria.key as keyof GroupAssessmentData] as number);
      if (allScores.length === 0) return { ...criteria, average: 0, count: 0 };
      
      return {
        ...criteria,
        average: Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10,
        count: allScores.length
      };
    }).sort((a, b) => b.average - a.average);
  };

  const topGroups = getTopPerformingGroups();
  const criteriaStats = getCriteriaStats();

  if (groupAssessments.length === 0) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-red-900 mb-2">No Group Assessments Yet</h3>
          <p className="text-red-700">
            Start by assessing groups in the "Group Assessment" tab to see the heatmap visualization.
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
            Heatmap View
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Performance Stats
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Feedback Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Group Performance Heatmap</CardTitle>
              <p className="text-sm text-red-700">
                Showing {filteredAssessments.length} assessments across {groups.length} groups
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-left bg-red-100 border border-red-200 text-red-900 font-medium">
                        Group
                      </th>
                      {GROUP_CRITERIA.map(criteria => (
                        <th key={criteria.key} className="p-3 text-center bg-red-100 border border-red-200 text-red-900 font-medium min-w-[120px]">
                          {criteria.label}
                        </th>
                      ))}
                      <th className="p-3 text-center bg-red-100 border border-red-200 text-red-900 font-medium">
                        Assessments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(group => {
                      const stats = getGroupStats(group);
                      if (!stats) {
                        return (
                          <tr key={group}>
                            <td className="p-3 border border-red-200 font-medium bg-red-50 text-red-900">
                              {group}
                            </td>
                            {GROUP_CRITERIA.map(criteria => (
                              <td key={criteria.key} className="p-3 border border-red-200 text-center bg-gray-50">
                                <span className="text-gray-400">-</span>
                              </td>
                            ))}
                            <td className="p-3 border border-red-200 text-center bg-gray-50">
                              <Badge variant="outline" className="border-gray-300">0</Badge>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={group}>
                          <td className="p-3 border border-red-200 font-medium bg-red-50 text-red-900">
                            {group}
                          </td>
                          {GROUP_CRITERIA.map(criteria => {
                            const average = calculateGroupAverage(group, criteria.key);
                            if (average === null) {
                              return (
                                <td key={criteria.key} className="p-3 border border-red-200 text-center bg-gray-50">
                                  <span className="text-gray-400">-</span>
                                </td>
                              );
                            }
                            return (
                              <td key={criteria.key} className="p-3 border border-red-200 text-center">
                                <div className={`px-3 py-2 rounded-lg ${getScoreColor(average)} ${getTextColor(average)} font-medium`}>
                                  {average}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 border border-red-200 text-center">
                            <Badge variant="outline" className="border-red-300">
                              {stats.assessmentCount}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-3">Score Legend</h4>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <div key={score} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded ${getScoreColor(score)} ${getTextColor(score)} flex items-center justify-center text-xs font-medium`}>
                        {score}
                      </div>
                      {score === 1 && <span className="text-xs text-red-600">Poor</span>}
                      {score === 10 && <span className="text-xs text-red-600">Excellent</span>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Performing Groups */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Award className="w-5 h-5" />
                  Top Performing Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topGroups.map((item, index) => (
                  <div key={item.group} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-red-300">#{index + 1}</Badge>
                        <span className="font-medium text-red-900">{item.group}</span>
                      </div>
                      <Badge className="bg-red-600">
                        {item.stats?.averageScore}/10
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-red-700">
                      <div>Overall: {item.stats?.overallAverage}/10</div>
                      <div>Assessments: {item.stats?.assessmentCount}</div>
                      <div>Range: {item.stats?.lowestScore}-{item.stats?.highestScore}</div>
                      <div>Assessors: {item.stats?.assessors.length}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Criteria Performance */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Target className="w-5 h-5" />
                  Criteria Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {criteriaStats.map((criteria, index) => (
                  <div key={criteria.key} className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-red-100">
                    <div>
                      <div className="font-medium text-red-900">{criteria.label}</div>
                      <div className="text-sm text-red-600">{criteria.count} assessments</div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg ${getScoreColor(criteria.average)} ${getTextColor(criteria.average)} font-medium`}>
                      {criteria.average}/10
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <TrendingUp className="w-5 h-5" />
                Feedback Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {groups.map(group => {
                const groupAssessments = filteredAssessments.filter(a => a.groupId === group);
                if (groupAssessments.length === 0) return null;

                return (
                  <div key={group} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                    <h4 className="font-medium text-red-900 mb-3">{group}</h4>
                    
                    {groupAssessments.map((assessment, index) => (
                      <div key={assessment.id} className="mb-4 p-3 bg-white/80 rounded-lg border border-red-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-red-300">
                              {assessment.assessorName}
                            </Badge>
                            <Badge variant="secondary">
                              {assessment.caseStudy}
                            </Badge>
                          </div>
                          <GroupReportExport 
                            data={{
                              groupName: group,
                              caseStudy: assessment.caseStudy,
                              teamMembers: assessment.teamMembers,
                              assessorName: assessment.assessorName,
                              strategicApproach: assessment.strategicApproach,
                              innovationCreativity: assessment.innovationCreativity,
                              teamDynamics: assessment.teamDynamics,
                              impactPracticality: assessment.impactPracticality,
                              businessAcumen: assessment.businessAcumen,
                              presentationSkills: assessment.presentationSkills,
                              overallGroupScore: assessment.overallGroupScore,
                              strengths: assessment.strengths,
                              areasForImprovement: assessment.areasForImprovement,
                              additionalComments: assessment.additionalComments,
                              createdAt: assessment.createdAt
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {assessment.strengths && (
                            <div>
                              <span className="font-medium text-green-700">Strengths: </span>
                              <span className="text-green-600">{assessment.strengths}</span>
                            </div>
                          )}
                          {assessment.areasForImprovement && (
                            <div>
                              <span className="font-medium text-orange-700">Areas for Improvement: </span>
                              <span className="text-orange-600">{assessment.areasForImprovement}</span>
                            </div>
                          )}
                          {assessment.additionalComments && (
                            <div>
                              <span className="font-medium text-blue-700">Additional Comments: </span>
                              <span className="text-blue-600">{assessment.additionalComments}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}