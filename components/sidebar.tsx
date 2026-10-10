"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  CheckSquare,
  Video,
  TrendingUp,
  Bell,
  Settings,
  Users,
  Building2,
  Cpu,
  ShieldAlert,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

interface SidebarProps {
  role: "STUDENT" | "ADMIN" | "RECRUITER";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const studentItems: NavItem[] = [
    { title: "Overview", href: "/student/dashboard", icon: LayoutDashboard },
    { title: "AI Resume Hub", href: "/student/resume", icon: FileText, badge: "AI" },
    { title: "Matched Jobs", href: "/student/jobs", icon: Briefcase },
    { title: "Adaptive Tests", href: "/student/assessments", icon: CheckSquare },
    { title: "AI Interview Room", href: "/student/interviews", icon: Video, badge: "Live" },
    { title: "Skill Gap Matrix", href: "/student/skills", icon: TrendingUp },
    { title: "My Profile", href: "/student/profile", icon: GraduationCap },
    { title: "Notifications", href: "/student/notifications", icon: Bell },
  ];

  const adminItems: NavItem[] = [
    { title: "Placement Hub", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Student Roster", href: "/admin/students", icon: Users },
    { title: "Partner Companies", href: "/admin/companies", icon: Building2 },
    { title: "Job Postings", href: "/admin/jobs", icon: Briefcase },
    { title: "AI Candidate Match", href: "/admin/candidates", icon: Sparkles, badge: "AI" },
    { title: "Assessments Bank", href: "/admin/assessments", icon: CheckSquare },
    { title: "Interview Reviews", href: "/admin/interviews", icon: Video },
    { title: "Analytics & Funnel", href: "/admin/analytics", icon: TrendingUp },
    { title: "Agent Run Audit", href: "/admin/agent-logs", icon: Cpu, badge: "Logs" },
    { title: "Security & Audit", href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  const recruiterItems: NavItem[] = [
    { title: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
    { title: "My Job Postings", href: "/recruiter/jobs", icon: Briefcase },
    { title: "Applicant Matches", href: "/recruiter/candidates", icon: Users, badge: "AI" },
  ];

  const items = role === "ADMIN" ? adminItems : role === "RECRUITER" ? recruiterItems : studentItems;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {role === "ADMIN" ? "Placement Admin" : role === "RECRUITER" ? "Corporate Portal" : "Student Workspace"}
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}/dashboard` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-muted-foreground")} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
