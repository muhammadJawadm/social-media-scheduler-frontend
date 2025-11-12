import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { apiCall } from '../lib/api';
import { ArrowLeft, Twitter, Facebook, Instagram } from 'lucide-react';

const platforms = [
  { id: 'Twitter', label: 'Twitter', icon: Twitter },
  { id: 'Facebook', label: 'Facebook', icon: Facebook },
  { id: 'Instagram', label: 'Instagram', icon: Instagram },
];

function PostForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = !!params.id;

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');

  useEffect(() => {
    if (isEdit && params.id) {
      loadPost();
    }
  }, [params.id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const post = await apiCall('GET', `/api/posts/${params.id}`);
      setContent(post.content || '');
      setSelectedPlatforms(post.platforms || []);
      setImageUrl(post.imageUrl || '');
      setStatus(post.status === 'published' ? 'scheduled' : post.status);
      
      if (post.scheduledTime) {
        const date = new Date(post.scheduledTime);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setScheduledTime(localDateTime);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLocation('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({ title: 'Error', description: 'Content is required', variant: 'destructive' });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({ title: 'Error', description: 'Select at least one platform', variant: 'destructive' });
      return;
    }

    if (!scheduledTime) {
      toast({ title: 'Error', description: 'Scheduled time is required', variant: 'destructive' });
      return;
    }

    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
      toast({ title: 'Error', description: 'Time must be in the future', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        content,
        platforms: selectedPlatforms,
        scheduledTime: scheduledDate.toISOString(),
        imageUrl: imageUrl || undefined,
        status,
      };

      if (isEdit) {
        await apiCall('PUT', `/api/posts/${params.id}`, payload);
        toast({ title: 'Success', description: 'Post updated' });
      } else {
        await apiCall('POST', '/api/posts', payload);
        toast({ title: 'Success', description: 'Post created' });
      }

      setLocation('/posts');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  if (loading && isEdit) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Button variant="ghost" className="gap-2 mb-6" onClick={() => setLocation('/posts')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit Post' : 'Create New Post'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What would you like to share?"
                    className="min-h-32"
                    maxLength={500}
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {content.length}/500
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <div key={platform.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform.id}
                            checked={selectedPlatforms.includes(platform.id)}
                            onCheckedChange={() => togglePlatform(platform.id)}
                          />
                          <Label htmlFor={platform.id} className="flex items-center gap-2 cursor-pointer">
                            <Icon className="h-4 w-4" />
                            {platform.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                      />
                      <span>Save as Draft</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="scheduled"
                        checked={status === 'scheduled'}
                        onChange={() => setStatus('scheduled')}
                      />
                      <span>Schedule Post</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/posts')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default PostForm;