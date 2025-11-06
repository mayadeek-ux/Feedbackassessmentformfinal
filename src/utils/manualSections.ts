export interface Section {
  id: string;
  type: 'header' | 'subheader' | 'paragraph' | 'list' | 'numbered-list' | 'divider' | 'callout' | 'table-of-contents';
  content: string;
  level?: number;
  style?: 'info' | 'warning' | 'success' | 'error';
  items?: string[];
}

export const DEFAULT_ASSESSOR_SECTIONS: Section[] = [
  { id: '1', type: 'header', content: 'Assessor User Manual', level: 1 },
  { id: '2', type: 'subheader', content: 'Event Feedback Assessment System', level: 2 },
  { id: 'toc', type: 'table-of-contents', content: 'Table of Contents' },
  { id: '3', type: 'divider', content: '' },
  { id: '4', type: 'header', content: '1. Getting Started', level: 1 },
  { id: '5', type: 'subheader', content: '🔐 Logging In', level: 2 },
  { id: '6', type: 'paragraph', content: 'To access the platform, follow these steps:' },
  { id: '7', type: 'numbered-list', content: 'Login Steps', items: [
    'Navigate to the platform URL provided by your administrator',
    'Enter your registered email address',
    'Click "Send Magic Link"',
    'Check your email inbox for the authentication link',
    'Click the link to automatically log in (link expires in 15 minutes)'
  ]},
  { id: '8', type: 'callout', content: 'Magic links are single-use and time-limited for your protection.', style: 'info' },
  { id: '9', type: 'subheader', content: '🧭 Platform Navigation', level: 2 },
  { id: '10', type: 'paragraph', content: 'The platform interface consists of several key areas:' },
  { id: '11', type: 'list', content: 'Navigation Areas', items: [
    'Top Bar: Contains the event switcher, connection status indicator, and profile menu',
    'Dashboard: Shows all your assigned candidates and groups',
    'Connection Status indicators'
  ]},
  { id: '12', type: 'divider', content: '' },
  { id: '13', type: 'header', content: '2. Individual Assessments', level: 1 },
  { id: '14', type: 'subheader', content: 'Assessment Structure', level: 2 },
  { id: '15', type: 'paragraph', content: 'Individual assessments evaluate candidates across 10 criteria, each containing 10 sub-criteria.' },
  { id: '16', type: 'callout', content: 'Each sub-criterion = 1 point | Maximum per criterion = 10 points | Total maximum score = 100 points', style: 'success' },
  { id: '17', type: 'subheader', content: 'The 10 Assessment Criteria', level: 2 },
  { id: '18', type: 'numbered-list', content: 'Assessment Criteria', items: [
    'Strategic Thinking - Vision, planning, systems thinking, risk assessment',
    'Leadership - Inspiring others, decision-making, accountability',
    'Communication - Clarity, listening, presentation, persuasion',
    'Innovation - Creative thinking, experimentation, novel approaches',
    'Problem Solving - Analysis, logical reasoning, solution evaluation',
    'Collaboration - Teamwork, partnership, inclusive behavior',
    'Adaptability - Flexibility, resilience, managing change',
    'Decision Making - Judgment, speed vs accuracy, risk analysis',
    'Emotional Intelligence - Self-awareness, empathy, relationship management',
    'Digital Fluency - Technology adoption, data literacy, digital tools'
  ]},
  { id: '18a', type: 'subheader', content: 'Detailed Criterion Explanations', level: 2 },
  { id: '18b', type: 'paragraph', content: 'Each criterion contains specific behaviors to observe. Here are detailed explanations with practical examples:' },
  
  { id: '19a', type: 'subheader', content: '1. Strategic Thinking', level: 3 },
  { id: '19b', type: 'paragraph', content: 'Ability to see the big picture, anticipate future trends, and plan accordingly.' },
  { id: '19c', type: 'callout', content: 'Example: Candidate identifies how a local decision impacts company-wide goals, proposes 3-year roadmap considering market trends, or explains how different departments interconnect.', style: 'success' },
  { id: '19d', type: 'list', content: 'Look for:', items: [
    'Articulates long-term vision beyond immediate tasks',
    'Considers multiple stakeholders and interconnected systems',
    'Identifies potential risks and creates contingency plans',
    'Links current actions to future organizational outcomes'
  ]},
  
  { id: '20a', type: 'subheader', content: '2. Leadership', level: 3 },
  { id: '20b', type: 'paragraph', content: 'Capacity to inspire, guide, and take ownership of outcomes.' },
  { id: '20c', type: 'callout', content: 'Example: Candidate volunteers to lead a difficult initiative, motivates team through challenges, or demonstrates courage in making unpopular but necessary decisions.', style: 'success' },
  { id: '20d', type: 'list', content: 'Look for:', items: [
    'Takes initiative without being asked',
    'Inspires confidence and motivates others',
    'Accepts responsibility for team outcomes',
    'Provides clear direction under pressure'
  ]},
  
  { id: '21a', type: 'subheader', content: '3. Communication', level: 3 },
  { id: '21b', type: 'paragraph', content: 'Effectiveness in expressing ideas and understanding others across different contexts.' },
  { id: '21c', type: 'callout', content: 'Example: Candidate explains complex technical concept in simple terms, actively paraphrases to confirm understanding, or adapts communication style for different audiences.', style: 'success' },
  { id: '21d', type: 'list', content: 'Look for:', items: [
    'Expresses ideas clearly and concisely',
    'Listens actively and asks clarifying questions',
    'Adapts message to audience (technical vs. non-technical)',
    'Uses storytelling and examples to illustrate points'
  ]},
  
  { id: '22a', type: 'subheader', content: '4. Innovation', level: 3 },
  { id: '22b', type: 'paragraph', content: 'Willingness to challenge the status quo and generate creative solutions.' },
  { id: '22c', type: 'callout', content: 'Example: Candidate proposes unconventional solution that others missed, suggests pilot program to test new approach, or combines ideas from different industries.', style: 'success' },
  { id: '22d', type: 'list', content: 'Look for:', items: [
    'Proposes novel approaches to old problems',
    'Challenges assumptions constructively',
    'Suggests experimenting with new methods',
    'Draws inspiration from diverse sources'
  ]},
  
  { id: '23a', type: 'subheader', content: '5. Problem Solving', level: 3 },
  { id: '23b', type: 'paragraph', content: 'Systematic approach to analyzing issues and developing effective solutions.' },
  { id: '23c', type: 'callout', content: 'Example: Candidate breaks down complex problem into manageable parts, uses data to diagnose root cause rather than symptoms, or evaluates solutions against clear criteria.', style: 'success' },
  { id: '23d', type: 'list', content: 'Look for:', items: [
    'Identifies root causes vs. surface symptoms',
    'Uses structured frameworks to analyze problems',
    'Generates multiple solution options before deciding',
    'Tests assumptions with data and evidence'
  ]},
  
  { id: '24a', type: 'subheader', content: '6. Collaboration', level: 3 },
  { id: '24b', type: 'paragraph', content: 'Ability to work effectively with others and build productive relationships.' },
  { id: '24c', type: 'callout', content: 'Example: Candidate actively seeks input from quieter team members, builds on others ideas rather than competing, or finds win-win solutions in disagreements.', style: 'success' },
  { id: '24d', type: 'list', content: 'Look for:', items: [
    'Actively involves others in decision-making',
    'Builds on teammates contributions',
    'Shares credit and celebrates team success',
    'Creates psychological safety for diverse perspectives'
  ]},
  
  { id: '25a', type: 'subheader', content: '7. Adaptability', level: 3 },
  { id: '25b', type: 'paragraph', content: 'Flexibility in responding to change and recovering from setbacks.' },
  { id: '25c', type: 'callout', content: 'Example: Candidate quickly pivots strategy when new information emerges, remains calm when exercise changes unexpectedly, or learns from failure without defensiveness.', style: 'success' },
  { id: '25d', type: 'list', content: 'Look for:', items: [
    'Adjusts approach when circumstances change',
    'Maintains composure during unexpected challenges',
    'Views setbacks as learning opportunities',
    'Remains open to alternative viewpoints'
  ]},
  
  { id: '26a', type: 'subheader', content: '8. Decision Making', level: 3 },
  { id: '26b', type: 'paragraph', content: 'Sound judgment in choosing courses of action with incomplete information.' },
  { id: '26c', type: 'callout', content: 'Example: Candidate makes timely decision despite ambiguity, explicitly weighs trade-offs between options, or explains decision rationale using clear criteria.', style: 'success' },
  { id: '26d', type: 'list', content: 'Look for:', items: [
    'Makes decisions in appropriate timeframe',
    'Balances analysis with action',
    'Considers both short and long-term impacts',
    'Explains reasoning transparently'
  ]},
  
  { id: '27a', type: 'subheader', content: '9. Emotional Intelligence', level: 3 },
  { id: '27b', type: 'paragraph', content: 'Awareness of own emotions and ability to navigate interpersonal dynamics.' },
  { id: '27c', type: 'callout', content: 'Example: Candidate acknowledges own stress and manages it constructively, recognizes when teammate is frustrated and responds supportively, or adjusts approach based on others emotional states.', style: 'success' },
  { id: '27d', type: 'list', content: 'Look for:', items: [
    'Demonstrates self-awareness of emotions and triggers',
    'Shows empathy and perspective-taking',
    'Manages own emotions under pressure',
    'Reads social cues and adjusts behavior accordingly'
  ]},
  
  { id: '28a', type: 'subheader', content: '10. Digital Fluency', level: 3 },
  { id: '28b', type: 'paragraph', content: 'Comfort with technology and ability to leverage digital tools effectively.' },
  { id: '28c', type: 'callout', content: 'Example: Candidate suggests using data analytics to solve problem, quickly learns new digital tool during exercise, or proposes automation for repetitive process.', style: 'success' },
  { id: '28d', type: 'list', content: 'Look for:', items: [
    'Incorporates technology naturally into solutions',
    'Uses data to support decision-making',
    'Learns new digital tools quickly',
    'Understands digital transformation implications'
  ]},
  
  { id: '19', type: 'divider', content: '' },
  { id: '20', type: 'header', content: '3. Scoring Methodology', level: 1 },
  { id: '21', type: 'subheader', content: 'The Tick-Box System', level: 2 },
  { id: '22', type: 'paragraph', content: 'Simple, objective, and fast scoring that reduces subjective bias.' },
  { id: '23', type: 'numbered-list', content: 'How It Works', items: [
    'Read each sub-criterion carefully',
    'Ask yourself: "Did I observe this behavior during the assessment?"',
    'If YES - Tick the box',
    'If NO or UNCLEAR - Leave unticked',
    'Scores accumulate automatically'
  ]},
  { id: '24', type: 'subheader', content: 'Performance Bands', level: 2 },
  { id: '25', type: 'list', content: 'Score Ranges', items: [
    '🟢 80-100 points: Exceptional - Outstanding performance demonstrating mastery',
    '🔵 60-79 points: Strong - Solid competence with clear capabilities',
    '🟡 40-59 points: Developing - Growing capabilities with areas to refine',
    '🔴 0-39 points: Limited - Foundation building phase requiring support'
  ]},
  { id: '26', type: 'divider', content: '' },
  { id: '31', type: 'header', content: '4. Best Practices', level: 1 },
  { id: '32', type: 'subheader', content: 'Before Assessment', level: 3 },
  { id: '33', type: 'list', content: '', items: [
    '✅ Review all criteria in advance',
    '✅ Ensure stable internet connection',
    '✅ Allocate sufficient uninterrupted time',
    '✅ Familiarize yourself with the platform'
  ]},
  { id: '34', type: 'subheader', content: 'During Assessment', level: 3 },
  { id: '35', type: 'list', content: '', items: [
    '✅ Observe behaviors actively and objectively',
    '✅ Take brief notes for evidence',
    '✅ Score in real-time as you observe',
    '✅ Use the notes field for specific examples'
  ]},
  { id: '36', type: 'subheader', content: 'After Assessment', level: 3 },
  { id: '37', type: 'list', content: '', items: [
    '✅ Review all scores before final submission',
    '✅ Add comprehensive summary comments',
    '✅ Generate reports promptly',
    '✅ Debrief with fellow assessors for calibration'
  ]}
];

