// src/lib/hooks/classlogs.ts
import { useQuery, useMutation, useQueryClient,keepPreviousData } from '@tanstack/react-query';
import client from '@/lib/client';
import type { CreateClassLogPayload, UpdateClassLogPayload, ListParams } from '@/lib/types';
import type { InferClientReturn } from '@/lib/utils';
import { qkey } from '@/lib/utils';

export function useClassLogs(params?: ListParams) {
  type T = InferClientReturn<typeof client.listClassLogs>;
  return useQuery<T>({
    queryKey: qkey('classlogs', params),
    queryFn: () => client.listClassLogs(params),
    placeholderData:keepPreviousData,
  });
}

export function useClassLog(id?: string) {
  type T = InferClientReturn<typeof client.getClassLog> | null;
  return useQuery<T>({
    queryKey: ['classlog', id],
    queryFn: () => (id ? client.getClassLog(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useCreateClassLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassLogPayload) => client.createClassLog(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classlogs'] }),
  });
}

export function useUpdateClassLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassLogPayload }) =>
      client.updateClassLog(id, payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['classlogs'] });
      qc.invalidateQueries({ queryKey: ['classlog', vars.id] });
    },
  });
}

export function useDeleteClassLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteClassLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classlogs'] }),
  });
}
