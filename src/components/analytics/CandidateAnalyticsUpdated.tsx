import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { IndividualReportExport } from '../reports/ReportGenerator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  BarChart3,
  Target,
  Award,
  Users,
  Plus,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Activity,
  Grid3X3
} from 'lucide-react';

interface CandidateData {
  id: string;
  name: string;
  overallScore: number;
  criteriaScores: Record<string, number>;
  status: 'completed' | 'in_progress' | 'not_started';
  submissionDate?: Date;
  timeSpent: number; // in minutes
  caseStudy: string;
  summary?: string;
}

interface AnalyticsProps {
  candidates: CandidateData[];
  onAddCandidate: () => void;
  onBackToDashboard: () => void;
}

const CRITERIA = [
  { id: 'strategic-thinking', name: 'Strategic Thinking', maxScore: 10 },
  { id: 'leadership', name: 'Leadership', maxScore: 10 },
  { id: 'communication', name: 'Communication', maxScore: 10 },
  { id: 'innovation', name: 'Innovation', maxScore: 10 },
  { id: 'problem-solving', name: 'Problem Solving', maxScore: 10 },
  { id: 'collaboration', name: 'Collaboration', maxScore: 10 },
  { id: 'adaptability', name: 'Adaptability', maxScore: 10 },
  { id: 'decision-making', name: 'Decision Making', maxScore: 10 },
  { id: 'emotional-intelligence', name: 'Emotional Intelligence', maxScore: 10 },
  { id: 'digital-fluency', name: 'Digital Fluency', maxScore: 10 }
];

