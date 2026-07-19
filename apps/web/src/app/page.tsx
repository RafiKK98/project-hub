"use client";

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { useAuthStore } from "@/store/auth.store";
import {
  ArrowRight,
  BarChart3,
  Bell,
  GitBranch,
  Kanban,
  Moon,
  Shield,
  Sun,
  Users,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

// ── Animated issue key cycling ────────────────────────────────────────────────

const DEMO_ISSUES = [
  {
    key: "WEB-42",
    title: "Redesign landing page",
    status: "In Progress",
    color: "text-yellow-500",
  },
  {
    key: "API-17",
    title: "Add refresh token rotation",
    status: "Done",
    color: "text-green-500",
  },
  {
    key: "DSH-8",
    title: "Build analytics dashboard",
    status: "In Review",
    color: "text-violet-500",
  },
  {
    key: "AUTH-3",
    title: "Implement RBAC guards",
    status: "Done",
    color: "text-green-500",
  },
  {
    key: "UI-21",
    title: "Dark mode support",
    status: "In Progress",
    color: "text-yellow-500",
  },
];

function IssueTerminal() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % DEMO_ISSUES.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const issue = DEMO_ISSUES[current]!;

  return (
    <div className="mx-auto mt-12 max-w-lg rounded-xl border border-border bg-card p-4 font-mono text-sm shadow-xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-muted-foreground">projecthub</span>
      </div>
      <div
        className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">$</span>
          <span className="text-foreground">issue view </span>
          <span className="text-blue-400">{issue.key}</span>
        </div>
        <div className="mt-3 space-y-1.5 pl-4 text-xs">
          <div className="flex gap-4">
            <span className="w-16 text-muted-foreground">title</span>
            <span className="text-foreground">{issue.title}</span>
          </div>
          <div className="flex gap-4">
            <span className="w-16 text-muted-foreground">status</span>
            <span className={issue.color}>{issue.status}</span>
          </div>
          <div className="flex gap-4">
            <span className="w-16 text-muted-foreground">key</span>
            <span className="text-foreground">{issue.key}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Kanban,
    title: "Kanban Board",
    description:
      "Drag and drop issues across columns. Reorder within columns. Real-time status updates.",
  },
  {
    icon: Users,
    title: "Organizations & Teams",
    description:
      "Multi-tenant workspaces with fine-grained roles. Invite members, manage permissions.",
  },
  {
    icon: GitBranch,
    title: "Project Tracking",
    description:
      "Sequential issue numbers, priorities, assignees, due dates, and rich descriptions.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "In-app notification center. Get notified when issues are assigned or commented on.",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description:
      "Cross-project overview. See what's assigned to you and project progress at a glance.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Owner, Admin, Manager, Developer, Reporter, Guest. Fine-grained permission system.",
  },
];

// ── Nav ───────────────────────────────────────────────────────────────────────

function LandingNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
          <span className="text-sm font-bold text-background">P</span>
        </div>
        ProjectHub
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        )}
        {isAuthenticated ? (
          <Button asChild size="sm">
            <Link href="/dashboard">
              Go to dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started free</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <LandingNav isAuthenticated={isAuthenticated} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center md:py-36">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-3xl">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Zap className="h-3 w-3" />
            Open source · Free to use
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Project management
            <span className="block text-muted-foreground">
              built for engineers
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Track issues, ship faster. ProjectHub gives your team a Kanban
            board, issue tracker, notification system, and cross-project
            dashboard — all in one place.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard">
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    Get started free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>

          <IssueTerminal />
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Everything your team needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built with the same stack as the tools you love — Linear, GitHub,
              Notion.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/30"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* Tech stack */}
      <section className="px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "Next.js 15",
              "NestJS",
              "TypeScript",
              "Prisma",
              "PostgreSQL",
              "TanStack Query",
              "Tailwind CSS v4",
              "shadcn/ui",
              "@dnd-kit",
              "TurboRepo",
            ].map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Ready to ship?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Create an account and set up your first project in under a minute.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard">
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
              <span className="text-[10px] font-bold text-background">P</span>
            </div>
            <span>ProjectHub</span>
          </div>
          <p>Built with Next.js · Deployed on Vercel &amp; Render</p>
        </div>
      </footer>
    </div>
  );
}
