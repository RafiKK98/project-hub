import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CTASectionProps {
  isAuthenticated: boolean;
}

export function CTASection({ isAuthenticated }: CTASectionProps) {
  return (
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
  );
}