export function CandidateAnalytics({ candidates, onAddCandidate, onBackToDashboard }: AnalyticsProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    candidates.length > 0 ? candidates[0].id : null
  );
  const [editingSummary, setEditingSummary] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [candidateSummaries, setCandidateSummaries] = useState<Record<string, string>>({});

  const completedCandidates = candidates.filter(c => c.status === 'completed');
  const avgScore = completedCandidates.length > 0 
    ? Math.round(completedCandidates.reduce((sum, c) => sum + c.overallScore, 0) / completedCandidates.length)
    : 0;

  const getPerformanceBand = (score: number) => {
    if (score >= 80) return { label: 'Exceptional', color: 'bg-emerald-600', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50' };
    if (score >= 60) return { label: 'Strong', color: 'bg-blue-600', textColor: 'text-blue-600', bgLight: 'bg-blue-50' };
    if (score >= 40) return { label: 'Developing', color: 'bg-amber-600', textColor: 'text-amber-600', bgLight: 'bg-amber-50' };
    return { label: 'Limited', color: 'bg-red-600', textColor: 'text-red-600', bgLight: 'bg-red-50' };
  };

  const getCriteriaAnalysis = (candidate: CandidateData) => {
    const scores = candidate.criteriaScores;
    const criteriaNames = CRITERIA.reduce((acc, criteria) => {
      acc[criteria.id] = criteria.name;
      return acc;
    }, {} as Record<string, string>);

    const sortedScores = Object.entries(scores)
      .map(([id, score]) => ({ id, name: criteriaNames[id] || id, score }))
      .sort((a, b) => b.score - a.score);

    const strongest = sortedScores.slice(0, 3);
    const weakest = sortedScores.slice(-3).reverse();

    // Generate insights
    const greenFlags = [];
    const redFlags = [];

    strongest.forEach(criteria => {
      if (criteria.score >= 8) {
        greenFlags.push(`Exceptional ${criteria.name.toLowerCase()} performance (${criteria.score}/10)`);
      }
    });

    weakest.forEach(criteria => {
      if (criteria.score <= 3) {
        redFlags.push(`Requires significant development in ${criteria.name.toLowerCase()} (${criteria.score}/10)`);
      }
    });

    // Additional analysis
    const communicationScore = scores['communication'] || 0;
    const leadershipScore = scores['leadership'] || 0;
    const innovationScore = scores['innovation'] || 0;

    if (communicationScore >= 8 && leadershipScore >= 8) {
      greenFlags.push('Outstanding leadership communication combination - ready for senior roles');
    }

    if (innovationScore >= 7 && scores['problem-solving'] >= 7) {
      greenFlags.push('Excellent innovation and problem-solving synergy - ideal for transformation roles');
    }

    if (communicationScore <= 4) {
      redFlags.push('Communication limitations may significantly impact leadership effectiveness');
    }

    if (leadershipScore <= 3 && scores['decision-making'] <= 3) {
      redFlags.push('Core leadership capabilities require intensive development before advancement');
    }

    return { strongest, weakest, greenFlags, redFlags };
  };

  const selectedCandidateData = selectedCandidate 
    ? candidates.find(c => c.id === selectedCandidate)
    : null;

  const selectedAnalysis = selectedCandidateData 
    ? getCriteriaAnalysis(selectedCandidateData)
    : null;

  const HeatmapCell = ({ score, maxScore, size = 'normal' }: { score: number; maxScore: number; size?: 'small' | 'normal' | 'large' }) => {
    const percentage = (score / maxScore) * 100;
    const intensity = Math.min(percentage / 100, 1);
    
    let bgColor = 'bg-slate-100';
    let textColor = 'text-slate-600';
    if (intensity > 0.8) { bgColor = 'bg-emerald-600'; textColor = 'text-white'; }
    else if (intensity > 0.6) { bgColor = 'bg-emerald-400'; textColor = 'text-white'; }
    else if (intensity > 0.4) { bgColor = 'bg-amber-400'; textColor = 'text-white'; }
    else if (intensity > 0.2) { bgColor = 'bg-orange-500'; textColor = 'text-white'; }
    else if (intensity > 0) { bgColor = 'bg-red-500'; textColor = 'text-white'; }

    const sizeClasses = {
      small: 'w-6 h-6 text-xs',
      normal: 'w-10 h-10 text-sm',
      large: 'w-12 h-12 text-base'
    };

    return (
      <div 
        className={`${sizeClasses[size]} ${bgColor} ${textColor} rounded-lg flex items-center justify-center font-semibold shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer`}
        title={`${score}/${maxScore} (${Math.round(percentage)}%)`}
      >
        {score}
      </div>
    );
  };

  const handleEditSummary = (candidateId: string) => {
    setEditingSummary(candidateId);
    setSummaryText(candidateSummaries[candidateId] || '');
  };

  const handleSaveSummary = (candidateId: string) => {
    setCandidateSummaries(prev => ({
      ...prev,
      [candidateId]: summaryText
    }));
    setEditingSummary(null);
    setSummaryText('');
  };

  const generateDefaultSummary = (candidate: CandidateData) => {
    const analysis = getCriteriaAnalysis(candidate);
    const band = getPerformanceBand(candidate.overallScore);
    
    return `${candidate.name} demonstrated ${band.label.toLowerCase()} performance with an overall score of ${candidate.overallScore}/100. Key strengths include ${analysis.strongest.map(s => s.name.toLowerCase()).join(', ')}, while development opportunities lie in ${analysis.weakest.map(w => w.name.toLowerCase()).join(', ')}. ${analysis.greenFlags.length > 0 ? 'Notable highlights: ' + analysis.greenFlags[0] : ''}`;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Enhanced Header with Navigation */}
      <div className="glass rounded-3xl p-8 card-shadow-lg border-2 border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-red-200 hover:bg-red-50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="border-l border-red-200 pl-6">
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                <Activity className="w-8 h-8" />
                Performance Analytics Dashboard
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Comprehensive candidate analysis with detailed heatmaps and performance insights
              </p>
            </div>
          </div>
          <Button 
            onClick={onAddCandidate}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-white px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Candidate
          </Button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <Card className="text-center p-16 border-dashed border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-slate-700 mb-3">No Candidates Added Yet</h3>
          <p className="text-slate-500 mb-6 text-lg">Start by adding candidates to unlock powerful performance analytics and heatmap visualizations</p>
          <Button 
            onClick={onAddCandidate}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8 py-4 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Candidate
          </Button>
        </Card>
      ) : (
        <>
          {/* Enhanced Summary Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 border-blue-200 card-shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">Total Candidates</p>
                    <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text">
                      {candidates.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-green-100 border-emerald-200 card-shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Completed</p>
                    <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text">
                      {completedCandidates.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 via-purple-50 to-violet-100 border-purple-200 card-shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-700 mb-1">Average Score</p>
                    <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text">
                      {avgScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 via-orange-50 to-red-100 border-orange-200 card-shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">Top Performer</p>
                    <p className="text-lg font-bold text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
                      {completedCandidates.length > 0 
                        ? completedCandidates.reduce((top, candidate) => 
                            candidate.overallScore > top.overallScore ? candidate : top
                          ).name
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-2 border-white/20 p-2 rounded-2xl shadow-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300">
                Overview
              </TabsTrigger>
              <TabsTrigger value="individual-heatmap" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300">
                Individual Heatmaps
              </TabsTrigger>
              <TabsTrigger value="group-heatmap" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300">
                Group Analysis
              </TabsTrigger>
              <TabsTrigger value="all-participants" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300">
                Master Heatmap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {candidates.map(candidate => {
                  const band = getPerformanceBand(candidate.overallScore);
                  const analysis = getCriteriaAnalysis(candidate);
                  const summary = candidateSummaries[candidate.id] || generateDefaultSummary(candidate);
                  
                  return (
                    <Card key={candidate.id} className={`card-shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 border-2 ${band.bgLight} hover:scale-[1.02]`}>
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between mb-4">
                          <CardTitle className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <div className="gradient-text text-xl">{candidate.name}</div>
                              <div className="text-sm text-muted-foreground font-normal">
                                {candidate.caseStudy}
                              </div>
                            </div>
                          </CardTitle>
                          <div className="text-right">
                            <div className="text-3xl font-bold gradient-text mb-2">{candidate.overallScore}</div>
                            <Badge className={`${band.color} text-white px-3 py-1 text-sm font-semibold`}>
                              {band.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <IndividualReportExport 
                            data={{
                              candidateName: candidate.name,
                              position: (candidate as any).position,
                              department: (candidate as any).department,
                              email: (candidate as any).email,
                              overallScore: candidate.overallScore,
                              criteriaScores: candidate.criteriaScores,
                              caseStudy: candidate.caseStudy,
                              status: candidate.status,
                              timeSpent: candidate.timeSpent,
                              submissionDate: candidate.submissionDate,
                              summary: summary,
                              redFlags: (candidate as any).redFlags
                            }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Progress value={candidate.overallScore} className="h-3 bg-slate-200" />
                        
                        {/* Individual Heatmap Preview */}
                        <div className="bg-white/80 rounded-xl p-4 border">
                          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4" />
                            Criteria Performance Heatmap
                          </h4>
                          <div className="grid grid-cols-5 gap-2">
                            {CRITERIA.map(criteria => (
                              <div key={criteria.id} className="text-center">
                                <HeatmapCell 
                                  score={candidate.criteriaScores[criteria.id] || 0}
                                  maxScore={criteria.maxScore}
                                  size="small"
                                />
                                <div className="text-xs text-slate-600 mt-1 truncate" title={criteria.name}>
                                  {criteria.name.split(' ')[0]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Editable Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-slate-700">Performance Summary</h4>
                            {editingSummary === candidate.id ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveSummary(candidate.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSummary(null)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSummary(candidate.id)}
                                className="text-slate-600 hover:text-slate-800"
                              >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                          {editingSummary === candidate.id ? (
                            <Textarea
                              value={summaryText}
                              onChange={(e) => setSummaryText(e.target.value)}
                              rows={4}
                              className="w-full bg-white border-slate-300"
                              placeholder="Enter performance summary..."
                            />
                          ) : (
                            <p className="text-slate-700 leading-relaxed">{summary}</p>
                          )}
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-emerald-700 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Top Performing Criteria
                            </h4>
                            {analysis.strongest.map(criteria => (
                              <div key={criteria.id} className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                                • <span className="font-medium">{criteria.name}</span> ({criteria.score}/10)
                              </div>
                            ))}
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-red-700 flex items-center gap-2">
                              <TrendingDown className="w-4 h-4" />
                              Development Areas
                            </h4>
                            {analysis.weakest.map(criteria => (
                              <div key={criteria.id} className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                                • <span className="font-medium">{criteria.name}</span> ({criteria.score}/10)
                              </div>
                            ))}
                          </div>
                        </div>

                        {(analysis.greenFlags.length > 0 || analysis.redFlags.length > 0) && (
                          <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-200">
                            {analysis.greenFlags.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-emerald-700 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Key Strengths
                                </h4>
                                {analysis.greenFlags.map((flag, index) => (
                                  <div key={index} className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
                                    • {flag}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {analysis.redFlags.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Areas of Concern
                                </h4>
                                {analysis.redFlags.map((flag, index) => (
                                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    • {flag}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="individual-heatmap" className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                {completedCandidates.map(candidate => {
                  const band = getPerformanceBand(candidate.overallScore);
                  
                  return (
                    <Card key={candidate.id} className="card-shadow-lg bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
                      <CardHeader>
                        <div className="space-y-4">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="gradient-text text-lg">{candidate.name}</div>
                                <div className="text-sm text-muted-foreground font-normal">
                                  Individual Criteria Heatmap
                                </div>
                              </div>
                            </div>
                            <Badge className={`${band.color} text-white px-3 py-1`}>
                              {candidate.overallScore}
                            </Badge>
                          </CardTitle>
                          <div className="flex justify-end">
                            <IndividualReportExport 
                              data={{
                                candidateName: candidate.name,
                                position: (candidate as any).position,
                                department: (candidate as any).department,
                                email: (candidate as any).email,
                                overallScore: candidate.overallScore,
                                criteriaScores: candidate.criteriaScores,
                                caseStudy: candidate.caseStudy,
                                status: candidate.status,
                                timeSpent: candidate.timeSpent,
                                submissionDate: candidate.submissionDate,
                                summary: candidateSummaries[candidate.id],
                                redFlags: (candidate as any).redFlags
                              }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 gap-4">
                          {CRITERIA.map(criteria => (
                            <div key={criteria.id} className="text-center space-y-2">
                              <HeatmapCell 
                                score={candidate.criteriaScores[criteria.id] || 0}
                                maxScore={criteria.maxScore}
                                size="normal"
                              />
                              <div className="text-xs font-medium text-slate-600 leading-tight">
                                {criteria.name}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <div className="text-sm text-slate-600">
                            <strong>Case Study:</strong> {candidate.caseStudy} | 
                            <strong> Time:</strong> {candidate.timeSpent}min | 
                            <strong> Performance:</strong> {band.label}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="group-heatmap" className="space-y-8">
              <Card className="card-shadow-lg bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center gap-3 text-2xl">
                    <BarChart3 className="w-7 h-7" />
                    Group Performance Analysis
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Comparative analysis showing strengths and development areas across all participants
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Group Summary Stats */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                      <h4 className="font-semibold text-emerald-800 mb-2">Group Strengths</h4>
                      <div className="space-y-1">
                        {CRITERIA.map(criteria => {
                          const avgScore = completedCandidates.length > 0 
                            ? completedCandidates.reduce((sum, c) => sum + (c.criteriaScores[criteria.id] || 0), 0) / completedCandidates.length
                            : 0;
                          return avgScore >= 7 ? (
                            <div key={criteria.id} className="text-sm text-emerald-700">
                              • {criteria.name} (avg: {avgScore.toFixed(1)})
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                      <h4 className="font-semibold text-amber-800 mb-2">Development Areas</h4>
                      <div className="space-y-1">
                        {CRITERIA.map(criteria => {
                          const avgScore = completedCandidates.length > 0 
                            ? completedCandidates.reduce((sum, c) => sum + (c.criteriaScores[criteria.id] || 0), 0) / completedCandidates.length
                            : 0;
                          return avgScore < 6 ? (
                            <div key={criteria.id} className="text-sm text-amber-700">
                              • {criteria.name} (avg: {avgScore.toFixed(1)})
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Red Flags</h4>
                      <div className="space-y-1">
                        {completedCandidates.filter(c => c.overallScore < 50).map(candidate => (
                          <div key={candidate.id} className="text-sm text-red-700">
                            • {candidate.name} (Score: {candidate.overallScore})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-participants" className="space-y-8">
              <Card className="card-shadow-lg bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center gap-3 text-2xl">
                    <Grid3X3 className="w-7 h-7" />
                    Master Criteria Heatmap - All Participants
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Complete performance overview across all criteria and candidates
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="min-w-max space-y-4">
                      <div className="flex gap-3 mb-6">
                        <div className="w-48 text-base font-bold text-slate-700">Candidate</div>
                        {CRITERIA.map(criteria => (
                          <div key={criteria.id} className="w-12 text-xs text-center font-semibold text-slate-700" title={criteria.name}>
                            {criteria.name.split(' ').map(word => word.charAt(0)).join('')}
                          </div>
                        ))}
                        <div className="w-20 text-base font-bold text-center text-slate-700">Total</div>
                      </div>
                      
                      {completedCandidates.map(candidate => (
                        <div key={candidate.id} className="flex gap-3 items-center p-3 bg-white rounded-xl border hover:shadow-md transition-all duration-200">
                          <div className="w-48 font-semibold text-slate-800 truncate">{candidate.name}</div>
                          {CRITERIA.map(criteria => (
                            <HeatmapCell 
                              key={criteria.id}
                              score={candidate.criteriaScores[criteria.id] || 0}
                              maxScore={criteria.maxScore}
                              size="normal"
                            />
                          ))}
                          <div className="w-20 text-center">
                            <Badge className={`${getPerformanceBand(candidate.overallScore).color} text-white px-3 py-1 font-bold`}>
                              {candidate.overallScore}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-200">
                    <span className="font-semibold text-slate-700">Performance Scale:</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-red-500 rounded-lg"></div>
                        <span className="text-sm font-medium">0-2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-orange-500 rounded-lg"></div>
                        <span className="text-sm font-medium">3-4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-amber-400 rounded-lg"></div>
                        <span className="text-sm font-medium">5-6</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-400 rounded-lg"></div>
                        <span className="text-sm font-medium">7-8</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-600 rounded-lg"></div>
                        <span className="text-sm font-medium">9-10</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}