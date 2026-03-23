import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Users, Baby } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useRooms, useCreateRoom } from '@/features/rooms/hooks/use-rooms';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  ageRangeMin: z.coerce.number().min(0, 'Minimum age must be 0 or greater'),
  ageRangeMax: z.coerce.number().min(0, 'Maximum age must be 0 or greater'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  ratioRequired: z.string().min(1, 'Ratio is required'),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

export function RoomsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: rooms, isLoading } = useRooms();
  const createRoom = useCreateRoom();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      ageRangeMin: 0,
      ageRangeMax: 12,
      capacity: 10,
      ratioRequired: '1:3',
    },
  });

  const onSubmit = async (data: CreateRoomForm) => {
    try {
      await createRoom.mutateAsync(data);
      toast.success('Room created successfully');
      setDialogOpen(false);
      reset();
    } catch {
      toast.error('Failed to create room');
    }
  };

  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Manage your nursery rooms and their settings"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              Add Room
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Room</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input id="room-name" {...register('name')} aria-invalid={!!errors.name} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-ageMin">Min Age (months)</Label>
                    <Input id="room-ageMin" type="number" min={0} {...register('ageRangeMin')} aria-invalid={!!errors.ageRangeMin} />
                    {errors.ageRangeMin && <p className="text-xs text-destructive">{errors.ageRangeMin.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-ageMax">Max Age (months)</Label>
                    <Input id="room-ageMax" type="number" min={0} {...register('ageRangeMax')} aria-invalid={!!errors.ageRangeMax} />
                    {errors.ageRangeMax && <p className="text-xs text-destructive">{errors.ageRangeMax.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-capacity">Capacity</Label>
                    <Input id="room-capacity" type="number" min={1} {...register('capacity')} aria-invalid={!!errors.capacity} />
                    {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-ratio">Ratio Required</Label>
                    <Input id="room-ratio" placeholder="e.g. 1:3" {...register('ratioRequired')} aria-invalid={!!errors.ratioRequired} />
                    {errors.ratioRequired && <p className="text-xs text-destructive">{errors.ratioRequired.message}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Room'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : rooms?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-lg font-medium">No rooms yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first room to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms?.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle className="text-lg">{room.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Age Range</span>
                    <span>{room.ageRangeMin} – {room.ageRangeMax} months</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="size-3.5" />
                      Capacity
                    </span>
                    <span>{room.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ratio Required</span>
                    <span>{room.ratioRequired}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Baby className="size-3.5" />
                      Children
                    </span>
                    <span className="font-medium">{room.currentCount ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
