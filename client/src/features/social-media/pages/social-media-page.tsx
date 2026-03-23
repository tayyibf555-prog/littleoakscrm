import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Trash2, Send, Clock, CheckCircle2, XCircle, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useSocialMediaPosts,
  useConsentChildren,
  useCreatePost,
  useDeletePost,
} from '@/features/social-media/hooks/use-social-media';
import type { PostStatus } from '@/types/social-media';

const statusConfig: Record<PostStatus, { label: string; variant: 'outline' | 'secondary' | 'default' | 'destructive' }> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  SCHEDULED: { label: 'Scheduled', variant: 'secondary' },
  PUBLISHED: { label: 'Published', variant: 'default' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'tiktok', label: 'TikTok', icon: Send },
];

export function SocialMediaPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: posts, isLoading } = useSocialMediaPosts();
  const { data: consentChildren } = useConsentChildren();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState('');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleChild = (id: string) => {
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }
    try {
      await createPost.mutateAsync({
        content,
        platforms: selectedPlatforms,
        scheduledFor: scheduledFor || undefined,
        childrenInPost: selectedChildren.length > 0 ? selectedChildren : undefined,
      });
      toast.success('Post created');
      setDialogOpen(false);
      setContent('');
      setSelectedPlatforms([]);
      setScheduledFor('');
      setSelectedChildren([]);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create post';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div>
      <PageHeader
        title="Social Media"
        description="Manage and schedule social media posts"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              Compose Post
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Compose Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">{content.length} characters</p>
                </div>

                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => {
                      const Icon = p.icon;
                      const selected = selectedPlatforms.includes(p.id);
                      return (
                        <Button
                          key={p.id}
                          type="button"
                          variant={selected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => togglePlatform(p.id)}
                        >
                          <Icon className="mr-1 size-3.5" />
                          {p.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                </div>

                {consentChildren && consentChildren.length > 0 && (
                  <div className="space-y-2">
                    <Label>Children in Post (consent-verified only)</Label>
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border p-2">
                      {consentChildren.map((child) => (
                        <label key={child.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedChildren.includes(child.id)}
                            onChange={() => toggleChild(child.id)}
                            className="size-4"
                          />
                          {child.firstName} {child.lastName}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createPost.isPending}>
                  {createPost.isPending ? 'Creating...' : scheduledFor ? 'Schedule Post' : 'Create Draft'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : posts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Send className="size-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-medium">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Compose your first social media post.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => {
            const cfg = statusConfig[post.status];
            return (
              <Card key={post.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        {post.platforms.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        By {post.author?.staffProfile ? `${post.author.staffProfile.firstName} ${post.author.staffProfile.lastName}` : 'Unknown'}
                        {post.scheduledFor && <> &middot; Scheduled: {format(parseISO(post.scheduledFor), 'dd MMM yyyy HH:mm')}</>}
                        {post.publishedAt && <> &middot; Published: {format(parseISO(post.publishedAt), 'dd MMM yyyy HH:mm')}</>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
