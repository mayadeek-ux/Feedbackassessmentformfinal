# Export Report Integration Guide

## Overview
The export report functionality has been implemented in `/components/reports/ReportGenerator.tsx`. This guide shows how to integrate export buttons into the CandidateGroupManager component.

## Components Available

### 1. IndividualReportExport
For individual candidate assessments
```tsx
import { IndividualReportExport } from '../reports/ReportGenerator';

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
```

### 2. GroupReportExport
For group assessments
```tsx
import { GroupReportExport } from '../reports/ReportGenerator';

<GroupReportExport 
  data={{
    groupName: group.name,
    caseStudy: group.caseStudy,
    teamMembers: group.memberIds.map(id => candidates.find(c => c.id === id)?.name || 'Unknown'),
    assessorName: 'Judge Name', // Get from current user
    strategicApproach: groupScores.strategicApproach || 0,
    innovationCreativity: groupScores.innovationCreativity || 0,
    teamDynamics: groupScores.teamDynamics || 0,
    impactPracticality: groupScores.impactPracticality || 0,
    businessAcumen: groupScores.businessAcumen || 0,
    presentationSkills: groupScores.presentationSkills || 0,
    overallGroupScore: groupScores.overall || 0,
    strengths: groupFeedback.strengths || '',
    areasForImprovement: groupFeedback.areasForImprovement || '',
    additionalComments: groupFeedback.additionalComments || '',
    createdAt: new Date().toISOString()
  }}
/>
```

## Integration Points in CandidateGroupManager.tsx

### Step 1: Add Import
At the top of `/components/management/CandidateGroupManager.tsx`, add:
```tsx
import { IndividualReportExport, GroupReportExport } from '../reports/ReportGenerator';
```

### Step 2: Add Export Button for Individual Candidates
In the candidate card section (around line 464), add the export button BEFORE the Edit/Delete buttons:

```tsx
<div className="divider-luxury my-4"></div>

{/* Export Report Button */}
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
  {/* Existing Edit and Delete buttons */}
</div>
```

### Step 3: Add Export Button for Groups
In the group card section (around line 923), add the export button:

Note: You'll need to retrieve group assessment data from Supabase or state. This is a placeholder showing the structure:

```tsx
<div className="divider-luxury my-4"></div>

{/* Export Group Report Button */}
{group.status === 'completed' && (
  <div className="mb-3">
    <GroupReportExport 
      data={{
        groupName: group.name,
        caseStudy: group.caseStudy,
        teamMembers: getGroupMembers(group).map(m => m.name),
        assessorName: 'Current Judge', // Get from user context
        strategicApproach: 0, // Get from group assessment data
        innovationCreativity: 0,
        teamDynamics: 0,
        impactPracticality: 0,
        businessAcumen: 0,
        presentationSkills: 0,
        overallGroupScore: 0,
        strengths: '',
        areasForImprovement: '',
        additionalComments: '',
        createdAt: new Date().toISOString()
      }}
    />
  </div>
)}

<div className="flex gap-3">
  {/* Existing Edit and Delete buttons */}
</div>
```

## Report Types Available

Each export button provides a dropdown with 3 report types:

### For Individuals:
1. **Candidate Report** - Development-focused report for the candidate
2. **HR Report** - Comprehensive talent management report
3. **Line Manager Report** - Coaching and development conversation guide

### For Groups:
1. **Team Report** - Collaborative feedback for team members
2. **HR Report** - Team performance analysis
3. **Manager Report** - Team development guide

## Usage
1. Click the "Export Report" button next to a completed assessment
2. Select the desired report type from the dropdown
3. The report opens in a new window ready to print as PDF
4. The report is also downloaded as an HTML file

## Styling
The export buttons use the same sophisticated monochromatic theme as the rest of the application with:
- Glass morphism effects
- Emerald accent colors
- Smooth hover transitions
- Responsive design
