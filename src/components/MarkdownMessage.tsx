import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export function MarkdownMessage({ text }: { text: string }) {
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
          return (
            <SyntaxHighlighter language={match[1]} PreTag="div" wrapLongLines>
              {content.replace(/\n$/, "")}
            </SyntaxHighlighter>
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
