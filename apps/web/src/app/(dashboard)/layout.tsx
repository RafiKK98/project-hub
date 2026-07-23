import { TopNav } from "@/components/layout/top-nav";
import { SessionSync } from "@/components/session-sync";
import { type ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SessionSync />
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
