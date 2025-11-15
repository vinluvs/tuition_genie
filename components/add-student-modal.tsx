"use client";

/*
File path: /components/add-student-modal.tsx

PSEUDOCODE / PLAN
1. Export a React component AddStudentModal with props:
   - isOpen: boolean
   - onClose: () => void
   - onSaved?: (student) => void
2. Local state: form fields (name, parentsName, phone, address, classId, interests, subjects), classes list, loading, error
3. On mount (when modal opens) fetch classes list from /api/classes
4. Simple client-side validation (required: name, phone, classId)
5. Submit handler: POST to /api/students with form JSON, handle response
   - show loading state, disable submit
   - on success: call onSaved, reset form, close modal
   - on error: show friendly message
6. Modal: accessible markup, close on overlay click or Esc, animated with framer-motion
7. Keep Tailwind & shadcn look consistent with theme (dark, neon accents)
8. Export default AddStudentModal

Notes: This component assumes the presence of shadcn UI Button/Input/Select components at '@/components/ui/*'. If your project uses different paths, update imports.
*/

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Info } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (student: any) => void;
};

type ClassItem = { id: string; name: string };

export default function AddStudentModal({ isOpen, onClose, onSaved }: Props) {
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
        interests: interests.trim() || null,
        subjects: subjects.trim() || null,
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server returned ${res.status}`);
      }

      const created = await res.json();
      // optimistic callback
      onSaved?.(created);
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
          <div ref={overlayRef} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose()} />

          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            className="relative w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-linear-to-br from-[#051126] to-[#081427] border border-slate-800 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add New Student</h3>
                <button aria-label="Close" onClick={onClose} className="p-2 rounded-md hover:bg-slate-800/40">
                  <X />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Student Name<span className="text-rose-400">*</span></label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aisha Khan" autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Parent's Name</label>
                    <Input value={parentsName} onChange={(e) => setParentsName(e.target.value)} placeholder="e.g. Mr. Khan" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Phone<span className="text-rose-400">*</span></label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit phone" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Class Assign<span className="text-rose-400">*</span></label>
                    <Select onValueChange={(v) => setClassId(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select class"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">Address</label>
                    <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">Interests <span className="text-slate-400 text-xs">(optional)</span></label>
                    <Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Robotics, Chess" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">Subjects they enjoy / are good at <span className="text-slate-400 text-xs">(optional)</span></label>
                    <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Maths, Physics" />
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-rose-300 min-h-5">{error}</div>
                  <div className="flex gap-2">
                    <Button variant={"ghost" as any} type="button" onClick={() => { resetForm(); onClose(); }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Create Student"}
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
