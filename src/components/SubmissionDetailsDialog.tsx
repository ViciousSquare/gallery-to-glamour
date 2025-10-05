import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  ALL_SUBMISSION_TAGS,
  ACTIVITY_TAGS,
  SERVICE_TAGS,
  STATUS_TAGS,
  getTagColor
} from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Submission } from '@/lib/types';
import { submissionsApi } from '@/lib/api';



interface SubmissionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
  onUpdate: () => void;
}

export function SubmissionDetailsDialog({
  open,
  onOpenChange,
  submission,
  onUpdate,
}: SubmissionDetailsDialogProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(submission);

  // Update local state when submission prop changes
  useEffect(() => {
    setCurrentSubmission(submission);
  }, [submission]);

  if (!currentSubmission) return null;

  const handleAddTag = async (tag: string) => {
    if (currentSubmission.tags.includes(tag)) return;

    setIsUpdating(true);
    const newTags = [...currentSubmission.tags, tag];

    try {
      await submissionsApi.updateTags(currentSubmission.id, newTags);
      // Update local state immediately for live updates
      setCurrentSubmission({ ...currentSubmission, tags: newTags });

      toast({
        title: "Tag Added",
        description: `Added "${tag}" to ${currentSubmission.first_name} ${currentSubmission.last_name}`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add tag: ${error.message}`,
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setIsUpdating(true);
    const newTags = currentSubmission.tags.filter(tag => tag !== tagToRemove);

    try {
      await submissionsApi.updateTags(currentSubmission.id, newTags);
      // Update local state immediately for live updates
      setCurrentSubmission({ ...currentSubmission, tags: newTags });

      toast({
        title: "Tag Removed",
        description: `Removed "${tagToRemove}" from ${currentSubmission.first_name} ${currentSubmission.last_name}`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to remove tag: ${error.message}`,
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const handleClearAllTags = async () => {
    if (currentSubmission.tags.length === 0) return;

    setIsUpdating(true);
    try {
      await submissionsApi.updateTags(currentSubmission.id, []);
      // Update local state immediately for live updates
      setCurrentSubmission({ ...currentSubmission, tags: [] });

      toast({
        title: "Tags Cleared",
        description: `Removed all tags from ${currentSubmission.first_name} ${currentSubmission.last_name}`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to clear tags: ${error.message}`,
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const handleUpdateResurfaceDate = async (dateValue: string) => {
    setIsUpdating(true);
    const resurfaceDate = dateValue ? new Date(dateValue).toISOString() : null;

    try {
      await submissionsApi.updateResurfaceDate(currentSubmission.id, resurfaceDate);
      // Update local state immediately for live updates
      setCurrentSubmission({ ...currentSubmission, resurface_date: resurfaceDate });

      toast({
        title: "Resurface Date Updated",
        description: `Updated resurface date for ${currentSubmission.first_name} ${currentSubmission.last_name}`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update resurface date: ${error.message}`,
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      await submissionsApi.softDelete(currentSubmission.id);
      toast({
        title: "Submission Deleted",
        description: `Submission for ${currentSubmission.first_name} ${currentSubmission.last_name} has been deleted`,
      });
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete submission: ${error.message}`,
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };



  const availableTagsToAdd = ALL_SUBMISSION_TAGS.filter(
    tag => !currentSubmission.tags.includes(tag)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {currentSubmission.first_name} {currentSubmission.last_name}
          </DialogTitle>
        </DialogHeader>

        {/* Contact Information */}
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <div>{currentSubmission.email}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Submitted:</span>
                <div>{formatDate(currentSubmission.created_at)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Company:</span>
                <div>{currentSubmission.company || 'Not specified'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Role:</span>
                <div>{currentSubmission.role || 'Not specified'}</div>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-600">Interest Area:</span>
                <div>{currentSubmission.interest_area || 'Not specified'}</div>
              </div>
              <div>
                <Label htmlFor="resurface-date" className="font-medium text-gray-600">Resurface Date:</Label>
                <Input
                  id="resurface-date"
                  type="date"
                  value={currentSubmission.resurface_date ? new Date(currentSubmission.resurface_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdateResurfaceDate(e.target.value)}
                  disabled={isUpdating}
                  className="mt-1"
                />
              </div>
              {currentSubmission.goals && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-600">Goals:</span>
                  <div className="mt-1 text-gray-800">{currentSubmission.goals}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Tags */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm text-gray-600">Current Tags</h3>
            {currentSubmission.tags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-auto"
                onClick={handleClearAllTags}
                disabled={isUpdating}
              >
                Clear All
              </Button>
            )}
          </div>
          {currentSubmission.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {currentSubmission.tags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className={`${getTagColor(tag)} pr-1 text-xs`}
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isUpdating}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No tags yet</p>
          )}
        </div>

        {/* Available Tags to Add */}
        {availableTagsToAdd.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-gray-600 mb-3">Add Tags</h3>
            
            {/* Activity Tags */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-blue-600 mb-2">Activities</h4>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_TAGS.filter(tag => !currentSubmission.tags.includes(tag)).map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    onClick={() => handleAddTag(tag)}
                    disabled={isUpdating}
                  >
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Service Tags */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-green-600 mb-2">Services</h4>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TAGS.filter(tag => !currentSubmission.tags.includes(tag)).map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={() => handleAddTag(tag)}
                    disabled={isUpdating}
                  >
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Tags */}
            <div>
              <h4 className="text-xs font-medium text-orange-600 mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_TAGS.filter(tag => !currentSubmission.tags.includes(tag)).map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                    onClick={() => handleAddTag(tag)}
                    disabled={isUpdating}
                  >
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the submission for {currentSubmission.first_name} {currentSubmission.last_name}? This will hide it from the dashboard but keep the data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            OK
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}