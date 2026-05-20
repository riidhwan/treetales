import type { CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

interface Props {
  readonly className?: string
  readonly content: string
  readonly emptyFallback?: string
  readonly style?: CSSProperties
}

export function MarkdownContent({
  className,
  content,
  emptyFallback,
  style,
}: Props) {
  const markdown = content || emptyFallback

  if (!markdown) {
    return null
  }

  return (
    <div className={cn('max-w-none text-tt-ink', className)} style={style}>
      <ReactMarkdown
        components={{
          a: ({ children, href, title }) => (
            <a
              className="font-medium text-tt-moss underline underline-offset-4 hover:text-tt-moss-dark"
              href={href}
              rel="noreferrer"
              target="_blank"
              title={title}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-tt-line pl-4 text-tt-muted">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-tt-paper-deep px-1 py-0.5 font-mono text-sm text-tt-ink">
              {children}
            </code>
          ),
          h1: ({ children }) => (
            <h1 className="text-[1.875em] font-bold leading-tight text-tt-ink">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[1.5em] font-bold leading-tight text-tt-ink">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[1.25em] font-semibold leading-tight text-tt-ink">
              {children}
            </h3>
          ),
          hr: () => <hr className="border-tt-line" />,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-6">{children}</ol>
          ),
          p: ({ children }) => (
            <p className="text-[1em] leading-8 text-tt-ink">{children}</p>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md bg-tt-paper-deep p-4 text-[0.875em] leading-6 text-tt-ink">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          td: ({ children }) => (
            <td className="border border-tt-line px-3 py-2 align-top">
              {children}
            </td>
          ),
          th: ({ children }) => (
            <th className="border border-tt-line bg-tt-paper-deep px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tr: ({ children }) => <tr>{children}</tr>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-2 pl-6">{children}</ul>
          ),
        }}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
