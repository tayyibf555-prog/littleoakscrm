import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Plus, Trash2, Phone, Mail } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useChild,
  useUpdateChild,
  useUpdateMedical,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useUpdateConsents,
} from '@/features/children/hooks/use-children';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { ConsentType } from '@/types/child';
import type { ChildStatus, EmergencyContact, MedicalInfo } from '@/types/child';

// --- Profile Edit Schema ---
const editProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  roomId: z.string().optional(),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  status: z.enum(['ACTIVE', 'LEFT', 'WAITLIST']),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

// --- Medical Edit Schema ---
const editMedicalSchema = z.object({
  allergies: z.string().optional(),
  dietaryNeeds: z.string().optional(),
  medicalConditions: z.string().optional(),
  gpName: z.string().optional(),
  gpPhone: z.string().optional(),
  gpAddress: z.string().optional(),
  healthNotes: z.string().optional(),
});

type EditMedicalForm = z.infer<typeof editMedicalSchema>;

// --- Contact Schema ---
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  priority: z.coerce.number().min(1).max(10),
  authorisedPickup: z.boolean(),
});

type ContactForm = z.infer<typeof contactSchema>;

// --- Status helpers ---
const statusVariant: Record<ChildStatus, 'default' | 'secondary' | 'outline'> = {
  ACTIVE: 'default',
  LEFT: 'secondary',
  WAITLIST: 'outline',
};

const statusLabel: Record<ChildStatus, string> = {
  ACTIVE: 'Active',
  LEFT: 'Left',
  WAITLIST: 'Waitlist',
};

const consentLabels: Record<string, string> = {
  PHOTO: 'Photography',
  VIDEO: 'Video Recording',
  OUTINGS: 'Outings & Trips',
  SUNSCREEN: 'Sunscreen Application',
  MEDICATION: 'Medication Administration',
  FACE_PAINTING: 'Face Painting',
  SOCIAL_MEDIA: 'Social Media',
};

