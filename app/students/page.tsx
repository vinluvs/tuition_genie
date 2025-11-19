"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AddStudentModal from "@/components/add-student-modal";
import { useStudents } from "@/hooks/students";
import { Search, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudentModel } from "@/lib/types";

type StudentListItem = StudentModel & {
  class: { name: string };
  avatarUrl?: string | null;
};

export default function StudentsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const {
    data: studentsData,
    isLoading,
    isError,
    error,
  } = useStudents({ search: debouncedQuery });

  const students = useMemo(
    () => (studentsData?.items as StudentListItem[]) ?? [],
    [studentsData]
  );

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-[#071021] to-black text-slate-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Students</h1>
            <p className="text-slate-400 text-sm mt-1">
              All enrolled students — search, open profile, and reward points.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <label htmlFor="search" className="sr-only">
                Search students
              </label>
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

            <Button
              aria-label="Add new student"
              className="flex items-center gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={14} /> Add Student
            </Button>
            <AddStudentModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSaved={() => {
                // Invalidation is handled by the useCreateStudent hook
              }}
            />
          </div>
        </header>

        <section>
          <Card className="bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800">
            <CardContent>
              {isLoading ? (
                <div className="py-10 text-center text-slate-400">
                  Loading students…
                </div>
              ) : isError ? (
                <div className="py-10 text-center text-amber-300">
                  {error?.message || "Could not load students. Please try again."}
                </div>
              ) : (
                <div className="space-y-2">
                  {students.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      No students match your search.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-800">
                      {students.map((s) => (
                        <motion.li
                          key={s._id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center gap-4">
                            <StudentAvatar student={s} />
                            <div>
                              <div className="font-medium">{s.name}</div>
                              <div className="text-xs text-slate-500">
                                {s.class ? s.class.name : "Unassigned"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-sm font-semibold text-emerald-300">
                              {s.totalpoints} pts
                            </div>
                            <Link
                              href={`/students/${s._id}`}
                              className="p-2 rounded-md hover:bg-slate-800/40"
                            >
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

function StudentAvatar({ student }: { student: StudentListItem }) {
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return student.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={student.avatarUrl}
      alt={`${student.name} avatar`}
      className="w-11 h-11 rounded-full object-cover"
    />
  ) : (
    <div className="w-11 h-11 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-semibold">
      {initials}
    </div>
  );
}