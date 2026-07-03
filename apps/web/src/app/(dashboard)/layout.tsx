import { TopNav } from "@/components/layout/top-nav";
import { type ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