// ===== MAIN PAGE =====
export function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: child, isLoading } = useChild(id!);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!child) {
    return (
      <div>
        <PageHeader title="Child Not Found" />
        <p className="text-muted-foreground">The child you are looking for does not exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => void navigate('/children')}>
          Back to Children
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => void navigate('/children')}>
          <ArrowLeft className="size-4" />
          Back to Children
        </Button>
      </div>

      <PageHeader
        title={`${child.firstName} ${child.lastName}`}
        description={child.preferredName ? `Preferred name: ${child.preferredName}` : undefined}
        action={<Badge variant={statusVariant[child.status]}>{statusLabel[child.status]}</Badge>}
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="consents">Consents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab child={child} />
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <MedicalTab childId={child.id} medical={child.medicalInfo} />
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <ContactsTab childId={child.id} contacts={child.emergencyContacts} />
        </TabsContent>

        <TabsContent value="consents" className="mt-4">
          <ConsentsTab childId={child.id} consents={child.consents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== PROFILE TAB =====
function ProfileTab({ child }: { child: NonNullable<ReturnType<typeof useChild>['data']> }) {
  const [editing, setEditing] = useState(false);
  const updateChild = useUpdateChild();
  const { data: rooms } = useRooms();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: child.firstName,
      lastName: child.lastName,
      preferredName: child.preferredName ?? '',
      dateOfBirth: child.dateOfBirth.split('T')[0],
      gender: child.gender,
      roomId: child.roomId ?? undefined,
      enrollmentDate: child.enrollmentDate.split('T')[0],
      status: child.status,
    },
  });

  const genderValue = watch('gender');
  const roomIdValue = watch('roomId');
  const statusValue = watch('status');

  const onSubmit = async (data: EditProfileForm) => {
    try {
      await updateChild.mutateAsync({
        id: child.id,
        data: {
          ...data,
          preferredName: data.preferredName || undefined,
          roomId: data.roomId || undefined,
        },
      });
      toast.success('Child updated successfully');
      setEditing(false);
    } catch {
      toast.error('Failed to update child');
    }
  };

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input id="edit-firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input id="edit-lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-preferredName">Preferred Name</Label>
              <Input id="edit-preferredName" {...register('preferredName')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dob">Date of Birth</Label>
                <Input id="edit-dob" type="date" {...register('dateOfBirth')} aria-invalid={!!errors.dateOfBirth} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={genderValue} onValueChange={(val) => setValue('gender', val as EditProfileForm['gender'], { shouldValidate: true })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={roomIdValue ?? ''} onValueChange={(val) => setValue('roomId', val, { shouldValidate: true })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {rooms?.map((room) => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-enrollment">Enrollment Date</Label>
                <Input id="edit-enrollment" type="date" {...register('enrollmentDate')} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusValue} onValueChange={(val) => setValue('status', val as EditProfileForm['status'], { shouldValidate: true })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="LEFT">Left</SelectItem>
                    <SelectItem value="WAITLIST">Waitlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setEditing(false); }}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="First Name" value={child.firstName} />
          <InfoField label="Last Name" value={child.lastName} />
          <InfoField label="Preferred Name" value={child.preferredName ?? '—'} />
          <InfoField label="Date of Birth" value={format(parseISO(child.dateOfBirth), 'dd MMM yyyy')} />
          <InfoField label="Gender" value={child.gender} />
          <InfoField label="Room" value={child.room?.name ?? '—'} />
          <InfoField label="Enrollment Date" value={format(parseISO(child.enrollmentDate), 'dd MMM yyyy')} />
          <InfoField label="Status" value={statusLabel[child.status]} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

// ===== MEDICAL TAB =====
function MedicalTab({ childId, medical }: { childId: string; medical: MedicalInfo | null }) {
  const [editing, setEditing] = useState(false);
  const updateMedical = useUpdateMedical();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditMedicalForm>({
    resolver: zodResolver(editMedicalSchema),
    defaultValues: {
      allergies: medical?.allergies ?? '',
      dietaryNeeds: medical?.dietaryNeeds ?? '',
      medicalConditions: medical?.medicalConditions ?? '',
      gpName: medical?.gpName ?? '',
      gpPhone: medical?.gpPhone ?? '',
      gpAddress: medical?.gpAddress ?? '',
      healthNotes: medical?.healthNotes ?? '',
    },
  });

  const onSubmit = async (data: EditMedicalForm) => {
    try {
      await updateMedical.mutateAsync({ childId, data });
      toast.success('Medical information updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update medical information');
    }
  };

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea id="allergies" {...register('allergies')} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryNeeds">Dietary Needs</Label>
              <Textarea id="dietaryNeeds" {...register('dietaryNeeds')} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea id="medicalConditions" {...register('medicalConditions')} rows={3} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gpName">GP Name</Label>
                <Input id="gpName" {...register('gpName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpPhone">GP Phone</Label>
                <Input id="gpPhone" {...register('gpPhone')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpAddress">GP Address</Label>
              <Input id="gpAddress" {...register('gpAddress')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthNotes">Health Notes</Label>
              <Textarea id="healthNotes" {...register('healthNotes')} rows={3} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setEditing(false); }}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medical Information</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <InfoField label="Allergies" value={medical?.allergies ?? 'None recorded'} />
          <InfoField label="Dietary Needs" value={medical?.dietaryNeeds ?? 'None recorded'} />
          <InfoField label="Medical Conditions" value={medical?.medicalConditions ?? 'None recorded'} />
          <Separator />
          <div className="grid grid-cols-2 gap-6">
            <InfoField label="GP Name" value={medical?.gpName ?? '—'} />
            <InfoField label="GP Phone" value={medical?.gpPhone ?? '—'} />
          </div>
          <InfoField label="GP Address" value={medical?.gpAddress ?? '—'} />
          <InfoField label="Health Notes" value={medical?.healthNotes ?? 'None'} />
        </div>
      </CardContent>
    </Card>
  );
}

// ===== CONTACTS TAB =====
function ContactsTab({ childId, contacts }: { childId: string; contacts: EmergencyContact[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      relationship: '',
      phone: '',
      email: '',
      priority: 1,
      authorisedPickup: false,
    },
  });

  const authorisedPickupValue = watch('authorisedPickup');

  const openCreate = () => {
    setEditingContact(null);
    reset({
      firstName: '',
      lastName: '',
      relationship: '',
      phone: '',
      email: '',
      priority: (contacts?.length ?? 0) + 1,
      authorisedPickup: false,
    });
    setDialogOpen(true);
  };

  const openEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    reset({
      firstName: contact.firstName,
      lastName: contact.lastName,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email ?? '',
      priority: contact.priority,
      authorisedPickup: contact.authorisedPickup,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ContactForm) => {
    try {
      if (editingContact) {
        await updateContact.mutateAsync({
          childId,
          contactId: editingContact.id,
          data: { ...data, email: data.email || undefined },
        });
        toast.success('Contact updated');
      } else {
        await createContact.mutateAsync({
          childId,
          data: { ...data, email: data.email || undefined },
        });
        toast.success('Contact added');
      }
      setDialogOpen(false);
      reset();
    } catch {
      toast.error('Failed to save contact');
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteContact.mutateAsync({ childId, contactId });
      toast.success('Contact removed');
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emergency Contacts</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" onClick={openCreate} />}>
            <Plus className="size-4" />
            Add Contact
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-firstName">First Name</Label>
                  <Input id="contact-firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-lastName">Last Name</Label>
                  <Input id="contact-lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-relationship">Relationship</Label>
                <Input id="contact-relationship" {...register('relationship')} aria-invalid={!!errors.relationship} />
                {errors.relationship && <p className="text-xs text-destructive">{errors.relationship.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input id="contact-phone" {...register('phone')} aria-invalid={!!errors.phone} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" {...register('email')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-priority">Priority</Label>
                  <Input id="contact-priority" type="number" min={1} max={10} {...register('priority')} />
                </div>
                <div className="flex items-end space-x-2 pb-0.5">
                  <input
                    id="contact-authorised"
                    type="checkbox"
                    checked={authorisedPickupValue}
                    onChange={(e) => setValue('authorisedPickup', e.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  <Label htmlFor="contact-authorised">Authorised Pickup</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingContact ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No emergency contacts added yet.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts
                  .sort((a, b) => a.priority - b.priority)
                  .map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </TableCell>
                      <TableCell>{contact.relationship}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3 text-muted-foreground" />
                          {contact.phone}
                        </span>
                      </TableCell>
                      <TableCell>{contact.priority}</TableCell>
                      <TableCell>
                        {contact.authorisedPickup ? (
                          <Badge variant="default">Authorised</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(contact)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => void handleDelete(contact.id)}>
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== CONSENTS TAB =====
function ConsentsTab({ childId, consents }: { childId: string; consents: import('@/types/child').Consent[] }) {
  const updateConsents = useUpdateConsents();

  const allConsentTypes = Object.values(ConsentType);
  const consentMap = new Map(consents.map((c) => [c.type, c]));

  const handleToggle = async (type: ConsentType, currentlyGranted: boolean) => {
    try {
      await updateConsents.mutateAsync({
        childId,
        data: [
          {
            type,
            granted: !currentlyGranted,
            grantedBy: !currentlyGranted ? 'Staff' : undefined,
          },
        ],
      });
      toast.success(`Consent ${!currentlyGranted ? 'granted' : 'revoked'}`);
    } catch {
      toast.error('Failed to update consent');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allConsentTypes.map((type) => {
            const consent = consentMap.get(type);
            const granted = consent?.granted ?? false;

            return (
              <div key={type} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{consentLabels[type] ?? type}</p>
                  {consent?.grantedBy && granted && (
                    <p className="text-xs text-muted-foreground">
                      Granted by: {consent.grantedBy}
                      {consent.grantedAt ? ` on ${format(parseISO(consent.grantedAt), 'dd MMM yyyy')}` : ''}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={granted}
                  onClick={() => void handleToggle(type, granted)}
                  disabled={updateConsents.isPending}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    granted ? 'bg-primary' : 'bg-input'
                  }`}
                >
                  <span
                    className={`pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      granted ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
