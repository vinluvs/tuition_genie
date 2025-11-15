// types.ts
// Frontend TypeScript interfaces generated from server mongoose models.
// IDs are represented as strings (Mongo ObjectId -> string).
// Timestamps as ISO strings (string). Adjust to `Date` if you prefer real Date objects.

export type ID = string;

/** Class model */
export interface Schedule {
  days: string[];            // e.g. ["Mon","Wed","Fri"]
  startTime?: string;        // "17:00"
  endTime?: string;          // "18:30"
  timezone?: string;         // default "Asia/Kolkata"
}
export interface ClassModel {
  _id?: ID;
  name: string;              // e.g., "Grade 7 Math - Batch A"
  schedule?: Schedule;
  feePerMonthINR: number;
  instructor?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Attendance status for ClassLog */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceEntry {
  studentId: ID;
  status: AttendanceStatus;
}

/** ClassLog model (per-class session / attendance / notes) */
export interface ClassLog {
  _id?: ID;
  classId: ID;               // reference to Class._id
  date: string;              // ISO date string
  topic?: string | null;
  homework?: string | null;
  attendance?: AttendanceEntry[];
  createdAt?: string;
  updatedAt?: string;
}

/** Fee model */
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank' | 'other';
export type FeeStatus = 'due' | 'partial' | 'paid';

export interface Fee {
  _id?: ID;
  studentId: ID;
  classId: ID;
  month: string;             // "YYYY-MM" (e.g. "2025-11")
  baseAmountINR: number;
  discountINR?: number;
  paidINR?: number;
  method?: PaymentMethod | null;
  status?: FeeStatus;
  createdAt?: string;
  updatedAt?: string;
}

/** Student model */
export type GenderString = string; // server uses string; you can narrow this if you want

export interface Student {
  _id?: ID;
  name: string;
  parentsName: string;
  phone: string;
  address: string;
  dob: string;               // ISO date string
  gender: GenderString;
  classId: ID;               // reference to Class._id
  interests?: string[]; 
  totalpoints: number;
      // default []
  createdAt?: string;
  updatedAt?: string;
}

/** TestScore model */
export interface TestScoreEntry {
  studentId: ID;
  marksObtained: number;
  remarks?: string | null;
}

export interface TestScore {
  _id?: ID;
  classId: ID;
  date: string;              // ISO date string
  title: string;
  totalMarks: number;
  scores: TestScoreEntry[];
  createdAt?: string;
  updatedAt?: string;
}

/** User model (frontend view) */
export interface User {
  _id?: ID;
  name?: string | null;
  centerName?: string | null;
  email?: string | null;
  // Do not store plain passwords in frontend; server stores passwordHash.
  passwordHash?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Utility: Minimal summary types used in lists */
export interface StudentSummary {
  _id: ID;
  name: string;
  phone?: string;
  classId?: ID;
}
export interface ClassSummary {
  _id: ID;
  name: string;
  instructor?: string;
}

/* --- END types.ts --- */
