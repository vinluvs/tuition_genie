"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useCreateExpense, useUpdateExpense } from "@/hooks/expenses";
import { toast } from "sonner";
import type { ExpenseModel } from "@/lib/types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    expense?: ExpenseModel;
};

const CATEGORIES = [
    "Rent",
    "Salaries",
    "Utilities",
    "Equipment",
    "Maintenance",
    "Marketing",
    "Software",
    "Other",
];

export default function AddExpenseModal({ isOpen, onClose, expense }: Props) {
    const createExpenseMutation = useCreateExpense();
    const updateExpenseMutation = useUpdateExpense();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Other");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (expense) {
                setTitle(expense.title);
                setAmount(expense.amount.toString());
                setCategory(expense.category || "Other");
                setDate(expense.date.slice(0, 10));
                setNotes(expense.notes || "");
            } else {
                setTitle("");
                setAmount("");
                setCategory("Other");
                setDate(new Date().toISOString().slice(0, 10));
                setNotes("");
            }
        }
    }, [isOpen, expense]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !date) {
            toast.error("Please fill in all required fields");
            return;
        }

        const payload = {
            title,
            amount: Number(amount),
            category,
            date,
            notes,
        };

        try {
            if (expense) {
                await updateExpenseMutation.mutateAsync({
                    id: expense._id,
                    payload,
                });
                toast.success("Expense updated successfully");
            } else {
                await createExpenseMutation.mutateAsync(payload);
                toast.success("Expense added successfully");
            }
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save expense");
        }
    };

    const isPending = createExpenseMutation.isPending || updateExpenseMutation.isPending;

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
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">
                                {expense ? "Edit Expense" : "Add Expense"}
                            </h3>
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
                                    Title*
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Monthly Rent"
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
                                        placeholder="0.00"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Category
                                    </label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="bg-slate-950 border-slate-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Date*
                                </label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-slate-950 border-slate-800 pl-10"
                                    />
                                    <Calendar
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Notes
                                </label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Optional details..."
                                    className="bg-slate-950 border-slate-800 resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isPending ? "Saving..." : expense ? "Update Expense" : "Add Expense"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
