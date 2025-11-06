import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  Save, 
  Eye, 
  FileText, 
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Shield,
  AlertCircle,
  Check
} from 'lucide-react';

interface ManualEditorProps {
  onClose?: () => void;
}

const ASSESSOR_MANUAL_KEY = 'assessor_manual_content';
const ADMIN_MANUAL_KEY = 'admin_manual_content';

const DEFAULT_ASSESSOR_MANUAL = `# Assessor User Manual
## Event Feedback Assessment System

### Table of Contents
1. Getting Started - Login & Navigation
2. Dashboard Overview - Understanding Your Workspace
3. Individual Assessments - 10 Criteria Explained
4. Group Assessments - Team Evaluation Process
5. Scoring Methodology - Tick-Box System
6. Reports & Exports - Three Report Types
7. Best Practices - Quality Assessment Tips
8. Troubleshooting - Common Issues & Solutions

---

## 1. Getting Started

### 🔐 Logging In

To access the platform:

1. Navigate to the platform URL provided by your administrator
2. Enter your registered email address
3. Click "Send Magic Link"
4. Check your email inbox for the authentication link
5. Click the link to automatically log in (link expires in 15 minutes)

**Security Note:** Magic links are single-use and time-limited for your protection.

### 🧭 Platform Navigation

The platform interface consists of several key areas:

- **Top Bar**: Contains the event switcher, connection status indicator, and profile menu
- **Dashboard**: Shows all your assigned candidates and groups
- **Connection Status**: 
  - 🟢 Green = Connected and syncing
  - 🟡 Yellow = Reconnecting
  - 🔴 Red = Disconnected (work will be saved locally)

---

## 2. Individual Assessments

### Assessment Structure

Individual assessments evaluate candidates across **10 criteria**, each containing **10 sub-criteria**.

**Scoring System:**
- Each sub-criterion = 1 point (tick-box methodology)
- Maximum per criterion = 10 points
- Total maximum score = 100 points

### The 10 Assessment Criteria

#### 1. Strategic Thinking
Evaluates vision, long-term planning, systems thinking, and risk assessment capabilities.

#### 2. Leadership
Assesses ability to inspire others, make decisions, and demonstrate accountability.

#### 3. Communication
Measures clarity of expression, active listening, presentation skills, and persuasion.

#### 4. Innovation
Evaluates creative thinking, experimentation, and novel approaches to challenges.

#### 5. Problem Solving
Assesses analytical abilities, logical reasoning, and solution evaluation skills.

#### 6. Collaboration
Measures teamwork, partnership building, and inclusive behavior.

#### 7. Adaptability
Evaluates flexibility, resilience, and change management capabilities.

#### 8. Decision Making
Assesses judgment quality, balancing speed with accuracy, and risk analysis.

#### 9. Emotional Intelligence
Measures self-awareness, empathy, and relationship management skills.

#### 10. Digital Fluency
Evaluates technology adoption, data literacy, and effective use of digital tools.

---

## 3. Scoring Methodology

### The Tick-Box System

**Philosophy:** Simple, objective, and fast scoring that reduces subjective bias.

**How It Works:**
1. Read each sub-criterion carefully
2. Ask yourself: "Did I observe this behavior during the assessment?"
3. If YES → Tick the box ✓
4. If NO or UNCLEAR → Leave unticked
5. Scores accumulate automatically

### Performance Bands

- **80-100 points: Exceptional** 🟢 - Outstanding performance demonstrating mastery
- **60-79 points: Strong** 🔵 - Solid competence with clear capabilities
- **40-59 points: Developing** 🟡 - Growing capabilities with areas to refine
- **0-39 points: Limited** 🔴 - Foundation building phase requiring support

---

## 4. Reports & Exports

### Three Report Types for Individual Assessments

#### 1. Candidate Development Report 👤
**For:** The candidate themselves
**Contains:** Personalized insights, strengths, growth opportunities, development recommendations

#### 2. HR Talent Analysis 🏢
**For:** HR team, talent management
**Contains:** Promotion readiness, retention risk, succession planning insights

#### 3. Line Manager Guide 👥
**For:** Direct manager/supervisor
**Contains:** Coaching tips, conversation starters, actionable management advice

---

## 5. Best Practices

### Before Assessment
✅ Review all criteria in advance
✅ Ensure stable internet connection
✅ Allocate sufficient uninterrupted time
✅ Familiarize yourself with the platform

### During Assessment
✅ Observe behaviors actively and objectively
✅ Take brief notes for evidence
✅ Score in real-time as you observe
✅ Use the notes field for specific examples

### After Assessment
✅ Review all scores before final submission
✅ Add comprehensive summary comments
✅ Generate reports promptly
✅ Debrief with fellow assessors for calibration

---

## 6. Troubleshooting

### Common Issues

**Issue: Can't log in**
- Solution: Check email spam folder, request new magic link, ensure link hasn't expired

**Issue: Scores not saving**
- Solution: Check internet connection, look for auto-save confirmation, try manual save

**Issue: Can't submit assessment**
- Solution: Ensure all required fields completed, check for validation errors

**Need Help?**
Contact your event coordinator or system administrator.

---

*Generated by Event Feedback Assessment System*
`;

