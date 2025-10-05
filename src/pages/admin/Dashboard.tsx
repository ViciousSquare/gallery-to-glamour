import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { analytics, AnalyticsMetrics } from '@/analytics';
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
import DataErrorBoundary from '@/components/DataErrorBoundary';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

import { Mail, MessageSquare, Lightbulb } from "lucide-react";
import { getTagColor } from '@/lib/constants';
import { toast } from "sonner";
import type { Resource, Coach, Submission } from '@/lib/types';
import { resourcesApi, coachesApi, submissionsApi } from '@/lib/api';

const getLlmActionLabel = (status: string) => {
  switch (status) {
    case 'new': return 'Draft Intro Email';
    case 'lead': return 'Plan Follow-Up';
    case 'client': return 'Suggest Next Steps';
    case 'closed': return 'Send Thank-You';
    default: return 'Suggest Action';
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, signOut } = useAuth();
  const hasTrackedView = useRef(false);
  const hasShownNewAlert = useRef(false);
  const hasShownRevisitAlert = useRef(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [nextStepsDialogOpen, setNextStepsDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteResourceDialog, setDeleteResourceDialog] = useState<{ open: boolean; resource: Resource | null }>({ open: false, resource: null });
  const [deleteCoachDialog, setDeleteCoachDialog] = useState<{ open: boolean; coach: Coach | null }>({ open: false, coach: null });

  const defaultTab = searchParams.get('tab') || 'analytics';

  // Filter submissions based on status
  const filteredSubmissions = submissions.filter(submission => {
    if (statusFilter === 'all') {
      return !submission.resurface_date; // "All" excludes submissions with revisit dates
    }
    if (statusFilter === 'revisit') {
      return submission.resurface_date; // Show ALL submissions with revisit dates (past and future)
    }
    // For status filters, exclude submissions that have revisit dates
    return submission.status === statusFilter && !submission.resurface_date;
  });

  useEffect(() => {
    if (!hasTrackedView.current) {
      analytics.track('Admin Dashboard Viewed');
      console.log('📊 Dashboard: Sending test event to PostHog');
      analytics.track('Dashboard Test Event', { timestamp: new Date().toISOString() });
      hasTrackedView.current = true;
    }
    fetchResources();
    fetchCoaches();
    fetchSubmissions();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (submissions.length > 0 && !hasShownNewAlert.current) {
      const newCount = submissions.filter(s => s.status === 'new').length;
      if (newCount > 0) {
        toast(`You have ${newCount} new submission${newCount > 1 ? 's' : ''}`, {
          action: {
            label: "View",
            onClick: () => {
              setStatusFilter('new');
              navigate('/admin?tab=submissions', { replace: true });
            }
          }
        });
        hasShownNewAlert.current = true;
      }
    }
  }, [submissions, navigate]);

  useEffect(() => {
    if (submissions.length > 0 && !hasShownRevisitAlert.current) {
      const revisitCount = submissions.filter(s =>
        s.resurface_date && new Date(s.resurface_date) <= new Date()
      ).length;
      if (revisitCount > 0) {
        toast(`You have ${revisitCount} submission${revisitCount > 1 ? 's' : ''} to revisit`, {
          action: {
            label: "View",
            onClick: () => {
              setStatusFilter('revisit');
              navigate('/admin?tab=submissions', { replace: true });
            }
          }
        });
        hasShownRevisitAlert.current = true;
      }
    }
  }, [submissions, navigate]);

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

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const metrics = await analytics.fetchInsights();
      setAnalyticsMetrics(metrics);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error("Error fetching analytics", {
        description: error.message
      });
    }
    setLoadingAnalytics(false);
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

  const handleOpenNotes = () => {
    setNotesDialogOpen(true);
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
        <Tabs value={defaultTab} onValueChange={(value) => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('tab', value);
          navigate(`/admin?${newSearchParams.toString()}`, { replace: true });
        }} className="w-full">
           <TabsList className="mb-8">
             <TabsTrigger value="analytics">Analytics</TabsTrigger>
             <TabsTrigger value="resources">Resources</TabsTrigger>
             <TabsTrigger value="coaches">Coaches</TabsTrigger>
             <TabsTrigger value="submissions">Submissions</TabsTrigger>
           </TabsList>

           {/* Analytics Tab */}
           <TabsContent value="analytics">
             {/* Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.length}</div>
              <p className="text-xs text-muted-foreground">
                {resources.filter(r => r.featured).length} featured
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coaches.filter(c => c.active).length}</div>
              <p className="text-xs text-muted-foreground">
                of {coaches.length} total coaches
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Submissions</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {submissions.filter(s => s.status === 'new').length} new submissions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views (30d)</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingAnalytics ? '...' : analyticsMetrics?.totalPageViews || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {loadingAnalytics ? 'Loading...' : `${analyticsMetrics?.uniqueUsers || 0} unique users`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Views (30d)</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingAnalytics ? '...' : analyticsMetrics?.adminDashboardViews || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                dashboard visits
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Login Successes (30d)</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingAnalytics ? '...' : analyticsMetrics?.loginSuccesses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                successful logins
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Site Entries (30d)</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingAnalytics ? '...' : analyticsMetrics?.siteEntries || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                unique site visits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Sources */}
        {!loadingAnalytics && (analyticsMetrics?.topReferrers?.length || analyticsMetrics?.topUtmSources?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {analyticsMetrics?.topReferrers?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Referrers (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsMetrics.topReferrers.slice(0, 5).map((referrer, index) => (
                      <div key={referrer.domain} className="flex justify-between items-center">
                        <span className="text-sm">{referrer.domain}</span>
                        <Badge variant="secondary">{referrer.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {analyticsMetrics?.topUtmSources?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top UTM Sources (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsMetrics.topUtmSources.slice(0, 5).map((source, index) => (
                      <div key={source.source} className="flex justify-between items-center">
                        <span className="text-sm">{source.source}</span>
                        <Badge variant="secondary">{source.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recent Site Entries with UTM Details */}
        {!loadingAnalytics && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Site Entries (30d)</CardTitle>
              <p className="text-sm text-muted-foreground">Detailed view of recent visitors with UTM parameters</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>UTM Source</TableHead>
                      <TableHead>UTM Medium</TableHead>
                      <TableHead>UTM Campaign</TableHead>
                      <TableHead>UTM Term</TableHead>
                      <TableHead>UTM Content</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsMetrics?.recentEntries?.length > 0 ? (
                      analyticsMetrics.recentEntries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm">
                            {new Date(entry.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {entry.entry_page}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.referrer ? (
                              <span className="truncate max-w-32 block" title={entry.referrer}>
                                {entry.referrer.length > 30 ? `${entry.referrer.substring(0, 30)}...` : entry.referrer}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">direct</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.utm_source || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.utm_medium || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.utm_campaign || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.utm_term || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.utm_content || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No site entries yet. Visit your site with UTM parameters to see data here.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resources</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/admin/resources/import')}>
                    Bulk Import
                  </Button>
                  <Button onClick={() => navigate('/admin/resources/new')}>
                    Add New Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataErrorBoundary onRetry={fetchResources}>
                  {loadingResources ? (
                    <TableSkeleton rows={5} columns={5} />
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
               </DataErrorBoundary>
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
                <DataErrorBoundary onRetry={fetchCoaches}>
                  {loadingCoaches ? (
                    <TableSkeleton rows={5} columns={6} />
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
               </DataErrorBoundary>
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
                    All ({submissions.filter(s => !s.resurface_date).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('new')}
                  >
                    New ({submissions.filter(s => s.status === 'new' && !s.resurface_date).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'lead' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('lead')}
                  >
                    Lead ({submissions.filter(s => s.status === 'lead' && !s.resurface_date).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'client' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('client')}
                  >
                    Client ({submissions.filter(s => s.status === 'client' && !s.resurface_date).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'closed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('closed')}
                  >
                    Closed ({submissions.filter(s => s.status === 'closed' && !s.resurface_date).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'revisit' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('revisit')}
                  >
                    To Revisit ({submissions.filter(s => s.resurface_date).length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataErrorBoundary onRetry={fetchSubmissions}>
                  {loadingSubmissions ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-[260px_120px_minmax(240px,1fr)_180px_160px_200px] gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                        <div>Contact</div>
                        <div>Date</div>
                        <div>Interest</div>
                        <div>Tags</div>
                        <div>Status</div>
                        <div className="justify-self-end">Actions</div>
                      </div>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-[260px_120px_minmax(240px,1fr)_180px_160px_200px] gap-4 px-4 py-4 border-b border-border/50">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-1">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                          <div className="flex gap-2 justify-self-end">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {statusFilter === 'all' ? 'No submissions found.' : statusFilter === 'revisit' ? 'No submissions to revisit.' : `No ${statusFilter} submissions found.`}
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
                      <div className="justify-self-end">Actions</div>
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
                        onNotesAction={() => {
                          setSelectedSubmission(submission);
                          setNotesDialogOpen(true);
                        }}
                        loadingSuggestions={loadingSuggestions}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
               </DataErrorBoundary>
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
        onOpenNotes={handleOpenNotes}
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