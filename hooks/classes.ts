// src/lib/hooks/classes.ts
import { useQuery, useMutation, useQueryClient,keepPreviousData } from '@tanstack/react-query';
import client from '@/lib/client';
import type {
  CreateClassPayload,
  UpdateClassPayload,
  ListParams,
} from '@/lib/types';
import type { InferClientReturn } from '@/lib/utils';
import { qkey } from '@/lib/utils';

export function useClasses(params?: ListParams) {
  type T = InferClientReturn<typeof client.listClasses>;
  return useQuery<T>({
    queryKey: qkey('classes', params),
    queryFn: () => client.listClasses(params),
    placeholderData:keepPreviousData,
  });
}

export function useClass(id?: string) {
  type T = InferClientReturn<typeof client.getClass> | null;
  return useQuery<T>({
    queryKey: ['class', id],
    queryFn: () => (id ? client.getClass(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassPayload) => client.createClass(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassPayload }) =>
      client.updateClass(id, payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['classes'] });
      qc.invalidateQueries({ queryKey: ['class', vars.id] });
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteClass(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}
