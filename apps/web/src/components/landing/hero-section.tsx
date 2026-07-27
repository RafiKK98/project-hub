import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { IssueTerminal } from "./issue-terminal";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
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
          Track issues, ship faster. ProjectHub gives your team a Kanban board,
          issue tracker, notification system, and cross-project dashboard — all
          in one place.
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
  );
}
