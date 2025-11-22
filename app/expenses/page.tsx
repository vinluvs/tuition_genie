"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Trash2,
    Search,
    DollarSign,
    TrendingDown,
    Calendar,
    Filter,
    PieChart,
    Edit3
} from "lucide-react";
import MainAppLayout from "@/components/MainAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useExpenses, useDeleteExpense } from "@/hooks/expenses";
import AddExpenseModal from "@/components/add-expense-modal";
import { toast } from "sonner";
import type { ExpenseModel } from "@/lib/types";

export default function ExpensesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseModel | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

    const { data: expenses, isLoading } = useExpenses();
    const deleteExpenseMutation = useDeleteExpense();

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            try {
                await deleteExpenseMutation.mutateAsync(id);
                toast.success("Expense deleted");
            } catch (error) {
                toast.error("Failed to delete expense");
            }
        }
    };

    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        return expenses.filter((expense) => {
            const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "All" || expense.category === categoryFilter;
            const matchesMonth = expense.date.startsWith(monthFilter);
            return matchesSearch && matchesCategory && matchesMonth;
        });
    }, [expenses, searchQuery, categoryFilter, monthFilter]);

    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    }, [filteredExpenses]);

    const categoryBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        filteredExpenses.forEach((e) => {
            const cat = e.category || "Other";
            breakdown[cat] = (breakdown[cat] || 0) + e.amount;
        });
        return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
    }, [filteredExpenses]);

    return (
        <MainAppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <DollarSign className="text-rose-400" /> Expenses
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Manage and track your center's expenditures
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingExpense(undefined);
                            setIsAddModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Expense
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-linear-to-br from-rose-950/50 to-slate-900 border-rose-900/30">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                                    <TrendingDown size={20} />
                                </div>
                                <div className="text-sm font-medium text-slate-400">
                                    Total Expenses ({new Date(monthFilter).toLocaleString('default', { month: 'long' })})
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                ₹{totalExpenses.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800 md:col-span-2">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <PieChart size={20} />
                                </div>
                                <div className="text-sm font-medium text-slate-400">
                                    Top Categories
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {categoryBreakdown.slice(0, 4).map(([cat, amount]) => (
                                    <div key={cat} className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full">
                                        <span className="text-xs text-slate-400">{cat}</span>
                                        <span className="text-sm font-semibold text-slate-200">₹{amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                {categoryBreakdown.length === 0 && (
                                    <div className="text-sm text-slate-500">No data available</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-950 border-slate-800"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-40">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                    <Filter size={14} className="mr-2 text-slate-400" />
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Categories</SelectItem>
                                    <SelectItem value="Rent">Rent</SelectItem>
                                    <SelectItem value="Salaries">Salaries</SelectItem>
                                    <SelectItem value="Utilities">Utilities</SelectItem>
                                    <SelectItem value="Equipment">Equipment</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Software">Software</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-48">
                            <Input
                                type="month"
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading expenses...</div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                            <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No expenses found for this period.</p>
                        </div>
                    ) : (
                        filteredExpenses.map((expense) => (
                            <motion.div
                                key={expense._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{expense.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                                                {expense.category || "Other"}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(expense.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">
                                            ₹{expense.amount.toLocaleString()}
                                        </div>
                                        {expense.notes && (
                                            <div className="text-xs text-slate-500 max-w-[200px] truncate text-right">
                                                {expense.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingExpense(expense);
                                                setIsAddModalOpen(true);
                                            }}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Edit3 size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(expense._id)}
                                            className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <AddExpenseModal
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingExpense(undefined);
                    }}
                    expense={editingExpense}
                />
            </div>
        </MainAppLayout>
    );
}
