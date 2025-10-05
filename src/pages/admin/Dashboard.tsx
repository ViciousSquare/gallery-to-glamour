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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DraftIntroductionDialog } from "@/components/DraftIntroductionDialog";
import { SubmissionDetailsDialog } from '@/components/SubmissionDetailsDialog';
import { NotesDialog } from '@/components/NotesDialog';
import { NextStepsDialog } from '@/components/NextStepsDialog';
import { SubmissionRow } from '@/components/SubmissionRow';

import { Mail, MessageSquare, Lightbulb } from "lucide-react";
import { getTagColor } from '@/lib/constants';
import { toast } from "sonner";
import type { Resource, Coach, Submission } from '@/lib/types';
import { resourcesApi, coachesApi, submissionsApi } from '@/lib/api';

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
  const [deleteResourceDialog, setDeleteResourceDialog] = useState<{ open: boolean; resource: Resource | null }>({ open: false, resource: null });
  const [deleteCoachDialog, setDeleteCoachDialog] = useState<{ open: boolean; coach: Coach | null }>({ open: false, coach: null });

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
    try {
      const data = await resourcesApi.fetchAll();
      setResources(data);
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      toast.error("Error fetching resources", {
        description: error.message
      });
    }
    setLoadingResources(false);
  };

  const fetchCoaches = async () => {
    setLoadingCoaches(true);
    try {
      const data = await coachesApi.fetchAll();
      setCoaches(data);
    } catch (error: any) {
      console.error('Error fetching coaches:', error);
      toast.error("Error fetching coaches", {
        description: error.message
      });
    }
    setLoadingCoaches(false);
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const data = await submissionsApi.fetchAll();
      setSubmissions(data);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast.error("Error fetching submissions", {
        description: error.message
      });
    }
    setLoadingSubmissions(false);
  };


  const handleDeleteResource = async () => {
    if (!deleteResourceDialog.resource) return;

    try {
      await resourcesApi.delete(deleteResourceDialog.resource.id);
      fetchResources();
      setDeleteResourceDialog({ open: false, resource: null });
    } catch (error: any) {
      toast.error("Error deleting resource", {
        description: error.message
      });
    }
  };

  const handleDeleteCoach = async () => {
    if (!deleteCoachDialog.coach) return;

    try {
      await coachesApi.delete(deleteCoachDialog.coach.id);
      fetchCoaches();
      setDeleteCoachDialog({ open: false, coach: null });
    } catch (error: any) {
      toast.error("Error deleting coach", {
        description: error.message
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleStatusChange = (id: string, status: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status } : s
      )
    );
  };

  const onLlmAction = (submission: Submission) => {
    if (submission.status === 'new') {
      setSelectedSubmission(submission);
      setDraftDialogOpen(true);
    } else {
      // For other statuses, open NextStepsDialog
      setSelectedSubmission(submission);
      setNextStepsDialogOpen(true);
    }
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
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => setDeleteResourceDialog({ open: true, resource })}
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setDeleteResourceDialog({ open: false, resource: null })}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDeleteResource}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => setDeleteCoachDialog({ open: true, coach })}
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Coach</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete coach "{coach.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setDeleteCoachDialog({ open: false, coach: null })}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDeleteCoach}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
                      <SubmissionRow
                        key={submission.id}
                        submission={submission}
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setDetailsDialogOpen(true);
                        }}
                        onLlmAction={() => onLlmAction(submission)}
                        loadingSuggestions={loadingSuggestions}
                        onStatusChange={handleStatusChange}
                      />
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