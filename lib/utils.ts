import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { QueryKey } from '@tanstack/react-query';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* Infer the awaited return type of a client function */
export type InferClientReturn<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

/* Simple query key helper that keeps keys stable */
export const qkey = (ns: string, params?: Record<string, any>): QueryKey =>
  params ? [ns, params] : [ns];