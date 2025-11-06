import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  Timer
} from 'lucide-react';

interface ProgressStats {
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  overdueAssignments: number;
  averageCompletionTime: number;
  averageScore: number;
  currentParticipants?: number;
  expectedParticipants?: number;
  participantProgress?: number;
}

interface RecentActivity {
  id: string;
  type: 'completed' | 'started' | 'submitted';
  candidateName?: string;
  groupName?: string;
  timestamp: Date;
  score?: number;
}

interface ProgressTrackerProps {
  stats: ProgressStats;
  recentActivity: RecentActivity[];
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    type: 'individual' | 'group';
    dueDate: Date;
    priority: 'low' | 'normal' | 'high' | 'urgent';
  }>;
}

export function ProgressTracker({ stats, recentActivity, upcomingDeadlines }: ProgressTrackerProps) {
  const completionPercentage = stats.totalAssignments > 0 ? (stats.completedAssignments / stats.totalAssignments) * 100 : 0;
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'started': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'submitted': return <Target className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.ceil(diffInHours / 24)}d`;
  };

  return (
    <div className="space-y-6">


      {/* Progress Overview */}
      <Card className="surface-luxury border-2 border-slate-200 rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl gradient-text">
            <TrendingUp className="w-6 h-6" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Overall Assessment Completion</span>
              <span className="font-semibold">{Math.round(completionPercentage)}% ({stats.completedAssignments}/{stats.totalAssignments})</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="text-xs text-muted-foreground text-center">
              Target: 100 participants × 2 case studies = 200 total assessments
            </div>
          </div>

          {/* Participant Progress */}
          {stats.currentParticipants !== undefined && stats.expectedParticipants !== undefined && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Participant Enrollment</span>
                <span className="font-semibold">{stats.participantProgress}% ({stats.currentParticipants}/{stats.expectedParticipants})</span>
              </div>
              <Progress value={stats.participantProgress || 0} className="h-2" />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {stats.averageCompletionTime > 0 ? `${stats.averageCompletionTime}m` : '--'}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Completion Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {stats.averageScore > 0 ? `${stats.averageScore}/100` : '--'}
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}