import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicingApi } from '@/api/invoicing';
import type {
  ListInvoicesParams,
  CreateFeeScheduleData,
  UpdateFeeScheduleData,
  UpsertFundedHoursData,
  CreateInvoiceData,
  RecordPaymentData,
} from '@/api/invoicing';

// ---- Fee Schedules ----

export function useFeeSchedules() {
  return useQuery({
    queryKey: ['fee-schedules'],
    queryFn: () => invoicingApi.listFeeSchedules().then((res) => res.data),
  });
}

export function useCreateFeeSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeeScheduleData) =>
      invoicingApi.createFeeSchedule(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['fee-schedules'] });
    },
  });
}

export function useUpdateFeeSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeeScheduleData }) =>
      invoicingApi.updateFeeSchedule(id, data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['fee-schedules'] });
    },
  });
}

// ---- Funded Hours ----

export function useFundedHoursList() {
  return useQuery({
    queryKey: ['funded-hours'],
    queryFn: () => invoicingApi.listFundedHours().then((res) => res.data),
  });
}

export function useFundedHours(childId: string) {
  return useQuery({
    queryKey: ['funded-hours', childId],
    queryFn: () => invoicingApi.getFundedHours(childId).then((res) => res.data),
    enabled: !!childId,
  });
}

export function useUpsertFundedHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, data }: { childId: string; data: UpsertFundedHoursData }) =>
      invoicingApi.upsertFundedHours(childId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['funded-hours'] });
      void queryClient.invalidateQueries({ queryKey: ['funded-hours', variables.childId] });
    },
  });
}

// ---- Invoices ----

export function useInvoices(params?: ListInvoicesParams) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicingApi.listInvoices(params).then((res) => res.data),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicingApi.getInvoice(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceData) =>
      invoicingApi.createInvoice(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      invoicingApi.voidInvoice(id).then((res) => res.data),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
      void queryClient.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      invoicingApi.sendInvoice(id).then((res) => res.data),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
      void queryClient.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: RecordPaymentData }) =>
      invoicingApi.recordPayment(invoiceId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
      void queryClient.invalidateQueries({ queryKey: ['invoices', variables.invoiceId] });
    },
  });
}
