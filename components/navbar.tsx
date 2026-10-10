"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sparkles,
  Briefcase,
  BookOpen,
  Video,
  User,
  LogOut,
  ShieldCheck,
  Building,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const isAdmin = user?.roles?.includes("ADMIN");
  const isRecruiter = user?.roles?.includes("RECRUITER");
  const isStudent = user?.roles?.includes("STUDENT");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Hiremind
            </span>
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
              Agentic Campus Placement Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              {isStudent && (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/student/dashboard") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/student/resume"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/student/resume") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Resume Hub
                  </Link>
                  <Link
                    href="/student/jobs"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/student/jobs") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Matched Jobs
                  </Link>
                  <Link
                    href="/student/assessments"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/student/assessments") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Assessments
                  </Link>
                  <Link
                    href="/student/interviews"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/student/interviews") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    AI Interviews
                  </Link>
                  <Link
                    href="/student/skills"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/student/skills") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Skill Gap
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/admin/dashboard") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Placement Cell
                  </Link>
                  <Link
                    href="/admin/jobs"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/admin/jobs") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Job Postings
                  </Link>
                  <Link
                    href="/admin/candidates"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/admin/candidates") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    AI Shortlisting
                  </Link>
                  <Link
                    href="/admin/assessments"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/admin/assessments") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Assessments
                  </Link>
                  <Link
                    href="/admin/agent-logs"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/admin/agent-logs") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    AI Agent Logs
                  </Link>
                </>
              )}

              {isRecruiter && (
                <>
                  <Link
                    href="/recruiter/dashboard"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/recruiter/dashboard") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Recruiter Console
                  </Link>
                  <Link
                    href="/recruiter/jobs"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/recruiter/jobs") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    My Postings
                  </Link>
                  <Link
                    href="/recruiter/candidates"
                    className={`transition-colors hover:text-primary ${
                      pathname.startsWith("/recruiter/candidates") ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Matched Talent
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link href="#features" className="text-muted-foreground hover:text-primary">
                Features
              </Link>
              <Link href="#architecture" className="text-muted-foreground hover:text-primary">
                Polyglot Architecture
              </Link>
              <Link href="#agents" className="text-muted-foreground hover:text-primary">
                AI Agents
              </Link>
              <Link href="#workflow" className="text-muted-foreground hover:text-primary">
                Workflow
              </Link>
              <Link href="#faq" className="text-muted-foreground hover:text-primary">
                FAQ
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold">{user.firstName} {user.lastName}</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200">
                  {user.roles?.[0] || "USER"}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  Register as Student
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background p-4 space-y-3">
          {user ? (
            <>
              {isStudent && (
                <div className="flex flex-col space-y-2">
                  <Link href="/student/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/student/resume" onClick={() => setMobileMenuOpen(false)}>Resume Hub</Link>
                  <Link href="/student/jobs" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
                  <Link href="/student/assessments" onClick={() => setMobileMenuOpen(false)}>Assessments</Link>
                  <Link href="/student/interviews" onClick={() => setMobileMenuOpen(false)}>AI Interviews</Link>
                  <Link href="/student/skills" onClick={() => setMobileMenuOpen(false)}>Skill Gap</Link>
                </div>
              )}
              {isAdmin && (
                <div className="flex flex-col space-y-2">
                  <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/admin/jobs" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
                  <Link href="/admin/candidates" onClick={() => setMobileMenuOpen(false)}>Candidates</Link>
                  <Link href="/admin/agent-logs" onClick={() => setMobileMenuOpen(false)}>Agent Logs</Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
