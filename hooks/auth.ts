// src/lib/hooks/auth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import type { LoginPayload } from '@/lib/types';
import type { InferClientReturn } from '@/lib/utils';
import { qkey } from '@/lib/utils';

export function useMe() {
  type MeT = InferClientReturn<typeof client.me>;
  return useQuery<MeT>({
    queryKey: ['me'],
    queryFn: () => client.me(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: LoginPayload) => client.login(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    client.logout();
    qc.clear();
  };
}
