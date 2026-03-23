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

import { useCreateStaff } from '@/features/staff/hooks/use-staff';

const createStaffSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  dateOfBirth: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
});

type CreateStaffForm = z.infer<typeof createStaffSchema>;

export function StaffCreatePage() {
  const navigate = useNavigate();
  const createStaff = useCreateStaff();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffForm>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      department: '',
      dateOfBirth: '',
      startDate: '',
    },
  });

  const onSubmit = async (data: CreateStaffForm) => {
    try {
      const staff = await createStaff.mutateAsync({
        ...data,
        phone: data.phone || undefined,
        department: data.department || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
      });
      toast.success('Staff member created successfully');
      void navigate(`/staff/${staff.id}`);
    } catch {
      toast.error('Failed to create staff member. Please try again.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Staff Member"
        description="Register a new staff member at your nursery"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Staff Information</CardTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  {...register('jobTitle')}
                  aria-invalid={!!errors.jobTitle}
                />
                {errors.jobTitle && (
                  <p className="text-xs text-destructive">{errors.jobTitle.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department (optional)</Label>
                <Input
                  id="department"
                  {...register('department')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth (optional)</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  aria-invalid={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Staff Member'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate('/staff')}
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
