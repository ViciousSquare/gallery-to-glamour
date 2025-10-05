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
}

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
    } else {
      setSubmissions(data || []);
    }
    setLoadingSubmissions(false);
  };

  const handleUpdateSubmissionStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(`Error updating status: ${error.message}`);
    } else {
      // Update only the affected submission in local state instead of refetching all
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: newStatus } : s
        )
      );
    }
  };

  const handleSuggestAction = async (submission: Submission) => {
    // Add to loading set
    setLoadingSuggestions(prev => new Set(prev).add(submission.id));

    try {
      // Fetch notes for this submission
      const { data: notes, error: notesError } = await supabase
        .from('submission_notes')
        .select('*')
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: true });

      if (notesError) {
        throw new Error(`Error fetching notes: ${notesError.message}`);
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('suggest-next-action', {
        body: {
          submission,
          notes: notes || []
        }
      });

      if (error) {
        throw new Error(`Error getting suggestion: ${error.message}`);
      }

      // Show suggestion in toast with copy functionality
      toast.success("Action Suggestion", {
        description: data.suggestion,
        duration: 10000,
        action: {
          label: "Copy",
          onClick: () => {
            navigator.clipboard.writeText(data.suggestion);
            toast.success("Copied to clipboard!");
          }
        }
      });

    } catch (error) {
      console.error('Error getting action suggestion:', error);
      toast.error("Failed to get suggestion", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      // Remove from loading set
      setLoadingSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(submission.id);
        return newSet;
      });
    }
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
      alert(`Error deleting resource: ${error.message}`);
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
      alert(`Error deleting coach: ${error.message}`);
    } else {
      fetchCoaches();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow 
                            key={submission.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <TableCell>
                              {new Date(submission.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {submission.first_name} {submission.last_name}
                            </TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>{submission.company || '-'}</TableCell>
                            <TableCell>{submission.role || '-'}</TableCell>
                            <TableCell>{submission.interest_area || '-'}</TableCell>
                            <TableCell>
                              {submission.tags && submission.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {submission.tags.slice(0, 3).map((tag, index) => (
                                    <Badge 
                                      key={index}
                                      variant="outline"
                                      className={`${getTagColor(tag)} text-xs px-1.5 py-0.5`}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {submission.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                                      +{submission.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  submission.status === 'new' ? 'default' :
                                  submission.status === 'lead' ? 'secondary' :
                                  submission.status === 'client' ? 'default' :
                                  submission.status === 'closed' ? 'outline' : 'default'
                                }
                                className={
                                  submission.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                  submission.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                                  submission.status === 'client' ? 'bg-green-100 text-green-800' :
                                  submission.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''
                                }
                              >
                                {submission.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubmission(submission);
                                    setNotesDialogOpen(true);
                                  }}
                                >
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  Notes
                                </Button>
                                <Select
                                  value={submission.status}
                                  onValueChange={(newStatus) => {
                                    handleUpdateSubmissionStatus(submission.id, newStatus);
                                  }}
                                >
                                  <SelectTrigger className="w-24 h-8" onClick={(e) => e.stopPropagation()}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (submission.status === 'new') {
                                      setSelectedSubmission(submission);
                                      setDraftDialogOpen(true);
                                    } else {
                                      handleSuggestAction(submission);
                                    }
                                  }}
                                  disabled={loadingSuggestions.has(submission.id)}
                                >
                                  {submission.status === 'new' ? (
                                    <>
                                      <Mail className="mr-1 h-3 w-3" />
                                      {loadingSuggestions.has(submission.id) ? 'Loading...' : 'Draft Email'}
                                    </>
                                  ) : (
                                    <>
                                      <Lightbulb className="mr-1 h-3 w-3" />
                                      {loadingSuggestions.has(submission.id) ? 'Loading...' : 'Suggest Action'}
                                    </>
                                  )}
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
    </div>
  );
}