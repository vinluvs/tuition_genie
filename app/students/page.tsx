"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AddStudentModal from "@/components/add-student-modal";
import { Search, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Student = {
  id: string;
  name: string;
  classAssigned: string;
  points: number;
  avatarUrl?: string | null;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // fetch students
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch("/api/students")
      .then(async (res) => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        return (await res.json()) as Student[];
      })
      .then((data) => {
        if (!mounted) return;
        setStudents(data || []);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError("Could not load students. Showing sample data.");
        // fallback sample data
        setStudents([
          { id: "s1", name: "Aisha Khan", classAssigned: "XII - Physics", points: 120 },
          { id: "s2", name: "Rohit Sharma", classAssigned: "XI - Maths", points: 95 },
          { id: "s3", name: "Neha Gupta", classAssigned: "X - Chemistry", points: 140 },
        ]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // debounce query input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  // filtered list
  const filtered = useMemo(() => {
    if (!debouncedQuery) return students;
    const q = debouncedQuery.toLowerCase();
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.classAssigned.toLowerCase().includes(q));
  }, [students, debouncedQuery]);

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-[#071021] to-black text-slate-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Students</h1>
            <p className="text-slate-400 text-sm mt-1">All enrolled students — search, open profile, and reward points.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <label htmlFor="search" className="sr-only">Search students</label>
              <div className="flex items-center gap-2 bg-slate-900/40 rounded-md px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or class"
                  className="bg-transparent outline-none w-full placeholder:text-slate-500 text-slate-100"
                />
              </div>
            </div>

            <Button aria-label="Add new student" className="flex items-center gap-2" onClick={() => setModalOpen(true)}>
              <Plus size={14} /> Add Student
            </Button>
            <AddStudentModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSaved={(student) => {
                setStudents((prev) => [...prev, student]);
              }}
            />
          </div>
        </header>

        <section>
          <Card className="bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800">
            <CardContent>
              {loading ? (
                <div className="py-10 text-center text-slate-400">Loading students…</div>
              ) : (
                <div className="space-y-2">
                  {error && <div className="text-xs text-amber-300">{error}</div>}

                  {filtered.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">No students match your search.</div>
                  ) : (
                    <ul className="divide-y divide-slate-800">
                      {filtered.map((s) => (
                        <motion.li
                          key={s.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center gap-4">
                            <StudentAvatar student={s} />
                            <div>
                              <div className="font-medium">{s.name}</div>
                              <div className="text-xs text-slate-500">{s.classAssigned}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-sm font-semibold text-emerald-300">{s.points}</div>
                            <Link href={`/students/${s.id}`} className="p-2 rounded-md hover:bg-slate-800/40">
                              <span className="sr-only">Open {s.name}</span>
                              <ArrowRight />
                            </Link>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function StudentAvatar({ student }: { student: Student }) {
  // if avatarUrl available, show <img>, otherwise initials circle
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return student.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={student.avatarUrl} alt={`${student.name} avatar`} className="w-11 h-11 rounded-full object-cover" />
  ) : (
    <div className="w-11 h-11 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-semibold">{initials}</div>
  );
}
