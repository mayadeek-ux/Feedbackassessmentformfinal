import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trash2, Plus } from 'lucide-react';

interface GroupManagerProps {
  groups: string[];
  caseStudies: string[];
  onUpdateGroups: (groups: string[]) => void;
  onUpdateCaseStudies: (caseStudies: string[]) => void;
}

export function GroupManager({ groups, caseStudies, onUpdateGroups, onUpdateCaseStudies }: GroupManagerProps) {
  const [newGroup, setNewGroup] = useState('');
  const [newCaseStudy, setNewCaseStudy] = useState('');

  const addGroup = () => {
    if (newGroup.trim() && !groups.includes(newGroup.trim())) {
      onUpdateGroups([...groups, newGroup.trim()]);
      setNewGroup('');
    }
  };

  const removeGroup = (groupToRemove: string) => {
    onUpdateGroups(groups.filter(group => group !== groupToRemove));
  };

  const addCaseStudy = () => {
    if (newCaseStudy.trim() && !caseStudies.includes(newCaseStudy.trim())) {
      onUpdateCaseStudies([...caseStudies, newCaseStudy.trim()]);
      setNewCaseStudy('');
    }
  };

  const removeCaseStudy = (caseStudyToRemove: string) => {
    onUpdateCaseStudies(caseStudies.filter(study => study !== caseStudyToRemove));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter group name"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGroup()}
            />
            <Button onClick={addGroup} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No groups created yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <Badge key={group} variant="secondary" className="flex items-center gap-2">
                    {group}
                    <button
                      onClick={() => removeGroup(group)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Case Studies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter case study name"
              value={newCaseStudy}
              onChange={(e) => setNewCaseStudy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCaseStudy()}
            />
            <Button onClick={addCaseStudy} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {caseStudies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No case studies created yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {caseStudies.map((study) => (
                  <Badge key={study} variant="secondary" className="flex items-center gap-2">
                    {study}
                    <button
                      onClick={() => removeCaseStudy(study)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}