import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useToast } from "../lib/toastStore";
import { useState } from "react";

export function MarkdownMessage({ text }: { text: string }) {
  const toast = useToast();
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const copy = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedBlock(val.slice(0, 24));
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedBlock(null), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({
          className,
          children,
        }: {
          className?: string;
          children?: React.ReactNode;
        }) {
          const match = /language-(\w+)/.exec(className ?? "");
          const content = Array.isArray(children)
            ? children.join("")
            : String(children ?? "");

          if (!match) {
            // inline code or no language: render simple <code>
            return <code className={className}>{children}</code>;
          }

          // fenced code block with language
          const body = content.replace(/\n$/, "");
          return (
            <div className="relative group">
              <button
                type="button"
                onClick={() => copy(body)}
                className="absolute right-2 top-2 z-10 px-2 py-1 text-[10px] rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
              >
                {copiedBlock === body.slice(0, 24) ? "Copied" : "Copy"}
              </button>
              <SyntaxHighlighter language={match[1]} PreTag="div" wrapLongLines>
                {body}
              </SyntaxHighlighter>
            </div>
          );
        },
        a({ href, children, ...props }) {
          return (
            <a
              href={href ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
