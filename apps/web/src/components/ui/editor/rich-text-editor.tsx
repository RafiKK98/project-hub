"use client";

import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "./editor-toolbar";

export interface RichTextEditorProps {
  content: string; // JSON string or plain text
  onChange: (json: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Add a description...",
  className,
  minHeight = "160px",
}: RichTextEditorProps) {
  // Parse content — handle both JSON (new) and plain text (legacy)
  const parsedContent = (() => {
    if (!content) return undefined;
    try {
      return JSON.parse(content);
    } catch {
      // Legacy plain text — wrap in a paragraph node
      return {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: content }] },
        ],
      };
    }
  })();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-md bg-muted px-4 py-3 font-mono text-sm",
          },
        },
        code: {
          HTMLAttributes: {
            class: "rounded bg-muted px-1 py-0.5 font-mono text-sm",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-border pl-4 text-muted-foreground italic",
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: parsedContent,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3",
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-code:text-foreground prose-strong:text-foreground",
          "prose-li:text-foreground",
        ),
      },
    },
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-background transition-colors",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      {editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  );
}
RichTextEditor.displayName = "RichTextEditor";
