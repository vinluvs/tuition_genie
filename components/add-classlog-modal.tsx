"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useCreateClassLog, useUpdateClassLog } from "@/hooks/classlogs";
import { useClasses } from "@/hooks/classes";
import type { ClassLogModel } from "@/lib/types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    classId?: string;
    classLog?: ClassLogModel;
};

export default function AddClassLogModal({
    isOpen,
    onClose,
    classId,
    classLog,
}: Props) {
    const [date, setDate] = useState("");
    const [topic, setTopic] = useState("");
    const [homework, setHomework] = useState("");
    const [selectedClassId, setSelectedClassId] = useState(classId || "");
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateClassLog();
    const updateMutation = useUpdateClassLog();
    const { data: classesData } = useClasses();
    const classes = classesData?.items || [];

    useEffect(() => {
        if (classLog) {
            setDate(classLog.date?.split("T")[0] || "");
            setTopic(classLog.topic || "");
            setHomework(classLog.homework || "");
            // If editing, use the class from the log if available, or the prop
            const logClassId = typeof classLog.class === 'object' ? classLog.class._id : classLog.class;
            setSelectedClassId(logClassId || classId || "");
        } else {
            resetForm();
        }
    }, [classLog, isOpen, classId]);

    const resetForm = () => {
        setDate(new Date().toISOString().split("T")[0]);
        setTopic("");
        setHomework("");
        setSelectedClassId(classId || "");
        setError(null);
    };

    const validate = () => {
        if (!date) return "Date is required";
        if (!selectedClassId) return "Class is required";
        return null;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const v = validate();
        if (v) return setError(v);

        setError(null);

        try {
            const payload = {
                class: selectedClassId,
                date: new Date(date).toISOString(),
                topic: topic.trim() || undefined,
                homework: homework.trim() || undefined,
            };

            if (classLog) {
                await updateMutation.mutateAsync({
                    id: classLog._id,
                    payload,
                });
            } else {
                await createMutation.mutateAsync(payload);
            }

            resetForm();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Failed to save class log");
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

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
                        className="relative w-full max-w-2xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="bg-linear-to-br from-[#051126] to-[#081427] border border-slate-800 rounded-2xl shadow-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    {classLog ? "Edit Class Log" : "Add Class Log"}
                                </h3>
                                <button
                                    aria-label="Close"
                                    onClick={onClose}
                                    className="p-2 rounded-md hover:bg-slate-800/40"
                                >
                                    <X />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    {!classId && (
                                        <div>
                                            <label className="block text-xs text-slate-300 mb-1">
                                                Class<span className="text-rose-400">*</span>
                                            </label>
                                            <Select
                                                value={selectedClassId}
                                                onValueChange={setSelectedClassId}
                                                disabled={!!classLog} // Disable changing class when editing
                                            >
                                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                                    <SelectValue placeholder="Select a class" />
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
                                    )}
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">
                                            Date<span className="text-rose-400">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            autoFocus={!!classId}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">
                                            Topic
                                        </label>
                                        <Input
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g. Quadratic Equations"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">
                                            Homework
                                        </label>
                                        <Textarea
                                            value={homework}
                                            onChange={(e) => setHomework(e.target.value)}
                                            placeholder="e.g. Complete exercises 1-10"
                                            rows={3}
                                        />
                                    </div>
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
                                            {isLoading
                                                ? "Saving..."
                                                : classLog
                                                    ? "Update Log"
                                                    : "Create Log"}
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
