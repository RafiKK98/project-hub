// ── Animated issue key cycling ────────────────────────────────────────────────

import { useEffect, useState } from "react";

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

export function IssueTerminal() {
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
