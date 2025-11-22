"use client";

import React, { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  ArrowLeft,
  Printer,
  Plus,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  MapPin,
  Phone,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import MainAppLayout from "@/components/MainAppLayout";
import AddStudentModal from "@/components/add-student-modal";
import AddBillModal from "@/components/add-bill-modal";
import EditFeeModal from "@/components/edit-fee-modal";
import { FeeInvoice } from "@/components/fee-invoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudent, useDeleteStudent } from "@/hooks/students";
import { useStudentTestScores } from "@/hooks/tests";
import { useFees } from "@/hooks/fees";
import { useMe } from "@/hooks/auth";

import type { FeeModel } from "@/lib/types";

function StudentDetailsPageContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [editOpen, setEditOpen] = useState(false);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [editFee, setEditFee] = useState<FeeModel | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState("performance");
  const [printFee, setPrintFee] = useState<FeeModel | null>(null);

  const { data: user } = useMe();
  const { data: student, isLoading: studentLoading } = useStudent(id);
  const { data: tests, isLoading: testsLoading } = useStudentTestScores(id);
  const { data: fees, isLoading: feesLoading } = useFees({ student: id });
  const deleteStudentMutation = useDeleteStudent();

  const handleDelete = async () => {
    await deleteStudentMutation.mutateAsync(id);
    setConfirmDelete(false);
    router.push("/students");
  };

  const handlePrint = (fee: FeeModel) => {
    setPrintFee(fee);
    // Allow state to update before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const rank = 1; // Placeholder for rank calculation

  const suggestions = useMemo(() => {
    if (!tests || tests.length === 0) return ["No test data available."];
    const avg =
      tests.reduce((acc, t) => acc + (t.marksObtained || 0) / t.totalMarks, 0) /
      tests.length;
    if (avg < 0.5)
      return ["Focus on core concepts.", "More practice required."];
    return ["Doing great! Keep it up."];
  }, [tests]);

  const aiInsight = useMemo(() => {
    if (!tests || tests.length === 0)
      return "Not enough data to generate insights.";
    const recentTests = tests.slice(0, 3);
    const trend =
      recentTests.length > 1
        ? (recentTests[0].marksObtained || 0) / recentTests[0].totalMarks >
          (recentTests[1].marksObtained || 0) / recentTests[1].totalMarks
          ? "improving"
          : "declining"
        : "stable";

    return `Student performance is ${trend}. Strong in recent assessments. Recommended to maintain consistency in daily practice.`;
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
      <div className="print:hidden">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft size={16} /> Back to Students
          </Button>

          {/* Profile Card */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
            {/* Banner */}
            <div className="h-32 bg-linear-to-r from-indigo-900 to-slate-900"></div>

            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-slate-950 p-1">
                  <div className="w-full h-full rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-bold text-3xl">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 pt-2 md:pt-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        {student.name}
                      </h1>
                      <p className="text-slate-400">
                        {(student.class &&
                          typeof student.class === "object" &&
                          student.class.name) ||
                          "No class assigned"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditOpen(true)}
                        variant="outline"
                        className="border-slate-700 hover:bg-slate-800"
                      >
                        <Edit3 size={14} className="mr-2" /> Edit Profile
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 size={14} className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-300">
                  <UserIcon size={18} className="text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500">Parent</div>
                    <div className="font-medium">{student.parentsName || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone size={18} className="text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500">Phone</div>
                    <div className="font-medium">{student.phone || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin size={18} className="text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500">Location</div>
                    <div className="font-medium truncate max-w-[150px]" title={student.address}>
                      {student.address || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Award size={18} className="text-emerald-500" />
                  <div>
                    <div className="text-xs text-slate-500">Total Points</div>
                    <div className="font-bold text-emerald-400">
                      {student.totalpoints || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-800 pb-1">
            <button
              onClick={() => setTab("performance")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "performance"
                  ? "bg-slate-800 text-white border-b-2 border-emerald-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
            >
              Performance
            </button>
            <button
              onClick={() => setTab("fees")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "fees"
                  ? "bg-slate-800 text-white border-b-2 border-emerald-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
            >
              Fees & Billing
            </button>
          </div>

          {/* Tab Content */}
          {tab === "performance" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AI Insight Card */}
              <Card className="md:col-span-3 bg-linear-to-r from-indigo-950/50 to-slate-900 border-indigo-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-indigo-300 text-lg">
                    <Sparkles size={18} /> AI Performance Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{aiInsight}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <TrendingUp size={20} />
                    </div>
                    <div className="text-sm font-medium text-slate-400">
                      Class Rank
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {rank ? `#${rank}` : "N/A"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Top 5% of class
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <BookOpen size={20} />
                    </div>
                    <div className="text-sm font-medium text-slate-400">
                      Avg. Score
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {tests && tests.length > 0
                      ? `${Math.round(
                        (tests.reduce(
                          (acc, t) =>
                            acc + (t.marksObtained || 0) / t.totalMarks,
                          0
                        ) /
                          tests.length) *
                        100
                      )}%`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Based on last {tests?.length || 0} tests
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-slate-400 mb-3">
                    Focus Areas
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <span className="text-emerald-500 mt-1">•</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-1 md:col-span-3 mt-2">
                <h3 className="text-lg font-semibold mb-4">Recent Test Scores</h3>
                <div className="space-y-3">
                  {tests?.map((t) => (
                    <motion.div
                      key={t.testId}
                      whileHover={{ scale: 1.005 }}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                          {Math.round(
                            ((t.marksObtained || 0) / t.totalMarks) * 100
                          )}
                          %
                        </div>
                        <div>
                          <div className="font-medium text-white">{t.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(t.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          {t.marksObtained}
                          <span className="text-slate-500 text-sm">
                            /{t.totalMarks}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(!tests || tests.length === 0) && (
                    <div className="text-center py-10 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                      No test scores recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "fees" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Fee History</h3>
                <Button
                  onClick={() => setAddBillOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={14} /> Generate Bill
                </Button>
              </div>

              <div className="space-y-3">
                {fees?.items.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {new Date(b.month).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          Generated on {new Date(b.createdAt || "").toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ₹{b.baseAmountINR - (b.discountINR || 0)}
                        </div>
                        <div
                          className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${b.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : b.status === "due"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                        >
                          {b.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditFee(b)}
                          className="hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(b)}
                          className="hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Printer size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!fees?.items || fees.items.length === 0) && (
                  <div className="text-center py-10 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                    No fee records found.
                  </div>
                )}
              </div>
            </div>
          )}
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

        <EditFeeModal
          isOpen={!!editFee}
          onClose={() => setEditFee(null)}
          fee={editFee}
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
              className="relative bg-slate-900 rounded-lg p-6 z-10 w-full max-w-md border border-slate-800"
            >
              <div className="text-lg font-semibold flex items-center gap-2 text-white">
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

      {/* Printable Invoice Section */}
      {printFee && student && (
        <FeeInvoice
          fee={printFee}
          student={student}
          centerName={user?.centerName}
        />
      )}
    </div>
  );
}

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <MainAppLayout>
      <StudentDetailsPageContent params={params} />
    </MainAppLayout>
  );
}

