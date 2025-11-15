"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import {toast} from 'sonner'

// NOTE: Placeholder hook for context/auth. Replace with your actual implementation.
const useAuth = () => ({
  // You must provide a valid token based on your setup.
  token: typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : 'DUMMY_TOKEN', 
});

// --- Types based on your backend structure ---
type ClassItem = {
  _id: string; // Correctly using MongoDB's _id
  name: string;
  instructor?: string | null; // Correctly using 'instructor' field
  feePerMonthINR: number; // Added from Class model
  // ADDED: Schedule type definition
  schedule?: { 
    days?: string[]; // e.g., ["Mon", "Wed", "Fri"]
    startTime?: string; // e.g., "17:00"
    endTime?: string;   // e.g., "18:30"
  };
};

// --- New Class Modal Component ---
// NOTE: This modal does not yet include schedule fields. They remain optional based on classes.routes.js.
const NewClassModal = ({ isOpen, onClose, onClassAdded }: { isOpen: boolean, onClose: () => void, onClassAdded: (newClass: ClassItem) => void }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token === 'DUMMY_TOKEN') {
        toast.error("Authentication token is required to add a class.");
        return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          instructor: instructor.trim() || undefined,
          feePerMonthINR: parseFloat(fee),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create class: ${response.statusText}`);
      }

      const newClass: ClassItem = await response.json();
      onClassAdded(newClass);
      toast.success("Class added successfully!");
      onClose();
      // Reset form
      setName('');
      setInstructor('');
      setFee('');
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[#051026] text-slate-100 p-6 rounded-lg shadow-2xl w-full max-w-md border border-slate-800"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Class</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 hover:bg-slate-800">
            <X size={20} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">Class Name (e.g., XI - Physics)</label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="instructor" className="block text-sm font-medium text-slate-400 mb-1">Instructor/Teacher Name (Optional)</label>
            <Input id="instructor" type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} />
          </div>
          <div>
            <label htmlFor="fee" className="block text-sm font-medium text-slate-400 mb-1">Fee per Month (INR)</label>
            <Input id="fee" type="number" value={fee} onChange={(e) => setFee(e.target.value)} required min="0" step="any" />
          </div>
          <Button type="submit" disabled={loading || !name || !fee} className="w-full">
            {loading ? 'Adding Class...' : 'Add Class'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
// --- End of Modal Component ---
// ------------------------------------------------------------------
// --- Classes Page Component ---

export default function ClassesPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch classes from the backend
  useEffect(() => {
    if (!token || token === 'DUMMY_TOKEN') {
        setClasses([]);
        setError("Authentication token is required to load data.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    fetch("/api/classes", {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
      .then(async (r) => {
        if (!r.ok) {
            const errorData = await r.json();
            throw new Error(errorData.error || `Failed with status: ${r.status}`);
        }
        return r.json();
      })
      .then((data: ClassItem[]) => {
          setClasses(data);
      })
      .catch((e) => {
        console.error("Fetch error:", e);
        setError("Failed to load classes. Showing sample data.");
        // Fallback to sample data if fetch fails
        setClasses([
          { _id: "c1", name: "XII - Physics", instructor: "Ravi Sir", feePerMonthINR: 2000, schedule: { days: ["Mon", "Wed"], startTime: "18:00", endTime: "19:30" } },
          { _id: "c2", name: "XI - Maths", instructor: "Neha Ma'am", feePerMonthINR: 1500, schedule: { days: ["Tue", "Thu", "Sat"], startTime: "17:00", endTime: "18:00" } },
        ]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Debouncing for search
  useEffect(() => { const t = setTimeout(()=>setDebounced(query.trim()), 200); return ()=>clearTimeout(t); }, [query]);

  // Client-side filtering logic
  const filtered = useMemo(()=>{
    if(!debounced) return classes;
    const q = debounced.toLowerCase();
    // Search by name or instructor
    return classes.filter(c=>c.name.toLowerCase().includes(q) || (c.instructor||"").toLowerCase().includes(q));
  }, [classes, debounced]);

  // Handler for adding a new class to the list after successful creation
  const handleClassAdded = (newClass: ClassItem) => {
    // Add the newly created class and sort by name
    setClasses(prev => [...prev, newClass].sort((a,b) => a.name.localeCompare(b.name)));
  }

  return (
    <>
      <main className="min-h-screen bg-linear-to-b from-slate-900 via-[#071021] to-black text-slate-100 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex items-start md:items-center justify-between gap-4 mb-6 flex-col md:flex-row">
            <div>
              <h1 className="text-3xl font-extrabold">Classes</h1>
              <p className="text-slate-400 text-sm mt-1">Manage batches and class details.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="flex items-center gap-2 bg-slate-900/40 rounded-md px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                  placeholder="Search classes or instructor"
                  className="bg-transparent outline-none placeholder:text-slate-500"
                />
              </div>
              {/* Add New Class CTA - Now opens modal */}
              <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                <Plus size={14} /> New Class
              </Button>
            </div>
          </header>

          <Card className="bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800">
            <CardContent className="p-0">
              {error && <div className="py-10 text-center text-red-400">{error}</div>}
              {loading && !error ? <div className="py-10 text-center text-slate-400">Loading classes…</div> : (
                <ul className="divide-y divide-slate-800">
                  {filtered.length===0 ? <div className="py-6 text-center text-slate-500">No classes found.</div> : filtered.map((c)=> (
                    <motion.li key={c._id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} whileHover={{scale:1.01}} className="flex items-center justify-between py-4 px-6">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        {/* Displaying instructor and fee */}
                        <div className="text-xs text-slate-500">
                          {c.instructor || 'No instructor assigned'} | Fee: ₹{c.feePerMonthINR.toLocaleString('en-IN')} /mo
                        </div>
                        {/* ADDED: Displaying schedule if it exists and has days defined */}
                        {c.schedule?.startTime && c.schedule?.endTime && (
                            <div className="text-xs text-emerald-400 mt-1">
                                **Schedule:** {c.schedule?.days?.join(', ')} ({c.schedule?.startTime} - {c.schedule?.endTime})
                            </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <Link href={`/classes/${c._id}`} className="p-2 rounded-md hover:bg-slate-800/40">
                            <ArrowRight />
                        </Link>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* New Class Modal Component */}
      <NewClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassAdded={handleClassAdded}
      />
    </>
  );
}