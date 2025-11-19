"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreateClass } from "@/hooks/classes";
import { CreateClassPayload } from "@/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddClassModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [fee, setFee] = useState("");
  const createClassMutation = useCreateClass();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal is closed
      setName("");
      setInstructor("");
      setFee("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fee) {
      toast.warning("Class Name and Fee are required.");
      return;
    }
    
    const payload: CreateClassPayload = {
        name,
        instructor,
        feePerMonthINR: parseInt(fee, 10),
    };

    createClassMutation.mutate(payload, {
        onSuccess: () => {
            toast.success("Class added successfully!");
            onClose();
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#081427] border border-slate-800 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Class</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Class Name (e.g., 'Grade 10 Physics')"
            disabled={createClassMutation.isPending}
          />
          <Input
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            placeholder="Instructor Name (Optional)"
            disabled={createClassMutation.isPending}
          />
          <Input
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="Fee per Month (INR)"
            disabled={createClassMutation.isPending}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={createClassMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createClassMutation.isPending}>
              {createClassMutation.isPending ? "Adding..." : "Add Class"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
