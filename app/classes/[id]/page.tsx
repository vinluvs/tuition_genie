"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  DollarSign,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useClass, useDeleteClass } from "@/hooks/classes";
import { useStudents } from "@/hooks/students";
import { useClassLogs, useDeleteClassLog } from "@/hooks/classlogs";
import { useTests, useDeleteTest } from "@/hooks/tests";
import AddClassLogModal from "@/components/add-classlog-modal";
import AddTestScoreModal from "@/components/add-testscore-modal";
import type { StudentModel, ClassLogModel, TestScoreModel } from "@/lib/types";

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addClassLogOpen, setAddClassLogOpen] = useState(false);
  const [addTestScoreOpen, setAddTestScoreOpen] = useState(false);
  const [editingClassLog, setEditingClassLog] = useState<ClassLogModel | undefined>();

  const { data: cls, isLoading, error } = useClass(id);
  const { data: studentsData } = useStudents({ class: id });
  const { data: classLogsData } = useClassLogs({ class: id });
  const { data: testsData } = useTests({ class: id });

  const deleteClassMutation = useDeleteClass();
  const deleteClassLogMutation = useDeleteClassLog();
  const deleteTestMutation = useDeleteTest();

  const handleDelete = async () => {
    deleteClassMutation.mutate(id, {
      onSuccess: () => router.push("/classes"),
      onError: (e) => {
        console.error(e);
        alert("Could not delete class");
      },
    });
  };

  const handleDeleteClassLog = async (logId: string) => {
    if (confirm("Delete this class log?")) {
      deleteClassLogMutation.mutate(logId);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (confirm("Delete this test?")) {
      deleteTestMutation.mutate(testId);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (error || !cls) return <div className="p-8 text-rose-300">Class not found.</div>;

  const students = studentsData?.items || [];
  const classLogs = classLogsData?.items || [];
  const tests = testsData?.items || [];

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-[#071021] to-black text-slate-100 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Button>
        </div>

        {/* Profile Header - Twitter Style */}
        <div className="bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800 rounded-2xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600" />

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-start justify-between -mt-12">
              <div className="flex items-end gap-4">
                {/* Profile Avatar */}
                <div className="w-24 h-24 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-bold text-2xl border-4 border-[#021022]">
                  {cls.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="mb-2">
                  <h1 className="text-3xl font-bold">{cls.name}</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Instructor: {cls.instructor || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setConfirmDelete(true)}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Users size={14} />
                  <span>Students</span>
                </div>
                <div className="text-2xl font-semibold text-emerald-300">
                  {students.length}
                </div>
              </div>
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <BookOpen size={14} />
                  <span>Class Logs</span>
                </div>
                <div className="text-2xl font-semibold text-blue-300">
                  {classLogs.length}
                </div>
              </div>
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <ClipboardList size={14} />
                  <span>Tests</span>
                </div>
                <div className="text-2xl font-semibold text-purple-300">
                  {tests.length}
                </div>
              </div>
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <DollarSign size={14} />
                  <span>Fee/Month</span>
                </div>
                <div className="text-2xl font-semibold text-amber-300">
                  ₹{cls.feePerMonthINR}
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            {cls.schedule && (
              <div className="mt-4 p-4 bg-slate-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <Calendar size={14} />
                  <span>Schedule</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-300">
                    {cls.schedule.days?.join(", ") || "No days set"}
                  </span>
                  {cls.schedule.startTime && cls.schedule.endTime && (
                    <span className="text-slate-400 ml-2">
                      • {cls.schedule.startTime} - {cls.schedule.endTime}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="mt-8">
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="w-full justify-start bg-slate-900/30 border border-slate-800">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users size={16} />
                Students
              </TabsTrigger>
              <TabsTrigger value="classlogs" className="flex items-center gap-2">
                <BookOpen size={16} />
                Class Logs
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <ClipboardList size={16} />
                Tests
              </TabsTrigger>
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Students in this class</h3>
                  </div>

                  {students.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Users size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No students enrolled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student: StudentModel) => (
                        <motion.div
                          key={student._id}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 bg-slate-900/30 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-bold">
                              {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-slate-400">
                                Total Points: <span className="text-emerald-300 font-semibold">{student.totalpoints || 0}</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/students/${student._id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye size={14} />
                              View
                            </Button>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Class Logs Tab */}
            <TabsContent value="classlogs" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Class Logs</h3>
                    <Button
                      onClick={() => {
                        setEditingClassLog(undefined);
                        setAddClassLogOpen(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Add Class Log
                    </Button>
                  </div>

                  {classLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No class logs yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {classLogs.map((log: ClassLogModel) => (
                        <motion.div
                          key={log._id}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 bg-slate-900/30 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-sm font-medium text-slate-300">
                                  {new Date(log.date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              </div>
                              {log.topic && (
                                <div className="text-sm mb-1">
                                  <span className="text-slate-400">Topic:</span>{" "}
                                  <span className="text-slate-200">{log.topic}</span>
                                </div>
                              )}
                              {log.homework && (
                                <div className="text-sm">
                                  <span className="text-slate-400">Homework:</span>{" "}
                                  <span className="text-slate-200">{log.homework}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingClassLog(log);
                                  setAddClassLogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClassLog(log._id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tests Tab */}
            <TabsContent value="tests" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Tests & Scores</h3>
                    <Button
                      onClick={() => setAddTestScoreOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Add Test Score
                    </Button>
                  </div>

                  {tests.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No tests recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tests.map((test: TestScoreModel) => {
                        const avgScore = test.scores.length > 0
                          ? test.scores.reduce((acc, s) => acc + s.marksObtained, 0) / test.scores.length
                          : 0;
                        const avgPercentage = ((avgScore / test.totalMarks) * 100).toFixed(1);

                        return (
                          <motion.div
                            key={test._id}
                            whileHover={{ scale: 1.01 }}
                            className="p-4 bg-slate-900/30 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-medium text-lg">{test.title}</div>
                                <div className="text-xs text-slate-400 mt-1">
                                  {new Date(test.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                  {" • "}
                                  Total Marks: {test.totalMarks}
                                  {" • "}
                                  Class Average: {avgPercentage}%
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTest(test._id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {test.scores.map((score) => {
                                const studentName = typeof score.student === 'object'
                                  ? score.student.name
                                  : students.find(s => s._id === score.student)?.name || "Unknown";
                                const percentage = ((score.marksObtained / test.totalMarks) * 100).toFixed(1);

                                return (
                                  <div
                                    key={score._id || (typeof score.student === 'string' ? score.student : score.student._id)}
                                    className="flex items-center justify-between p-2 bg-slate-800/30 rounded"
                                  >
                                    <span className="text-sm">{studentName}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium">
                                        {score.marksObtained}/{test.totalMarks}
                                      </span>
                                      <span className="text-xs text-slate-400 w-12 text-right">
                                        {percentage}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <AddClassLogModal
        isOpen={addClassLogOpen}
        onClose={() => {
          setAddClassLogOpen(false);
          setEditingClassLog(undefined);
        }}
        classId={id}
        classLog={editingClassLog}
      />

      <AddTestScoreModal
        isOpen={addTestScoreOpen}
        onClose={() => setAddTestScoreOpen(false)}
        classId={id}
      />

      {/* Delete Confirmation */}
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
              <AlertTriangle className="text-amber-400" /> Delete Class?
            </div>
            <div className="text-sm text-slate-400 mt-2">
              This will remove the class and detach students from it.
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteClassMutation.isPending}
              >
                {deleteClassMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