export const DEFAULT_ADMIN_SECTIONS: Section[] = [
  { id: '1', type: 'header', content: 'Administrator User Manual', level: 1 },
  { id: '2', type: 'subheader', content: 'Event Feedback Assessment System', level: 2 },
  { id: 'toc', type: 'table-of-contents', content: 'Table of Contents' },
  { id: '3', type: 'divider', content: '' },
  { id: '4', type: 'header', content: '1. Administrator Overview', level: 1 },
  { id: '5', type: 'subheader', content: 'Your Role & Responsibilities', level: 2 },
  { id: '6', type: 'paragraph', content: 'As an administrator, you have complete control over the assessment platform with the following privileges:' },
  { id: '7', type: 'list', content: '', items: [
    '✅ Create and manage events',
    '✅ Add/edit candidates and groups',
    '✅ Manage assessors and their permissions',
    '✅ Assign candidates/groups to assessors',
    '✅ View all assessments and analytics',
    '✅ Configure system settings',
    '✅ Export comprehensive reports'
  ]},
  { id: '8', type: 'callout', content: 'Admin: Full platform control with CRUD operations | Assessor: Limited to assigned tasks only', style: 'info' },
  { id: '9', type: 'divider', content: '' },
  { id: '10', type: 'header', content: '2. Event Management', level: 1 },
  { id: '11', type: 'subheader', content: 'Creating a New Event', level: 2 },
  { id: '12', type: 'numbered-list', content: 'Event Creation Steps', items: [
    'Navigate to the Event Management section in the Admin Panel',
    'Click "Create New Event"',
    'Fill in required details: Event Name, Description, Dates',
    'Select Event Type (Individual/Group/Mixed)',
    'Set Status (Not Started/In Progress/Completed)',
    'Configure advanced settings (optional)',
    'Click "Create Event"'
  ]},
  { id: '13', type: 'subheader', content: 'Event Status Types', level: 2 },
  { id: '14', type: 'list', content: '', items: [
    '🔴 Not Started - Event setup complete but not yet active',
    '🟡 In Progress - Active event with ongoing assessments',
    '🟢 Completed - All assessments finished',
    '⏸️ Paused - Temporarily suspended'
  ]},
  { id: '15', type: 'divider', content: '' },
  { id: '16', type: 'header', content: '3. Candidate Management', level: 1 },
  { id: '17', type: 'subheader', content: 'Adding Candidates', level: 2 },
  { id: '18', type: 'paragraph', content: 'You can add candidates using two methods:' },
  { id: '19', type: 'list', content: '', items: [
    'Quick Add (Single): Add individual candidates one at a time using manual form',
    'Bulk Import (CSV): Upload multiple candidates at once using CSV template'
  ]},
  { id: '20', type: 'callout', content: 'Archive (Recommended): Preserves all data, can be restored | Delete: Permanent removal, cannot be undone', style: 'warning' },
  { id: '21', type: 'divider', content: '' },
  { id: '22', type: 'header', content: '4. Assignment Management', level: 1 },
  { id: '23', type: 'subheader', content: 'Three Assignment Methods', level: 2 },
  { id: '24', type: 'numbered-list', content: 'Assignment Types', items: [
    'Manual Assignment - Assign specific candidates to specific assessors one by one for precise control',
    'Bulk Assignment - Select multiple candidates and assign them all to one assessor',
    'Auto-Assignment (Round-Robin) - System automatically distributes candidates evenly across all active assessors'
  ]},
  { id: '25', type: 'divider', content: '' },
  { id: '26', type: 'header', content: '5. Best Practices', level: 1 },
  { id: '27', type: 'subheader', content: 'Before Event', level: 3 },
  { id: '28', type: 'list', content: '', items: [
    '✅ Set up the system at least 1 week before the event',
    '✅ Import all candidates and create groups',
    '✅ Test the system with dummy data',
    '✅ Brief all assessors on the process'
  ]},
  { id: '29', type: 'subheader', content: 'During Event', level: 3 },
  { id: '30', type: 'list', content: '', items: [
    '✅ Monitor progress in real-time',
    '✅ Provide support to assessors as needed',
    '✅ Balance workloads if assignments are uneven',
    '✅ Watch for technical issues or anomalies'
  ]},
  { id: '31', type: 'subheader', content: 'After Event', level: 3 },
  { id: '32', type: 'list', content: '', items: [
    '✅ Generate comprehensive reports',
    '✅ Share results with appropriate stakeholders',
    '✅ Archive the event for future reference',
    '✅ Collect feedback from assessors'
  ]},
  { id: '33', type: 'divider', content: '' },
  { id: 'r1', type: 'header', content: '6. Reports & Exports', level: 1 },
  { id: 'r2', type: 'subheader', content: 'Overview', level: 2 },
  { id: 'r3', type: 'paragraph', content: 'The platform generates three distinct, personalized PDF reports tailored to different stakeholder needs. Each report type provides unique insights based on assessment data.' },
  { id: 'r4', type: 'callout', content: 'All reports feature modern, futuristic design with performance visualization, personalized insights, and actionable recommendations.', style: 'success' },
  
  { id: 'r5', type: 'subheader', content: 'The Three Report Types', level: 2 },
  
  { id: 'r6', type: 'subheader', content: '1. 👤 Candidate Development Report', level: 3 },
  { id: 'r7', type: 'paragraph', content: 'Designed for the candidate themselves. This report provides constructive feedback to support personal growth and development.' },
  { id: 'r8', type: 'list', content: 'Key Features:', items: [
    'Performance summary with overall score and band rating',
    'Strengths identification with specific examples',
    'Development areas highlighted constructively',
    'Personalized action plan with concrete next steps',
    'Growth trajectory visualization',
    'Self-reflection prompts and questions'
  ]},
  { id: 'r9', type: 'callout', content: 'Best for: Sharing directly with candidates for development conversations and self-improvement planning.', style: 'info' },
  
  { id: 'r10', type: 'subheader', content: '2. 🏢 HR Talent Analysis Report', level: 3 },
  { id: 'r11', type: 'paragraph', content: 'Designed for HR professionals and talent management teams. Focuses on organizational fit, promotion readiness, and succession planning.' },
  { id: 'r12', type: 'list', content: 'Key Features:', items: [
    'Promotion readiness assessment with timeline recommendations',
    'Succession planning insights and role suitability',
    'High-potential talent indicators and benchmarking',
    'Strategic workforce planning data',
    'Risk assessment for key positions',
    'Comparative analysis across candidates',
    'Retention and development investment priorities'
  ]},
  { id: 'r13', type: 'callout', content: 'Best for: Talent reviews, succession planning meetings, and strategic workforce decisions.', style: 'info' },
  
  { id: 'r14', type: 'subheader', content: '3. 👥 Line Manager Coaching Guide', level: 3 },
  { id: 'r15', type: 'paragraph', content: 'Designed for direct managers. Provides practical coaching tips and conversation starters for ongoing development.' },
  { id: 'r16', type: 'list', content: 'Key Features:', items: [
    'Quick reference performance snapshot',
    'Specific coaching conversation starters',
    'Behavioral examples observed during assessment',
    'Week-by-week coaching plan suggestions',
    'Warning signs to watch for',
    'Delegation and stretch assignment recommendations',
    'Progress tracking checkpoints'
  ]},
  { id: 'r17', type: 'callout', content: 'Best for: One-on-one meetings, performance reviews, and ongoing coaching conversations.', style: 'info' },
  
  { id: 'r18', type: 'divider', content: '' },
  { id: 'r19', type: 'subheader', content: 'How to Generate Reports', level: 2 },
  { id: 'r20', type: 'paragraph', content: 'Reports can be generated for both individual candidates and group assessments through the Candidate & Group Manager interface.' },
  
  { id: 'r21', type: 'subheader', content: 'Individual Candidate Reports', level: 3 },
  { id: 'r22', type: 'numbered-list', content: 'Generation Steps', items: [
    'Navigate to the Candidate & Group Manager in the Admin Panel',
    'Locate the candidate profile card',
    'Click the Download button (📥) next to the candidate name',
    'Select the report type from the dropdown menu',
    'The PDF will automatically generate and download',
    'File naming: [CandidateName]_[ReportType]_[Date].pdf'
  ]},
  
  { id: 'r23', type: 'subheader', content: 'Group Assessment Reports', level: 3 },
  { id: 'r24', type: 'numbered-list', content: 'Generation Steps', items: [
    'Navigate to the Groups tab in the Candidate & Group Manager',
    'Locate the group profile card',
    'Click the Download button (📥) next to the group name',
    'Select the report type (group reports show collective assessment)',
    'Reports aggregate data from all assessors for that group',
    'File naming: [GroupName]_[ReportType]_[Date].pdf'
  ]},
  
  { id: 'r25', type: 'divider', content: '' },
  { id: 'r26', type: 'subheader', content: 'Report Content Structure', level: 2 },
  { id: 'r27', type: 'paragraph', content: 'All reports follow a consistent structure with tailored content for each stakeholder type:' },
  { id: 'r28', type: 'numbered-list', content: 'Standard Sections', items: [
    'Executive Summary - Overall performance snapshot',
    'Assessment Overview - Event details and methodology',
    'Performance Analysis - Detailed breakdown by criteria',
    'Strengths & Development Areas - Evidence-based insights',
    'Performance Bands Visualization - Color-coded scoring',
    'Personalized Insights - AI-generated recommendations',
    'Action Plan - Specific next steps',
    'Appendix - Assessment criteria reference'
  ]},
  
  { id: 'r29', type: 'subheader', content: 'Best Practices', level: 2 },
  { id: 'r30', type: 'list', content: 'Report Generation Tips', items: [
    '✅ Generate all three report types for comprehensive documentation',
    '✅ Share the appropriate report type with each stakeholder',
    '✅ Generate reports promptly after assessment completion',
    '✅ Store reports securely with proper access controls',
    '✅ Use reports as conversation starters, not final judgments',
    '✅ Follow up within 2 weeks of report generation',
    '✅ Archive reports for future reference and comparison'
  ]},
  
  { id: 'r31', type: 'callout', content: '📊 Pro Tip: Generate all three reports immediately after event completion while assessment context is fresh. Different stakeholders need different perspectives on the same data.', style: 'success' },
  
  { id: 'r32', type: 'divider', content: '' },
  { id: '34', type: 'callout', content: '⚠️ Data Security: Perform weekly backups | Secure deletion of old data | GDPR compliance | Access control management', style: 'error' }
];
