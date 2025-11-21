"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Trash2 } from "lucide-react";
import { useCreateTest } from "@/hooks/tests";
import { useStudents } from "@/hooks/students";
import type { StudentModel } from "@/lib/types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
};

type StudentScore = {
    studentId: string;
    studentName: string;
    marksObtained: number;
};

export default function AddTestScoreModal({
    isOpen,
    onClose,
    classId,
}: Props) {
    const [date, setDate] = useState("");
    const [title, setTitle] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [studentScores, setStudentScores] = useState<StudentScore[]>([]);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateTest();
    const { data: studentsData } = useStudents({ class: classId });

    useEffect(() => {
        if (isOpen && studentsData?.items) {
            // Initialize scores for all students in the class
            const scores = studentsData.items.map((student: StudentModel) => ({
                studentId: student._id,
                studentName: student.name,
                marksObtained: 0,
            }));
            setStudentScores(scores);
            setDate(new Date().toISOString().split("T")[0]);
        }
    }, [isOpen, studentsData]);

    const resetForm = () => {
        setDate(new Date().toISOString().split("T")[0]);
        setTitle("");
        setTotalMarks("");
        setStudentScores([]);
        setError(null);
    };

    const validate = () => {
        if (!date) return "Date is required";
        if (!title.trim()) return "Test title is required";
        if (!totalMarks || parseFloat(totalMarks) <= 0) return "Total marks must be greater than 0";
        return null;
    };

    const handleScoreChange = (studentId: string, value: string) => {
        setStudentScores((prev) =>
            prev.map((s) =>
                s.studentId === studentId
                    ? { ...s, marksObtained: parseFloat(value) || 0 }
                    : s
            )
        );
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const v = validate();
        if (v) return setError(v);

        setError(null);

        try {
            const payload = {
                class: classId,
                date: new Date(date).toISOString(),
                title: title.trim(),
                totalMarks: parseFloat(totalMarks),
                scores: studentScores.map((s) => ({
                    student: s.studentId,
                    marksObtained: s.marksObtained,
                })),
            };

            await createMutation.mutateAsync(payload);

            resetForm();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Failed to save test scores");
        }
    };

    const isLoading = createMutation.isPending;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => onClose()}
                    />

                    <motion.div
                        initial={{ y: 20, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 8, opacity: 0, scale: 0.98 }}
                        className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="bg-linear-to-br from-[#051126] to-[#081427] border border-slate-800 rounded-2xl shadow-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Add Test Scores</h3>
                                <button
                                    aria-label="Close"
                                    onClick={onClose}
                                    className="p-2 rounded-md hover:bg-slate-800/40"
                                >
                                    <X />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">
                                            Date<span className="text-rose-400">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">
                                            Test Title<span className="text-rose-400">*</span>
                                        </label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Unit Test 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">
                                            Total Marks<span className="text-rose-400">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            value={totalMarks}
                                            onChange={(e) => setTotalMarks(e.target.value)}
                                            placeholder="e.g. 100"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div>
                                    <h4 className="text-sm font-semibold mb-3">Student Scores</h4>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {studentScores.map((student) => {
                                            const percentage = totalMarks
                                                ? ((student.marksObtained / parseFloat(totalMarks)) * 100).toFixed(1)
                                                : "0";
                                            return (
                                                <div
                                                    key={student.studentId}
                                                    className="grid grid-cols-3 gap-4 items-center p-3 bg-slate-900/30 rounded-lg"
                                                >
                                                    <div className="col-span-1">
                                                        <div className="text-sm font-medium">{student.studentName}</div>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            value={student.marksObtained}
                                                            onChange={(e) =>
                                                                handleScoreChange(student.studentId, e.target.value)
                                                            }
                                                            placeholder="Marks"
                                                            min="0"
                                                            step="0.01"
                                                            max={totalMarks || undefined}
                                                        />
                                                    </div>
                                                    <div className="col-span-1 text-right">
                                                        <span className="text-sm text-slate-400">
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {studentScores.length === 0 && (
                                        <div className="text-center text-slate-400 py-8">
                                            No students found in this class
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-2" />
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-rose-300 min-h-5">{error}</div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={"ghost" as any}
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                                onClose();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Saving..." : "Save Test Scores"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
