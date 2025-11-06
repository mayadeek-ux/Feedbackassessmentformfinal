import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Download, Upload, FileText, Users, FolderOpen, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { IndividualAssessmentData } from './NewIndividualAssessmentForm';
import { GroupAssessmentData } from './NewGroupAssessmentForm';

interface FileSharingManagerProps {
  individualAssessments: IndividualAssessmentData[];
  groupAssessments: GroupAssessmentData[];
  groups: string[];
  caseStudies: string[];
  onImportData: (data: {
    individualAssessments?: IndividualAssessmentData[];
    groupAssessments?: GroupAssessmentData[];
    groups?: string[];
    caseStudies?: string[];
  }) => void;
}

export function FileSharingManager({
  individualAssessments,
  groupAssessments,
  groups,
  caseStudies,
  onImportData
}: FileSharingManagerProps) {
  const [dragOver, setDragOver] = useState(false);

  // Export individual assessor's data
  const exportMyAssessments = (assessorName?: string) => {
    const assessorFilter = assessorName || prompt('Enter your assessor name to export only your assessments (or leave blank for all):');
    
    let filteredIndividual = individualAssessments;
    let filteredGroup = groupAssessments;

    if (assessorFilter?.trim()) {
      filteredIndividual = individualAssessments.filter(a => 
        a.assessorName.toLowerCase().includes(assessorFilter.toLowerCase())
      );
      filteredGroup = groupAssessments.filter(a => 
        a.assessorName.toLowerCase().includes(assessorFilter.toLowerCase())
      );
    }

    const exportData = {
      assessorName: assessorFilter?.trim() || 'All Assessors',
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        individualAssessments: filteredIndividual,
        groupAssessments: filteredGroup,
        groups,
        caseStudies
      },
      stats: {
        individualCount: filteredIndividual.length,
        groupCount: filteredGroup.length,
        totalAssessments: filteredIndividual.length + filteredGroup.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = assessorFilter?.trim() 
      ? `assessments-${assessorFilter.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
      : `all-assessments-${new Date().toISOString().split('T')[0]}.json`;
    
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${exportData.stats.totalAssessments} assessments to ${fileName}`);
  };

  // Export complete dataset for admin
  const exportCompleteDataset = () => {
    const completeData = {
      projectName: 'Future Ready Assessment Platform',
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        individualAssessments,
        groupAssessments,
        groups,
        caseStudies
      },
      stats: {
        totalIndividualAssessments: individualAssessments.length,
        totalGroupAssessments: groupAssessments.length,
        uniqueCandidates: new Set(individualAssessments.map(a => a.candidateName)).size,
        uniqueAssessors: new Set([
          ...individualAssessments.map(a => a.assessorName),
          ...groupAssessments.map(a => a.assessorName)
        ]).size,
        totalGroups: groups.length,
        totalCaseStudies: caseStudies.length
      }
    };

    const blob = new Blob([JSON.stringify(completeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complete-assessment-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Complete dataset exported successfully!');
  };

  // Import assessments from file
  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate file structure
        if (!importedData.data) {
          throw new Error('Invalid file format - missing data section');
        }

        const data = importedData.data;
        let importCount = 0;

        // Import individual assessments
        if (data.individualAssessments && Array.isArray(data.individualAssessments)) {
          // Filter out duplicates based on ID
          const existingIds = new Set(individualAssessments.map(a => a.id));
          const newIndividual = data.individualAssessments.filter((a: IndividualAssessmentData) => !existingIds.has(a.id));
          
          if (newIndividual.length > 0) {
            onImportData({ individualAssessments: [...individualAssessments, ...newIndividual] });
            importCount += newIndividual.length;
          }
        }

        // Import group assessments
        if (data.groupAssessments && Array.isArray(data.groupAssessments)) {
          const existingIds = new Set(groupAssessments.map(a => a.id));
          const newGroup = data.groupAssessments.filter((a: GroupAssessmentData) => !existingIds.has(a.id));
          
          if (newGroup.length > 0) {
            onImportData({ groupAssessments: [...groupAssessments, ...newGroup] });
            importCount += newGroup.length;
          }
        }

        // Import groups and case studies if they don't exist
        if (data.groups && Array.isArray(data.groups)) {
          const newGroups = [...new Set([...groups, ...data.groups])];
          if (newGroups.length > groups.length) {
            onImportData({ groups: newGroups });
          }
        }

        if (data.caseStudies && Array.isArray(data.caseStudies)) {
          const newCaseStudies = [...new Set([...caseStudies, ...data.caseStudies])];
          if (newCaseStudies.length > caseStudies.length) {
            onImportData({ caseStudies: newCaseStudies });
          }
        }

        const assessorName = importedData.assessorName || 'Unknown';
        const fileDate = importedData.exportDate ? new Date(importedData.exportDate).toLocaleDateString() : 'Unknown date';
        
        toast.success(`Successfully imported ${importCount} new assessments from ${assessorName} (${fileDate})`);
        
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import file. Please check the file format.');
      }
    };

    reader.readAsText(file);
  };

  // File drop handling
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFiles = files.filter(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      toast.error('Please drop JSON assessment files only');
      return;
    }

    jsonFiles.forEach(handleFileImport);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // File input handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(handleFileImport);
    e.target.value = ''; // Reset input
  };

  const getAssessorsList = () => {
    const allAssessors = new Set([
      ...individualAssessments.map(a => a.assessorName),
      ...groupAssessments.map(a => a.assessorName)
    ]);
    return Array.from(allAssessors).sort();
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Download className="w-5 h-5" />
            Export Assessment Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-red-900">For Individual Assessors</h4>
              <Button
                onClick={() => exportMyAssessments()}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={individualAssessments.length === 0 && groupAssessments.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export My Assessments
              </Button>
              <p className="text-sm text-red-700">
                Creates a file with your individual assessment data to share with others.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-red-900">For Event Coordinators</h4>
              <Button
                onClick={exportCompleteDataset}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50"
                disabled={individualAssessments.length === 0 && groupAssessments.length === 0}
              >
                <Package className="w-4 h-4 mr-2" />
                Export Complete Dataset
              </Button>
              <p className="text-sm text-red-700">
                Downloads all assessment data from all assessors in one comprehensive file.
              </p>
            </div>
          </div>

          {/* Quick export by assessor */}
          {getAssessorsList().length > 0 && (
            <>
              <Separator className="bg-red-200" />
              <div>
                <h4 className="font-medium text-red-900 mb-3">Quick Export by Assessor</h4>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {getAssessorsList().map(assessor => {
                    const individualCount = individualAssessments.filter(a => a.assessorName === assessor).length;
                    const groupCount = groupAssessments.filter(a => a.assessorName === assessor).length;
                    const totalCount = individualCount + groupCount;
                    
                    return (
                      <div key={assessor} className="flex items-center justify-between p-2 bg-white/60 rounded border border-red-100">
                        <div>
                          <div className="font-medium text-sm">{assessor}</div>
                          <div className="text-xs text-red-600">{totalCount} assessment{totalCount !== 1 ? 's' : ''}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportMyAssessments(assessor)}
                          className="border-red-200 hover:bg-red-50"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Upload className="w-5 h-5" />
            Import Assessment Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-red-400 bg-red-50' 
                : 'border-red-200 bg-red-50/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FolderOpen className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div className="text-red-900 font-medium mb-2">
              Drop JSON assessment files here
            </div>
            <div className="text-sm text-red-700 mb-4">
              or click the button below to select files
            </div>
            
            <Label htmlFor="file-import" className="cursor-pointer">
              <Button variant="outline" className="border-red-200 hover:bg-red-50" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Select Assessment Files
                </span>
              </Button>
            </Label>
            <Input
              id="file-import"
              type="file"
              accept=".json"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-900">
              <div className="font-medium mb-2">📋 How File Sharing Works:</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Each assessor exports their assessments using "Export My Assessments"</li>
                <li>They share the JSON file with you (email, USB, cloud storage, etc.)</li>
                <li>You import all received files here to combine everyone's data</li>
                <li>The system automatically prevents duplicate assessments</li>
                <li>All assessors can then export the complete dataset</li>
              </ol>
            </div>
          </div>

          {/* Import Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 bg-white/60 rounded-lg border border-red-100 text-center">
              <div className="text-2xl font-bold text-red-600">
                {individualAssessments.length}
              </div>
              <div className="text-sm text-red-700">Individual Assessments</div>
            </div>
            <div className="p-3 bg-white/60 rounded-lg border border-red-100 text-center">
              <div className="text-2xl font-bold text-red-600">
                {groupAssessments.length}
              </div>
              <div className="text-sm text-red-700">Group Assessments</div>
            </div>
            <div className="p-3 bg-white/60 rounded-lg border border-red-100 text-center">
              <div className="text-2xl font-bold text-red-600">
                {getAssessorsList().length}
              </div>
              <div className="text-sm text-red-700">Unique Assessors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Guide */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <FileText className="w-5 h-5" />
            File Sharing Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-900 mb-2">✅ For Assessors:</div>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Complete your individual and group assessments</li>
                  <li>Click "Export My Assessments"</li>
                  <li>Share the downloaded JSON file with the event coordinator</li>
                  <li>No internet connection required!</li>
                </ol>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-900 mb-2">📊 For Coordinators:</div>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Collect JSON files from all assessors</li>
                  <li>Import all files using the drag & drop area above</li>
                  <li>View combined heatmaps and analytics</li>
                  <li>Export complete dataset for final analysis</li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="font-medium text-yellow-900 mb-2">💡 Tips:</div>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Files are named with assessor name and date for easy organization</li>
                <li>You can import multiple files at once by selecting them together</li>
                <li>Duplicate assessments are automatically filtered out during import</li>
                <li>Works completely offline - no internet required for assessments</li>
                <li>Share files via email, USB drives, cloud storage, or any file sharing method</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}