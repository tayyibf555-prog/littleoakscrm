import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Send, XCircle, PoundSterling } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
  useInvoice,
  useSendInvoice,
  useVoidInvoice,
  useRecordPayment,
} from '@/features/invoicing/hooks/use-invoicing';
import type { InvoiceStatus } from '@/types/invoicing';

const statusVariant: Record<InvoiceStatus, 'outline' | 'secondary' | 'default' | 'destructive'> = {
  DRAFT: 'outline',
  SENT: 'secondary',
  PAID: 'default',
  PARTIAL: 'secondary',
  OVERDUE: 'destructive',
  VOID: 'outline',
};

function formatCurrency(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoice(id!);
  const sendInvoice = useSendInvoice();
  const voidInvoice = useVoidInvoice();
  const recordPayment = useRecordPayment();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const handleSend = async () => {
    try {
      await sendInvoice.mutateAsync(id!);
      toast.success('Invoice sent');
    } catch {
      toast.error('Failed to send invoice');
    }
  };

  const handleVoid = async () => {
    try {
      await voidInvoice.mutateAsync(id!);
      toast.success('Invoice voided');
    } catch {
      toast.error('Failed to void invoice');
    }
  };

  const handleRecordPayment = async () => {
    const amount = Math.round(parseFloat(paymentAmount) * 100);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    try {
      await recordPayment.mutateAsync({
        invoiceId: id!,
        data: {
          amount,
          paymentMethod,
          reference: paymentReference || undefined,
          paidDate: paymentDate,
        },
      });
      toast.success('Payment recorded');
      setPaymentDialogOpen(false);
      setPaymentAmount('');
      setPaymentReference('');
    } catch {
      toast.error('Failed to record payment');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!invoice) {
    return <p className="text-muted-foreground">Invoice not found.</p>;
  }

  const outstanding = invoice.total - invoice.paidAmount;

  return (
    <div>
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description={`${invoice.child?.firstName} ${invoice.child?.lastName} — ${invoice.parent?.firstName} ${invoice.parent?.lastName}`}
        action={
          <div className="flex gap-2">
            {invoice.status === 'DRAFT' && (
              <Button onClick={handleSend} disabled={sendInvoice.isPending}>
                <Send className="size-4" />
                {sendInvoice.isPending ? 'Sending...' : 'Send Invoice'}
              </Button>
            )}
            {invoice.status !== 'VOID' && invoice.status !== 'PAID' && (
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger render={<Button variant="outline" />}>
                  <PoundSterling className="size-4" />
                  Record Payment
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (£)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={`Outstanding: ${formatCurrency(outstanding)}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? '')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="CHILDCARE_VOUCHER">Childcare Voucher</SelectItem>
                          <SelectItem value="TAX_FREE_CHILDCARE">Tax-Free Childcare</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reference</Label>
                      <Input
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Optional reference"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleRecordPayment} disabled={recordPayment.isPending}>
                      {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {invoice.status !== 'VOID' && invoice.status !== 'PAID' && (
              <Button variant="ghost" onClick={handleVoid} disabled={voidInvoice.isPending}>
                <XCircle className="size-4 text-destructive" />
              </Button>
            )}
            <Link to="/invoices">
              <Button variant="outline">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Period</p>
                  <p>{format(parseISO(invoice.periodStart), 'dd MMM')} - {format(parseISO(invoice.periodEnd), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p>{format(parseISO(invoice.dueDate), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issued</p>
                  <p>{format(parseISO(invoice.createdAt), 'dd MMM yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.fundedHoursDeduction > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Funded Hours Deduction</span>
                    <span>-{formatCurrency(invoice.fundedHoursDeduction)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid</span>
                  <span>{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Outstanding</span>
                  <span className={outstanding > 0 ? 'text-destructive' : 'text-green-600'}>
                    {formatCurrency(outstanding)}
                  </span>
                </div>
              </div>

              {invoice.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment history */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {(!invoice.payments || invoice.payments.length === 0) ? (
                <p className="text-sm text-muted-foreground">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{formatCurrency(payment.amount)}</span>
                        <Badge variant="outline">{payment.paymentMethod.replace('_', ' ')}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(parseISO(payment.paidDate), 'dd MMM yyyy')}
                        {payment.reference && <> &middot; Ref: {payment.reference}</>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
