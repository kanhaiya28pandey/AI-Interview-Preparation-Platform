import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  return (
    <div className={`markdown-body space-y-3 font-sans text-xs text-text-secondary leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-2xl font-semibold text-text-primary mt-6 mb-3 border-b border-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-xl font-semibold text-text-primary mt-5 mb-2.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-lg font-medium text-text-primary mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed my-2.5">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-text-primary">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-text-primary">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 text-text-secondary my-3 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 text-text-secondary my-3 pl-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-xs sm:text-sm leading-relaxed text-text-secondary">
              {children}
            </li>
          ),
          code: ({ node, inline, className: codeClassName, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="font-mono text-[11px] bg-surface-raised border border-border px-1.5 py-0.5 rounded text-accent font-semibold" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="font-mono text-xs bg-surface-raised border border-border p-4 rounded-xl overflow-x-auto text-text-primary my-4 leading-relaxed">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent bg-surface-raised/60 p-3 my-4 text-xs italic text-text-muted rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-xs text-left border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-surface-raised p-2.5 border border-border font-mono font-semibold text-text-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 border border-border text-text-secondary">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
