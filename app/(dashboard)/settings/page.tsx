"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, Settings as SettingsIcon, ShieldCheck, Database } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function SettingsHubPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "superadmin";

  const sections = [
    {
      title: "Airflow Configuration",
      description: "Manage connection URL and authentication for your Airflow instance.",
      href: "/settings/airflow",
      icon: Server,
      adminOnly: true,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "User Management",
      description: "Manage system users, roles, and DAG access permissions.",
      href: "/settings/users",
      icon: Users,
      adminOnly: true,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Application Logs",
      description: "View system execution logs and monitoring history.",
      href: "/logs",
      icon: Database,
      adminOnly: false,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings & Administration</h1>
        <p className="text-muted-foreground mt-2">Manage your monitoring environment and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          if (section.adminOnly && !isAdmin) return null;

          return (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-white/5">
                <CardHeader>
                  <div className={`w-12 h-12 ${section.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {section.title}
                    {section.adminOnly && (
                      <span title="Superadmin Only">
                        <ShieldCheck className="h-3 w-3 text-amber-500" />
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="pt-2">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                    Manage Settings →
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {!isAdmin && (
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-none">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              Limited Access
            </CardTitle>
            <CardDescription>
              Some configuration options are hidden because you do not have administrative privileges. Contact your superadmin if you need access to system settings.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
