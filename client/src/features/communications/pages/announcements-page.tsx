import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Pin, Trash2, Megaphone } from 'lucide-react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from '@/features/communications/hooks/use-communications';
import type { AnnouncementPriority } from '@/types/communications';

const priorityVariant: Record<AnnouncementPriority, 'outline' | 'secondary' | 'default' | 'destructive'> = {
  LOW: 'outline',
  NORMAL: 'secondary',
  HIGH: 'default',
  URGENT: 'destructive',
};

export function AnnouncementsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      await createAnnouncement.mutateAsync({ title, content, priority, isPinned });
      toast.success('Announcement created');
      setDialogOpen(false);
      setTitle('');
      setContent('');
      setPriority('NORMAL');
      setIsPinned(false);
    } catch {
      toast.error('Failed to create announcement');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast.success('Announcement deleted');
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const pinned = announcements?.filter((a) => a.isPinned) ?? [];
  const regular = announcements?.filter((a) => !a.isPinned) ?? [];

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Staff announcements and updates"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              New Announcement
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your announcement..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as AnnouncementPriority)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <input type="checkbox" id="pinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="size-4" />
                    <Label htmlFor="pinned">Pin announcement</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createAnnouncement.isPending}>
                  {createAnnouncement.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : announcements?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Megaphone className="size-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-medium">No announcements</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first announcement to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinned.length > 0 && (
            <div className="space-y-3">
              {pinned.map((a) => (
                <Card key={a.id} className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Pin className="size-4 text-primary" />
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <Badge variant={priorityVariant[a.priority]}>{a.priority}</Badge>
                      <Button variant="ghost" size="sm" className="ml-auto" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      By {a.author?.staffProfile ? `${a.author.staffProfile.firstName} ${a.author.staffProfile.lastName}` : 'Unknown'} &middot; {format(parseISO(a.publishedAt), 'dd MMM yyyy HH:mm')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {regular.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <Badge variant={priorityVariant[a.priority]}>{a.priority}</Badge>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  By {a.author?.staffProfile ? `${a.author.staffProfile.firstName} ${a.author.staffProfile.lastName}` : 'Unknown'} &middot; {format(parseISO(a.publishedAt), 'dd MMM yyyy HH:mm')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
