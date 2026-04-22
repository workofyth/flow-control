"use client";

import {
  LayoutDashboard,
  Play,
  Settings,
  History,
  Terminal,
  LogOut,
  ChevronRight,
  Monitor,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "All DAGs",
    url: "/dashboard",
    icon: Play,
  },
  {
    title: "History",
    url: "/history",
    icon: History,
  },
];

const secondaryItems = [
  {
    title: "Logs",
    url: "/logs",
    icon: Terminal,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Monitor className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">FlowMonitor</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Secondary</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(session?.user as any)?.role === "superadmin" && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/settings/users" />}
                      tooltip="User Management"
                      isActive={pathname === "/settings/users"}
                    >
                      <Users className="size-4" />
                      <span>User Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/settings/airflow" />}
                      tooltip="Airflow Config"
                      isActive={pathname === "/settings/airflow"}
                    >
                      <Monitor className="size-4" />
                      <span>Airflow Config</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
