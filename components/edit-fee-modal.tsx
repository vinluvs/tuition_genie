"use client";

import React, { useEffect, useState } from "react";
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
import { useUpdateFee } from "@/hooks/fees";
import type { FeeModel, FeeStatus, FeeMethod } from "@/lib/types";
import { toast } from "sonner";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    fee: FeeModel | null;
};

export default function EditFeeModal({ isOpen, onClose, fee }: Props) {
    const updateFeeMutation = useUpdateFee();

    const [paidINR, setPaidINR] = useState<string>("");
    const [status, setStatus] = useState<FeeStatus>("due");
    const [method, setMethod] = useState<FeeMethod>("cash");

    useEffect(() => {
        if (isOpen && fee) {
            setPaidINR(fee.paidINR.toString());
            setStatus(fee.status);
            setMethod(fee.method || "cash");
        }
    }, [isOpen, fee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fee) return;

        try {
            await updateFeeMutation.mutateAsync({
                id: fee._id,
                payload: {
                    paidINR: Number(paidINR),
                    status,
                    method,
                },
            });
            toast.success("Fee updated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update fee");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && fee && (
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
                            <h3 className="text-lg font-semibold text-white">Edit Fee</h3>
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
                                    Paid Amount (₹)
                                </label>
                                <Input
                                    type="number"
                                    value={paidINR}
                                    onChange={(e) => setPaidINR(e.target.value)}
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Status
                                </label>
                                <Select
                                    value={status}
                                    onValueChange={(v) => setStatus(v as FeeStatus)}
                                >
                                    <SelectTrigger className="bg-slate-950 border-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="due">Due</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Payment Method
                                </label>
                                <Select
                                    value={method}
                                    onValueChange={(v) => setMethod(v as FeeMethod)}
                                >
                                    <SelectTrigger className="bg-slate-950 border-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank">Bank Transfer</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={updateFeeMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateFeeMutation.isPending}>
                                    {updateFeeMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
