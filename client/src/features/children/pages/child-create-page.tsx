import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateChild } from '@/features/children/hooks/use-children';
import { useRooms } from '@/features/rooms/hooks/use-rooms';

const createChildSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Gender is required',
  }),
  roomId: z.string().optional(),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
});

type CreateChildForm = z.infer<typeof createChildSchema>;

export function ChildCreatePage() {
  const navigate = useNavigate();
  const createChild = useCreateChild();
  const { data: rooms } = useRooms();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateChildForm>({
    resolver: zodResolver(createChildSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      preferredName: '',
      dateOfBirth: '',
      gender: undefined,
      roomId: undefined,
      enrollmentDate: '',
    },
  });

  const genderValue = watch('gender');
  const roomIdValue = watch('roomId');

  const onSubmit = async (data: CreateChildForm) => {
    try {
      const child = await createChild.mutateAsync({
        ...data,
        preferredName: data.preferredName || undefined,
        roomId: data.roomId || undefined,
      });
      toast.success('Child created successfully');
      void navigate(`/children/${child.id}`);
    } catch {
      toast.error('Failed to create child. Please try again.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Child"
        description="Register a new child at your nursery"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name (optional)</Label>
              <Input
                id="preferredName"
                {...register('preferredName')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  aria-invalid={!!errors.dateOfBirth}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={genderValue ?? ''}
                  onValueChange={(val) => setValue('gender', val as CreateChildForm['gender'], { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.gender}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-destructive">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room</Label>
                <Select
                  value={roomIdValue ?? ''}
                  onValueChange={(val) => setValue('roomId', val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms?.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  {...register('enrollmentDate')}
                  aria-invalid={!!errors.enrollmentDate}
                />
                {errors.enrollmentDate && (
                  <p className="text-xs text-destructive">{errors.enrollmentDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Child'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate('/children')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
