"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export function DepartmentPerformanceChart({ data }: { data: any[] }) {
  const chartData = data && data.length > 0 ? data : [
    { department: "Computer Science", total: 4, avgCgpa: 8.65, placed: 2 },
    { department: "Information Tech", total: 2, avgCgpa: 7.40, placed: 1 },
    { department: "AI & ML", total: 1, avgCgpa: 8.95, placed: 1 },
    { department: "ECE", total: 1, avgCgpa: 8.20, placed: 0 },
    { department: "Data Science", total: 1, avgCgpa: 8.10, placed: 1 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey="department" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          />
          <Bar dataKey="total" name="Total Students" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="placed" name="Placed / Shortlisted" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PipelineFunnelChart({ data }: { data: any[] }) {
  const chartData = data && data.length > 0 ? data : [
    { stage: "Applications", count: 12 },
    { stage: "AI Screened", count: 10 },
    { stage: "Shortlisted", count: 8 },
    { stage: "Tests Completed", count: 6 },
    { stage: "Interviews", count: 4 },
    { stage: "Offers Made", count: 3 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
          <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillDistributionChart() {
  const skillData = [
    { name: "Python", count: 9 },
    { name: "React", count: 8 },
    { name: "PostgreSQL", count: 7 },
    { name: "SQL", count: 7 },
    { name: "TypeScript", count: 6 },
    { name: "Docker", count: 4 },
    { name: "Machine Learning", count: 4 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={skillData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
          <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
