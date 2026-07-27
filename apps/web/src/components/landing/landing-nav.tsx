import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

interface LandingNavProps {
  isAuthenticated: boolean;
}

export function LandingNav({ isAuthenticated }: LandingNavProps) {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
          <span className="text-sm font-bold text-background">P</span>
        </div>
        ProjectHub
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </Button>
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
