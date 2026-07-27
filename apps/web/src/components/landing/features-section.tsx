import {
  BarChart3,
  Bell,
  GitBranch,
  Kanban,
  Shield,
  Users,
} from "lucide-react";

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

export function FeaturesSection() {
  return (
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
  );
}
