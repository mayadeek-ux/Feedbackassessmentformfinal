import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { User, FileText, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCandidate: (candidate: NewCandidateData) => void;
}

interface NewCandidateData {
  name: string;
  email: string;
  caseStudy: string;
  estimatedDuration: number;
  notes?: string;
  tags: string[];
}

const CASE_STUDIES = [
  'Case Study 1',
  'Case Study 2'
];

const CANDIDATE_TAGS = [
  'Senior Leader',
  'Mid-Level Manager', 
  'High Potential',
  'Technical Expert',
  'Cross-Functional',
  'Remote Worker',
  'Team Lead',
  'Individual Contributor',
  'New Hire',
  'External Candidate'
];

export function AddCandidateModal({ isOpen, onClose, onAddCandidate }: AddCandidateModalProps) {
  const [formData, setFormData] = useState<NewCandidateData>({
    name: '',
    email: '',
    caseStudy: '',
    estimatedDuration: 90,
    notes: '',
    tags: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.caseStudy) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAddCandidate(formData);
      toast.success('Candidate added successfully');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        caseStudy: '',
        estimatedDuration: 90,
        notes: '',
        tags: []
      });
      
      onClose();
    } catch (error) {
      toast.error('Failed to add candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl gradient-text">
            <Plus className="w-5 h-5" />
            Add New Candidate
          </DialogTitle>
          <DialogDescription>
            Create a new candidate profile with assessment configuration and classification tags.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-red-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Information
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter candidate's full name"
                    className="bg-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="candidate@company.com"
                    className="bg-white"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Configuration */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Assessment Configuration
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="caseStudy">Case Study *</Label>
                  <Select 
                    value={formData.caseStudy} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, caseStudy: value }))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a case study" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASE_STUDIES.map(study => (
                        <SelectItem key={study} value={study}>
                          {study}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 90 }))}
                    min="30"
                    max="240"
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags & Classification */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-green-900">Tags & Classification</h3>
              
              <div className="space-y-3">
                <Label>Select relevant tags (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {CANDIDATE_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                        formData.tags.includes(tag)
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white border border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about this candidate or special considerations..."
              rows={3}
              className="bg-white"
            />
          </div>

          {/* Preview */}
          {(formData.name || formData.caseStudy) && (
            <Card className="bg-gradient-to-r from-purple-50 to-purple-50 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Preview</h3>
                <div className="space-y-2 text-sm">
                  {formData.name && (
                    <div><span className="font-medium">Name:</span> {formData.name}</div>
                  )}
                  {formData.email && (
                    <div><span className="font-medium">Email:</span> {formData.email}</div>
                  )}
                  {formData.caseStudy && (
                    <div><span className="font-medium">Case Study:</span> {formData.caseStudy}</div>
                  )}
                  <div><span className="font-medium">Duration:</span> {formData.estimatedDuration} minutes</div>
                  {formData.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Tags:</span>
                      {formData.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}