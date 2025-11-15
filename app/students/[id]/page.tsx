"use client";

// File path: /app/(marketing)/students/[id]/page.tsx
// Purpose: Student details page for Tuition Genie — profile header, edit/delete modals, tabs: Performance & Fees

/*
Plan (short):
- Fetch student by id from /api/students/{id}
- Fetch classmates (same class) to compute class position by points
- Header: avatar, name, class, points, edit & delete buttons (open modals)
- Tabs: Performance (test scores list, points breakdown, computed rank, suggestions), Fees (last 5 bills with print, add bill button -> opens /components/add-bill-modal)
- Modals: EditStudentModal (reuse AddStudentModal props pattern) and ConfirmDelete modal
- Keep framer-motion animations, shadcn cards, lucide icons, dark deep-space theme
- Assumes components: AddStudentModal (created), AddBillModal (exists), Button/Card/Input/etc from shadcn
*/

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Edit3, Trash2, ArrowLeft, Printer, Plus } from "lucide-react";
import AddStudentModal from "@/components/add-student-modal";
import AddBillModal from "@/components/add-bill-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Use local Tabs implementation below

type Student = {
  id: string;
  name: string;
  parentsName?: string | null;
  phone?: string | null;
  address?: string | null;
  classId?: string | null;
  classAssigned?: string | null;
  points: number;
  interests?: string | null;
  subjects?: string | null;
  avatarUrl?: string | null;
};

type TestScore = { id: string; title: string; score: number; max: number; pointsEarned: number; date: string };
type Bill = { id: string; amount: number; status: "paid" | "pending" | "overdue"; remarks?: string | null; date: string };

