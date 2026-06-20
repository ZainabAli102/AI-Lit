"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Building2, GraduationCap, LayoutDashboard, LogIn, MonitorUp, School, Settings2, UsersRound } from "lucide-react";
import { clsx } from "clsx";

const navGroups = [
  {
    title: "Access",
    items: [{ label: "Login", href: "/login", icon: LogIn }]
  },
  {
    title: "CONNECTED",
    items: [
      { label: "Admin", href: "/admin", icon: LayoutDashboard },
      { label: "Schools", href: "/admin/schools", icon: Building2 },
      { label: "Curriculum", href: "/admin/curriculum", icon: BookOpen },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 }
    ]
  },
  {
    title: "School",
    items: [
      { label: "Overview", href: "/school", icon: School },
      { label: "Classes", href: "/school/classes", icon: GraduationCap },
      { label: "Teachers", href: "/school/teachers", icon: UsersRound },
      { label: "Progress", href: "/school/progress", icon: BarChart3 }
    ]
  },
  {
    title: "Teaching",
    items: [
      { label: "Teacher", href: "/teacher", icon: LayoutDashboard },
      { label: "My Classes", href: "/teacher/classes", icon: GraduationCap },
      { label: "Lesson Workspace", href: "/teacher/lessons/sample-lesson", icon: BookOpen },
      { label: "Smartboard", href: "/teacher/smartboard/sample-activity", icon: MonitorUp }
    ]
  },
  {
    title: "Future",
    items: [
      { label: "Student", href: "/student", icon: LayoutDashboard },
      { label: "Dashboard", href: "/student/dashboard", icon: Settings2 }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[#dde3dc] bg-white/90 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 px-5 py-5">
        <Link className="block rounded-md px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116466]" href="/teacher">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#116466]">CONNECTED MENA</p>
          <p className="mt-1 text-lg font-semibold text-[#17211c]">AI Literacy Platform</p>
        </Link>

        <nav className="flex gap-4 overflow-x-auto pb-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {navGroups.map((group) => (
            <div className="min-w-48 lg:min-w-0" key={group.title}>
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#87928d]">{group.title}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      className={clsx(
                        "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116466]",
                        isActive ? "bg-[#e6f1ed] text-[#0b4d4f]" : "text-[#42514a] hover:bg-[#f1f4f1] hover:text-[#17211c]"
                      )}
                      href={item.href}
                      key={item.href}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
