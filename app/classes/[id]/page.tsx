"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Edit3, Trash2, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClassSummary } from "@/lib/types";

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [cls, setCls] = useState<ClassSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetch(`/api/classes/${id}`).then((r)=> r.ok ? r.json() : null),
      fetch(`/api/classes/${id}/students`).then((r)=> r.ok ? r.json() : []),
    ]).then(([c, s])=>{
      if(!mounted) return;
      setCls(c || { id, name: 'Class '+id, teacher: '—' });
    }).catch((e)=>{
      console.error(e);
      if(!mounted) return;
      setCls({_id:id, name:'Class '+id, instructor:'—'});
    }).finally(()=> mounted && setLoading(false));
    return ()=>{ mounted=false; }
  },[id]);

  const handleDelete = async ()=>{
    try{
      const res = await fetch(`/api/classes/${id}`,{ method: 'DELETE' });
      if(!res.ok) throw new Error('Failed');
      router.push('/classes');
    }catch(e){ console.error(e); alert('Could not delete class'); }
  }

  if(loading) return <div className="p-8 text-slate-400">Loading…</div>;
  if(!cls) return <div className="p-8 text-rose-300">Class not found.</div>;

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-[#071021] to-black text-slate-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant={"ghost" as any} onClick={()=>router.back()} className="flex items-center gap-2"><ArrowLeft size={16} /> Back</Button>
        </div>

        <header className="bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800 rounded-2xl p-6 flex items-center justify-between gap-6">
          <div>
            <div className="text-2xl font-semibold">{cls.name}</div>
            <div className="text-sm text-slate-400 mt-1">Teacher: {cls.instructor || '—'}</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={()=>setConfirmDelete(true)} variant={"destructive" as any} className="flex items-center gap-2"><Trash2 size={14} /> Delete</Button>
          </div>
        </header>

        <div >
          <Card>
            <CardContent>
              <div className="text-xs text-slate-400">Actions</div>
              <div className="mt-3 flex flex-col gap-2">
                <Link href={`/classes/${id}/edit`} className="text-sm hover:underline">Edit class details</Link>
                <Link href={`/classes/${id}/attendance`} className="text-sm hover:underline">Attendance</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setConfirmDelete(false)} />
          <motion.div initial={{scale:0.98, opacity:0}} animate={{scale:1, opacity:1}} className="relative bg-slate-900 rounded-lg p-6 z-10 w-full max-w-md">
            <div className="text-lg font-semibold">Delete class?</div>
            <div className="text-sm text-slate-400 mt-2">This will remove the class and detach students from it.</div>
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
