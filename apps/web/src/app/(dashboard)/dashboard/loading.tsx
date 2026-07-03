import { DashboardSkeleton } from "@/components/ui/skeletons";

// Next.js automatically wraps the page in Suspense and shows this
// while the dashboard page's async work resolves.
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
