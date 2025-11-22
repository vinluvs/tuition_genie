"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGenerateFee } from "@/hooks/fees";
import { useClasses } from "@/hooks/classes";
import { useStudents } from "@/hooks/students";
import { toast } from "sonner";
import type { StudentModel } from "@/lib/types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function GenerateFeeModal({ isOpen, onClose }: Props) {
    const generateFeeMutation = useGenerateFee();
    const { data: classesData } = useClasses();
    const classes = classesData?.items || [];

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [amount, setAmount] = useState("");
    const [discount, setDiscount] = useState("0");

    const { data: studentsData } = useStudents({ class: selectedClassId });
    const students = studentsData?.items || [];

    useEffect(() => {
        if (!isOpen) {
            setSelectedClassId("");
            setSelectedStudentId("");
            setMonth(new Date().toISOString().slice(0, 7));
            setAmount("");
            setDiscount("0");
        }
    }, [isOpen]);

    // Auto-fill amount from class fee when class is selected
    useEffect(() => {
        if (selectedClassId) {
            const cls = classes.find((c) => c._id === selectedClassId);
            if (cls) {
                setAmount(cls.feePerMonthINR.toString());
            }
        }
    }, [selectedClassId, classes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassId || !selectedStudentId || !month || !amount) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await generateFeeMutation.mutateAsync({
                class: selectedClassId,
                student: selectedStudentId,
                month,
                baseAmountINR: Number(amount),
                discountINR: Number(discount),
            });
            toast.success("Fee generated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to generate fee");
        }
    };

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
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: 12, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 8, opacity: 0 }}
                        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Generate Fee</h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Class*
                                </label>
                                <Select
                                    value={selectedClassId}
                                    onValueChange={(val) => {
                                        setSelectedClassId(val);
                                        setSelectedStudentId(""); // Reset student when class changes
                                    }}
                                >
                                    <SelectTrigger className="bg-slate-950 border-slate-800">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Student*
                                </label>
                                <Select
                                    value={selectedStudentId}
                                    onValueChange={setSelectedStudentId}
                                    disabled={!selectedClassId}
                                >
                                    <SelectTrigger className="bg-slate-950 border-slate-800">
                                        <SelectValue placeholder={selectedClassId ? "Select Student" : "Select Class First"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student: StudentModel) => (
                                            <SelectItem key={student._id} value={student._id}>
                                                {student.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Month*
                                </label>
                                <Input
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Amount (₹)*
                                    </label>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Discount (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={generateFeeMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={generateFeeMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {generateFeeMutation.isPending ? "Generating..." : "Generate"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
