// src/lib/hooks/expenses.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from '@/lib/client';
import type { CreateExpensePayload, ExpenseModel } from '@/lib/types';
import type { InferClientReturn } from '@/lib/utils';
import { qkey } from '@/lib/utils';

export function useExpenses(params?: Record<string, any>) {
  type T = ExpenseModel[];
  return useQuery<T>({
    queryKey: qkey('expenses', params),
    queryFn: () => client.listExpenses(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation<ExpenseModel, unknown, CreateExpensePayload>({
    mutationFn: (payload: CreateExpensePayload) => client.createExpense(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation<ExpenseModel, unknown, { id: string; payload: Partial<CreateExpensePayload> }>({
    mutationFn: ({ id, payload }) => client.updateExpense(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: (id: string) => client.deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
