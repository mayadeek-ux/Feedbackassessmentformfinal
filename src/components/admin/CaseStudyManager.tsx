import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { 
  Plus, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  FileText,
  Target,
  Clock,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CaseStudy {
  id: string;
  name: string;
  description: string;
  createdDate?: Date;
  lastModified?: Date;
  usageCount?: number;
}

interface CaseStudyManagerProps {
  caseStudies: CaseStudy[];
  onUpdateCaseStudy: (id: string, updates: any) => void;
  onAddCaseStudy: (caseStudyData: any) => void;
  onDeleteCaseStudy: (id: string) => void;
  onBackToDashboard: () => void;
}

export function CaseStudyManager({
  caseStudies,
  onUpdateCaseStudy,
  onAddCaseStudy,
  onDeleteCaseStudy,
  onBackToDashboard
}: CaseStudyManagerProps) {
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newCaseStudy, setNewCaseStudy] = useState({
    name: '',
    description: ''
  });

  const handleEditCaseStudy = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingCaseStudy) {
      setIsSaving(true);
      try {
        await onUpdateCaseStudy(editingCaseStudy.id, {
          ...editingCaseStudy,
          lastModified: new Date()
        });
        toast.success('Case study updated successfully!');
        setEditingCaseStudy(null);
        setIsEditDialogOpen(false);
      } catch (error) {
        toast.error('Failed to update case study. Please try again.');
        console.error('Save error:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCaseStudy(null);
    setIsEditDialogOpen(false);
  };

  const handleAddCaseStudy = async () => {
    if (!newCaseStudy.name.trim()) {
      toast.error('Case study name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onAddCaseStudy({
        ...newCaseStudy,
        createdDate: new Date(),
        lastModified: new Date(),
        usageCount: 0
      });
      toast.success('Case study created successfully!');
      setNewCaseStudy({ name: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      toast.error('Failed to create case study. Please try again.');
      console.error('Create error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCaseStudies = caseStudies.filter(cs =>
    cs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cs.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCaseStudyUsage = (caseStudyName: string) => {
    // This would typically come from props or API
    // For demo, we'll simulate usage counts
    const usageCounts: Record<string, number> = {
      'Strategic Leadership Challenge': 8,
      'Innovation & Digital Transformation': 6,
      'Crisis Management & Adaptability': 3
    };
    return usageCounts[caseStudyName] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 animate-fade-in">
      {/* Header */}
      <div className="glass border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBackToDashboard}
                className="rounded-xl hover-lift"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="divider-luxury"></div>
              <div>
                <h1 className="text-3xl font-bold gradient-text-premium">Case Study Management</h1>
                <p className="text-lg text-muted-foreground">Create and manage assessment case studies</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold gradient-text">{caseStudies.length}</div>
                <div className="text-sm text-muted-foreground">Case Studies</div>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 rounded-2xl card-shadow-lg hover-lift"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Case Study
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Search and Filters */}
        <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search case studies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 surface-luxury border-slate-200 rounded-xl focus-elegant"
                />
              </div>
              <Button variant="outline" className="rounded-xl hover-lift">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Case Study Form */}
        {showAddForm && (
          <Card className="surface-luxury border-2 border-slate-200 rounded-3xl card-shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl gradient-text flex items-center gap-3">
                <Plus className="w-6 h-6" />
                Create New Case Study
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="newCaseStudyName" className="text-base font-semibold">Case Study Name *</Label>
                  <Input
                    id="newCaseStudyName"
                    value={newCaseStudy.name}
                    onChange={(e) => setNewCaseStudy(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Strategic Leadership Challenge"
                    className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Preview</Label>
                  <div className="p-3 surface-luxury border border-slate-200 rounded-xl">
                    <div className="text-sm font-semibold gradient-text">
                      {newCaseStudy.name || 'Case Study Name'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="newCaseStudyDescription" className="text-base font-semibold">Description</Label>
                <Textarea
                  id="newCaseStudyDescription"
                  value={newCaseStudy.description}
                  onChange={(e) => setNewCaseStudy(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the focus and objectives of this case study..."
                  className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handleAddCaseStudy} 
                  className="bg-slate-600 hover:bg-slate-700 rounded-xl card-shadow"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Creating...' : 'Create Case Study'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Case Studies List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold gradient-text">Existing Case Studies</h2>
          
          <div className="grid gap-6">
            {filteredCaseStudies.map(caseStudy => (
              <Card 
                key={caseStudy.id} 
                className="surface-luxury border-2 border-slate-200 rounded-3xl hover-lift transition-all duration-500 status-elite"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl gradient-text">{caseStudy.name}</CardTitle>
                        <p className="text-muted-foreground mt-1">{caseStudy.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold gradient-text">
                          {getCaseStudyUsage(caseStudy.name)}
                        </div>
                        <div className="text-xs text-muted-foreground">Active Uses</div>
                      </div>
                      <Badge variant="secondary" className="rounded-xl px-3 py-1">
                        <FileText className="w-3 h-3 mr-1" />
                        Case Study
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {caseStudy.createdDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Created: {caseStudy.createdDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {caseStudy.lastModified && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Edit3 className="w-4 h-4" />
                        <span>Modified: {caseStudy.lastModified.toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Used by {getCaseStudyUsage(caseStudy.name)} assessments</span>
                    </div>
                  </div>

                  <div className="divider-luxury"></div>

                  <div className="flex gap-3">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1 hover-lift rounded-xl"
                          onClick={() => handleEditCaseStudy(caseStudy)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Case Study
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="surface-luxury rounded-2xl border-2 border-slate-200 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl gradient-text">Edit Case Study</DialogTitle>
                          <DialogDescription>
                            Make changes to the case study. Changes will affect all future assessments using this case study.
                          </DialogDescription>
                        </DialogHeader>
                        {editingCaseStudy && (
                          <div className="space-y-6 py-4">
                            <div className="space-y-3">
                              <Label className="text-base font-semibold">Case Study Name</Label>
                              <Input
                                value={editingCaseStudy.name}
                                onChange={(e) => setEditingCaseStudy(prev => 
                                  prev ? {...prev, name: e.target.value} : null
                                )}
                                className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-base font-semibold">Description</Label>
                              <Textarea
                                value={editingCaseStudy.description}
                                onChange={(e) => setEditingCaseStudy(prev => 
                                  prev ? {...prev, description: e.target.value} : null
                                )}
                                className="surface-luxury border-slate-200 rounded-xl focus-elegant"
                                rows={4}
                              />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-amber-800 mb-2">
                                <Target className="w-4 h-4" />
                                <span className="font-semibold">Impact Assessment</span>
                              </div>
                              <p className="text-sm text-amber-700">
                                This case study is currently used in {getCaseStudyUsage(caseStudy.name)} active assessments. 
                                Changes will affect all future assessments using this case study.
                              </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={handleSaveEdit} 
                                className="bg-slate-600 hover:bg-slate-700 rounded-xl"
                                disabled={isSaving}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={handleCancelEdit}
                                className="rounded-xl"
                                disabled={isSaving}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                          disabled={getCaseStudyUsage(caseStudy.name) > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="surface-luxury rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="gradient-text flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Delete Case Study
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            Are you sure you want to delete <strong>{caseStudy.name}</strong>? 
                            This action cannot be undone.
                            {getCaseStudyUsage(caseStudy.name) > 0 && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 font-semibold">⚠️ Cannot delete this case study</p>
                                <p className="text-red-700 text-sm">
                                  This case study is currently used in {getCaseStudyUsage(caseStudy.name)} active assessments.
                                </p>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => {
                              onDeleteCaseStudy(caseStudy.id);
                              toast.success('Case study deleted successfully!');
                            }}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                            disabled={getCaseStudyUsage(caseStudy.name) > 0}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Case Study
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCaseStudies.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl gradient-text mb-2">No case studies found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first case study to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
