import { AssessmentData } from './AssessmentForm';
import { GroupAssessmentData } from './GroupAssessmentForm';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Download, FileSpreadsheet, Users, User } from 'lucide-react';

interface ExportDataProps {
  assessments: AssessmentData[];
  groupAssessments?: GroupAssessmentData[];
}

export function ExportData({ assessments, groupAssessments = [] }: ExportDataProps) {
  const exportIndividualCSV = () => {
    if (assessments.length === 0) return;

    const headers = [
      'Candidate Name',
      'Assessor Name', 
      'Group',
      'Case Study',
      'Analytical Thinking',
      'Problem Solving',
      'Communication',
      'Collaboration',
      'Leadership Potential',
      'Public Speaking',
      'Comments',
      'Timestamp'
    ];

    const csvContent = [
      headers.join(','),
      ...assessments.map(assessment => [
        `"${assessment.candidateName}"`,
        `"${assessment.assessorName}"`,
        `"${assessment.groupId}"`,
        `"${assessment.caseStudy}"`,
        assessment.analyticalThinking,
        assessment.problemSolving,
        assessment.communication,
        assessment.collaboration,
        assessment.leadershipPotential,
        assessment.publicSpeaking,
        `"${assessment.comments.replace(/"/g, '""')}"`,
        `"${new Date(assessment.timestamp).toISOString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `individual-assessments-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportGroupAssessmentsCSV = () => {
    if (groupAssessments.length === 0) return;

    const headers = [
      'Group ID',
      'Case Study',
      'Assessor Name',
      'Team Members',
      'Strategic Approach',
      'Innovation & Creativity',
      'Team Dynamics',
      'Impact/Practicality',
      'Business Acumen',
      'Presentation Skills',
      'Overall Group Score',
      'Strengths',
      'Areas for Improvement',
      'Additional Comments',
      'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...groupAssessments.map(assessment => [
        `"${assessment.groupId}"`,
        `"${assessment.caseStudy}"`,
        `"${assessment.assessorName}"`,
        `"${assessment.teamMembers.join('; ')}"`,
        assessment.strategicApproach,
        assessment.innovationCreativity,
        assessment.teamDynamics,
        assessment.impactPracticality,
        assessment.businessAcumen,
        assessment.presentationSkills,
        assessment.overallGroupScore,
        `"${assessment.strengths.replace(/"/g, '""')}"`,
        `"${assessment.areasForImprovement.replace(/"/g, '""')}"`,
        `"${assessment.additionalComments.replace(/"/g, '""')}"`,
        `"${new Date(assessment.createdAt).toISOString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `group-assessments-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCombinedReport = () => {
    if (assessments.length === 0 && groupAssessments.length === 0) return;

    // Create comprehensive summary data
    const groups = Array.from(new Set([
      ...assessments.map(a => a.groupId),
      ...groupAssessments.map(a => a.groupId)
    ]));
    const caseStudies = Array.from(new Set([
      ...assessments.map(a => a.caseStudy),
      ...groupAssessments.map(a => a.caseStudy)
    ]));
    const candidates = Array.from(new Set(assessments.map(a => a.candidateName)));
    
    let reportContent = 'COMPREHENSIVE ASSESSMENT REPORT\n';
    reportContent += '=====================================\n\n';
    reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    reportContent += `OVERVIEW:\n`;
    reportContent += `---------\n`;
    reportContent += `Individual Assessments: ${assessments.length}\n`;
    reportContent += `Group Assessments: ${groupAssessments.length}\n`;
    reportContent += `Total Groups: ${groups.length} (${groups.join(', ')})\n`;
    reportContent += `Case Studies: ${caseStudies.length} (${caseStudies.join(', ')})\n`;
    reportContent += `Unique Candidates: ${candidates.length}\n\n`;

    // Individual Assessment Summary
    if (assessments.length > 0) {
      reportContent += 'INDIVIDUAL ASSESSMENT SUMMARY:\n';
      reportContent += '==============================\n\n';
      
      caseStudies.forEach(caseStudy => {
        reportContent += `=== ${caseStudy} ===\n`;
        groups.forEach(group => {
          const groupAssessments = assessments.filter(a => a.groupId === group && a.caseStudy === caseStudy);
          if (groupAssessments.length > 0) {
            reportContent += `\n${group}:\n`;
            const uniqueCandidatesInGroup = Array.from(new Set(groupAssessments.map(a => a.candidateName)));
            
            uniqueCandidatesInGroup.forEach(candidate => {
              const candidateAssessments = groupAssessments.filter(a => a.candidateName === candidate);
              const avgScores = {
                analytical: candidateAssessments.reduce((sum, a) => sum + a.analyticalThinking, 0) / candidateAssessments.length,
                problemSolving: candidateAssessments.reduce((sum, a) => sum + a.problemSolving, 0) / candidateAssessments.length,
                communication: candidateAssessments.reduce((sum, a) => sum + a.communication, 0) / candidateAssessments.length,
                collaboration: candidateAssessments.reduce((sum, a) => sum + a.collaboration, 0) / candidateAssessments.length,
                leadership: candidateAssessments.reduce((sum, a) => sum + a.leadershipPotential, 0) / candidateAssessments.length,
                publicSpeaking: candidateAssessments.reduce((sum, a) => sum + a.publicSpeaking, 0) / candidateAssessments.length,
              };
              
              const overall = Object.values(avgScores).reduce((sum, score) => sum + score, 0) / 6;
              
              reportContent += `  ${candidate}: Overall ${overall.toFixed(1)} `;
              reportContent += `(Analytical: ${avgScores.analytical.toFixed(1)}, `;
              reportContent += `Problem Solving: ${avgScores.problemSolving.toFixed(1)}, `;
              reportContent += `Communication: ${avgScores.communication.toFixed(1)}, `;
              reportContent += `Collaboration: ${avgScores.collaboration.toFixed(1)}, `;
              reportContent += `Leadership: ${avgScores.leadership.toFixed(1)}, `;
              reportContent += `Public Speaking: ${avgScores.publicSpeaking.toFixed(1)})\n`;
            });
          }
        });
        reportContent += '\n';
      });
    }

    // Group Assessment Summary
    if (groupAssessments.length > 0) {
      reportContent += '\nGROUP ASSESSMENT SUMMARY:\n';
      reportContent += '=========================\n\n';
      
      caseStudies.forEach(caseStudy => {
        const caseGroupAssessments = groupAssessments.filter(a => a.caseStudy === caseStudy);
        if (caseGroupAssessments.length > 0) {
          reportContent += `=== ${caseStudy} ===\n`;
          
          groups.forEach(group => {
            const groupData = caseGroupAssessments.filter(a => a.groupId === group);
            if (groupData.length > 0) {
              reportContent += `\n${group}:\n`;
              
              groupData.forEach(assessment => {
                const avgCriteriaScore = (
                  assessment.strategicApproach + 
                  assessment.innovationCreativity + 
                  assessment.teamDynamics + 
                  assessment.impactPracticality + 
                  assessment.businessAcumen + 
                  assessment.presentationSkills
                ) / 6;
                
                reportContent += `  Assessor: ${assessment.assessorName}\n`;
                reportContent += `  Team Members: ${assessment.teamMembers.join(', ')}\n`;
                reportContent += `  Average Criteria Score: ${avgCriteriaScore.toFixed(1)}\n`;
                reportContent += `  Overall Group Score: ${assessment.overallGroupScore}\n`;
                reportContent += `  Strategic Approach: ${assessment.strategicApproach}\n`;
                reportContent += `  Innovation & Creativity: ${assessment.innovationCreativity}\n`;
                reportContent += `  Team Dynamics: ${assessment.teamDynamics}\n`;
                reportContent += `  Impact/Practicality: ${assessment.impactPracticality}\n`;
                reportContent += `  Business Acumen: ${assessment.businessAcumen}\n`;
                reportContent += `  Presentation Skills: ${assessment.presentationSkills}\n`;
                
                if (assessment.strengths) {
                  reportContent += `  Strengths: ${assessment.strengths}\n`;
                }
                if (assessment.areasForImprovement) {
                  reportContent += `  Areas for Improvement: ${assessment.areasForImprovement}\n`;
                }
                if (assessment.additionalComments) {
                  reportContent += `  Additional Comments: ${assessment.additionalComments}\n`;
                }
                reportContent += '\n';
              });
            }
          });
        }
      });
    }

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `comprehensive-assessment-report-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasIndividualData = assessments.length > 0;
  const hasGroupData = groupAssessments.length > 0;
  const hasAnyData = hasIndividualData || hasGroupData;

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <Download className="w-5 h-5" />
          Export Assessment Data
        </CardTitle>
        <p className="text-sm text-red-700">
          Export your assessment data for further analysis or record keeping.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Individual Assessments Export */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-600" />
            <h4 className="font-medium text-red-900">Individual Assessments</h4>
            <Badge variant="outline" className="border-red-300">
              {assessments.length} records
            </Badge>
          </div>
          
          <Button 
            onClick={exportIndividualCSV} 
            disabled={!hasIndividualData} 
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Individual Assessments CSV
          </Button>
        </div>

        <Separator className="bg-red-200" />

        {/* Group Assessments Export */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-600" />
            <h4 className="font-medium text-red-900">Group Assessments</h4>
            <Badge variant="outline" className="border-red-300">
              {groupAssessments.length} records
            </Badge>
          </div>
          
          <Button 
            onClick={exportGroupAssessmentsCSV} 
            disabled={!hasGroupData} 
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Group Assessments CSV
          </Button>
        </div>

        <Separator className="bg-red-200" />

        {/* Combined Report */}
        <div className="space-y-3">
          <h4 className="font-medium text-red-900">Comprehensive Report</h4>
          <p className="text-sm text-red-700">
            Combined summary report including both individual and group assessment data.
          </p>
          
          <Button 
            onClick={exportCombinedReport} 
            disabled={!hasAnyData} 
            variant="outline" 
            className="w-full border-red-300 hover:bg-red-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Combined Summary Report
          </Button>
        </div>
        
        {!hasAnyData && (
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">
              No assessment data available to export. Complete some assessments first.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}