import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, Twitter, Facebook, Instagram } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { apiCall } from '../lib/api';

const platformIcons = { Twitter, Facebook, Instagram };
const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-chart-4/20 text-chart-4',
  published: 'bg-chart-3/20 text-chart-3',
  failed: 'bg-destructive/20 text-destructive',
};

function Posts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, [page, status]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (status !== 'all') params.append('status', status);
      
      const data = await apiCall('GET', `/api/posts?${params.toString()}`);
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;

    try {
      await apiCall('DELETE', `/api/posts/${id}`);
      toast({ title: 'Success', description: 'Post deleted' });
      loadPosts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-2">Posts</h1>
              <p className="text-sm text-muted-foreground">Manage your scheduled posts</p>
            </div>
            <Link href="/posts/new">
              <a>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </a>
            </Link>
          </div>

          <div className="mb-6">
            <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {posts.map((post) => {
                  const date = new Date(post.scheduledTime);
                  const canEdit = post.status !== 'published';
                  
                  return (
                    <Card key={post.id} className="hover-elevate">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm flex-1 line-clamp-3">{post.content}</p>
                            <Badge className={statusColors[post.status as keyof typeof statusColors]}>
                              {post.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {post.platforms.map((platform: string) => {
                              const Icon = platformIcons[platform as keyof typeof platformIcons];
                              return (
                                <Badge key={platform} variant="secondary" className="gap-1">
                                  <Icon className="h-3 w-3" />
                                  {platform}
                                </Badge>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              <div>{date.toLocaleDateString()}</div>
                              <div>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div className="flex gap-2">
                              {canEdit && (
                                <Link href={`/posts/edit/${post.id}`}>
                                  <a>
                                    <Button size="icon" variant="ghost">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </a>
                                </Link>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(post.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Plus className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first post to get started</p>
                <Link href="/posts/new">
                  <a>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Post
                    </Button>
                  </a>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default Posts;