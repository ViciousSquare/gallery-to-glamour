import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Lightbulb, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface NextStepsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
  actionType: string;
}

export const NextStepsDialog = ({ open, onOpenChange, submission, actionType }: NextStepsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [cost, setCost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch notes for context
      const { data: notes, error: notesError } = await supabase
        .from('submission_notes')
        .select('*')
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (notesError) {
        throw new Error(`Error fetching notes: ${notesError.message}`);
      }

      const { data, error } = await supabase.functions.invoke('suggest-next-action', {
        body: {
          submission,
          notes: notes || [],
          actionType
        }
      });

      if (error) {
        throw new Error(`Error getting suggestion: ${error.message}`);
      }

      setSuggestion(data.suggestion);
      setCost(data.estimatedCost || null);
      toast.success("Suggestion generated successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to generate suggestion");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(suggestion);
    toast.success("Suggestion copied to clipboard!");
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Plan Follow-Up';
      case 'lead': return 'Draft Next Steps';
      case 'client': return 'Draft Next Steps';
      case 'closed': return 'Send Thank-You';
      default: return 'Suggest Action';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getActionLabel(actionType)}</DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions for {submission.first_name} {submission.last_name}
          </DialogDescription>
        </DialogHeader>

        {!suggestion && !loading && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm"><strong>Name:</strong> {submission.first_name} {submission.last_name}</p>
              <p className="text-sm"><strong>Email:</strong> {submission.email}</p>
              <p className="text-sm"><strong>Status:</strong> {submission.status}</p>
              <p className="text-sm"><strong>Company:</strong> {submission.company || 'Not provided'}</p>
              <p className="text-sm"><strong>Goals:</strong> {submission.goals || 'Not provided'}</p>
            </div>

            <Button onClick={generateSuggestion} className="w-full" size="lg">
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate {getActionLabel(actionType)}
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating personalized suggestion...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {suggestion && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Suggestion</label>
              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              {cost && (
                <p className="text-xs text-muted-foreground">
                  Estimated cost: ${cost}
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>

            <Button onClick={() => { setSuggestion(""); setCost(null); }} variant="ghost" className="w-full">
              Generate New Suggestion
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};