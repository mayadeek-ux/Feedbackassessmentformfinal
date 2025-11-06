import { TrendingUp } from "lucide-react";

interface ProgressOverviewProps {
  candidates: Array<{
    id: string;
    name: string;
    overallScore: number;
    status: 'not_started' | 'in_progress' | 'completed';
    timeSpent: number;
    submissionDate?: Date;
  }>;
  assignments: Array<{
    id: string;
    type: 'individual' | 'group';
    status: 'not_started' | 'in_progress' | 'submitted';
    currentScore?: number;
    maxScore: number;
  }>;
  groups: Array<{
    id: string;
    name: string;
    memberIds: string[];
    status: 'active' | 'completed' | 'archived';
  }>;
}

export function ProgressOverview({ candidates, assignments, groups }: ProgressOverviewProps) {
  // Calculate overall completion percentage
  const calculateOverallCompletion = () => {
    if (assignments.length === 0) return 0;
    
    const completedAssignments = assignments.filter(a => a.status === 'submitted').length;
    return Math.round((completedAssignments / assignments.length) * 100);
  };

  // Calculate average completion time
  const calculateAverageTime = () => {
    const completedCandidates = candidates.filter(c => c.status === 'completed' && c.timeSpent > 0);
    
    if (completedCandidates.length === 0) return 0;
    
    const totalTime = completedCandidates.reduce((sum, candidate) => sum + candidate.timeSpent, 0);
    return Math.round(totalTime / completedCandidates.length);
  };

  // Calculate average score
  const calculateAverageScore = () => {
    const completedCandidates = candidates.filter(c => c.status === 'completed' && c.overallScore > 0);
    
    if (completedCandidates.length === 0) return 0;
    
    const totalScore = completedCandidates.reduce((sum, candidate) => sum + candidate.overallScore, 0);
    return Math.round(totalScore / completedCandidates.length);
  };

  // Format time display
  const formatTime = (minutes: number) => {
    if (minutes === 0) return '--';
    return `${minutes}m`;
  };

  const overallCompletion = calculateOverallCompletion();
  const averageTime = calculateAverageTime();
  const averageScore = calculateAverageScore();

  return (
    <div className="glass rounded-3xl p-8 card-shadow-xl hover-lift">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold gradient-text-premium">Progress Overview</h2>
      </div>

      {/* Overall Completion */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">Overall Completion</span>
          <span className="text-2xl font-semibold">{overallCompletion}%</span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${overallCompletion}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Average Completion Time */}
        <div className="text-center">
          <div className="text-4xl font-bold gradient-text-premium mb-2">
            {formatTime(averageTime)}
          </div>
          <div className="text-muted-foreground">
            Avg. Completion Time
          </div>
        </div>

        {/* Average Score */}
        <div className="text-center">
          <div className="text-4xl font-bold gradient-text-premium mb-2">
            {averageScore > 0 ? `${averageScore}/100` : '--'}
          </div>
          <div className="text-muted-foreground">
            Average Score
          </div>
        </div>
      </div>

      {/* Empty State Messaging */}
      {assignments.length === 0 && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-center text-muted-foreground">
            Start your first assessment to see progress metrics here
          </p>
        </div>
      )}

      {/* Progress Insights */}
      {assignments.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{assignments.length}</div>
              <div className="text-sm text-muted-foreground">Total Assignments</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{candidates.length}</div>
              <div className="text-sm text-muted-foreground">Active Candidates</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{groups.filter(g => g.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground">Active Groups</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}