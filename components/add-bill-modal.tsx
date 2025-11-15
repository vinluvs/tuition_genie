"use client";

/*
File: /components/add-bill-modal.tsx
Purpose: Modal to add a bill for a student. Props: isOpen, onClose, studentId, onSaved
Behavior:
 - fields: amount, status (paid/pending/overdue), date, remarks
 - basic validation: amount > 0, date required
 - POST to /api/students/{studentId}/bills (fallback to /api/bills)
 - shows loading & errors, calls onSaved with created bill on success
*/

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onSaved?: (bill: any) => void;
};

export default function AddBillModal({ isOpen, onClose, studentId, onSaved }: Props) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // reset form when closed
      setAmount("");
      setStatus("pending");
      setDate(new Date().toISOString().slice(0, 10));
      setRemarks("");
      setError(null);
      setSaving(false);
    }
  }, [isOpen]);

  const validate = () => {
    const a = Number(amount);
    if (!amount || isNaN(a) || a <= 0) return "Enter a valid amount";
    if (!date) return "Select a date";
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setSaving(true);
    setError(null);

    const payload = { studentId, amount: Number(amount), status, date, remarks: remarks || null };

    try {
      // try student-specific route first
      let res = await fetch(`/api/students/${encodeURIComponent(studentId)}/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // fallback to generic bills route
        res = await fetch(`/api/bills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const created = await res.json();
      onSaved?.(created);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create bill");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div initial={{ y: 12, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 8, opacity: 0 }} className="relative w-full max-w-lg bg-linear-to-br from-[#051126] to-[#081427] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Bill</h3>
              <button aria-label="Close" onClick={onClose} className="p-2 rounded-md hover:bg-slate-800/40">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300">Amount (₹)*</label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000" inputMode="numeric" />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Status*</label>
                <Select onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs text-slate-300">Date*</label>
                <div className="flex items-center gap-2">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <Calendar />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-300">Remarks</label>
                <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Optional" />
              </div>

              <div className="md:col-span-2 flex items-center justify-between mt-3">
                <div className="text-xs text-rose-300">{error}</div>
                <div className="flex gap-2">
                  <Button variant={"ghost" as any} onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Bill"}</Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
