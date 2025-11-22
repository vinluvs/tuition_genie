"use client";

import React, { useState, useEffect } from "react";
import MainAppLayout from "@/components/MainAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMe, useUpdateUser } from "@/hooks/auth";
import { toast } from "sonner";
import { Settings, User, Building } from "lucide-react";

export default function SettingsPage() {
    const { data: user, isLoading } = useMe();
    const updateUserMutation = useUpdateUser();

    const [name, setName] = useState("");
    const [centerName, setCenterName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setCenterName(user.centerName || "");
            setEmail(user.email);
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUserMutation.mutateAsync({
                name,
                centerName,
            });
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        }
    };

    if (isLoading) {
        return (
            <MainAppLayout>
                <div className="flex items-center justify-center h-[50vh] text-slate-400">
                    Loading settings...
                </div>
            </MainAppLayout>
        );
    }

    return (
        <MainAppLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Settings className="text-slate-400" /> Settings
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage your account and center preferences
                    </p>
                </div>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="text-indigo-400" size={20} /> Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your personal details and tuition center information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-slate-950 border-slate-800 pl-10"
                                            placeholder="Your Name"
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={email}
                                        disabled
                                        className="bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-slate-500">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="centerName" className="text-slate-300">Tuition Center Name</Label>
                                    <div className="relative">
                                        <Input
                                            id="centerName"
                                            value={centerName}
                                            onChange={(e) => setCenterName(e.target.value)}
                                            className="bg-slate-950 border-slate-800 pl-10"
                                            placeholder="e.g. Excellence Academy"
                                        />
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    </div>
                                    <p className="text-xs text-slate-500">This name will appear on invoices and reports.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={updateUserMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                                >
                                    {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainAppLayout>
    );
}
