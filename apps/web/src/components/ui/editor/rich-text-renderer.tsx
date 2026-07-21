import { cn } from "@/lib/utils";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

interface RichTextRendererProps {
  content: string | null;
  className?: string;
}

function isJsonContent(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null && "type" in parsed;
  } catch {
    return false;
  }
}

export function RichTextRenderer({
  content,
  className,
}: RichTextRendererProps) {
  if (!content)
    return (
      <p className={cn("text-sm text-muted-foreground italic", className)}>
        No description
      </p>
    );

  let html: string;

  if (isJsonContent(content)) {
    try {
      html = generateHTML(JSON.parse(content), [StarterKit]);
    } catch {
      html = `<p>${content}</p>`;
    }
  } else {
    // Legacy plain text — render as paragraphs
    html = content
      .split("\n")
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join("");
  }

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-p:text-foreground prose-p:leading-relaxed",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:rounded-md prose-pre:bg-muted prose-pre:p-4",
        "prose-blockquote:border-l-border prose-blockquote:text-muted-foreground",
        "prose-strong:text-foreground",
        "prose-li:text-foreground",
        className,
      )}
      // generateHTML output is from our own TipTap schema — safe to render
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