const DEFAULT_ADMIN_MANUAL = `# Administrator User Manual
## Event Feedback Assessment System

### Table of Contents
1. Administrator Overview - Your Role & Responsibilities
2. Getting Started - First-Time Setup Checklist
3. Event Management - Create, Edit, Archive
4. Candidate & Group Management - CRUD Operations
5. Assessor Management - Adding, Assigning, Permissions
6. Case Study Management - Scenarios & Exercises
7. Assignment Management - Manual, Bulk, Auto-Assign
8. Analytics & Monitoring - Dashboard Insights
9. System Configuration - Settings & Customization
10. Best Practices - Event Planning & Execution
11. Troubleshooting - Common Issues & Solutions

---

## 1. Administrator Overview

### Your Role & Responsibilities

As an administrator, you have complete control over the assessment platform:

✅ Create and manage events
✅ Add/edit candidates and groups
✅ Manage assessors and their permissions
✅ Assign candidates/groups to assessors
✅ View all assessments and analytics
✅ Configure system settings
✅ Export comprehensive reports

### Admin vs Assessor Access

**Admin:** Full platform control with CRUD operations across all events, candidates, and assessors.

**Assessor:** Limited to assigned tasks - can only view and assess their assigned candidates/groups.

---

## 2. Event Management

### Creating a New Event

1. Navigate to the Event Management section in the Admin Panel
2. Click "Create New Event"
3. Fill in the required event details:
   - Event Name (required)
   - Description
   - Start Date & End Date
   - Event Type (Individual/Group/Mixed)
   - Status (Not Started/In Progress/Completed)
4. Configure advanced settings (optional)
5. Click "Create Event"

### Event Status Types

- 🔴 **Not Started** - Event setup complete but not yet active
- 🟡 **In Progress** - Active event with ongoing assessments
- 🟢 **Completed** - All assessments finished
- ⏸️ **Paused** - Temporarily suspended

---

## 3. Candidate Management

### Adding Candidates

**Quick Add (Single):**
Add individual candidates one at a time using the manual form.

**Bulk Import (CSV):**
Upload multiple candidates at once using the CSV template.

### Archive vs Delete

⚠️ **Important Decision:**

- **Archive (Recommended):** Preserves all data, candidate can be restored if needed
- **Delete:** Permanent removal, cannot be undone, use with extreme caution

---

## 4. Assessor Management

### Adding Assessors

1. Navigate to Assessor Management
2. Click "Add New Assessor"
3. Enter assessor details:
   - Full Name
   - Email Address
   - Role (Assessor/Admin)
4. Click "Send Invitation"

The assessor will receive a magic link to access the platform.

### Managing Permissions

- **Assessor Role:** Can only view and score assigned candidates/groups
- **Admin Role:** Full system access and management capabilities

---

## 5. Assignment Management

### Three Assignment Methods

#### Manual Assignment
Assign specific candidates to specific assessors one by one for precise control.

**Best For:** Small events, strategic pairing

#### Bulk Assignment
Select multiple candidates and assign them all to one assessor.

**Best For:** Medium events, team-based assignments

#### Auto-Assignment (Round-Robin)
System automatically distributes candidates evenly across all active assessors.

**Best For:** Large events, equal workload distribution

---

## 6. Analytics Dashboard

### Real-Time Insights

Monitor your event progress with live analytics:

- **Total Progress:** Overall completion percentage
- **Completed Assessments:** X out of Y assessments done
- **Average Score:** Mean score across all completed assessments
- **Active Users:** Number of assessors currently online

### Export Options

- **CSV Export:** Raw data for analysis in Excel/Google Sheets
- **PDF Reports:** Formatted reports for candidates, HR, and line managers
- **Bulk Export:** Download all data for archival purposes

---

## 7. Best Practices

### Before Event
✅ Set up the system at least 1 week before the event
✅ Import all candidates and create groups
✅ Test the system with dummy data
✅ Brief all assessors on the process

### During Event
✅ Monitor progress in real-time
✅ Provide support to assessors as needed
✅ Balance workloads if assignments are uneven
✅ Watch for technical issues or anomalies

### After Event
✅ Generate comprehensive reports
✅ Share results with appropriate stakeholders
✅ Archive the event for future reference
✅ Collect feedback from assessors

---

## 8. System Configuration

### Settings You Can Customize

- Event-specific assessment criteria
- Performance band thresholds
- Report templates and branding
- Email notification settings
- Auto-save intervals
- Assessment time limits

---

## 9. Security & Data Management

### Data Protection

⚠️ **Critical Responsibilities:**

- Perform weekly backups minimum
- Secure deletion of old/archived data
- GDPR compliance for candidate information
- Access control management
- Audit trail monitoring

### User Access Management

Regularly review:
- Active user accounts
- Permission levels
- Last login dates
- Inactive accounts for removal

---

## 10. Troubleshooting

### Common Admin Issues

**Issue: Assessor can't access their assignments**
- Solution: Check assignment is active, verify assessor has correct permissions, confirm event status

**Issue: Data not syncing across devices**
- Solution: Check network connection, verify Supabase connection status, try manual sync

**Issue: Reports not generating**
- Solution: Ensure all assessments are submitted, check for missing data, verify report template

### Getting Support

For technical issues or platform questions:
1. Check this manual first
2. Review system logs in Admin Panel
3. Contact platform support with error details

---

*Generated by Event Feedback Assessment System*
*Administrator Version*
`;

