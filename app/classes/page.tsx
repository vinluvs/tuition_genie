"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus, ArrowRight } from "lucide-react";
import MainAppLayout from "@/components/MainAppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useClasses } from "@/hooks/classes";
import AddClassModal from "@/components/add-class-modal";

function ClassesPageContent() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: classes, isLoading, error } = useClasses();

  // Debouncing for search
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Client-side filtering logic
  const filtered = useMemo(() => {
    const items = classes?.items || [];
    if (!debounced) return items;
    const q = debounced.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.instructor || "").toLowerCase().includes(q)
    );
  }, [classes, debounced]);

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <header className="flex items-start md:items-center justify-between gap-4 mb-6 flex-col md:flex-row">
          <div>
            <h1 className="text-3xl text-emerald-600 font-extrabold">Classes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage batches and class details.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-accent/50 rounded-md px-3 py-2">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search classes or instructor"
                className="bg-transparent outline-none placeholder:text-slate-500"
              />
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={14} /> New Class
            </Button>
          </div>
        </header>

        <Card >
          <CardContent className="p-0">
            {error && (
              <div className="py-10 text-center text-red-400">
                Failed to load classes.
              </div>
            )}
            {isLoading && !error ? (
              <div className="py-10 text-center">
                Loading classes…
              </div>
            ) : (
              <ul className="divide-y">
                {filtered.length === 0 ? (
                  <div className="py-6 text-center ">
                    No classes found.
                  </div>
                ) : (
                  filtered.map((c) => (
                    <motion.li
                      key={c._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between py-4 px-6"
                    >
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs ">
                          {c.instructor || "No instructor assigned"} | Fee: ₹
                          {c.feePerMonthINR.toLocaleString("en-IN")} /mo
                        </div>
                        {c.schedule?.startTime && c.schedule?.endTime && (
                          <div className="text-xs text-emerald-400 mt-1">
                            **Schedule:** {c.schedule?.days?.join(", ")} (
                            {c.schedule?.startTime} - {c.schedule?.endTime})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <Link
                          href={`/classes/${c._id}`}
                          className="p-2 rounded-md hover:bg-slate-800/40"
                        >
                          <ArrowRight />
                        </Link>
                      </div>
                    </motion.li>
                  ))
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default function ClassesPage() {
  return (
    <MainAppLayout>
      <ClassesPageContent />
    </MainAppLayout>
  );
}
