import { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, User, Plus, Search, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  role: string | null;
  interest_area: string | null;
  goals: string | null;
  status: string;
  notes: string | null;
  tags: string[];
}

interface SubmissionNote {
  id: string;
  note_text: string;
  note_type: string;
  created_by: string;
  created_at: string;
}

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
}

const NOTE_TYPES = [
  { type: 'call', label: 'Phone Call', icon: Phone, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { type: 'email', label: 'Email', icon: Mail, color: 'bg-green-100 text-green-800 border-green-200' },
  { type: 'meeting', label: 'Meeting', icon: Calendar, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { type: 'general', label: 'General', icon: MessageSquare, color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

const QUICK_TEMPLATES = [
  { type: 'call', text: 'Had a call with {{name}}. Discussed:\n\n• \n• \n\nNext steps:\n• ' },
  { type: 'email', text: 'Sent email to {{name}} regarding:\n\n• \n\nWaiting for response on:\n• ' },
  { type: 'meeting', text: 'Meeting with {{name}}:\n\nAttendees: \nTopics covered:\n• \n• \n\nAction items:\n• ' },
  { type: 'followup', text: 'Follow-up required:\n\n• When: \n• What: \n• Why: ' },
];

export function NotesDialog({ open, onOpenChange, submission }: NotesDialogProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<SubmissionNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedNoteType, setSelectedNoteType] = useState('general');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Fetch notes when dialog opens
  useEffect(() => {
    if (open && submission) {
      fetchNotes();
    }
  }, [open, submission]);

  const fetchNotes = async () => {
    if (!submission) return;
    
    setLoadingNotes(true);
    const { data, error } = await supabase
      .from('submission_notes')
      .select('*')
      .eq('submission_id', submission.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: `Failed to load notes: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
    setLoadingNotes(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !submission) return;

    setSavingNote(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add notes",
        variant: "destructive",
      });
      setSavingNote(false);
      return;
    }

    const { error } = await supabase
      .from('submission_notes')
      .insert({
        submission_id: submission.id,
        note_text: newNote.trim(),
        note_type: selectedNoteType,
        created_by: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: `Failed to save note: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setNewNote('');
      setShowQuickAdd(false);
      fetchNotes(); // Refresh notes list
      toast({
        title: "Note Added",
        description: "Your note has been saved successfully",
      });
    }
    setSavingNote(false);
  };

  const useTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    const name = submission ? `${submission.first_name} ${submission.last_name}` : 'the contact';
    const text = template.text.replace('{{name}}', name);
    setNewNote(text);
    setSelectedNoteType(template.type === 'followup' ? 'general' : template.type);
    setShowQuickAdd(true);
  };

  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDateDivider = (dateString: string, previousDateString?: string) => {
    const date = new Date(dateString);
    const previousDate = previousDateString ? new Date(previousDateString) : null;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const isSameDay = previousDate && date.toDateString() === previousDate.toDateString();
    
    if (isSameDay) return null;
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNoteTypeConfig = (type: string) => {
    return NOTE_TYPES.find(nt => nt.type === type) || NOTE_TYPES[3]; // default to general
  };

  const filteredNotes = notes.filter(note => 
    searchTerm === '' || 
    note.note_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes for {submission.first_name} {submission.last_name}
          </DialogTitle>
        </DialogHeader>

        {/* Quick Info Bar */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          {submission.email} • {submission.company || 'No company'} • {submission.role || 'No role'}
        </div>

        {/* Search & Quick Actions */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        </div>

        {/* Quick Templates */}
        {showQuickAdd && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-600">Quick start:</span>
                  {QUICK_TEMPLATES.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => useTemplate(template)}
                      className="text-xs"
                    >
                      {template.type === 'followup' ? 'Follow-up' : template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  {NOTE_TYPES.map((type) => (
                    <Button
                      key={type.type}
                      variant={selectedNoteType === type.type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedNoteType(type.type)}
                      className="text-xs"
                    >
                      <type.icon className="h-3 w-3 mr-1" />
                      {type.label}
                    </Button>
                  ))}
                </div>

                <Textarea
                  placeholder="What happened in this interaction?"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={savingNote}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || savingNote}
                    size="sm"
                  >
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </Button>
                  <Button
                    onClick={() => setShowQuickAdd(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Timeline */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {loadingNotes ? (
            <div className="text-center text-sm text-gray-500 py-8">
              Loading conversation history...
            </div>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => {
              const dateDivider = getDateDivider(
                note.created_at, 
                index > 0 ? filteredNotes[index - 1].created_at : undefined
              );
              const typeConfig = getNoteTypeConfig(note.note_type || 'general');
              
              return (
                <div key={note.id}>
                  {dateDivider && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-xs font-medium text-gray-500 bg-white px-2">
                        {dateDivider}
                      </span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                  )}
                  
                  <Card className="ml-4 relative">
                    <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      <typeConfig.icon className="h-2 w-2 text-gray-600" />
                    </div>
                    
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className={`text-xs ${typeConfig.color}`}>
                          <typeConfig.icon className="h-3 w-3 mr-1" />
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatNoteDate(note.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-sm whitespace-pre-wrap text-gray-800">
                        {note.note_text}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notes yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start building the conversation history with {submission.first_name}
              </p>
              <Button onClick={() => setShowQuickAdd(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add First Note
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}