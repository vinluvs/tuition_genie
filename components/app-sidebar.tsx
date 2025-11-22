"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  ClipboardList,
  TrendingDown,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { CenterHeader } from "@/components/center-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useMe } from "@/hooks/auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useMe()

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
    },
    {
      title: "Classes",
      url: "/classes",
      icon: GraduationCap,
    },
    {
      title: "Class Logs",
      url: "/classlogs",
      icon: BookOpen,
    },
    {
      title: "Class Tests",
      url: "/tests",
      icon: ClipboardList,
    },
    {
      title: "Fees",
      url: "/fees",
      icon: DollarSign,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: TrendingDown,
    },
  ]

  const userData = user ? {
    name: user.name || "User",
    email: user.email,
    avatar: "", // No avatar in current user model
  } : {
    name: "Loading...",
    email: "",
    avatar: "",
  }

  const centerName = user?.centerName || "Tuition Center"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CenterHeader centerName={centerName} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
