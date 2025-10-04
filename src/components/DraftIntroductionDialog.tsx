import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Mail, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface DraftIntroductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
}

export const DraftIntroductionDialog = ({ open, onOpenChange, submission }: DraftIntroductionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [draftEmail, setDraftEmail] = useState("");
  const [cost, setCost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/draft-introduction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submission })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate draft');
      }

      setDraftEmail(data.email);
      setCost(data.estimatedCost);
      toast.success("Draft generated successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to generate draft");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(draftEmail);
    toast.success("Email copied to clipboard!");
  };

  const openInGmail = () => {
    const subject = encodeURIComponent(`Re: Your AI Strategy Inquiry`);
    const body = encodeURIComponent(draftEmail);
    const mailto = `https://mail.google.com/mail/?view=cm&fs=1&to=${submission.email}&su=${subject}&body=${body}`;
    window.open(mailto, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Draft Introduction Email</DialogTitle>
          <DialogDescription>
            Generate a personalized introduction email for {submission.first_name} {submission.last_name}
          </DialogDescription>
        </DialogHeader>

        {!draftEmail && !loading && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm"><strong>Name:</strong> {submission.first_name} {submission.last_name}</p>
              <p className="text-sm"><strong>Email:</strong> {submission.email}</p>
              <p className="text-sm"><strong>Company:</strong> {submission.company || 'Not provided'}</p>
              <p className="text-sm"><strong>Role:</strong> {submission.role || 'Not provided'}</p>
              <p className="text-sm"><strong>Interest:</strong> {submission.interest_area || 'Not provided'}</p>
              <p className="text-sm"><strong>Goals:</strong> {submission.goals || 'Not provided'}</p>
            </div>

            <Button onClick={generateDraft} className="w-full" size="lg">
              <Mail className="mr-2 h-4 w-4" />
              Generate Draft Introduction
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating personalized email...</p>
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

        {draftEmail && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Generated Email</label>
              <Textarea
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
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
              <Button onClick={openInGmail} className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Open in Gmail
              </Button>
            </div>

            <Button onClick={() => { setDraftEmail(""); setCost(null); }} variant="ghost" className="w-full">
              Generate New Draft
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};