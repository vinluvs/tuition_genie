// src/lib/hooks/fees.ts
import { useQuery, useMutation, useQueryClient,keepPreviousData } from '@tanstack/react-query';
import client from '@/lib/client';
import type { GenerateFeePayload, UpdateFeePayload, ListParams } from '@/lib/types';
import type { InferClientReturn } from '@/lib/utils';
import { qkey } from '@/lib//utils';
import type { ID } from '@/lib/types';

export function useFees(params?: ListParams) {
  type T = InferClientReturn<typeof client.listFees>;
  return useQuery<T>({
    queryKey: qkey('fees', params),
    queryFn: () => client.listFees(params),
    placeholderData:keepPreviousData,
  });
}

export function useGenerateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateFeePayload) => client.generateFee(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees'] }),
  });
}

/**
 * useBulkGenerateFees
 * payload: { classId: ID; month: string }  -> backend: POST /fees/bulk-generate
 *
 * On success we invalidate ['fees'] so lists refresh automatically.
 */
export function useBulkGenerateFees() {
  const qc = useQueryClient();

  return useMutation<
    any,               // TData  - backend response shape (you returned Promise<any>)
    unknown,           // TError - keep generic unless you have ApiError type
    { classId: ID; month: string } // TVariables
  >({
    mutationFn: (payload) => client.bulkGenerateFees(payload),
    onSuccess: () => {
      // refresh fees list after successful bulk generation
      qc.invalidateQueries({ queryKey: ['fees'] });
    },
  });
}

export function useUpdateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFeePayload }) =>
      client.updateFee(id, payload),
    onSuccess: (_res, vars) => qc.invalidateQueries({ queryKey: ['fees'] }),
  });
}

export function useDeleteFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteFee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees'] }),
  });
}