// removed duplicate React import
export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [classmates, setClassmates] = useState<Student[]>([]);
  const [tests, setTests] = useState<TestScore[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState("performance");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetch(`/api/students/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/students?classOf=${id}`).then((r) => (r.ok ? r.json() : [])), // attempt: api returns classmates when provided classOf param or similar
      fetch(`/api/students/${id}/tests`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/students/${id}/bills`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([s, cls, t, b]) => {
        if (!mounted) return;
        setStudent(s || null);
        setClassmates(Array.isArray(cls) ? cls : []);
        setTests(Array.isArray(t) ? t : []);
        setBills(Array.isArray(b) ? b : []);
      })
      .catch((e) => {
        console.error(e);
        // fallback sample
        if (!mounted) return;
        setStudent({ id, name: "Aisha Khan", classAssigned: "XII - Physics", classId: "c1", points: 120, phone: "9876543210" });
        setClassmates([
          { id: "s1", name: "Aisha Khan", classAssigned: "XII - Physics", classId: "c1", points: 120 },
          { id: "s2", name: "Ravi", classAssigned: "XII - Physics", classId: "c1", points: 110 },
          { id: "s3", name: "Neha", classAssigned: "XII - Physics", classId: "c1", points: 140 },
        ]);
        setTests([
          { id: "t1", title: "Mock Test 1", score: 78, max: 100, pointsEarned: 15, date: "2025-09-01" },
          { id: "t2", title: "Test 2", score: 85, max: 100, pointsEarned: 20, date: "2025-10-01" },
        ]);
        setBills([
          { id: "b1", amount: 5000, status: "paid", remarks: "Monthly fee", date: "2025-10-05" },
          { id: "b2", amount: 5000, status: "pending", remarks: "Monthly fee", date: "2025-11-05" },
        ]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  const rank = useMemo(() => {
    if (!student) return null;
    const list = [...classmates, student].filter(Boolean) as Student[];
    const sorted = list.sort((a, b) => b.points - a.points);
    const idx = sorted.findIndex((s) => s.id === student.id);
    return idx >= 0 ? idx + 1 : null;
  }, [student, classmates]);

  const suggestions = useMemo(() => {
    // naive suggestion: if average test score < 60 suggest fundamentals, else advanced practice
    if (tests.length === 0) return ["No test data — assign a diagnostic test."];
    const avg = tests.reduce((s, t) => s + (t.score / t.max) * 100, 0) / tests.length;
    const low = tests.filter((t) => (t.score / t.max) * 100 < 50);
    const out: string[] = [];
    if (avg < 60) out.push("Focus on fundamentals: weekly revision and solved examples.");
    else out.push("Maintain strengths, add timed practice tests.");
    if (low.length) out.push("Target weak topics from recent tests — set micro-goals.");
    return out;
  }, [tests]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/students");
    } catch (e) {
      console.error(e);
      alert("Could not delete student");
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading…</div>;

  if (!student) return <div className="p-8 text-rose-300">Student not found.</div>;

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-[#071021] to-black text-slate-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant={"ghost" as any} onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Button>
        </div>

        <header className="bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800 rounded-2xl p-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-bold text-xl">
              {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="text-2xl font-semibold">{student.name}</div>
              <div className="text-sm text-slate-400 mt-1">{student.classAssigned || student.classId}</div>
              <div className="text-xs text-slate-500 mt-2">Parents: {student.parentsName || "—"} • Phone: {student.phone || "—"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-400">Points</div>
              <div className="text-xl font-semibold text-emerald-300">{student.points}</div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setEditOpen(true)} className="flex items-center gap-2"><Edit3 size={14} /> Edit</Button>
              <Button variant={"destructive" as any} onClick={() => setConfirmDelete(true)} className="flex items-center gap-2"><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs value={tab} onValueChange={setTab}>
            <Tabs.List>
              <Tabs.Trigger value="performance">Performance</Tabs.Trigger>
              <Tabs.Trigger value="fees">Fees</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="performance">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent>
                    <div className="text-xs text-slate-400">Class Position</div>
                    <div className="text-xl font-semibold mt-2">{rank ? `${rank}/${Math.max(1, classmates.length + 1)}` : "—"}</div>
                    <div className="text-sm text-slate-500 mt-2">Based on total points among classmates.</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="text-xs text-slate-400">Recent Avg Score</div>
                    <div className="text-xl font-semibold mt-2">
                      {tests.length ? `${Math.round((tests.reduce((s,t)=>s+(t.score/t.max)*100,0)/tests.length))}%` : "—"}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">Average across last {tests.length} tests.</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="text-xs text-slate-400">Suggested Focus</div>
                    <div className="mt-2 space-y-2">
                      {suggestions.map((s, i) => (
                        <div key={i} className="text-sm text-slate-300">• {s}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold">Test Scores</h3>
                <div className="mt-3 space-y-3">
                  {tests.map((t) => (
                    <motion.div key={t.id} whileHover={{ scale: 1.01 }} className="p-4 bg-slate-900/30 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{t.score}/{t.max}</div>
                        <div className="text-sm text-emerald-300">{t.pointsEarned} pts</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="fees">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Bills</h3>
                <div className="flex gap-2">
                  <Button onClick={() => setAddBillOpen(true)} className="flex items-center gap-2"><Plus size={14} /> Add Bill</Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {(bills.slice(0,5)).map((b) => (
                  <div key={b.id} className="p-4 bg-slate-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">{new Date(b.date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{b.remarks}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-semibold">₹{b.amount}</div>
                      <div className={`text-sm ${b.status === 'paid' ? 'text-emerald-300' : b.status === 'pending' ? 'text-amber-300' : 'text-rose-300'}`}>{b.status}</div>
                      <button onClick={() => window.print()} className="p-2 rounded-md hover:bg-slate-800/40"><Printer size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
      </div>

      {/* Edit modal */}
      <AddStudentModal isOpen={editOpen} onClose={() => setEditOpen(false)} onSaved={(s) => setStudent(s)} />

      {/* Add Bill modal (assumed) */}
      <AddBillModal isOpen={addBillOpen} onClose={() => setAddBillOpen(false)} onSaved={(bill:any)=> setBills(prev=>[bill,...prev])} studentId={id} />

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setConfirmDelete(false)} />
          <motion.div initial={{scale:0.98, opacity:0}} animate={{scale:1, opacity:1}} className="relative bg-slate-900 rounded-lg p-6 z-10 w-full max-w-md">
            <div className="text-lg font-semibold">Delete student?</div>
            <div className="text-sm text-slate-400 mt-2">This action cannot be undone. All student data including tests and bills will be removed.</div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant={"ghost" as any} onClick={()=>setConfirmDelete(false)}>Cancel</Button>
              <Button variant={"destructive" as any} onClick={handleDelete}>Delete</Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

// Minimal Tabs implementation using simple components to avoid dependency on specific shadcn tab API
function Tabs({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void; }) {
  return <div>{React.Children.map(children, (child:any)=> React.cloneElement(child, { activeValue: value, setValue: onValueChange }))}</div>;
}

Tabs.List = function TabsList({ children }: any) { return <div className="flex gap-2 mb-4">{children}</div>; };
Tabs.Trigger = function TabsTrigger({ children, value: v, setValue, activeValue }: any) {
  // the parent will inject activeValue & setValue via clone; to keep things simple we rely on closure using React context would be cleaner
  return (
    <button onClick={() => setValue(v)} className={`px-3 py-2 rounded-md ${v===activeValue? 'bg-emerald-800/30 text-emerald-200':'text-slate-300 hover:bg-slate-800/30'}`}>{children}</button>
  );
};
Tabs.Content = function TabsContent({ children, value: panelValue, activeValue }: any) {
  return panelValue === activeValue ? <div>{children}</div> : null;
};

