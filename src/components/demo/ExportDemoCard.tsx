import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { User, Calendar, Clock, Edit3, Trash2 } from 'lucide-react';
import { IndividualReportExport } from '../reports/ReportGenerator';

interface CandidateData {
  id: string;
  name: string;
  overallScore: number;
  criteriaScores: Record<string, number>;
  status: 'completed' | 'in_progress' | 'not_started';
  submissionDate?: Date;
  timeSpent: number;
  caseStudy: string;
  email?: string;
  department?: string;
  position?: string;
  redFlags?: string[];
}

interface ExportDemoCardProps {
  candidate: CandidateData;
}

export function ExportDemoCard({ candidate }: ExportDemoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-600';
      case 'in_progress': return 'bg-amber-600';
      default: return 'bg-slate-400';
    }
  };

  return (
    <Card className="surface-luxury border-2 border-slate-200 rounded-3xl hover-lift transition-all duration-500 status-elite">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg gradient-text">{candidate.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{candidate.caseStudy}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(candidate.status)} text-white rounded-xl px-3 py-1`}>
            {candidate.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Overall Score:</span>
          <span className="font-bold text-xl gradient-text">{candidate.overallScore}/100</span>
        </div>
        {candidate.email && (
          <div className="text-sm text-muted-foreground truncate">
            📧 {candidate.email}
          </div>
        )}
        {candidate.department && (
          <div className="text-sm text-muted-foreground">
            🏢 {candidate.department}
          </div>
        )}
        {candidate.submissionDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {candidate.submissionDate.toLocaleDateString('en-GB')}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {candidate.timeSpent} minutes
        </div>
        
        <div className="divider-luxury my-4"></div>
        
        {/* Export Report Button - Only shown for completed assessments */}
        {candidate.status === 'completed' && (
          <div className="mb-3">
            <IndividualReportExport 
              data={{
                candidateName: candidate.name,
                position: candidate.position,
                department: candidate.department,
                email: candidate.email,
                overallScore: candidate.overallScore,
                criteriaScores: candidate.criteriaScores,
                caseStudy: candidate.caseStudy,
                status: candidate.status,
                timeSpent: candidate.timeSpent,
                submissionDate: candidate.submissionDate,
                redFlags: candidate.redFlags
              }}
            />
          </div>
        )}
        
        <div className="flex gap-3">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 hover-lift rounded-xl"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
