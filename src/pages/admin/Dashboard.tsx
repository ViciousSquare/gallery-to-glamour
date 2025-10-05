import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DraftIntroductionDialog } from "@/components/DraftIntroductionDialog";
import { SubmissionDetailsDialog } from '@/components/SubmissionDetailsDialog';
import { NotesDialog } from '@/components/NotesDialog';
import { NextStepsDialog } from '@/components/NextStepsDialog';

import { Mail, MessageSquare, Lightbulb } from "lucide-react";
import { getTagColor } from '@/lib/constants';
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  eligibility: string | null;
  deadline: string | null;
  featured: boolean;
  created_at: string;
}

interface Coach {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  linkedin_url: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
}

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
  resurface_date: string | null;
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [nextStepsDialogOpen, setNextStepsDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter submissions based on status
  const filteredSubmissions = submissions.filter(submission => {
    if (statusFilter === 'all') return true;
    return submission.status === statusFilter;
  });

  useEffect(() => {
    fetchResources();
    fetchCoaches();
    fetchSubmissions();
  }, []);

  const fetchResources = async () => {
    setLoadingResources(true);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      toast.error("Error fetching resources", {
        description: error.message
      });
    } else {
      setResources(data || []);
    }
    setLoadingResources(false);
  };

  const fetchCoaches = async () => {
    setLoadingCoaches(true);
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching coaches:', error);
      toast.error("Error fetching coaches", {
        description: error.message
      });
    } else {
      setCoaches(data || []);
    }
    setLoadingCoaches(false);
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Error fetching submissions", {
        description: error.message
      });
    } else {
      setSubmissions(data || []);
    }
    setLoadingSubmissions(false);
  };


  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Error deleting resource", {
        description: error.message
      });
    } else {
      fetchResources();
    }
  };

  const handleDeleteCoach = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete coach "${name}"?`)) {
      return;
    }

    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Error deleting coach", {
        description: error.message
      });
    } else {
      fetchCoaches();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SubmissionRow = ({ submission }: { submission: Submission }) => {
    const [status, setStatus] = useState<string>(submission.status);

    const onChangeStatus = async (next: string) => {
      setStatus(next);

      // Calculate resurface date if status is changing to 'closed'
      const updateData: any = { status: next };
      if (next === 'closed') {
        const resurfaceDate = new Date();
        resurfaceDate.setMonth(resurfaceDate.getMonth() + 6);
        updateData.resurface_date = resurfaceDate.toISOString();
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', submission.id);
      if (error) {
        toast.error("Error updating status", {
          description: error.message
        });
        setStatus(submission.status);
      } else {
        // Update local state
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submission.id ? { ...s, status: next, resurface_date: updateData.resurface_date || s.resurface_date } : s
          )
        );
      }
    };

    const onLlmAction = async () => {
      if (status === 'new') {
        setSelectedSubmission(submission);
        setDraftDialogOpen(true);
      } else {
        // For other statuses, open NextStepsDialog
        setSelectedSubmission(submission);
        setNextStepsDialogOpen(true);
      }
    };

    const isResurfaced = submission.resurface_date && new Date(submission.resurface_date) <= new Date();

    return (
      <div className={`grid items-start gap-4 grid-cols-[260px_120px_minmax(240px,1fr)_180px_160px_200px] py-4 ${isResurfaced ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
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

        <Button
          className="w-[200px] justify-self-end"
          onClick={onLlmAction}
          disabled={loadingSuggestions.has(submission.id)}
          aria-label={`${getLlmActionLabel(status)} for ${submission.first_name} ${submission.last_name}`}
        >
          {loadingSuggestions.has(submission.id) ? 'Loading...' : getLlmActionLabel(status)}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.email}</div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resources</CardTitle>
                <Button onClick={() => navigate('/admin/resources/new')}>
                  Add New Resource
                </Button>
              </CardHeader>
              <CardContent>
                {loadingResources ? (
                  <div className="text-center py-8">Loading resources...</div>
                ) : resources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No resources found. Add your first resource!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resources.map((resource) => (
                          <TableRow key={resource.id}>
                            <TableCell className="font-medium">
                              {resource.title}
                            </TableCell>
                            <TableCell>{resource.category}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {resource.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {resource.featured ? (
                                <Badge>Featured</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteResource(resource.id, resource.title)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coaches Tab */}
          <TabsContent value="coaches">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Coaches</CardTitle>
                <Button onClick={() => navigate('/admin/coaches/new')}>
                  Add New Coach
                </Button>
              </CardHeader>
              <CardContent>
                {loadingCoaches ? (
                  <div className="text-center py-8">Loading coaches...</div>
                ) : coaches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No coaches found. Add your first coach!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Photo</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Bio</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coaches.map((coach) => (
                          <TableRow key={coach.id}>
                            <TableCell>{coach.display_order}</TableCell>
                            <TableCell>
                              <Avatar className="w-10 h-10">
                                {coach.image_url && (
                                  <AvatarImage src={coach.image_url} alt={coach.name} />
                                )}
                                <AvatarFallback>
                                  {coach.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                              {coach.name}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {coach.bio || '-'}
                            </TableCell>
                            <TableCell>
                              {coach.active ? (
                                <Badge>Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/admin/coaches/${coach.id}/edit`)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteCoach(coach.id, coach.name)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Contact Submissions</CardTitle>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({submissions.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('new')}
                  >
                    New ({submissions.filter(s => s.status === 'new').length})
                  </Button>
                  <Button
                    variant={statusFilter === 'lead' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('lead')}
                  >
                    Lead ({submissions.filter(s => s.status === 'lead').length})
                  </Button>
                  <Button
                    variant={statusFilter === 'client' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('client')}
                  >
                    Client ({submissions.filter(s => s.status === 'client').length})
                  </Button>
                  <Button
                    variant={statusFilter === 'closed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('closed')}
                  >
                    Closed ({submissions.filter(s => s.status === 'closed').length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSubmissions ? (
                  <div className="text-center py-8">Loading submissions...</div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {statusFilter === 'all' ? 'No submissions found.' : `No ${statusFilter} submissions found.`}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="grid grid-cols-[260px_120px_minmax(240px,1fr)_180px_160px_200px] gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                      <div>Contact</div>
                      <div>Date</div>
                      <div>Interest</div>
                      <div>Tags</div>
                      <div>Status</div>
                      <div className="justify-self-end">LLM Action</div>
                    </div>

                    {/* Submission Rows */}
                    {filteredSubmissions.map((submission) => (
                      <SubmissionRow key={submission.id} submission={submission} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>



        </Tabs>
      </main>
      
      {selectedSubmission && (
        <DraftIntroductionDialog
          open={draftDialogOpen}
          onOpenChange={setDraftDialogOpen}
          submission={selectedSubmission}
        />
      )}
      
      <SubmissionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        submission={selectedSubmission}
        onUpdate={fetchSubmissions}
      />
      
      <NotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        submission={selectedSubmission}
      />

      {selectedSubmission && (
        <NextStepsDialog
          open={nextStepsDialogOpen}
          onOpenChange={setNextStepsDialogOpen}
          submission={selectedSubmission}
          actionType={selectedSubmission?.status || 'new'}
        />
      )}
    </div>
  );
}