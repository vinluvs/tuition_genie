"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    ClipboardList,
    Plus,
    Trash2,
    Search,
    Filter,
    Calendar,
    GraduationCap,
    Users,
    Edit3
} from "lucide-react";
import MainAppLayout from "@/components/MainAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTests, useDeleteTest } from "@/hooks/tests";
import { useClasses } from "@/hooks/classes";
import AddTestScoreModal from "@/components/add-testscore-modal";
import { toast } from "sonner";
import type { TestScoreModel } from "@/lib/types";

export default function ClassTestsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<TestScoreModel | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    const { data: testsData, isLoading: testsLoading } = useTests();
    const { data: classesData } = useClasses();
    const deleteTestMutation = useDeleteTest();

    const tests = testsData?.items || [];
    const classes = classesData?.items || [];

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this test?")) {
            try {
                await deleteTestMutation.mutateAsync(id);
                toast.success("Test deleted");
            } catch (error) {
                toast.error("Failed to delete test");
            }
        }
    };

    const filteredTests = useMemo(() => {
        return tests.filter((test) => {
            const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());

            const testClassId = typeof test.class === 'object' ? test.class._id : test.class;
            const matchesClass = classFilter === "All" || testClassId === classFilter;

            const matchesDate = !dateFilter || test.date.startsWith(dateFilter);

            return matchesSearch && matchesClass && matchesDate;
        });
    }, [tests, searchQuery, classFilter, dateFilter]);

    return (
        <MainAppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <ClipboardList className="text-purple-400" /> Class Tests
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Manage tests, record scores, and track student performance.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingTest(undefined);
                            setIsAddModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Test
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search tests..."
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

                {/* Tests List */}
                <div className="space-y-3">
                    {testsLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading tests...</div>
                    ) : filteredTests.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                            <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No tests found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredTests.map((test) => {
                            const className = typeof test.class === 'object' ? test.class.name : classes.find(c => c._id === test.class)?.name || "Unknown Class";
                            const avgScore = test.scores.length > 0
                                ? test.scores.reduce((acc, s) => acc + s.marksObtained, 0) / test.scores.length
                                : 0;
                            const avgPercentage = ((avgScore / test.totalMarks) * 100).toFixed(1);

                            return (
                                <motion.div
                                    key={test._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                                                <ClipboardList size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <GraduationCap size={12} />
                                                        {className}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(test.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-white text-lg">{test.title}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users size={14} />
                                                        {test.scores.length} Students
                                                    </span>
                                                    <span>
                                                        Avg: <span className="text-slate-200 font-medium">{avgPercentage}%</span>
                                                    </span>
                                                    <span>
                                                        Total Marks: <span className="text-slate-200 font-medium">{test.totalMarks}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingTest(test);
                                                    setIsAddModalOpen(true);
                                                }}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <Edit3 size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(test._id)}
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

                <AddTestScoreModal
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingTest(undefined);
                    }}
                    test={editingTest}
                />
            </div>
        </MainAppLayout>
    );
}
