// src/lib/types.ts
// Frontend TypeScript types matching your standardized backend responses.

export type ID = string;

export type ApiList<T> = { items: T[]; total?: number };
export type ApiError = { status?: number; error?: string; [k: string]: any };

/* -----------------------
   User
   ----------------------- */
export type User = {
  _id: ID;
  name?: string;
  email: string;
  centerName?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = { token: string; user: User };
export type LoginPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; password: string; centerName?: string };

/* -----------------------
   Class
   ----------------------- */
export type ClassSchedule = {
  days?: string[]; // e.g. ["Mon","Wed"]
  startTime?: string; // "17:00"
  endTime?: string;   // "18:30"
  timezone?: string;  // "Asia/Kolkata"
};

export type ClassModel = {
  _id: ID;
  userId: ID;
  name: string;
  schedule?: ClassSchedule;
  feePerMonthINR: number;
  instructor?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateClassPayload = {
  name: string;
  feePerMonthINR: number;
  schedule?: ClassSchedule;
  instructor?: string;
};
export type UpdateClassPayload = Partial<CreateClassPayload>;

/* -----------------------
   Student
   ----------------------- */
export type StudentModel = {
  _id: ID;
  userId: ID;
  name: string;
  parentsName?: string;
  phone?: string;
  address?: string;
  dob?: string; // ISO date
  gender?: 'Male' | 'Female' | 'Other' | string;
  class?: ClassModel | ID;
  interests?: string[];
  totalpoints?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStudentPayload = {
  name: string;
  parentsName?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  class: ID;
  interests?: string[];
  totalpoints?: number;
};
export type UpdateStudentPayload = Partial<CreateStudentPayload>;

/* -----------------------
   Fee
   ----------------------- */
export type FeeMethod = 'cash' | 'upi' | 'card' | 'bank' | 'other';
export type FeeStatus = 'due' | 'partial' | 'paid';

export type FeeModel = {
  _id: ID;
  userId: ID;
  student: StudentModel | ID;
  class: ClassModel | ID;
  month: string; // "YYYY-MM"
  baseAmountINR: number;
  discountINR: number;
  paidINR: number;
  method?: FeeMethod | null;
  status: FeeStatus;
  referenceId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GenerateFeePayload = {
  student: ID;
  class: ID;
  month: string;
  baseAmountINR?: number;
  discountINR?: number;
};
export type UpdateFeePayload = Partial<{ paidINR: number; method: FeeMethod; referenceId: string; status: FeeStatus }>;

/* -----------------------
   ClassLog
   ----------------------- */
export type AttendanceEntry = {
  student: StudentModel | ID;
  status: 'present' | 'absent' | 'late' | 'excused';
};

export type ClassLogModel = {
  _id: ID;
  userId: ID;
  class: ClassModel | ID;
  date: string; // ISO
  topic?: string;
  homework?: string;
  attendance: AttendanceEntry[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateClassLogPayload = {
  class: ID;
  date: string; // ISO
  topic?: string;
  homework?: string;
  attendance?: { student: ID; status?: AttendanceEntry['status'] }[];
};
export type UpdateClassLogPayload = Partial<CreateClassLogPayload>;

/* -----------------------
   TestScore
   ----------------------- */
export type TestScoreEntry = {
  _id?: ID;
  student: StudentModel | ID;
  marksObtained: number;
  remarks?: string | null;
};

export type TestScoreModel = {
  _id: ID;
  userId: ID;
  class: ClassModel | ID;
  date: string;
  title: string;
  totalMarks: number;
  scores: TestScoreEntry[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTestPayload = {
  class: ID;
  date: string;
  title: string;
  totalMarks: number;
  scores?: { student: ID; marksObtained: number; remarks?: string }[];
};
export type UpdateTestPayload = Partial<CreateTestPayload>;

export type StudentTestScoreSummary = {
  testId: ID;
  class: ClassModel | ID;
  date: string;
  title: string;
  totalMarks: number;
  marksObtained: number | null;
  studentScoreId?: ID | null;
};

/* -----------------------
   List params
   ----------------------- */
export type ListParams = Record<string, any>;
