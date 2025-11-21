"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  ArrowLeft,
  Printer,
  Plus,
  AlertTriangle,
} from "lucide-react";
import MainAppLayout from "@/components/MainAppLayout";
import AddStudentModal from "@/components/add-student-modal";
import AddBillModal from "@/components/add-bill-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudent, useDeleteStudent } from "@/hooks/students";
import { useStudentTestScores } from "@/hooks/tests";
import { useFees } from "@/hooks/fees";

import type { StudentModel, StudentTestScoreSummary, FeeModel } from "@/lib/types";

function StudentDetailsPageContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [editOpen, setEditOpen] = useState(false);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState("performance");

  const { data: student, isLoading: studentLoading } = useStudent(id);
  const { data: tests, isLoading: testsLoading } = useStudentTestScores(id);
  const { data: fees, isLoading: feesLoading } = useFees({ student: id });
  const deleteStudentMutation = useDeleteStudent();

  const handleDelete = async () => {
    await deleteStudentMutation.mutateAsync(id);
    setConfirmDelete(false);
    router.push("/students");
  };

  const rank = 1; // Placeholder for rank calculation

  const suggestions = useMemo(() => {
    if (!tests || tests.length === 0) return ["No test data available."];
    const avg = tests.reduce((acc, t) => acc + (t.marksObtained || 0) / t.totalMarks, 0) / tests.length;
    if (avg < 0.5) return ["Focus on core concepts.", "More practice required."];
    return ["Doing great! Keep it up."];
  }, [tests]);

  const isLoading = studentLoading || testsLoading || feesLoading;

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading student details...</div>;
  }

  if (!student) {
    return <div className="p-8 text-rose-300">Student not found.</div>;
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={16} /> Back to Students
        </Button>

        <header className="bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-bold text-xl">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{student.name}</h1>
              <p className="text-sm text-slate-400 mt-1">
                {(student.class && typeof student.class === 'object' && student.class.name) || "No class assigned"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Parents: {student.parentsName || "N/A"} • Phone:{" "}
                {student.phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-400">Points</div>
              <div className="text-xl font-semibold text-emerald-300">
                {student.totalpoints || 0}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit3 size={14} /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </header>

        <div className="mt-8">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("performance")}
              className={`px-3 py-2 rounded-md ${tab === "performance"
                ? "bg-emerald-800/30 text-emerald-200"
                : "text-slate-300 hover:bg-slate-800/30"
                }`}
            >
              Performance
            </button>
            <button
              onClick={() => setTab("fees")}
              className={`px-3 py-2 rounded-md ${tab === "fees"
                ? "bg-emerald-800/30 text-emerald-200"
                : "text-slate-300 hover:bg-slate-800/30"
                }`}
            >
              Fees
            </button>
          </div>

          {tab === "performance" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent>
                  <div className="text-xs text-slate-400">Class Position</div>
                  <div className="text-xl font-semibold mt-2">
                    {rank ? `${rank}/1` : "N/A"}
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    Based on total points.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="text-xs text-slate-400">
                    Recent Average Score
                  </div>
                  <div className="text-xl font-semibold mt-2">
                    {tests && tests.length > 0
                      ? `${Math.round(
                        (tests.reduce(
                          (acc, t) => acc + (t.marksObtained || 0) / t.totalMarks,
                          0
                        ) /
                          tests.length) *
                        100
                      )}%`
                      : "N/A"}
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    Average across last {tests?.length || 0} tests.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="text-xs text-slate-400">Suggested Focus</div>
                  <div className="mt-2 space-y-2">
                    {suggestions.map((s, i) => (
                      <div key={i} className="text-sm text-slate-300">
                        • {s}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-1 md:col-span-3 mt-6">
                <h3 className="text-lg font-semibold">Test Scores</h3>
                <div className="mt-3 space-y-3">
                  {tests?.map((t) => (
                    <motion.div
                      key={t.testId}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 bg-slate-900/30 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(t.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {t.marksObtained}/{t.totalMarks}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "fees" && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Bills</h3>
                <Button
                  onClick={() => setAddBillOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={14} /> Add Bill
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {fees?.items.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 bg-slate-900/30 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">
                        {new Date(b.month).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-semibold">
                        ₹{b.baseAmountINR - (b.discountINR || 0)}
                      </div>
                      <div
                        className={`text-sm ${b.status === "paid"
                          ? "text-emerald-300"
                          : b.status === "due"
                            ? "text-amber-300"
                            : "text-rose-300"
                          }`}
                      >
                        {b.status}
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="p-2 rounded-md hover:bg-slate-800/40"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddStudentModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        student={student}
      />

      <AddBillModal
        isOpen={addBillOpen}
        onClose={() => setAddBillOpen(false)}
        studentId={id}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setConfirmDelete(false)}
          />
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-slate-900 rounded-lg p-6 z-10 w-full max-w-md"
          >
            <div className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="text-amber-400" /> Delete Student?
            </div>
            <div className="text-sm text-slate-400 mt-2">
              This action cannot be undone. All associated data will be removed.
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  return (
    <MainAppLayout>
      <StudentDetailsPageContent params={params} />
    </MainAppLayout>
  );
}
