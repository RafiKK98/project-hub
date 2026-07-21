"use client";

import dynamic from "next/dynamic";

export const LazyRichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-40 animate-pulse rounded-lg border border-input bg-muted" />
    ),
  },
);
