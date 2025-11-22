"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Plus,
    Trash2,
    Search,
    Filter,
    Calendar,
    GraduationCap
} from "lucide-react";
import MainAppLayout from "@/components/MainAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useClassLogs, useDeleteClassLog } from "@/hooks/classlogs";
import { useClasses } from "@/hooks/classes";
import AddClassLogModal from "@/components/add-classlog-modal";
import { toast } from "sonner";
import type { ClassLogModel } from "@/lib/types";

export default function ClassLogsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<ClassLogModel | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    const { data: classLogsData, isLoading: logsLoading } = useClassLogs();
    const { data: classesData } = useClasses();
    const deleteLogMutation = useDeleteClassLog();

    const classLogs = classLogsData?.items || [];
    const classes = classesData?.items || [];

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this class log?")) {
            try {
                await deleteLogMutation.mutateAsync(id);
                toast.success("Class log deleted");
            } catch (error) {
                toast.error("Failed to delete class log");
            }
        }
    };

    const filteredLogs = useMemo(() => {
        return classLogs.filter((log) => {
            const matchesSearch = (log.topic || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.homework || "").toLowerCase().includes(searchQuery.toLowerCase());

            const logClassId = typeof log.class === 'object' ? log.class._id : log.class;
            const matchesClass = classFilter === "All" || logClassId === classFilter;

            const matchesDate = !dateFilter || log.date.startsWith(dateFilter);

            return matchesSearch && matchesClass && matchesDate;
        });
    }, [classLogs, searchQuery, classFilter, dateFilter]);

    const handleEdit = (log: ClassLogModel) => {
        setEditingLog(log);
        setIsAddModalOpen(true);
    };

    const handleAdd = () => {
        setEditingLog(undefined);
        setIsAddModalOpen(true);
    };

    return (
        <MainAppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="text-blue-400" /> Class Logs
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Track daily class activities, topics covered, and homework.
                        </p>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Class Log
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search topics or homework..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-950 border-slate-800"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-48">
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                    <Filter size={14} className="mr-2 text-slate-400" />
                                    <SelectValue placeholder="Filter by Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-40">
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Logs List */}
                <div className="space-y-3">
                    {logsLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading class logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No class logs found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const className = typeof log.class === 'object' ? log.class.name : classes.find(c => c._id === log.class)?.name || "Unknown Class";

                            return (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <GraduationCap size={12} />
                                                        {className}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-white text-lg">{log.topic || "No Topic"}</h3>
                                                {log.homework && (
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        <span className="font-medium text-slate-500">Homework:</span> {log.homework}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(log)}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(log._id)}
                                                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>

                <AddClassLogModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    classLog={editingLog}
                // We don't pass classId here because we want the user to select it in the modal
                />
            </div>
        </MainAppLayout>
    );
}
