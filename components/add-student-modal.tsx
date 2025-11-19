"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { StudentModel } from "@/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (student: any) => void;
  student?: StudentModel;
};

type ClassItem = { id: string; name: string };

export default function AddStudentModal({
  isOpen,
  onClose,
  onSaved,
  student,
}: Props) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [parentsName, setParentsName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [interests, setInterests] = useState("");
  const [subjects, setSubjects] = useState("");

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // fetch classes when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingClasses(true);
    fetch("/api/classes")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load classes");
        return (await res.json()) as ClassItem[];
      })
      .then((data) => setClasses(data || []))
      .catch((e) => {
        console.error(e);
        // fallback sample
        setClasses([
          { id: "c1", name: "Class X" },
          { id: "c2", name: "Class XI" },
          { id: "c3", name: "Class XII" },
        ]);
      })
      .finally(() => setLoadingClasses(false));
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setParentsName(student.parentsName || "");
      setPhone(student.phone || "");
      setAddress(student.address || "");
      setClassId(
        (typeof student.class === "object"
          ? student.class?._id
          : student.class) || null
      );
      setInterests(student.interests?.join(", ") || "");
    } else {
      resetForm();
    }
  }, [student]);

  const resetForm = () => {
    setName("");
    setParentsName("");
    setPhone("");
    setAddress("");
    setClassId(null);
    setInterests("");
    setSubjects("");
    setError(null);
  };

  const validate = () => {
    if (!name.trim()) return "Student name is required";
    if (!phone.trim()) return "Phone is required";
    if (!classId) return "Please assign a class";
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        parentsName: parentsName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        classId,
        interests: interests.trim()
          ? interests.split(",").map((s) => s.trim())
          : [],
        subjects: subjects.trim()
          ? subjects.split(",").map((s) => s.trim())
          : [],
      };

      const url = student ? `/api/students/${student._id}` : "/api/students";
      const method = student ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server returned ${res.status}`);
      }

      const savedData = await res.json();
      // optimistic callback
      onSaved?.(savedData);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save student");
    } finally {
      setSaving(false);
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
            ref={overlayRef}
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
                  {student ? "Edit Student" : "Add New Student"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Student Name<span className="text-rose-400">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aisha Khan"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Parent's Name
                    </label>
                    <Input
                      value={parentsName}
                      onChange={(e) => setParentsName(e.target.value)}
                      placeholder="e.g. Mr. Khan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Phone<span className="text-rose-400">*</span>
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit phone"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Class Assign<span className="text-rose-400">*</span>
                    </label>
                    <Select
                      onValueChange={(v) => setClassId(v)}
                      value={classId || ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            loadingClasses
                              ? "Loading classes..."
                              : "Select class"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">
                      Address
                    </label>
                    <Textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Optional"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">
                      Interests{" "}
                      <span className="text-slate-400 text-xs">
                        (optional)
                      </span>
                    </label>
                    <Input
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="e.g. Robotics, Chess"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">
                      Subjects they enjoy / are good at{" "}
                      <span className="text-slate-400 text-xs">
                        (optional)
                      </span>
                    </label>
                    <Input
                      value={subjects}
                      onChange={(e) => setSubjects(e.target.value)}
                      placeholder="e.g. Maths, Physics"
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
                    <Button type="submit" disabled={saving}>
                      {saving
                        ? "Saving..."
                        : student
                        ? "Update Student"
                        : "Create Student"}
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