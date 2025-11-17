// lib/schemas.ts
import { z } from 'zod';

/* -----------------------------------------
   PRIMITIVE HELPERS
----------------------------------------- */
export const IDSchema = z.string().min(1);
export const ISOSchema = z.string().refine(v => !isNaN(Date.parse(v)), 'Invalid ISO date');
export const MonthSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM');

/* -----------------------------------------
   USER
----------------------------------------- */
export const UserSchema = z.object({
  _id: IDSchema,
  name: z.string().optional(),
  centerName: z.string().optional(),
  email: z.string().email(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const SignupPayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  centerName: z.string().optional()
});

/* -----------------------------------------
   CLASS
----------------------------------------- */
export const ClassScheduleSchema = z.object({
  days: z.array(z.string()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional()
});

export const ClassSchema = z.object({
  _id: IDSchema,
  userId: IDSchema,
  name: z.string(),
  schedule: ClassScheduleSchema.optional(),
  feePerMonthINR: z.number(),
  instructor: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateClassPayloadSchema = z.object({
  name: z.string(),
  feePerMonthINR: z.number(),
  schedule: ClassScheduleSchema.optional(),
  instructor: z.string().optional(),
});

/* -----------------------------------------
   STUDENT
----------------------------------------- */
export const AttendanceEntrySchema = z.object({
  student: IDSchema,
  status: z.enum(['present', 'absent', 'late', 'excused'])
});

export const StudentSchema = z.object({
  _id: IDSchema,
  userId: IDSchema,
  name: z.string(),
  parentsName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  class: IDSchema,
  interests: z.array(z.string()).optional(),
  totalpoints: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateStudentPayloadSchema = z.object({
  name: z.string(),
  parentsName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  class: IDSchema,
  interests: z.array(z.string()).optional(),
});

/* -----------------------------------------
   FEE
----------------------------------------- */
export const FeeSchema = z.object({
  _id: IDSchema,
  userId: IDSchema,
  student: IDSchema,
  class: IDSchema,
  month: MonthSchema,
  baseAmountINR: z.number(),
  discountINR: z.number(),
  paidINR: z.number(),
  method: z.enum(['cash', 'upi', 'card', 'bank', 'other']).optional(),
  status: z.enum(['due', 'partial', 'paid']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const GenerateFeePayloadSchema = z.object({
  student: IDSchema,
  class: IDSchema,
  month: MonthSchema,
  baseAmountINR: z.number().optional(),
  discountINR: z.number().optional(),
});

/* -----------------------------------------
   CLASS LOG
----------------------------------------- */
export const ClassLogSchema = z.object({
  _id: IDSchema,
  userId: IDSchema,
  class: IDSchema,
  date: ISOSchema,
  topic: z.string().optional(),
  homework: z.string().optional(),
  attendance: z.array(AttendanceEntrySchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateClassLogPayloadSchema = z.object({
  class: IDSchema,
  date: ISOSchema,
  topic: z.string().optional(),
  homework: z.string().optional(),
  attendance: z.array(AttendanceEntrySchema).optional(),
});

/* -----------------------------------------
   TEST SCORE
----------------------------------------- */
export const TestScoreEntrySchema = z.object({
  student: IDSchema,
  marksObtained: z.number(),
  remarks: z.string().optional()
});

export const TestScoreSchema = z.object({
  _id: IDSchema,
  userId: IDSchema,
  class: IDSchema,
  date: ISOSchema,
  title: z.string(),
  totalMarks: z.number(),
  scores: z.array(TestScoreEntrySchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateTestPayloadSchema = z.object({
  class: IDSchema,
  date: ISOSchema,
  title: z.string(),
  totalMarks: z.number(),
  scores: z.array(TestScoreEntrySchema),
});

/* -----------------------------------------
   LIST RESULT HELPER
----------------------------------------- */
export const ApiListSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().optional()
  });
