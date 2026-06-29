import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px=4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
            <span className="text-lg font-bold text-background">P</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            ProjectHub
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
