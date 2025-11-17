// src/lib/hooks/students.ts
import { useQuery, useMutation, useQueryClient,keepPreviousData } from '@tanstack/react-query';
import client from '@/lib/client';
import type {
  CreateStudentPayload,
  UpdateStudentPayload,
  ListParams,
} from '@/lib/types';
import type { InferClientReturn } from '@/lib/utils';
import { qkey } from '@/lib/utils';

export function useStudents(params?: ListParams) {
  type T = InferClientReturn<typeof client.listStudents>;
  return useQuery<T>({
    queryKey: qkey('students', params),
    queryFn: () => client.listStudents(params),
    placeholderData:keepPreviousData,
  });
}

export function useStudent(id?: string) {
  type T = InferClientReturn<typeof client.getStudent> | null;
  return useQuery<T>({
    queryKey: ['student', id],
    queryFn: () => (id ? client.getStudent(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => client.createStudent(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentPayload }) =>
      client.updateStudent(id, payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', vars.id] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteStudent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}
