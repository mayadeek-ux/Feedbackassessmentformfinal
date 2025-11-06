import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  MessageSquare,
  Save,
  Send,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ValidationRule {
  id: string;
  type: 'required' | 'warning' | 'recommendation';
  title: string;
  description: string;
  isValid: boolean;
  severity: 'low' | 'medium' | 'high';
}

interface ScoringValidationProps {
  scores: Record<string, number>;
  notes: Record<string, string>;
  generalNotes: string;
  totalScore: number;
  maxScore: number;
  isReadOnly?: boolean;
  onValidationComplete?: (isValid: boolean) => void;
}

export function ScoringValidation({
  scores,
  notes,
  generalNotes,
  totalScore,
  maxScore,
  isReadOnly = false,
  onValidationComplete
}: ScoringValidationProps) {
  const validationRules: ValidationRule[] = [
    {
      id: 'all-scores-set',
      type: 'required',
      title: 'All Criteria Scored',
      description: 'Every assessment criterion must have a score',
      isValid: Object.values(scores).every(score => score > 0),
      severity: 'high'
    },
    {
      id: 'notes-coverage',
      type: 'warning',
      title: 'Comprehensive Notes',
      description: 'Add notes for criteria with low scores (< 40%) or high scores (> 80%)',
      isValid: Object.entries(scores).every(([criteriaId, score]) => {
        const percentage = (score / 10) * 100; // Assuming max 10 per criteria
        if (percentage < 40 || percentage > 80) {
          return notes[criteriaId]?.trim().length > 10;
        }
        return true;
      }),
      severity: 'medium'
    },
    {
      id: 'general-notes',
      type: 'recommendation',
      title: 'General Assessment Notes',
      description: 'Add overall observations and recommendations',
      isValid: generalNotes.trim().length > 20,
      severity: 'low'
    },
    {
      id: 'balanced-scoring',
      type: 'warning',
      title: 'Balanced Assessment',
      description: 'Avoid clustering all scores in a narrow range',
      isValid: (() => {
        const scoreValues = Object.values(scores);
        if (scoreValues.length === 0) return false;
        const min = Math.min(...scoreValues);
        const max = Math.max(...scoreValues);
        return (max - min) >= 3; // Should have at least 3 point spread
      })(),
      severity: 'medium'
    },
    {
      id: 'extreme-scores',
      type: 'warning',
      title: 'Extreme Score Justification',
      description: 'Provide detailed notes for very low (≤2) or very high (≥9) scores',
      isValid: Object.entries(scores).every(([criteriaId, score]) => {
        if (score <= 2 || score >= 9) {
          return notes[criteriaId]?.trim().length > 15;
        }
        return true;
      }),
      severity: 'high'
    }
  ];

  const requiredRules = validationRules.filter(rule => rule.type === 'required');
  const warningRules = validationRules.filter(rule => rule.type === 'warning');
  const recommendationRules = validationRules.filter(rule => rule.type === 'recommendation');

  const passedRequired = requiredRules.filter(rule => rule.isValid).length;
  const passedWarnings = warningRules.filter(rule => rule.isValid).length;
  const passedRecommendations = recommendationRules.filter(rule => rule.isValid).length;

  const isFullyValid = requiredRules.every(rule => rule.isValid);
  const completionScore = Math.round(
    ((passedRequired / requiredRules.length) * 0.6 +
     (passedWarnings / warningRules.length) * 0.3 +
     (passedRecommendations / recommendationRules.length) * 0.1) * 100
  );

  React.useEffect(() => {
    if (onValidationComplete) {
      onValidationComplete(isFullyValid);
    }
  }, [isFullyValid, onValidationComplete]);

  const getValidationIcon = (rule: ValidationRule) => {
    if (rule.isValid) {
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
    
    switch (rule.type) {
      case 'required':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'recommendation':
        return <Eye className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getValidationColor = (rule: ValidationRule) => {
    if (rule.isValid) return 'border-emerald-200 bg-emerald-50';
    
    switch (rule.type) {
      case 'required':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'recommendation':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  if (isReadOnly) {
    return (
      <Card className="surface-luxury border-2 border-slate-200 rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl gradient-text">
            <CheckCircle className="w-6 h-6" />
            Assessment Validation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{completionScore}%</div>
            <div className="text-muted-foreground">Quality Score</div>
            <Progress value={completionScore} className="mt-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Overview */}
      <Card className="surface-luxury border-2 border-slate-200 rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl gradient-text">
            <Target className="w-6 h-6" />
            Assessment Quality Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">{completionScore}%</div>
            <div className="text-muted-foreground mb-4">Quality Score</div>
            <Progress value={completionScore} className="h-3" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 surface-luxury rounded-xl">
              <div className={`text-2xl font-bold ${isFullyValid ? 'text-emerald-600' : 'text-red-600'}`}>
                {passedRequired}/{requiredRules.length}
              </div>
              <div className="text-sm text-muted-foreground">Required</div>
            </div>
            <div className="text-center p-4 surface-luxury rounded-xl">
              <div className="text-2xl font-bold text-amber-600">
                {passedWarnings}/{warningRules.length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center p-4 surface-luxury rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {passedRecommendations}/{recommendationRules.length}
              </div>
              <div className="text-sm text-muted-foreground">Recommendations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold gradient-text">Validation Checklist</h3>
        
        {/* Required Rules */}
        {requiredRules.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Required Validations
            </h4>
            {requiredRules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border-2 ${getValidationColor(rule)} transition-all duration-300`}
              >
                <div className="flex items-center gap-3">
                  {getValidationIcon(rule)}
                  <div className="flex-1">
                    <div className="font-semibold">{rule.title}</div>
                    <div className="text-sm text-muted-foreground">{rule.description}</div>
                  </div>
                  <Badge variant={rule.isValid ? 'default' : 'destructive'} className="rounded-lg">
                    {rule.isValid ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning Rules */}
        {warningRules.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Quality Warnings
            </h4>
            {warningRules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border-2 ${getValidationColor(rule)} transition-all duration-300`}
              >
                <div className="flex items-center gap-3">
                  {getValidationIcon(rule)}
                  <div className="flex-1">
                    <div className="font-semibold">{rule.title}</div>
                    <div className="text-sm text-muted-foreground">{rule.description}</div>
                  </div>
                  <Badge variant={rule.isValid ? 'default' : 'secondary'} className="rounded-lg">
                    {rule.isValid ? 'Passed' : 'Review'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendation Rules */}
        {recommendationRules.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-700 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Best Practice Recommendations
            </h4>
            {recommendationRules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border-2 ${getValidationColor(rule)} transition-all duration-300`}
              >
                <div className="flex items-center gap-3">
                  {getValidationIcon(rule)}
                  <div className="flex-1">
                    <div className="font-semibold">{rule.title}</div>
                    <div className="text-sm text-muted-foreground">{rule.description}</div>
                  </div>
                  <Badge variant={rule.isValid ? 'default' : 'outline'} className="rounded-lg">
                    {rule.isValid ? 'Complete' : 'Optional'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Readiness */}
      {!isFullyValid && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>Assessment Not Ready for Submission</strong>
            <br />
            Please address all required validations before submitting your assessment.
          </AlertDescription>
        </Alert>
      )}

      {isFullyValid && completionScore < 80 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Eye className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            <strong>Assessment Ready with Recommendations</strong>
            <br />
            Your assessment meets all requirements. Consider addressing the recommendations above for higher quality.
          </AlertDescription>
        </Alert>
      )}

      {isFullyValid && completionScore >= 80 && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-emerald-800">
            <strong>High-Quality Assessment Ready</strong>
            <br />
            Excellent! Your assessment meets all requirements and follows best practices.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}