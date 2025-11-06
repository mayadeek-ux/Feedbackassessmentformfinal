# 🔐 Administrator User Manual
## Comprehensive Event Feedback Assessment System

---

## Table of Contents

1. [Administrator Overview](#administrator-overview)
2. [Getting Started](#getting-started)
3. [Event Management](#event-management)
4. [Candidate & Group Management](#candidate--group-management)
5. [Assessor Management](#assessor-management)
6. [Case Study Management](#case-study-management)
7. [Assignment Management](#assignment-management)
8. [Analytics & Monitoring](#analytics--monitoring)
9. [System Configuration](#system-configuration)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Administrator Overview

### Your Role & Responsibilities

As a system administrator, you have comprehensive control over:

✅ **Event Creation & Management** - Create and configure assessment events  
✅ **Candidate Management** - Add, edit, and organize candidates  
✅ **Group Management** - Create assessment groups and assign members  
✅ **Assessor Management** - Add assessors and manage their access  
✅ **Assignment Control** - Assign candidates/groups to assessors  
✅ **Case Study Management** - Create and manage assessment scenarios  
✅ **Analytics & Reporting** - Monitor progress and view comprehensive analytics  
✅ **System Configuration** - Configure platform settings and preferences  

### Admin vs. Assessor Access

**Admin Privileges:**
- Full CRUD (Create, Read, Update, Delete) operations
- Access to all events, candidates, groups, and assessors
- Analytics dashboard with cross-event insights
- System configuration and settings
- User management capabilities

**Assessor Privileges:**
- View assigned candidates and groups only
- Conduct assessments and generate reports
- Limited to their specific assignments
- No administrative functions

---

## Getting Started

### Logging In as Admin

1. **Access the Platform**
   - Navigate to the assessment platform URL
   - Enter your admin email address

2. **Magic Link Authentication**
   - Click "Send Magic Link"
   - Check your email for the authentication link
   - Click the link to log in
   - You'll be directed to the Admin Panel

3. **Admin Panel Layout**
   - **Top Bar:** Event switcher, connection status, admin menu
   - **Left Navigation:** Quick access to all admin sections
   - **Main Content:** Active management section
   - **Summary Cards:** Key metrics and statistics

### First-Time Setup Checklist

When setting up a new assessment event:

- [ ] Create the event in Event Management
- [ ] Add case studies relevant to the event
- [ ] Add all candidates to be assessed
- [ ] Create assessment groups (if applicable)
- [ ] Add assessors to the platform
- [ ] Assign candidates/groups to assessors
- [ ] Test with a dummy assessment
- [ ] Brief assessors on the process
- [ ] Launch the event

---

## Event Management

### Creating a New Event

**Step-by-Step:**

1. **Navigate to Event Management**
   - Click "Events" in the top navigation or admin panel

2. **Click "Create New Event"**
   - The event creation form will open

3. **Fill in Event Details:**
   - **Event Name:** (Required) e.g., "Q4 Leadership Assessment 2025"
   - **Description:** Brief overview of the event purpose
   - **Start Date:** When the event begins
   - **End Date:** When the event concludes
   - **Event Type:** Select from dropdown
     - Individual Assessment
     - Group Assessment
     - Mixed (Both)
   - **Status:** Set initial status
     - 🔴 Not Started
     - 🟡 In Progress
     - 🟢 Completed
     - ⏸️ Paused

4. **Advanced Settings** (Optional):
   - **Maximum Assessors per Candidate:** Limit multiple assessors
   - **Allow Score Visibility:** Control if assessors see other scores
   - **Auto-Archive Date:** Automatically archive after end date

5. **Click "Create Event"**
   - Event is created and becomes selectable in event switcher

### Managing Existing Events

#### Editing Events
1. Navigate to Events section
2. Click the **Edit** icon next to the event
3. Modify any details
4. Click "Save Changes"

#### Switching Between Events
- Use the **Event Switcher** in the top bar
- All views (candidates, groups, assessors) filter by selected event

#### Archiving Events
- Click the **Archive** icon next to completed events
- Archived events are hidden but data is preserved
- Access archived events via "Show Archived" toggle

#### Deleting Events
- Click the **Delete** icon (use with caution!)
- Confirmation dialog appears
- **Warning:** This deletes all associated data:
  - Candidates in the event
  - Groups in the event
  - Assignments
  - Assessment results

---

## Candidate & Group Management

### Candidate Management

#### Adding Individual Candidates

**Quick Add (Single Candidate):**
1. Click **"Add New Candidate"** button
2. Fill in the form:
   - **Full Name:** (Required)
   - **Email Address:** (Optional but recommended)
   - **Department:** (Optional)
   - **Position:** (Optional)
   - **Case Study:** Select from dropdown
3. Click **"Add Candidate"**

**Bulk Import (Multiple Candidates):**
1. Click **"Import Candidates"**
2. Download the CSV template
3. Fill in candidate details in Excel/Sheets
4. Upload the completed CSV file
5. Review import preview
6. Confirm import

**CSV Template Format:**
```csv
Name,Email,Department,Position,CaseStudy
John Smith,john.smith@company.com,Engineering,Senior Engineer,Case Study 1
Jane Doe,jane.doe@company.com,Marketing,Marketing Manager,Case Study 2
```

#### Editing Candidates
1. Find the candidate card
2. Click the **Edit** button
3. Modify any field
4. Click **"Save Changes"**
5. Changes are immediately reflected

#### Candidate Status Types

| Status | Icon | Description |
|--------|------|-------------|
| **Not Started** | 🔴 | Assessment hasn't begun |
| **In Progress** | 🟡 | Assessment is underway |
| **Completed** | 🟢 | Assessment submitted |

#### Archiving vs. Deleting Candidates

**Archiving (Recommended):**
- Moves candidate to "Archived" tab
- Data preserved
- Can be restored anytime
- Removes from active assignments
- Use for: Withdrawals, no-shows, postponements

**Permanently Deleting:**
- **Irreversible** data deletion
- All assessment data lost forever
- Use with extreme caution
- Requires confirmation

**Archive Process:**
1. Click the **Archive** (trash) icon on candidate card
2. Confirm archiving
3. Candidate moves to "Archived Candidates" tab
4. To restore: Go to Archived tab → Click **Restore**

#### Candidate Profiles

Each candidate profile shows:
- **Personal Info:** Name, email, department, position
- **Assessment Details:** Case study, assigned assessor(s)
- **Progress:** Status, current score, time spent
- **Activity:** Submission date, last updated
- **Actions:** Edit, view results, download reports, archive

### Group Management

#### Creating Assessment Groups

1. Click **"Create New Group"** button
2. Fill in group details:
   - **Group Name:** (Required) e.g., "Team Alpha"
   - **Description:** (Optional) Purpose or context
   - **Case Study:** Select group assessment scenario
   - **Target Score:** (Optional) Goal for the group
   - **Notes:** (Optional) Special instructions

3. **Select Group Members:**
   - Checkbox list of all active candidates
   - Select 2+ candidates for the group
   - Shows selected count
   - Only candidates not in other groups appear

4. Click **"Create Group"**

#### Editing Groups
1. Find the group card
2. Click **Edit Group**
3. Modify details:
   - Change group name/description
   - Update case study
   - Add/remove members
   - Adjust target score
4. Click **"Save Changes"**

#### Group Status Types
- **Active:** Currently available for assessment
- **Completed:** Assessment finished
- **Archived:** No longer active

#### Deleting Groups
- Click **Delete** icon on group card
- Confirmation required
- **Note:** Deleting a group does NOT delete the member candidates
- Members return to individual candidate pool

---

## Assessor Management

### Adding Assessors

#### Single Assessor
1. Click **"Add New Assessor"** in Assessor Management
2. Fill in assessor details:
   - **Full Name:** (Required)
   - **Email Address:** (Required) - Used for login
   - **Organization:** (Optional)
   - **Expertise Areas:** (Optional) Tags for specialization
   - **Status:** Active/Inactive
3. Click **"Add Assessor"**
4. Assessor receives welcome email with login instructions

#### Bulk Import Assessors
1. Click **"Import Assessors"**
2. Download CSV template
3. Fill in assessor details
4. Upload completed CSV
5. Confirm import

**CSV Format:**
```csv
Name,Email,Organization,Expertise
Dr. Sarah Johnson,sarah.j@company.com,HR Department,Leadership
Prof. Mike Chen,mike.chen@university.edu,Business School,Strategy
```

### Assessor Profiles

Each assessor profile displays:
- **Personal Info:** Name, email, organization
- **Expertise:** Areas of specialization
- **Assignment Load:** 
  - Individual assignments count
  - Group assignments count
  - Total workload
- **Performance Metrics:**
  - Completed assessments
  - Average scoring
  - Assessment speed
- **Status:** Active/Inactive

### Managing Assessor Workload

**Workload Balancing Tips:**
- Aim for even distribution across assessors
- Consider expertise when assigning
- Monitor completion rates
- Reassign if an assessor is overloaded

**Viewing Assignments:**
1. Click on an assessor card
2. View "Assignments" tab
3. See all individual and group assignments
4. Remove assignments if needed

### Deactivating Assessors

**When to Deactivate:**
- Assessor no longer available
- Assessment period ended
- Replacing with another assessor

**Process:**
1. Click **Edit** on assessor card
2. Change status to "Inactive"
3. Optionally reassign their candidates to another assessor
4. Save changes

**Effects of Deactivation:**
- Cannot log in
- Existing assignments remain
- Can view completed assessments (read-only)
- Can be reactivated anytime

### Assessor Permissions

**What Assessors Can Do:**
- ✅ View their assigned candidates/groups
- ✅ Conduct assessments
- ✅ Generate reports
- ✅ Add notes and comments
- ✅ View their own assessment history

**What Assessors Cannot Do:**
- ❌ See other assessors' work
- ❌ Access admin functions
- ❌ Modify candidate/group data
- ❌ Change assignments
- ❌ View system analytics
- ❌ Manage other users

---

## Case Study Management

### Understanding Case Studies

Case studies are the **scenarios or exercises** candidates/groups are assessed on.

**Examples:**
- Strategic Planning Exercise
- Crisis Management Simulation
- Innovation Challenge
- Leadership Scenario
- Team Problem-Solving Task

### Creating Case Studies

1. Navigate to **Case Study Management**
2. Click **"Add New Case Study"**
3. Fill in details:
   - **Case Study Name:** (Required) Clear, descriptive title
   - **Description:** (Required) Full scenario details
     - Context and background
     - Challenges presented
     - What candidates should address
     - Time allocated
     - Resources available
4. Click **"Create Case Study"**

### Editing Case Studies

1. Find the case study card
2. Click **"Edit Case Study"**
3. Modify name or description
4. Click **"Save Changes"**

**Warning:**
- Changes affect **future** assessments using this case study
- Completed assessments retain original case study text
- System shows "Impact Assessment" noting how many active assignments use it

### Deleting Case Studies

**Restrictions:**
- Cannot delete case studies **currently in use**
- Must reassign all candidates/groups first
- Or complete/archive assessments using it

**Process:**
1. Check usage count (shown on card)
2. If usage = 0, delete button is enabled
3. Click **Delete**
4. Confirm deletion

---

## Assignment Management

### Assignment Overview

Assignments connect **Assessors** with **Candidates/Groups** for assessment.

**Assignment Types:**
1. **Individual Assignment:** Assessor → Candidate
2. **Group Assignment:** Assessor → Group

### Assigning Candidates to Assessors

**Manual Assignment:**
1. Navigate to **Assignments** tab
2. Click **"Create Assignment"**
3. Select **Assignment Type:** Individual
4. Choose **Assessor** from dropdown
5. Choose **Candidate** from dropdown
6. Click **"Assign"**

**Bulk Assignment:**
1. Click **"Bulk Assign"**
2. Select assessor
3. Multi-select candidates (checkbox list)
4. Click **"Assign Selected"**

**Auto-Assignment (Round-Robin):**
1. Click **"Auto-Assign"**
2. System distributes unassigned candidates evenly across active assessors
3. Review proposed assignments
4. Confirm or adjust manually

### Assigning Groups to Assessors

1. Navigate to **Assignments** → **Groups** tab
2. Click **"Assign Group"**
3. Select assessor
4. Select group
5. Click **"Assign"**

### Managing Assignments

**Viewing All Assignments:**
- **By Assessor View:** Shows each assessor's full assignment list
- **By Candidate View:** Shows which assessor(s) assigned to each candidate
- **By Event View:** Filters assignments by selected event

**Reassigning:**
1. Find the assignment
2. Click **"Reassign"**
3. Select new assessor
4. Confirm reassignment
5. Original assessor loses access; new assessor gains it

**Removing Assignments:**
1. Click **"Remove"** on assignment card
2. Confirm removal
3. Candidate/group becomes unassigned
4. Can be reassigned to different assessor

### Multi-Assessor Assignments

**When to Use:**
- Require second opinion
- Training new assessors
- High-stakes assessments
- Calibration exercises

**Process:**
1. Assign same candidate to multiple assessors
2. Each assessor completes independent assessment
3. Admin can view all scores in analytics
4. Determine final score (average, consensus, etc.)

**Best Practices:**
- Clearly communicate to assessors if others are assessing same candidate
- Establish scoring calibration sessions beforehand
- Define how final score is determined

---

## Analytics & Monitoring

### Dashboard Overview

The **Analytics Dashboard** provides real-time insights into assessment progress.

#### Key Metrics Cards

**Overall Progress:**
- Total candidates/groups
- Completed assessments
- In-progress assessments
- Not started count
- Completion percentage

**Assessor Performance:**
- Most active assessors
- Average assessment time
- Completion rates by assessor
- Scoring consistency

**Score Distribution:**
- Average overall score
- Performance band breakdown
  - Exceptional: X%
  - Strong: X%
  - Developing: X%
  - Limited: X%

**Criteria Analysis:**
- Highest scoring criterion
- Lowest scoring criterion
- Criterion-by-criterion average

### Candidate Analytics

**Individual Candidate View:**
1. Click on any candidate card
2. View **Analytics** tab
3. See detailed breakdown:
   - Overall score and band
   - Criteria scores with visual bars
   - Completion timeline
   - Time spent on assessment
   - Assessor name
   - Notes and comments

**Comparison View:**
- Compare candidates side-by-side
- Filter by department, position, case study
- Sort by score, status, date
- Export comparison data

### Group Analytics

**Group Performance:**
- Team scores across 5 group criteria
- Member contribution insights (if multiple assessors)
- Comparison across groups
- Best/worst performing groups

### Export Options

**Export Data:**
1. Navigate to **Analytics** → **Export**
2. Select data type:
   - All candidates
   - Specific event
   - By assessor
   - By date range
3. Choose format:
   - CSV (for Excel/Sheets)
   - JSON (for data processing)
4. Click **"Export"**

**Exported Data Includes:**
- Candidate/group details
- Scores across all criteria
- Performance bands
- Assessor information
- Timestamps
- Notes and comments

### Real-Time Monitoring

**Live Updates:**
- Dashboard refreshes automatically
- See assessments being completed in real-time
- Connection status indicators
- Assessor activity logs

**Notifications:**
- Assessment completed alerts
- Assessor login/logout events
- System error notifications
- Assignment changes

---

## System Configuration

### Platform Settings

Access via **Settings** icon in admin menu.

#### General Settings
- **Platform Name:** Customize branding
- **Logo Upload:** Add your organization logo
- **Color Scheme:** Adjust primary colors (advanced)
- **Time Zone:** Set for timestamp displays

#### Email Settings
- **Sender Name:** Email "From" name
- **Email Templates:** Customize magic link email
- **Notification Preferences:** Configure alert emails

#### Assessment Settings
- **Default Case Study:** Pre-select for new candidates
- **Auto-Save Interval:** How often assessments save (default: 5 seconds)
- **Session Timeout:** Inactivity logout time
- **Score Rounding:** Decimal places for scores

#### Security Settings
- **Magic Link Expiry:** Default 15 minutes
- **Password Complexity:** If using password fallback
- **Two-Factor Authentication:** Enable for admins
- **Session Duration:** How long users stay logged in

#### Backup & Maintenance
- **Auto-Backup:** Daily, weekly, or custom schedule
- **Data Retention:** How long to keep archived data
- **Maintenance Mode:** Temporarily disable access for updates

### User Role Management

**Creating Custom Roles:**
1. Go to **Settings** → **Roles**
2. Click **"Create Role"**
3. Define role name (e.g., "Event Coordinator")
4. Set permissions:
   - View-only access
   - Edit candidates
   - Manage assignments
   - View analytics
   - Configure settings
5. Save role

**Assigning Roles:**
1. Edit user profile
2. Select role from dropdown
3. Save changes

### Database Management

#### Backup & Restore
1. Navigate to **Settings** → **Database**
2. Click **"Create Backup"**
3. Download backup file (.sql or .json)
4. Store securely off-platform

**Restoring from Backup:**
1. Click **"Restore from Backup"**
2. Upload backup file
3. Confirm restore (overwrites current data)
4. System restarts

#### Data Cleanup
- **Archive Old Events:** Move completed events to archive
- **Delete Test Data:** Remove dummy assessments
- **Prune Logs:** Clear old activity logs
- **Optimize Database:** Run monthly for performance

---

## Best Practices

### Event Planning

**Before the Event:**
- ✅ Set up event at least 1 week before
- ✅ Import all candidates early
- ✅ Create groups with clear names
- ✅ Assign assessors with balanced workloads
- ✅ Test with dummy assessments
- ✅ Brief assessors with training session
- ✅ Prepare candidates with pre-event communication

**During the Event:**
- ✅ Monitor real-time progress
- ✅ Be available for assessor support
- ✅ Watch for technical issues
- ✅ Balance reassignments if needed
- ✅ Keep communication channels open

**After the Event:**
- ✅ Generate all reports
- ✅ Share results with stakeholders
- ✅ Archive event data
- ✅ Collect assessor feedback
- ✅ Document lessons learned
- ✅ Plan improvements for next event

### Candidate Management Best Practices

1. **Naming Conventions:**
   - Use full names (First Last)
   - Standardize format across all candidates
   - Include middle initials if duplicate names

2. **Data Quality:**
   - Fill in as many fields as possible
   - Verify email addresses before event
   - Keep department/position consistent

3. **Group Organization:**
   - Clear, descriptive group names
   - Balance group sizes (4-6 members ideal)
   - Mix experience levels when appropriate

### Assessor Management Best Practices

1. **Onboarding:**
   - Send comprehensive manual in advance
   - Conduct live training session
   - Provide test environment for practice
   - Share FAQ document

2. **Calibration:**
   - Hold calibration session before event
   - Have all assessors score same sample candidate
   - Discuss scoring differences
   - Align on standards

3. **Support:**
   - Be available during assessment periods
   - Respond quickly to questions
   - Monitor for struggling assessors
   - Offer mid-event check-ins

### Data Security Best Practices

1. **Access Control:**
   - Minimum necessary access principle
   - Regular permission audits
   - Deactivate inactive users promptly

2. **Backups:**
   - Weekly full backups minimum
   - Store backups off-site
   - Test restore process quarterly

3. **Privacy:**
   - Communicate data handling to candidates
   - Follow GDPR/privacy regulations
   - Secure deletion of old data
   - Encrypt sensitive exports

### Performance Optimization

1. **Keep Events Manageable:**
   - Max 100-150 candidates per event ideal
   - Split large events into phases
   - Archive old events regularly

2. **Monitor System Health:**
   - Check connection status frequently
   - Watch for slow load times
   - Review error logs weekly

3. **Browser Recommendations:**
   - Chrome, Firefox, or Safari for best experience
   - Keep browsers updated
   - Clear cache if issues arise

---

## Troubleshooting

### Common Admin Issues

#### Can't Create Event
**Symptoms:** Create Event button doesn't work or form won't submit

**Solutions:**
1. Check all required fields are filled
2. Ensure dates are in correct format
3. Verify event name is unique
4. Refresh page and try again
5. Check browser console for errors

#### Candidates Not Appearing
**Symptoms:** Added candidates don't show in list

**Solutions:**
1. Check event switcher—you may be viewing wrong event
2. Refresh the page
3. Verify candidate wasn't accidentally archived
4. Check filters/search (clear them)
5. Confirm candidate was assigned to correct event

#### Assignments Not Working
**Symptoms:** Can't assign candidates to assessors

**Solutions:**
1. Verify assessor is marked "Active"
2. Check if candidate already assigned to this assessor
3. Ensure candidate exists and isn't archived
4. Refresh page
5. Try manual assignment instead of bulk

#### Reports Not Generating
**Symptoms:** Download reports button does nothing

**Solutions:**
1. Ensure assessment is marked "Completed"
2. Verify browser allows downloads
3. Disable popup blockers temporarily
4. Try different browser
5. Check if file downloaded to Downloads folder

### System Performance Issues

#### Slow Loading
**Causes:**
- Too many active events
- Large number of candidates (500+)
- Poor internet connection
- Browser cache full

**Solutions:**
1. Archive old/completed events
2. Split large events into phases
3. Clear browser cache
4. Close unnecessary tabs
5. Restart browser

#### Real-Time Sync Issues
**Symptoms:** Changes not appearing immediately, connection status yellow/red

**Solutions:**
1. Check internet connection
2. Refresh page
3. Log out and back in
4. Check server status
5. Contact support if persistent

### Data Issues

#### Lost Candidate Data
**Symptoms:** Candidate disappeared or data is incorrect

**Solutions:**
1. Check "Archived Candidates" tab
2. Search by name/email
3. Review activity logs
4. Check if in different event
5. Restore from backup if necessary

#### Duplicate Candidates
**Symptoms:** Same person appears multiple times

**Solutions:**
1. Compare IDs to identify duplicate
2. Check if same person in different events (intentional)
3. Merge candidates:
   - Export both candidate reports
   - Delete one duplicate
   - Update remaining candidate info
4. Future prevention: Check before adding

#### Import Errors
**Symptoms:** CSV import fails or imports incorrectly

**Solutions:**
1. Verify CSV format matches template exactly
2. Check for special characters in names/emails
3. Ensure emails are valid format
4. Remove empty rows
5. Check file encoding (UTF-8 recommended)

### Assessor Issues

#### Assessor Can't Log In
**Symptoms:** Assessor reports can't access platform

**Solutions:**
1. Verify assessor status is "Active"
2. Check email address is correct in system
3. Ask assessor to check spam folder
4. Resend magic link
5. Verify assessor assigned to active event

#### Assessor Sees No Assignments
**Symptoms:** Assessor dashboard empty

**Solutions:**
1. Verify assignments were made
2. Check event switcher (assessor on correct event)
3. Refresh assessor's page
4. Re-assign candidate to assessor
5. Have assessor log out and back in

### Getting Expert Help

**Escalation Path:**
1. **Check This Manual** - Most common issues covered
2. **Review Platform Documentation** - Technical details
3. **Contact Technical Support:**
   - Email: support@assessmentplatform.com
   - Include:
     - Event name
     - User email
     - Screenshot of error
     - Steps to reproduce
     - Browser and OS version
4. **Emergency Hotline** - For during-event critical issues only

---

## Advanced Features

### Custom Criteria Configuration

**When to Use:**
- Organization-specific competencies
- Industry-unique requirements
- Specialized assessment types

**Process:**
1. Navigate to **Settings** → **Criteria Configuration**
2. Click **"Add Custom Criterion"**
3. Define:
   - Criterion name
   - Description
   - 10 sub-criteria
   - Point value (1 for individual, 2 for group)
4. Save and assign to events

### Multi-Language Support

**Enabling:**
1. Settings → Language
2. Upload translation files (.json)
3. Set default language
4. Allow users to select language preference

**Supported Languages:**
- English (default)
- Spanish
- French
- German
- Mandarin
- (Others on request)

### API Access

**For Integrations:**
- HRIS systems
- Learning Management Systems (LMS)
- Reporting dashboards

**Setup:**
1. Settings → API
2. Generate API key
3. Review API documentation
4. Test with sandbox environment

### White-Labeling

**Enterprise Feature:**
- Custom domain
- Full branding (logo, colors, fonts)
- Custom email templates
- Remove platform branding

**Contact:** sales@assessmentplatform.com

---

## Appendix

### Glossary of Terms

| Term | Definition |
|------|------------|
| **Assessment** | The evaluation process of a candidate or group |
| **Assessor** | Person conducting assessments (formerly "Judge") |
| **Candidate** | Individual being assessed |
| **Case Study** | Scenario or exercise used for assessment |
| **Criterion** | Evaluation category (formerly "Competency") |
| **Event** | Organized assessment session with multiple participants |
| **Group** | Team of candidates assessed together |
| **Magic Link** | Passwordless login link sent via email |
| **Performance Band** | Score range category (Limited, Developing, Strong, Exceptional) |
| **Sub-Criterion** | Individual item within a criterion (10 per criterion) |

### Keyboard Shortcuts (Admin Panel)

- **Ctrl/Cmd + K** - Quick search
- **Ctrl/Cmd + N** - New candidate/group (context-dependent)
- **Ctrl/Cmd + E** - Switch event
- **Ctrl/Cmd + /** - Open help
- **Esc** - Close modal/dialog

### System Requirements

**Minimum:**
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- 4GB RAM
- Stable internet (1 Mbps+)
- Screen resolution 1280x720+

**Recommended:**
- Chrome/Firefox latest version
- 8GB+ RAM
- High-speed internet (10 Mbps+)
- Screen resolution 1920x1080+
- SSD storage

### Data Retention Policy

**Active Data:**
- Stored indefinitely while event is active
- Accessible to all authorized users
- Real-time backups

**Archived Data:**
- Stored for 7 years (default)
- Read-only access
- Monthly backups

**Deleted Data:**
- 30-day soft delete (recoverable)
- After 30 days: permanent deletion
- Backup archives maintained per policy

### Support Resources

**Documentation:**
- Assessor User Manual (see ASSESSOR_USER_MANUAL.md)
- API Documentation (for integrations)
- Video Tutorials (platform YouTube channel)

**Training:**
- Live onboarding sessions (monthly)
- On-demand webinars
- 1-on-1 training (enterprise plans)

**Community:**
- User forum (forum.assessmentplatform.com)
- Knowledge base (kb.assessmentplatform.com)
- Admin community Slack channel

---

## Change Log

**Version 1.0 - October 2025**
- Initial release
- Core admin features documented
- Comprehensive troubleshooting guide
- Best practices included

**Future Updates:**
- Advanced analytics features
- Custom reporting
- Integration guides
- Video tutorial links

---

## Quick Start Checklist

### For Your First Event

- [ ] **Day 1: Setup**
  - [ ] Create event
  - [ ] Add case studies
  - [ ] Import candidates
  - [ ] Create groups (if needed)

- [ ] **Day 2-3: Configuration**
  - [ ] Add assessors
  - [ ] Make assignments
  - [ ] Configure settings
  - [ ] Test with dummy data

- [ ] **Day 4-5: Pre-Event**
  - [ ] Brief assessors
  - [ ] Send candidate notifications
  - [ ] Final system check
  - [ ] Backup data

- [ ] **Event Day:**
  - [ ] Monitor real-time
  - [ ] Support assessors
  - [ ] Track progress
  - [ ] Handle issues

- [ ] **Post-Event:**
  - [ ] Generate reports
  - [ ] Share results
  - [ ] Archive event
  - [ ] Gather feedback

---

**Version:** 1.0  
**Last Updated:** October 2025  
**For Support:** support@assessmentplatform.com

---

*This manual is confidential and intended for system administrators only. Unauthorized distribution is prohibited.*
