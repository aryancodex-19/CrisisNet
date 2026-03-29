"use client"

import * as React from "react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ShieldAlert, LayoutDashboard, Activity, Package, Map } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

// This is sample data.
const data = {
  teams: [
    {
      name: "CrisisNet",
      logo: <ShieldAlert />,
      plan: "Mumbai HQ",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
    },
    {
      title: "Emergency Requests",
      url: "/requests",
      icon: <Activity />,
    },
    {
      title: "Resource Management",
      url: "/resources",
      icon: <Package />,
    },
    {
      title: "Transparency Map",
      url: "/map",
      icon: <Map />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-1.5 p-2">
          <span className="text-[10px] font-medium text-muted-foreground uppercase group-data-[collapsible=icon]:hidden pl-1">Theme</span>
          <div className="flex items-center w-full group-data-[collapsible=icon]:justify-center">
             <ModeToggle />
          </div>
        </div>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
