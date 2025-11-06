import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { downloadManualAsPDF } from '../../utils/pdfGenerator';
import { 
  X,
  HelpCircle,
  UserCheck,
  Users,
  Target,
  Clock,
  Save,
  Send,
  Keyboard,
  Eye,
  CheckCircle,
  BookOpen,
  Shield,
  FileText,
  Download
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'assessor' | 'admin';
}

export function HelpModal({ isOpen, onClose, userRole = 'assessor' }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState(userRole === 'admin' ? 'admin-manual' : 'quick-guide');
  const [assessorManualContent, setAssessorManualContent] = useState('');
  const [adminManualContent, setAdminManualContent] = useState('');

  // Load custom manual content from localStorage if available
  useEffect(() => {
    const savedAssessor = localStorage.getItem('assessor_manual_content');
    const savedAdmin = localStorage.getItem('admin_manual_content');
    
    if (savedAssessor) setAssessorManualContent(savedAssessor);
    if (savedAdmin) setAdminManualContent(savedAdmin);
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadManual = (type: 'assessor' | 'admin') => {
    const filename = type === 'assessor' ? 'ASSESSOR_USER_MANUAL.md' : 'ADMIN_USER_MANUAL.md';
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-900">Help & Documentation</CardTitle>
            </div>
            <Button variant="ghost" onClick={onClose} className="hover:bg-red-100">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 max-w-2xl">
                <TabsTrigger value="quick-guide" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Quick Guide
                </TabsTrigger>
                <TabsTrigger value="assessor-manual" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Assessor Manual
                </TabsTrigger>
                <TabsTrigger value="admin-manual" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Manual
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(90vh-180px)]">
              {/* Quick Guide Tab */}
              <TabsContent value="quick-guide" className="p-6 m-0">
                <div className="space-y-8">
                  {/* Quick Start */}
                  <section>
                    <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Quick Start Guide
                    </h2>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">For Assessors</h4>
                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                          <li>View your assigned assessments on the dashboard</li>
                          <li>Click "Start Assessment" or "Resume" to begin scoring</li>
                          <li>Use the tick-box system to score each criterion (1 point per tick)</li>
                          <li>Your progress is auto-saved every few seconds</li>
                          <li>Submit when complete to lock your assessment</li>
                        </ol>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-2">For Admins</h4>
                        <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
                          <li>Create events and manage assessors in the Admin Panel</li>
                          <li>Assign assessors to specific candidates or groups</li>
                          <li>Monitor assessment progress in real-time</li>
                          <li>Export results and generate comprehensive reports</li>
                        </ol>
                      </div>
                    </div>
                  </section>

                  {/* Individual Assessments */}
                  <section>
                    <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Individual Assessments
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">Scoring System</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• <strong>10 criteria</strong> with 10 sub-criteria each</li>
                          <li>• <strong>1 point per tick</strong> (100 points total)</li>
                          <li>• Progress shows completion per criterion</li>
                          <li>• Real-time score calculation</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">Performance Bands</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500">Exceptional</Badge>
                            <span className="text-sm">80-100 points</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500">Strong</Badge>
                            <span className="text-sm">60-79 points</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-500">Developing</Badge>
                            <span className="text-sm">40-59 points</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-500">Limited</Badge>
                            <span className="text-sm">0-39 points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Group Assessments */}
                  <section>
                    <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Group Assessments
                    </h2>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">Key Differences</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• <strong>5 criteria</strong> with 10 sub-criteria each</li>
                        <li>• <strong>2 points per tick</strong> (100 points total)</li>
                        <li>• Focus on team collaboration and dynamics</li>
                        <li>• Same performance bands as individual assessments</li>
                      </ul>
                    </div>
                  </section>

                  {/* Interface Features */}
                  <section>
                    <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Interface Features
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <Save className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium">Auto-save</div>
                            <div className="text-xs text-muted-foreground">Progress saved every 2 seconds</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="text-sm font-medium">Timer</div>
                            <div className="text-xs text-muted-foreground">Optional time tracking per assessment</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <Send className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-sm font-medium">Submit Lock</div>
                            <div className="text-xs text-muted-foreground">Assessment locks after submission</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="text-sm font-medium">Progress Tracking</div>
                            <div className="text-xs text-muted-foreground">Visual progress per criterion</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Keyboard Shortcuts */}
                  <section>
                    <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <Keyboard className="w-5 h-5" />
                      Keyboard Shortcuts
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Space</span>
                          <span className="text-xs text-muted-foreground">Toggle tick-box</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">↑ ↓</span>
                          <span className="text-xs text-muted-foreground">Navigate items</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Ctrl + S</span>
                          <span className="text-xs text-muted-foreground">Save draft</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Esc</span>
                          <span className="text-xs text-muted-foreground">Back to dashboard</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Support */}
                  <section>
                    <h2 className="text-lg font-semibold text-red-900 mb-4">Need More Help?</h2>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 mb-3">
                        For detailed instructions, check the comprehensive user manuals in the tabs above.
                      </p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Contact your event coordinator</li>
                        <li>• Check for system status updates</li>
                        <li>• Try refreshing the page if experiencing issues</li>
                        <li>• Your work is saved automatically, so you won\'t lose progress</li>
                      </ul>
                    </div>
                  </section>
                </div>
              </TabsContent>

              {/* Assessor Manual Tab */}
              <TabsContent value="assessor-manual" className="p-6 m-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Assessor User Manual
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Comprehensive guide for conducting assessments</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadManualAsPDF('assessor')}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">📘 Table of Contents</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>1. Getting Started - Login & Navigation</li>
                        <li>2. Dashboard Overview - Understanding Your Workspace</li>
                        <li>3. Individual Assessments - 10 Criteria Explained</li>
                        <li>4. Group Assessments - Team Evaluation Process</li>
                        <li>5. Scoring Methodology - Tick-Box System</li>
                        <li>6. Reports & Exports - Three Report Types</li>
                        <li>7. Best Practices - Quality Assessment Tips</li>
                        <li>8. Troubleshooting - Common Issues & Solutions</li>
                      </ul>
                    </div>

                    <section className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-red-500 pb-2">Getting Started</h3>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">🔐 Logging In</h4>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                          <li>Access the platform URL provided by your administrator</li>
                          <li>Enter your registered email address</li>
                          <li>Click "Send Magic Link"</li>
                          <li>Check your email inbox for the authentication link</li>
                          <li>Click the link to log in automatically (expires in 15 minutes)</li>
                        </ol>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">🧭 Platform Navigation</h4>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li><strong>Top Bar:</strong> Event switcher, connection status, profile menu</li>
                          <li><strong>Dashboard:</strong> Your assigned candidates and groups</li>
                          <li><strong>Connection Status:</strong>
                            <div className="ml-4 mt-1 space-y-1">
                              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Green = Connected</div>
                              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Yellow = Reconnecting</div>
                              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Red = Disconnected</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-red-500 pb-2">Individual Assessments</h3>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3">📊 Assessment Structure</h4>
                        <p className="text-sm text-purple-800 mb-2">Individual assessments evaluate candidates across <strong>10 criteria</strong>, each with <strong>10 sub-criteria</strong>.</p>
                        <div className="bg-white/60 p-3 rounded">
                          <p className="text-sm text-purple-900">
                            <strong>Scoring:</strong> Each sub-criterion = 1 point (tick-box methodology)<br/>
                            <strong>Maximum:</strong> 10 points per criterion<br/>
                            <strong>Total:</strong> 100 points
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">1. Strategic Thinking</h5>
                          <p className="text-xs text-gray-600">Vision, planning, systems thinking, risk assessment</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">2. Leadership</h5>
                          <p className="text-xs text-gray-600">Inspiring others, decision-making, accountability</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">3. Communication</h5>
                          <p className="text-xs text-gray-600">Clarity, listening, presentation, persuasion</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">4. Innovation</h5>
                          <p className="text-xs text-gray-600">Creative thinking, experimentation, novel approaches</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">5. Problem Solving</h5>
                          <p className="text-xs text-gray-600">Analysis, logical reasoning, solution evaluation</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">6. Collaboration</h5>
                          <p className="text-xs text-gray-600">Teamwork, partnership, inclusive behavior</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">7. Adaptability</h5>
                          <p className="text-xs text-gray-600">Flexibility, resilience, managing change</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">8. Decision Making</h5>
                          <p className="text-xs text-gray-600">Judgment, speed vs accuracy, risk analysis</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">9. Emotional Intelligence</h5>
                          <p className="text-xs text-gray-600">Self-awareness, empathy, relationship management</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">10. Digital Fluency</h5>
                          <p className="text-xs text-gray-600">Technology adoption, data literacy, digital tools</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-red-500 pb-2">Reports & Exports</h3>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">📑 Three Report Types for Individual Assessments</h4>
                        <div className="space-y-3">
                          <div className="bg-white/60 p-3 rounded">
                            <h5 className="font-semibold text-sm text-green-900 mb-1">1. Candidate Development Report 👤</h5>
                            <p className="text-xs text-green-800"><strong>For:</strong> The candidate themselves</p>
                            <p className="text-xs text-green-700 mt-1">Personalized insights, strengths, growth opportunities, development recommendations</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded">
                            <h5 className="font-semibold text-sm text-green-900 mb-1">2. HR Talent Analysis 🏢</h5>
                            <p className="text-xs text-green-800"><strong>For:</strong> HR team, talent management</p>
                            <p className="text-xs text-green-700 mt-1">Promotion readiness, retention risk, succession planning insights</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded">
                            <h5 className="font-semibold text-sm text-green-900 mb-1">3. Line Manager Guide 👥</h5>
                            <p className="text-xs text-green-800"><strong>For:</strong> Direct manager/supervisor</p>
                            <p className="text-xs text-green-700 mt-1">Coaching tips, conversation starters, actionable management advice</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-red-500 pb-2">Best Practices</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-2">Before Assessment</h5>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>✅ Review criteria in advance</li>
                            <li>✅ Ensure stable internet</li>
                            <li>✅ Allocate sufficient time</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h5 className="font-semibold text-yellow-900 mb-2">During Assessment</h5>
                          <ul className="text-xs text-yellow-800 space-y-1">
                            <li>✅ Observe behaviors</li>
                            <li>✅ Take brief notes</li>
                            <li>✅ Score in real-time</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-semibold text-green-900 mb-2">After Assessment</h5>
                          <ul className="text-xs text-green-800 space-y-1">
                            <li>✅ Review before submit</li>
                            <li>✅ Add summary comments</li>
                            <li>✅ Generate reports</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mt-8">
                      <h4 className="font-semibold text-red-900 mb-2">📖 Full Manual Available</h4>
                      <p className="text-sm text-red-800">
                        For complete details including troubleshooting, group assessments, scoring calibration, and more, 
                        download the full Assessor User Manual using the button above.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Admin Manual Tab */}
              <TabsContent value="admin-manual" className="p-6 m-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Administrator User Manual
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Comprehensive guide for platform administration</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadManualAsPDF('admin')}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-500 p-6 rounded-r-lg mb-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">🔐 Table of Contents</h3>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>1. Administrator Overview - Your Role & Responsibilities</li>
                        <li>2. Getting Started - First-Time Setup Checklist</li>
                        <li>3. Event Management - Create, Edit, Archive</li>
                        <li>4. Candidate & Group Management - CRUD Operations</li>
                        <li>5. Assessor Management - Adding, Assigning, Permissions</li>
                        <li>6. Case Study Management - Scenarios & Exercises</li>
                        <li>7. Assignment Management - Manual, Bulk, Auto-Assign</li>
                        <li>8. Analytics & Monitoring - Dashboard Insights</li>
                        <li>9. System Configuration - Settings & Customization</li>
                        <li>10. Best Practices - Event Planning & Execution</li>
                        <li>11. Troubleshooting - Common Issues & Solutions</li>
                      </ul>
                    </div>

                    <section className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-purple-500 pb-2">Administrator Privileges</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            What You Can Do
                          </h4>
                          <ul className="text-sm text-green-800 space-y-2">
                            <li>✅ Create and manage events</li>
                            <li>✅ Add/edit candidates and groups</li>
                            <li>✅ Manage assessors and permissions</li>
                            <li>✅ Assign candidates/groups to assessors</li>
                            <li>✅ View all assessments and analytics</li>
                            <li>✅ Configure system settings</li>
                            <li>✅ Export comprehensive reports</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Admin vs Assessor Access
                          </h4>
                          <p className="text-sm text-blue-800 mb-2"><strong>Admin:</strong> Full platform control</p>
                          <p className="text-sm text-blue-800 mb-2"><strong>Assessor:</strong> Limited to assigned tasks</p>
                          <div className="bg-white/60 p-2 rounded text-xs text-blue-700 mt-2">
                            Admins have complete CRUD operations across all events, candidates, and assessors.
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-purple-500 pb-2">Event Management</h3>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Creating a New Event</h4>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                          <li>Navigate to Event Management section</li>
                          <li>Click "Create New Event"</li>
                          <li>Fill in event details:
                            <ul className="ml-6 mt-1 space-y-1 list-disc">
                              <li>Event Name (required)</li>
                              <li>Description</li>
                              <li>Start & End Dates</li>
                              <li>Event Type (Individual/Group/Mixed)</li>
                              <li>Status (Not Started/In Progress/Completed)</li>
                            </ul>
                          </li>
                          <li>Configure advanced settings (optional)</li>
                          <li>Click "Create Event"</li>
                        </ol>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">🔴</div>
                          <div className="text-xs font-semibold text-red-900">Not Started</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">🟡</div>
                          <div className="text-xs font-semibold text-yellow-900">In Progress</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">🟢</div>
                          <div className="text-xs font-semibold text-green-900">Completed</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">⏸️</div>
                          <div className="text-xs font-semibold text-gray-900">Paused</div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-purple-500 pb-2">Candidate Management</h3>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-3">Adding Candidates</h4>
                        <div className="space-y-3">
                          <div className="bg-white/60 p-3 rounded">
                            <h5 className="font-semibold text-sm text-orange-900 mb-1">Quick Add (Single)</h5>
                            <p className="text-xs text-orange-800">Add individual candidates one at a time with manual form entry</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded">
                            <h5 className="font-semibold text-sm text-orange-900 mb-1">Bulk Import (CSV)</h5>
                            <p className="text-xs text-orange-800">Upload multiple candidates at once using CSV template</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-yellow-900 mb-2">⚠️ Archive vs Delete</h5>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li><strong>Archive (Recommended):</strong> Preserves data, can be restored</li>
                          <li><strong>Delete:</strong> Permanent removal, cannot be undone</li>
                        </ul>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-purple-500 pb-2">Assignment Management</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-2">Manual Assignment</h5>
                          <p className="text-xs text-blue-800">Assign specific candidates to specific assessors one by one</p>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <h5 className="font-semibold text-indigo-900 mb-2">Bulk Assignment</h5>
                          <p className="text-xs text-indigo-800">Select multiple candidates and assign to one assessor</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-900 mb-2">Auto-Assignment</h5>
                          <p className="text-xs text-purple-800">System distributes candidates evenly (round-robin)</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-purple-500 pb-2">Analytics Dashboard</h3>
                      
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
                        <h4 className="font-semibold text-cyan-900 mb-3">📊 Real-Time Insights</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white/60 p-3 rounded text-center">
                            <div className="text-xs text-cyan-800 mb-1">Total Progress</div>
                            <div className="text-lg font-bold text-cyan-900">X%</div>
                          </div>
                          <div className="bg-white/60 p-3 rounded text-center">
                            <div className="text-xs text-cyan-800 mb-1">Completed</div>
                            <div className="text-lg font-bold text-cyan-900">X/Y</div>
                          </div>
                          <div className="bg-white/60 p-3 rounded text-center">
                            <div className="text-xs text-cyan-800 mb-1">Avg Score</div>
                            <div className="text-lg font-bold text-cyan-900">XX</div>
                          </div>
                          <div className="bg-white/60 p-3 rounded text-center">
                            <div className="text-xs text-cyan-800 mb-1">Active Users</div>
                            <div className="text-lg font-bold text-cyan-900">X</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-purple-500 pb-2">Best Practices</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-semibold text-green-900 mb-2">Before Event</h5>
                          <ul className="text-xs text-green-800 space-y-1">
                            <li>✅ Set up 1 week early</li>
                            <li>✅ Import all candidates</li>
                            <li>✅ Test with dummy data</li>
                            <li>✅ Brief assessors</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-2">During Event</h5>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>✅ Monitor progress</li>
                            <li>✅ Support assessors</li>
                            <li>✅ Balance workloads</li>
                            <li>✅ Watch for issues</li>
                          </ul>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-900 mb-2">After Event</h5>
                          <ul className="text-xs text-purple-800 space-y-1">
                            <li>✅ Generate reports</li>
                            <li>✅ Share results</li>
                            <li>✅ Archive event</li>
                            <li>✅ Collect feedback</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg mt-8">
                      <h4 className="font-semibold text-purple-900 mb-2">📖 Full Manual Available</h4>
                      <p className="text-sm text-purple-800">
                        For complete details including system configuration, security settings, database management, 
                        advanced features, and comprehensive troubleshooting, download the full Administrator User Manual 
                        using the button above.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}