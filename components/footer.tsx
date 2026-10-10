import Link from "next/link";
import { Sparkles, Shield, Database, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-950/50 py-12 text-sm text-muted-foreground">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white">
              Hiremind
            </span>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            An Agentic AI-Based Intelligent Recruitment and Placement System for Automated Resume Screening,
            Adaptive Assessment, and Interview Evaluation. Engineered with a strict Polyglot Data Architecture
            (PostgreSQL + MongoDB + ChromaDB).
          </p>
          <div className="flex items-center gap-4 text-xs pt-2">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <Database className="h-3 w-3" /> PostgreSQL Relational
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <Database className="h-3 w-3" /> MongoDB Flexible
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
              <Cpu className="h-3 w-3" /> ChromaDB Vectors
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">AI Agents</h4>
          <ul className="space-y-2 text-xs">
            <li>Resume Analysis Agent</li>
            <li>JD Analysis Agent</li>
            <li>Hybrid Candidate Matcher</li>
            <li>Adaptive Assessment Engine</li>
            <li>AI Interview & Evaluation</li>
            <li>Skill Gap Matrix Agent</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Responsible AI</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              Bias-Free Evaluations
            </li>
            <li>Explainable AI Breakdowns</li>
            <li>Human-in-the-Loop Overrides</li>
            <li>Full Agent Audit Logs</li>
          </ul>
        </div>
      </div>

      <div className="container mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
        <p>© 2025-2026 Hiremind. Enterprise Academic Placement System.</p>
        <p className="mt-2 sm:mt-0">Production Full-Stack Architecture</p>
      </div>
    </footer>
  );
}
