import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Clock, Trash2, ListTodo } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  useTasks,
  useCreateTask,
  useUpdateTaskStatus,
  useDeleteTask,
} from '@/features/communications/hooks/use-communications';
import { staffApi } from '@/api/staff';
import type { TaskStatus, TaskPriority } from '@/types/communications';

const priorityVariant: Record<TaskPriority, 'outline' | 'secondary' | 'destructive'> = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'destructive',
};

const statusIcon: Record<TaskStatus, typeof Circle> = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  DONE: CheckCircle2,
};

const statusLabel: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export function TasksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: tasks, isLoading } = useTasks(
    undefined,
    statusFilter !== 'ALL' ? statusFilter : undefined,
  );
  const { data: staffList } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffApi.list().then((r) => r.data),
  });
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');

  const handleCreate = async () => {
    if (!title.trim() || !assigneeId) {
      toast.error('Title and assignee are required');
      return;
    }
    try {
      await createTask.mutateAsync({
        title,
        description: description || undefined,
        assigneeId,
        dueDate: dueDate || undefined,
        priority,
      });
      toast.success('Task created');
      setDialogOpen(false);
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setDueDate('');
      setPriority('MEDIUM');
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'TODO',
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage staff tasks and assignments"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              New Task
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                    <SelectContent>
                      {staffList?.map((s) => (
                        <SelectItem key={s.userId} value={s.userId}>
                          {s.firstName} {s.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createTask.isPending}>
                  {createTask.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tasks</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : tasks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <ListTodo className="size-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-medium">No tasks</p>
          <p className="mt-1 text-sm text-muted-foreground">Create a task to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks?.map((task) => {
            const StatusIcon = statusIcon[task.status];
            return (
              <Card key={task.id}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleStatusChange(task.id, nextStatus[task.status])}
                      className="mt-0.5 shrink-0"
                      title={`Mark as ${statusLabel[nextStatus[task.status]]}`}
                    >
                      <StatusIcon
                        className={`size-5 ${
                          task.status === 'DONE'
                            ? 'text-green-500'
                            : task.status === 'IN_PROGRESS'
                              ? 'text-blue-500'
                              : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                        <Badge variant="outline">{statusLabel[task.status]}</Badge>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Assigned to: {task.assignee?.staffProfile ? `${task.assignee.staffProfile.firstName} ${task.assignee.staffProfile.lastName}` : 'Unknown'}
                        </span>
                        {task.dueDate && (
                          <span>Due: {format(parseISO(task.dueDate), 'dd MMM yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
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