export function ManualEditor({ onClose }: ManualEditorProps) {
  const [activeTab, setActiveTab] = useState<'assessor' | 'admin'>('assessor');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [assessorContent, setAssessorContent] = useState('');
  const [adminContent, setAdminContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load saved content or use defaults
  useEffect(() => {
    const savedAssessor = localStorage.getItem(ASSESSOR_MANUAL_KEY);
    const savedAdmin = localStorage.getItem(ADMIN_MANUAL_KEY);
    
    setAssessorContent(savedAssessor || DEFAULT_ASSESSOR_MANUAL);
    setAdminContent(savedAdmin || DEFAULT_ADMIN_MANUAL);
    
    // Load last saved timestamp
    const lastSavedTime = localStorage.getItem('manuals_last_saved');
    if (lastSavedTime) {
      setLastSaved(new Date(lastSavedTime));
    }
  }, []);

  const handleContentChange = (content: string) => {
    if (activeTab === 'assessor') {
      setAssessorContent(content);
    } else {
      setAdminContent(content);
    }
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(ASSESSOR_MANUAL_KEY, assessorContent);
      localStorage.setItem(ADMIN_MANUAL_KEY, adminContent);
      const now = new Date();
      localStorage.setItem('manuals_last_saved', now.toISOString());
      setLastSaved(now);
      setHasUnsavedChanges(false);
      toast.success('Manuals saved successfully');
    } catch (error) {
      toast.error('Failed to save manuals');
      console.error('Save error:', error);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset this manual to default content? This cannot be undone.')) {
      if (activeTab === 'assessor') {
        setAssessorContent(DEFAULT_ASSESSOR_MANUAL);
      } else {
        setAdminContent(DEFAULT_ADMIN_MANUAL);
      }
      setHasUnsavedChanges(true);
      toast.info('Manual reset to default. Click Save to apply changes.');
    }
  };

  const handleExport = () => {
    const content = activeTab === 'assessor' ? assessorContent : adminContent;
    const filename = `${activeTab.toUpperCase()}_USER_MANUAL.md`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Manual exported as markdown file');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          handleContentChange(content);
          toast.success('Manual imported successfully');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const renderPreview = (content: string) => {
    // Simple markdown-like rendering for preview
    const lines = content.split('\n');
    return (
      <div className="prose prose-sm max-w-none">
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={index} className="text-2xl font-bold mt-5 mb-3 border-b-2 border-red-500 pb-2">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
          } else if (line.startsWith('#### ')) {
            return <h4 key={index} className="text-lg font-semibold mt-3 mb-2">{line.substring(5)}</h4>;
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            return <li key={index} className="ml-4">{line.substring(2)}</li>;
          } else if (line.startsWith('✅ ')) {
            return <div key={index} className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" />{line.substring(2)}</div>;
          } else if (line.startsWith('---')) {
            return <hr key={index} className="my-6 border-gray-300" />;
          } else if (line.trim() === '') {
            return <br key={index} />;
          } else {
            return <p key={index} className="mb-2">{line}</p>;
          }
        })}
      </div>
    );
  };

  const currentContent = activeTab === 'assessor' ? assessorContent : adminContent;
  const wordCount = currentContent.split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = currentContent.split('\n').length;

  return (
    <Card className="w-full h-full">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Manual Content Editor
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Edit user manual content that appears in the Help section
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            {lastSaved && !hasUnsavedChanges && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'assessor' | 'admin')} className="w-full">
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="assessor" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Assessor Manual
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Manual
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4 text-sm text-muted-foreground">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{lineCount} lines</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {viewMode === 'edit' ? 'Preview' : 'Edit'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Alert className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Markdown Supported:</strong> Use # for headers, - for lists, **bold**, *italic*, and more. 
                Changes will appear in the Help Modal after saving.
              </AlertDescription>
            </Alert>

            <TabsContent value="assessor" className="m-0">
              {viewMode === 'edit' ? (
                <Textarea
                  value={assessorContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Enter assessor manual content in markdown format..."
                />
              ) : (
                <ScrollArea className="h-[600px] border rounded-lg p-6">
                  {renderPreview(assessorContent)}
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="admin" className="m-0">
              {viewMode === 'edit' ? (
                <Textarea
                  value={adminContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Enter admin manual content in markdown format..."
                />
              ) : (
                <ScrollArea className="h-[600px] border rounded-lg p-6">
                  {renderPreview(adminContent)}
                </ScrollArea>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Quick Tips:</strong> Use clear headings, bullet points, and emojis for better readability. 
              Keep instructions concise and action-oriented. Test the preview before saving.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
