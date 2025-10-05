import { useState, memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTagColor } from '@/lib/constants';
import { toast } from "sonner";
import type { Submission } from '@/lib/types';
import { submissionsApi } from '@/lib/api';

interface SubmissionRowProps {
  submission: Submission;
  onClick: () => void;
  onLlmAction: () => void;
  onNotesAction: () => void;
  loadingSuggestions: Set<string>;
  onStatusChange: (id: string, status: string) => void;
}

const getLlmActionLabel = (status: string) => {
  switch (status) {
    case 'new': return 'Draft Intro Email';
    case 'lead': return 'Plan Follow-Up';
    case 'client': return 'Draft Next Steps';
    case 'closed': return 'Send Thank-You';
    default: return 'Suggest Action';
  }
};

export const SubmissionRow = memo(function SubmissionRow({ submission, onClick, onLlmAction, onNotesAction, loadingSuggestions, onStatusChange }: SubmissionRowProps) {
  const [status, setStatus] = useState<string>(submission.status);

  const onChangeStatus = async (next: string) => {
    setStatus(next);

    try {
      await submissionsApi.updateStatus(submission.id, next);
      onStatusChange(submission.id, next);
    } catch (error: any) {
      toast.error("Error updating status", {
        description: error.message
      });
      setStatus(submission.status);
    }
  };

  const isResurfaced = submission.resurface_date && new Date(submission.resurface_date) <= new Date();

  return (
    <div
      className={`grid items-start gap-4 grid-cols-[260px_120px_minmax(240px,1fr)_180px_160px_200px] py-4 cursor-pointer hover:bg-muted/50 transition-colors ${isResurfaced ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
      onClick={onClick}
    >
      <div className="max-w-[260px] space-y-0.5">
        <div className="font-semibold flex items-center gap-2">
          {submission.first_name} {submission.last_name}
          {isResurfaced && <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">Resurface</Badge>}
        </div>
        <div className="text-muted-foreground truncate">
          <a href={`mailto:${submission.email}`} className="hover:underline">
            {submission.email}
          </a>
        </div>
        <div className="text-muted-foreground truncate">{submission.company || '—'}</div>
        <div className="text-muted-foreground">{submission.role || '—'}</div>
        <div className="text-muted-foreground">{submission.interest_area || '—'}</div>
      </div>

      <div className="text-xs text-muted-foreground">
        {new Date(submission.created_at).toLocaleDateString()}
      </div>

      <div className="text-sm leading-snug line-clamp-2">
        {submission.goals || submission.notes || '—'}
      </div>

      <div className="flex flex-wrap gap-1">
        {(submission.tags || []).slice(0, 3).map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`${getTagColor(tag)} text-xs px-1.5 py-0.5`}
          >
            {tag}
          </Badge>
        ))}
        {(submission.tags || []).length > 3 && (
          <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
            +{(submission.tags || []).length - 3}
          </Badge>
        )}
      </div>

      <Select
        value={status}
        onValueChange={onChangeStatus}
        aria-label="Change status"
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">new</SelectItem>
          <SelectItem value="lead">lead</SelectItem>
          <SelectItem value="client">client</SelectItem>
          <SelectItem value="closed">closed</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-2 justify-self-end">
        <Button
          className="w-[200px]"
          onClick={(e) => {
            e.stopPropagation();
            onLlmAction();
          }}
          disabled={loadingSuggestions.has(submission.id)}
          aria-label={`${getLlmActionLabel(status)} for ${submission.first_name} ${submission.last_name}`}
        >
          {loadingSuggestions.has(submission.id) ? 'Loading...' : getLlmActionLabel(status)}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-[200px]"
          onClick={(e) => {
            e.stopPropagation();
            onNotesAction();
          }}
          aria-label={`View notes for ${submission.first_name} ${submission.last_name}`}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Notes
        </Button>
      </div>
    </div>
  );
});