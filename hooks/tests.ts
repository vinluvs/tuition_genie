// src/lib/hooks/tests.ts
import { useQuery, useMutation, useQueryClient,keepPreviousData } from '@tanstack/react-query';
import client from '@/lib/client';
import type { CreateTestPayload, UpdateTestPayload, ListParams } from '@/lib/types';
import type { InferClientReturn } from '@/lib/utils';
import { qkey } from '@/lib/utils';

export function useTests(params?: ListParams) {
  type T = InferClientReturn<typeof client.listTests>;
  return useQuery<T>({
    queryKey: qkey('tests', params),
    queryFn: () => client.listTests(params),
    placeholderData:keepPreviousData,
  });
}

export function useTest(id?: string) {
  type T = InferClientReturn<typeof client.getTest> | null;
  return useQuery<T>({
    queryKey: ['test', id],
    queryFn: () => (id ? client.getTest(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useCreateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTestPayload) => client.createTest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

export function useUpdateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTestPayload }) => client.updateTest(id, payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      qc.invalidateQueries({ queryKey: ['test', vars.id] });
    },
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteTest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

export function useStudentTestScores(studentId?: string) {
  type T = InferClientReturn<typeof client.getStudentTestScores> | [];
  return useQuery<T>({
    queryKey: ['studentTestScores', studentId],
    queryFn: () => (studentId ? client.getStudentTestScores(studentId) : Promise.resolve([])),
    enabled: Boolean(studentId),
  });
}
