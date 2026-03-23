import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateInvoice, useFeeSchedules } from '@/features/invoicing/hooks/use-invoicing';
import { childrenApi } from '@/api/children';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: string;
  feeScheduleId?: string;
}

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const { data: feeSchedules } = useFeeSchedules();
  const { data: children } = useQuery({
    queryKey: ['children', { status: 'ACTIVE' }],
    queryFn: () => childrenApi.list({ status: 'ACTIVE' }).then((r) => r.data),
  });

  const [parentId, setParentId] = useState('');
  const [childId, setChildId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: '' },
  ]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addFeeScheduleItem = (scheduleId: string) => {
    const schedule = feeSchedules?.find((s) => s.id === scheduleId);
    if (!schedule) return;
    setItems([
      ...items,
      {
        description: `${schedule.name} (${schedule.sessionType})`,
        quantity: 1,
        unitPrice: (schedule.ratePerSession / 100).toFixed(2),
        feeScheduleId: schedule.id,
      },
    ]);
  };

  const totalPence = items.reduce((sum, item) => {
    const price = Math.round(parseFloat(item.unitPrice || '0') * 100);
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = async () => {
    if (!parentId || !childId || !periodStart || !periodEnd || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (items.length === 0 || items.every((i) => !i.description)) {
      toast.error('Add at least one line item');
      return;
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        parentId,
        childId,
        periodStart,
        periodEnd,
        dueDate,
        notes: notes || undefined,
        items: items
          .filter((i) => i.description.trim())
          .map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: Math.round(parseFloat(i.unitPrice || '0') * 100),
            feeScheduleId: i.feeScheduleId,
          })),
      });
      toast.success('Invoice created');
      void navigate(`/invoices/${invoice.id}`);
    } catch {
      toast.error('Failed to create invoice');
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Invoice"
        description="Generate a new invoice for a parent"
      />

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent ID</Label>
                <Input
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  placeholder="Parent ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Child</Label>
                <Select value={childId} onValueChange={setChildId}>
                  <SelectTrigger><SelectValue placeholder="Select child" /></SelectTrigger>
                  <SelectContent>
                    {children?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Period Start</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Period End</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              {feeSchedules && feeSchedules.length > 0 && (
                <Select onValueChange={addFeeScheduleItem}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add from schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeSchedules.filter((s) => s.isActive).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — £{(s.ratePerSession / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  {index === 0 && <Label className="text-xs">Description</Label>}
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="w-20 space-y-1">
                  {index === 0 && <Label className="text-xs">Qty</Label>}
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-28 space-y-1">
                  {index === 0 && <Label className="text-xs">Unit Price (£)</Label>}
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="w-24 text-right text-sm font-medium pb-2">
                  £{((parseFloat(item.unitPrice || '0') * item.quantity)).toFixed(2)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="pb-2"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="size-4" />
              Add Item
            </Button>

            <Separator />

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>£{(totalPence / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for the invoice..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={createInvoice.isPending}>
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
          <Button variant="outline" onClick={() => void navigate('/invoices')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
