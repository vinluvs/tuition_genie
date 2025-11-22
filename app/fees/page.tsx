"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    Plus,
    Trash2,
    Search,
    Filter,
    Printer,
    Receipt,
    Users
} from "lucide-react";
import MainAppLayout from "@/components/MainAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFees, useDeleteFee } from "@/hooks/fees";
import { useClasses } from "@/hooks/classes";
import { useMe } from "@/hooks/auth";
import GenerateFeeModal from "@/components/generate-fee-modal";
import BulkGenerateFeeModal from "@/components/bulk-generate-fee-modal";
import EditFeeModal from "@/components/edit-fee-modal";
import { FeeInvoice } from "@/components/fee-invoice";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import type { FeeModel } from "@/lib/types";

export default function FeesPage() {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<FeeModel | null>(null);
    const [printingFee, setPrintingFee] = useState<FeeModel | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [monthFilter, setMonthFilter] = useState("");

    const { data: feesData, isLoading: feesLoading } = useFees();
    const { data: classesData } = useClasses();
    const { data: user } = useMe();
    const deleteFeeMutation = useDeleteFee();

    const fees = feesData?.items || [];
    const classes = classesData?.items || [];

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        onAfterPrint: () => setPrintingFee(null),
    });

    const onPrintClick = (fee: FeeModel) => {
        setPrintingFee(fee);
        // Wait for state to update and render the invoice before printing
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this fee record?")) {
            try {
                await deleteFeeMutation.mutateAsync(id);
                toast.success("Fee record deleted");
            } catch (error) {
                toast.error("Failed to delete fee record");
            }
        }
    };

    const filteredFees = useMemo(() => {
        return fees.filter((fee) => {
            const studentName = typeof fee.student === 'object' ? fee.student.name : "";
            const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase());

            const feeClassId = typeof fee.class === 'object' ? fee.class._id : fee.class;
            const matchesClass = classFilter === "All" || feeClassId === classFilter;

            const matchesStatus = statusFilter === "All" || fee.status === statusFilter;
            const matchesMonth = !monthFilter || fee.month === monthFilter;

            return matchesSearch && matchesClass && matchesStatus && matchesMonth;
        });
    }, [fees, searchQuery, classFilter, statusFilter, monthFilter]);

    const totalCollected = useMemo(() => {
        return filteredFees.reduce((acc, fee) => acc + fee.paidINR, 0);
    }, [filteredFees]);

    const totalPending = useMemo(() => {
        return filteredFees.reduce((acc, fee) => {
            const due = (fee.baseAmountINR - fee.discountINR) - fee.paidINR;
            return acc + (due > 0 ? due : 0);
        }, 0);
    }, [filteredFees]);

    return (
        <MainAppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <DollarSign className="text-emerald-400" /> Fees Management
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Track payments, generate invoices, and manage dues.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsBulkModalOpen(true)}
                            variant="outline"
                            className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                            <Receipt size={18} /> Bulk Generate
                        </Button>
                        <Button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Fee
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">Total Collected</div>
                            <div className="text-3xl font-bold text-emerald-400">₹{totalCollected.toLocaleString()}</div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">Total Pending</div>
                            <div className="text-3xl font-bold text-amber-400">₹{totalPending.toLocaleString()}</div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Receipt size={24} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search student name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-950 border-slate-800"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <div className="w-40">
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                    <Filter size={14} className="mr-2 text-slate-400" />
                                    <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-32">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Status</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="due">Due</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-40">
                            <Input
                                type="month"
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Fees List */}
                <div className="space-y-3">
                    {feesLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading fees...</div>
                    ) : filteredFees.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                            <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No fee records found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredFees.map((fee) => {
                            const studentName = typeof fee.student === 'object' ? fee.student.name : "Unknown Student";
                            const className = typeof fee.class === 'object' ? fee.class.name : classes.find(c => c._id === fee.class)?.name || "Unknown Class";
                            const dueAmount = (fee.baseAmountINR - fee.discountINR) - fee.paidINR;

                            return (
                                <motion.div
                                    key={fee._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    fee.status === 'partial' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-slate-200">{studentName}</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded">
                                                        <Users size={10} />
                                                        {className}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                                                    <span>Month: <span className="text-slate-300">{fee.month}</span></span>
                                                    <span>Total: <span className="text-slate-300">₹{fee.baseAmountINR - fee.discountINR}</span></span>
                                                    <span>Paid: <span className="text-emerald-400">₹{fee.paidINR}</span></span>
                                                    {dueAmount > 0 && (
                                                        <span>Due: <span className="text-rose-400">₹{dueAmount}</span></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            <div className={`px-2 py-1 rounded text-xs font-medium uppercase ${fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    fee.status === 'partial' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {fee.status}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onPrintClick(fee)}
                                                className="text-slate-400 hover:text-white"
                                                title="Print Invoice"
                                            >
                                                <Printer size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingFee(fee)}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(fee._id)}
                                                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>

                <GenerateFeeModal
                    isOpen={isGenerateModalOpen}
                    onClose={() => setIsGenerateModalOpen(false)}
                />

                <BulkGenerateFeeModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                />

                <EditFeeModal
                    isOpen={!!editingFee}
                    onClose={() => setEditingFee(null)}
                    fee={editingFee}
                />

                {/* Hidden Invoice for Printing */}
                <div className="hidden">
                    <div ref={printRef}>
                        {printingFee && typeof printingFee.student === 'object' && (
                            <FeeInvoice
                                fee={printingFee}
                                student={printingFee.student as any}
                                centerName={user?.centerName}
                            />
                        )}
                    </div>
                </div>
            </div>
        </MainAppLayout>
    );
}
