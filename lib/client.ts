// lib/client.ts
// Type-safe, CORS-friendly frontend client for your Next.js app.
// JSON bodies are stringified; FormData is passed through unchanged.

export type ID = string;

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const USE_CREDENTIALS = (process.env.NEXT_PUBLIC_USE_CREDENTIALS ?? 'true') === 'true';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('token'); } catch { return null; }
}

async function parseResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  const ct = res.headers.get('content-type') ?? '';
  const body = ct.includes('application/json') ? (text ? JSON.parse(text) : undefined) : text;
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || text || res.statusText;
    const err: any = new Error(String(msg));
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body as T;
}

type ReqOpts = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean; 
};

async function request<T = any>(path: string, opts: ReqOpts = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const method = (opts.method || 'GET').toUpperCase();
  const headers: Record<string, string> = { ...(opts.headers || {}) };

  let body: BodyInit | undefined = undefined;
  if (opts.body !== undefined && opts.body !== null) {
    // Keep FormData untouched (for file uploads)
    if (typeof FormData !== 'undefined' && opts.body instanceof FormData) {
      body = opts.body;
      // do not set Content-Type header; browser sets multipart/form-data boundary
    } else {
      // For regular objects/values: stringify to JSON
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      body = JSON.stringify(opts.body);
    }
  }

  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    body,
    mode: 'cors',
    credentials: USE_CREDENTIALS ? 'include' : 'omit'
  };

  const res = await fetch(url, fetchOptions);
  return parseResponse<T>(res);
}

/* ---------- clients ---------- */

export const authClient = {
  login: (email: string, password: string) =>
    request<{ token: string; name?: string }>('/api/auth/login', { method: 'POST', body: { email, password } }),
  signup: (payload: { name: string; centerName?: string; email: string; password: string }) =>
    request<{ token: string; name?: string }>('/api/auth/signup', { method: 'POST', body: payload }),
  saveToken: (token: string) => { if (typeof window !== 'undefined') localStorage.setItem('token', token); },
  logout: () => { if (typeof window !== 'undefined') localStorage.removeItem('token'); }
};

export const classesClient = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/classes${qs}`);
  },
  get: (id: ID) => request<any>(`/api/classes/${id}`),
  create: (payload: any) => request<any>('/api/classes', { method: 'POST', body: payload }),
  update: (id: ID, payload: any) => request<any>(`/api/classes/${id}`, { method: 'PATCH', body: payload }),
  remove: (id: ID) => request<void>(`/api/classes/${id}`, { method: 'DELETE' })
};

export const studentsClient = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/api/students${qs}`);
  },
  get: (id: ID) => request<any>(`/api/students/${id}`),
  create: (payload: any) => request<any>('/api/students', { method: 'POST', body: payload }),
  update: (id: ID, payload: any) => request<any>(`/api/students/${id}`, { method: 'PATCH', body: payload }),
  delete: (id: ID) => request<void>(`/api/students/${id}`, { method: 'DELETE' })
};


export const testsClient = {
  create: (payload: any) => request('/api/tests', { method: 'POST', body: payload }),
  byClass: (classId: ID) => request<any[]>(`/api/tests/by-class/${classId}`),
  byStudent: (studentId: ID) => request<any[]>(`/api/tests/by-student/${studentId}`)
};

export const feesClient = {
  generate: (payload: any) => request('/api/fees/generate', { method: 'POST', body: payload }),
  pay: (payload: any) => request('/api/fees/pay', { method: 'POST', body: payload }),
  dues: (month?: string) => request<any[]>(`/api/fees/dues${month ? '?month=' + encodeURIComponent(month) : ''}`),
  studentFees: (studentId: ID) => request<any[]>(`/api/fees/student/${studentId}`),
  recentPayments: (limit: number = 10) => request<any[]>(`/api/fees/payments/recent?limit=${limit}`),
  allPayments: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/fees/payments/all${qs}`);
  }
};

export const classLogsClient = {
  create: (payload: any) => request('/api/classlogs', { method: 'POST', body: payload }),
  byClass: (classId: ID) => request<any[]>(`/api/classlogs/by-class/${classId}`)
};


export default {
  request,
  authClient,
  classesClient,
  studentsClient,
  feesClient,
  testsClient
};
