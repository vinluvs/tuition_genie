
// src/lib/client.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Typed frontend client for your backend routes.
 * Assumes API returns:
 *  - POST /auth/login  -> { token, user }
 *  - POST /auth/signup -> { token, user }
 *  - GET  /auth/me     -> { user }
 *  - List endpoints    -> { items, total }
 *
 * Usage:
 *  import client from 'src/lib/client';
 *  await client.login(email, pass);
 *  const classes = await client.listClasses({ page:1, limit:20 });
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '/api';

import type {
  ID,
  ApiList,
  ApiError,
  User,
  LoginPayload,
  LoginResponse,
  SignupPayload,
  ClassModel,
  CreateClassPayload,
  UpdateClassPayload,
  StudentModel,
  CreateStudentPayload,
  UpdateStudentPayload,
  FeeModel,
  GenerateFeePayload,
  UpdateFeePayload,
  ClassLogModel,
  CreateClassLogPayload,
  UpdateClassLogPayload,
  TestScoreModel,
  CreateTestPayload,
  UpdateTestPayload,
  StudentTestScoreSummary,
  ListParams
} from './types';

type Json = any;

function buildQuery(params?: Record<string, any>) {
  if (!params) return '';
  const qp = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      if (Array.isArray(v)) return v.map(x => `${encodeURIComponent(k)}=${encodeURIComponent(String(x))}`).join('&');
      return `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
    })
    .join('&');
  return qp ? `?${qp}` : '';
}

/* Token helpers */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

/* Response parser / error normalizer */
async function parseResponse(res: Response) {
  const text = await res.text();
  let body: any;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const err: ApiError = (body && typeof body === 'object') ? { status: res.status, ...body } : { status: res.status, error: body || res.statusText };
    throw err;
  }
  return body;
}

/* Low-level fetch helper that attaches token */
async function apiFetch(path: string, opts: RequestInit = {}) {
  const incoming = opts.headers as HeadersInit | undefined;
  const headers = new Headers(incoming);

  if (!headers.has('Content-Type') && opts.body && typeof opts.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const fetchOpts: RequestInit = { ...opts, headers };
  const response = await fetch(`${API_BASE}${path}`, fetchOpts);
  return parseResponse(response);
}

/* ---------- client methods ---------- */
export const client = {
  /* Auth */
  async login(loginpayload: LoginPayload): Promise<LoginResponse> {
    const body = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(loginpayload) });
    // backend returns { token, user }
    if (body.token) setToken(body.token);
    return body as LoginResponse;
  },

  async signup(payload: SignupPayload): Promise<LoginResponse> {
    const body = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
    if (body.token) setToken(body.token);
    return body as LoginResponse;
  },

  async me(): Promise<User> {
    // backend returns { user }
    const body = await apiFetch('/auth/me', { method: 'GET' });
    return (body && body.user) ? (body.user as User) : Promise.reject({ status: 500, error: 'Invalid /auth/me response' });
  },

  logout() { setToken(null); },

  /* Classes */
  async createClass(payload: CreateClassPayload): Promise<ClassModel> {
    return apiFetch('/classes', { method: 'POST', body: JSON.stringify(payload) }) as Promise<ClassModel>;
  },
  async listClasses(params?: ListParams): Promise<ApiList<ClassModel>> {
    const q = buildQuery(params);
    return apiFetch(`/classes${q}`, { method: 'GET' }) as Promise<ApiList<ClassModel>>;
  },
  async getClass(id: ID): Promise<ClassModel> {
    return apiFetch(`/classes/${id}`, { method: 'GET' }) as Promise<ClassModel>;
  },
  async updateClass(id: ID, payload: UpdateClassPayload): Promise<ClassModel> {
    return apiFetch(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) as Promise<ClassModel>;
  },
  async deleteClass(id: ID): Promise<void> {
    await apiFetch(`/classes/${id}`, { method: 'DELETE' });
  },

  /* Students */
  async createStudent(payload: CreateStudentPayload): Promise<StudentModel> {
    return apiFetch('/students', { method: 'POST', body: JSON.stringify(payload) }) as Promise<StudentModel>;
  },
  async listStudents(params?: ListParams): Promise<ApiList<StudentModel>> {
    const q = buildQuery(params);
    return apiFetch(`/students${q}`, { method: 'GET' }) as Promise<ApiList<StudentModel>>;
  },
  async getStudent(id: ID): Promise<StudentModel> {
    return apiFetch(`/students/${id}`, { method: 'GET' }) as Promise<StudentModel>;
  },
  async updateStudent(id: ID, payload: UpdateStudentPayload): Promise<StudentModel> {
    return apiFetch(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) as Promise<StudentModel>;
  },
  async deleteStudent(id: ID): Promise<void> {
    await apiFetch(`/students/${id}`, { method: 'DELETE' });
  },

  /* Fees */
  async listFees(params?: ListParams): Promise<ApiList<FeeModel>> {
    const q = buildQuery(params);
    return apiFetch(`/fees${q}`, { method: 'GET' }) as Promise<ApiList<FeeModel>>;
  },
  async generateFee(payload: GenerateFeePayload): Promise<FeeModel> {
    return apiFetch('/fees/generate', { method: 'POST', body: JSON.stringify(payload) }) as Promise<FeeModel>;
  },
  async updateFee(id: ID, payload: UpdateFeePayload): Promise<FeeModel> {
    return apiFetch(`/fees/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) as Promise<FeeModel>;
  },
  async deleteFee(id: ID): Promise<void> {
    await apiFetch(`/fees/${id}`, { method: 'DELETE' });
  },

  /* ClassLogs */
  async createClassLog(payload: CreateClassLogPayload): Promise<ClassLogModel> {
    return apiFetch('/classlogs', { method: 'POST', body: JSON.stringify(payload) }) as Promise<ClassLogModel>;
  },
  async listClassLogs(params?: ListParams): Promise<ApiList<ClassLogModel>> {
    const q = buildQuery(params);
    return apiFetch(`/classlogs${q}`, { method: 'GET' }) as Promise<ApiList<ClassLogModel>>;
  },
  async getClassLog(id: ID): Promise<ClassLogModel> {
    return apiFetch(`/classlogs/${id}`, { method: 'GET' }) as Promise<ClassLogModel>;
  },
  async updateClassLog(id: ID, payload: UpdateClassLogPayload): Promise<ClassLogModel> {
    return apiFetch(`/classlogs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) as Promise<ClassLogModel>;
  },
  async deleteClassLog(id: ID): Promise<void> {
    await apiFetch(`/classlogs/${id}`, { method: 'DELETE' });
  },

  /* Tests */
  async listTests(params?: ListParams): Promise<ApiList<TestScoreModel>> {
    const q = buildQuery(params);
    return apiFetch(`/tests${q}`, { method: 'GET' }) as Promise<ApiList<TestScoreModel>>;
  },
  async createTest(payload: CreateTestPayload): Promise<TestScoreModel> {
    return apiFetch('/tests', { method: 'POST', body: JSON.stringify(payload) }) as Promise<TestScoreModel>;
  },
  async getTest(id: ID): Promise<TestScoreModel> {
    return apiFetch(`/tests/${id}`, { method: 'GET' }) as Promise<TestScoreModel>;
  },
  async updateTest(id: ID, payload: UpdateTestPayload): Promise<TestScoreModel> {
    return apiFetch(`/tests/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) as Promise<TestScoreModel>;
  },
  async deleteTest(id: ID): Promise<void> {
    await apiFetch(`/tests/${id}`, { method: 'DELETE' });
  },
  async getStudentTestScores(studentId: ID): Promise<StudentTestScoreSummary[]> {
    return apiFetch(`/tests/student/${studentId}`, { method: 'GET' }) as Promise<StudentTestScoreSummary[]>;
  },

  /* token utils */
  getToken,
  setToken,
};

export default client;
