// src/lib/hooks/auth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import type { LoginPayload, SignupPayload, User } from '@/lib/types';
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

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => client.updateUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: LoginPayload) => client.login(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: SignupPayload) => client.signup(p),
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
