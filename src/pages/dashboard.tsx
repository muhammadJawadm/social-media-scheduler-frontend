import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, FileText, CheckCircle2, Clock, Twitter, Facebook, Instagram } from 'lucide-react';
import { apiCall } from '../lib/api';

const platformIcons = { Twitter, Facebook, Instagram };

function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, postsData] = await Promise.all([
        apiCall('GET', '/api/dashboard/stats'),
        apiCall('GET', '/api/dashboard/upcoming'),
      ]);
      setStats(statsData);
      setUpcomingPosts(postsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of your scheduled posts</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <FileText className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalPosts || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                    <Clock className="h-4 w-4 text-chart-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.scheduledPosts || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Published</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-chart-3" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.publishedPosts || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.draftPosts || 0}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">Upcoming Posts</h2>
                  {upcomingPosts.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingPosts.map((post) => {
                        const date = new Date(post.scheduledTime);
                        return (
                          <div key={post.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-2">{post.content}</p>
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
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                              <div>{date.toLocaleDateString()}</div>
                              <div>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground">No upcoming posts</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-4">Posts by Platform</h2>
                  <Card>
                    <CardContent className="py-6">
                      <div className="space-y-6">
                        {stats?.platformStats && Object.entries(stats.platformStats).map(([platform, count]: [string, any]) => {
                          const Icon = platformIcons[platform as keyof typeof platformIcons];
                          const maxCount = Math.max(...Object.values(stats.platformStats).map(Number));
                          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          
                          return (
                            <div key={platform} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span className="font-medium">{platform}</span>
                                </div>
                                <span className="font-mono text-muted-foreground">{count}</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default Dashboard;