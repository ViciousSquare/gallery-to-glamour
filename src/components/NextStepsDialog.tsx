import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

   // Editable fields
   const [editedFirstName, setEditedFirstName] = useState(submission.first_name);
   const [editedLastName, setEditedLastName] = useState(submission.last_name);
   const [editedEmail, setEditedEmail] = useState(submission.email);
   const [editedCompany, setEditedCompany] = useState(submission.company || "");
   const [editedRole, setEditedRole] = useState(submission.role || "");
   const [editedInterestArea, setEditedInterestArea] = useState(submission.interest_area || "");
   const [editedGoals, setEditedGoals] = useState(submission.goals || "");
   const [editedTags, setEditedTags] = useState(submission.tags?.join(', ') || "");
   const [furtherContext, setFurtherContext] = useState("");

   // Reset states when submission changes
   useEffect(() => {
     setSuggestion("");
     setCost(null);
     setError(null);
     setEditedFirstName(submission.first_name);
     setEditedLastName(submission.last_name);
     setEditedEmail(submission.email);
     setEditedCompany(submission.company || "");
     setEditedRole(submission.role || "");
     setEditedInterestArea(submission.interest_area || "");
     setEditedGoals(submission.goals || "");
     setEditedTags(submission.tags?.join(', ') || "");
     setFurtherContext("");
   }, [submission.id]);

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

      const editedSubmission = {
        ...submission,
        first_name: editedFirstName,
        last_name: editedLastName,
        email: editedEmail,
        company: editedCompany || null,
        role: editedRole || null,
        interest_area: editedInterestArea || null,
        goals: editedGoals || null,
        tags: editedTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      const { data, error } = await supabase.functions.invoke('suggest-next-action', {
        body: {
          editedSubmission,
          notes: notes || [],
          actionType,
          furtherContext: furtherContext.trim() || null
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
      case 'client': return 'Suggest Next Steps';
      case 'closed': return 'Send Thank-You';
      default: return 'Suggest Action';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getActionLabel(actionType)}</DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions for {submission.first_name} {submission.last_name}
          </DialogDescription>
        </DialogHeader>

        {!suggestion && !loading && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    value={editedFirstName}
                    onChange={(e) => setEditedFirstName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editedLastName}
                    onChange={(e) => setEditedLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                  <Input
                    id="company"
                    value={editedCompany}
                    onChange={(e) => setEditedCompany(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                  <Input
                    id="role"
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="interestArea" className="text-sm font-medium">Interest Area</Label>
                <Input
                  id="interestArea"
                  value={editedInterestArea}
                  onChange={(e) => setEditedInterestArea(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="goals" className="text-sm font-medium">Goals</Label>
                <Textarea
                  id="goals"
                  value={editedGoals}
                  onChange={(e) => setEditedGoals(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. interested, follow-up, high-priority"
                />
              </div>
              <div>
                <Label htmlFor="furtherContext" className="text-sm font-medium">Further Context (Optional)</Label>
                <Textarea
                  id="furtherContext"
                  value={furtherContext}
                  onChange={(e) => setFurtherContext(e.target.value)}
                  className="mt-1"
                  placeholder="Add any additional context for the AI suggestion..."
                  rows={3}
                />
              </div>
              <p className="text-sm text-muted-foreground"><strong>Status:</strong> {submission.status}</p>
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
                className="min-h-[250px] font-mono text-sm"
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