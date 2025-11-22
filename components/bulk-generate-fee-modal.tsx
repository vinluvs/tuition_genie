"use client";

import React, { useState } from "react";
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
import { useBulkGenerateFees } from "@/hooks/fees";
import { useClasses } from "@/hooks/classes";
import { toast } from "sonner";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function BulkGenerateFeeModal({ isOpen, onClose }: Props) {
    const bulkGenerateMutation = useBulkGenerateFees();
    const { data: classesData } = useClasses();
    const classes = classesData?.items || [];

    const [selectedClassId, setSelectedClassId] = useState("");
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassId || !month) {
            toast.error("Please select a class and month");
            return;
        }

        try {
            await bulkGenerateMutation.mutateAsync({
                classId: selectedClassId,
                month,
            });
            toast.success("Bulk fees generated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to generate fees");
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
                            <h3 className="text-lg font-semibold text-white">Bulk Generate Fees</h3>
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
                                    onValueChange={setSelectedClassId}
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
                                    Month*
                                </label>
                                <Input
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>

                            <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-md">
                                This will generate fee records for all students in the selected class for the specified month.
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={bulkGenerateMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={bulkGenerateMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {bulkGenerateMutation.isPending ? "Generating..." : "Generate All"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
