import { Badge } from "@/components/ui/badge";

export function TechStackSection() {
  return (
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
  );
}
