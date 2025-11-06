import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { downloadManualAsPDF } from '../../utils/pdfGenerator';
import { Section, DEFAULT_ASSESSOR_SECTIONS, DEFAULT_ADMIN_SECTIONS } from '../../utils/manualSections';
import { 
  Save, 
  Download,
  RotateCcw,
  BookOpen,
  Shield,
  AlertCircle,
  Check,
  Eye,
  FileText,
  Type,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

export function PDFManualEditor() {
  const [activeTab, setActiveTab] = useState<'assessor' | 'admin'>('assessor');
  const [assessorSections, setAssessorSections] = useState<Section[]>(DEFAULT_ASSESSOR_SECTIONS);
  const [adminSections, setAdminSections] = useState<Section[]>(DEFAULT_ADMIN_SECTIONS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editItems, setEditItems] = useState<string[]>([]);

  const sections = activeTab === 'assessor' ? assessorSections : adminSections;
  const setSections = activeTab === 'assessor' ? setAssessorSections : setAdminSections;

  useEffect(() => {
    const savedAssessor = localStorage.getItem('pdf_assessor_sections');
    const savedAdmin = localStorage.getItem('pdf_admin_sections');
    const lastSavedTime = localStorage.getItem('pdf_manuals_last_saved');

    if (savedAssessor) {
      try {
        setAssessorSections(JSON.parse(savedAssessor));
      } catch (e) {
        console.error('Failed to parse assessor sections:', e);
      }
    }

    if (savedAdmin) {
      try {
        setAdminSections(JSON.parse(savedAdmin));
      } catch (e) {
        console.error('Failed to parse admin sections:', e);
      }
    }

    if (lastSavedTime) {
      setLastSaved(new Date(lastSavedTime));
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('pdf_assessor_sections', JSON.stringify(assessorSections));
      localStorage.setItem('pdf_admin_sections', JSON.stringify(adminSections));
      const now = new Date();
      localStorage.setItem('pdf_manuals_last_saved', now.toISOString());
      setLastSaved(now);
      setHasUnsavedChanges(false);
      toast.success('Manual changes saved successfully');
    } catch (error) {
      toast.error('Failed to save manual changes');
      console.error('Save error:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF...');
      await downloadManualAsPDF(activeTab);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset this manual to default content? This cannot be undone.')) {
      if (activeTab === 'assessor') {
        setAssessorSections(DEFAULT_ASSESSOR_SECTIONS);
      } else {
        setAdminSections(DEFAULT_ADMIN_SECTIONS);
      }
      setHasUnsavedChanges(true);
      toast.info('Manual reset to default. Click Save to apply changes.');
    }
  };

  const startEditing = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditingSection(sectionId);
      setEditContent(section.content);
      if (section.items) {
        setEditItems([...section.items]);
      } else {
        setEditItems([]);
      }
    }
  };

  const saveEdit = () => {
    if (!editingSection) return;

    const updatedSections = sections.map(section => {
      if (section.id === editingSection) {
        return {
          ...section,
          content: editContent,
          ...(section.items !== undefined ? { items: editItems } : {})
        };
      }
      return section;
    });

    setSections(updatedSections);
    setEditingSection(null);
    setHasUnsavedChanges(true);
    toast.success('Section updated');
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
    setEditItems([]);
  };

  const addSection = (type: Section['type'], afterId?: string) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      content: type === 'divider' ? '' : 'New ' + type,
      ...(type === 'header' || type === 'subheader' ? { level: type === 'header' ? 1 : 2 } : {}),
      ...(type === 'list' || type === 'numbered-list' ? { items: ['Item 1'] } : {}),
      ...(type === 'callout' ? { style: 'info' as const } : {})
    };

    if (afterId) {
      const index = sections.findIndex(s => s.id === afterId);
      const newSections = [...sections];
      newSections.splice(index + 1, 0, newSection);
      setSections(newSections);
    } else {
      setSections([...sections, newSection]);
    }

    setHasUnsavedChanges(true);
    toast.success('Section added');
  };

  const deleteSection = (sectionId: string) => {
    if (confirm('Delete this section?')) {
      setSections(sections.filter(s => s.id !== sectionId));
      setHasUnsavedChanges(true);
      toast.success('Section deleted');
    }
  };

  const addListItem = () => {
    setEditItems([...editItems, 'New item']);
  };

  const updateListItem = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index] = value;
    setEditItems(newItems);
  };

  const deleteListItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const renderSection = (section: Section) => {
    const isEditing = editingSection === section.id;

    if (isEditing) {
      return (
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                rows={3}
              />
            </div>

            {(section.type === 'list' || section.type === 'numbered-list') && (
              <div>
                <label className="text-sm font-medium">List Items</label>
                <div className="space-y-2 mt-2">
                  {editItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateListItem(index, e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteListItem(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={addListItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Render based on type
    switch (section.type) {
      case 'header':
        return (
          <div className="group relative">
            <h1 className={`font-bold text-red-900 ${section.level === 1 ? 'text-3xl mt-8 mb-4' : 'text-2xl mt-6 mb-3'}`}>
              {section.content}
            </h1>
            {renderEditButton(section.id)}
          </div>
        );

      case 'subheader':
        return (
          <div className="group relative">
            <h2 className={`font-semibold text-gray-900 ${section.level === 2 ? 'text-xl mt-5 mb-3' : 'text-lg mt-4 mb-2'}`}>
              {section.content}
            </h2>
            {renderEditButton(section.id)}
          </div>
        );

      case 'paragraph':
        return (
          <div className="group relative">
            <p className="text-gray-700 mb-3 leading-relaxed">{section.content}</p>
            {renderEditButton(section.id)}
          </div>
        );

      case 'list':
        return (
          <div className="group relative">
            {section.content && <p className="font-medium mb-2">{section.content}</p>}
            <ul className="space-y-1 mb-4">
              {section.items?.map((item, i) => (
                <li key={i} className="text-gray-700 ml-4">• {item}</li>
              ))}
            </ul>
            {renderEditButton(section.id)}
          </div>
        );

      case 'numbered-list':
        return (
          <div className="group relative">
            {section.content && <p className="font-medium mb-2">{section.content}</p>}
            <ol className="list-decimal list-inside space-y-1 mb-4">
              {section.items?.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ol>
            {renderEditButton(section.id)}
          </div>
        );

      case 'divider':
        return (
          <div className="group relative">
            <hr className="my-6 border-gray-300" />
            {renderEditButton(section.id)}
          </div>
        );

      case 'callout':
        const calloutStyles = {
          info: 'bg-blue-50 border-blue-200 text-blue-900',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
          success: 'bg-green-50 border-green-200 text-green-900',
          error: 'bg-red-50 border-red-200 text-red-900'
        };
        return (
          <div className="group relative">
            <div className={`p-4 rounded-lg border-l-4 mb-4 ${calloutStyles[section.style || 'info']}`}>
              <p>{section.content}</p>
            </div>
            {renderEditButton(section.id)}
          </div>
        );

      case 'table-of-contents':
        const headers = sections.filter(s => s.type === 'header');
        return (
          <div className="group relative">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📘 {section.content}</h3>
              <ul className="space-y-1">
                {headers.map((h, i) => (
                  <li key={i} className="text-sm text-blue-800">→ {h.content}</li>
                ))}
              </ul>
            </div>
            {renderEditButton(section.id)}
          </div>
        );

      default:
        return null;
    }
  };

  const renderEditButton = (sectionId: string) => (
    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => startEditing(sectionId)}
        className="h-7 px-2"
      >
        <Edit className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => deleteSection(sectionId)}
        className="h-7 px-2 text-red-600"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );

  return (
    <Card className="w-full h-full">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              PDF Manual Editor
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visual editor for user manual PDFs - Edit content and download as PDF
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
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
            <Alert className="mb-6">
              <Eye className="w-4 h-4" />
              <AlertDescription>
                <strong>Visual PDF Editor:</strong> Hover over any section to edit or delete it. Add new sections using the buttons below. 
                Click "Download PDF" to generate the final PDF with your changes.
              </AlertDescription>
            </Alert>

            <div className="mb-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => addSection('header')}>
                <Heading1 className="w-4 h-4 mr-2" />
                Add Header
              </Button>
              <Button size="sm" variant="outline" onClick={() => addSection('subheader')}>
                <Heading2 className="w-4 h-4 mr-2" />
                Add Subheader
              </Button>
              <Button size="sm" variant="outline" onClick={() => addSection('paragraph')}>
                <Type className="w-4 h-4 mr-2" />
                Add Paragraph
              </Button>
              <Button size="sm" variant="outline" onClick={() => addSection('list')}>
                <List className="w-4 h-4 mr-2" />
                Add List
              </Button>
              <Button size="sm" variant="outline" onClick={() => addSection('numbered-list')}>
                <ListOrdered className="w-4 h-4 mr-2" />
                Add Numbered List
              </Button>
              <Button size="sm" variant="outline" onClick={() => addSection('callout')}>
                <AlertCircle className="w-4 h-4 mr-2" />
                Add Callout
              </Button>
            </div>

            <ScrollArea className="h-[600px] border rounded-lg">
              <div className="p-8 bg-white" style={{ 
                maxWidth: '210mm', 
                margin: '0 auto',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
              }}>
                {sections.map(section => (
                  <div key={section.id}>
                    {renderSection(section)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Tabs>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Quick Tips:</strong> Hover over sections to edit inline. Changes are saved to localStorage. 
              Download PDF to get the formatted manual with your custom content. The PDF will use professional styling and formatting.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
