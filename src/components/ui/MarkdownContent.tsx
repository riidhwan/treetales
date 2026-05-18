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
    <div className={cn('max-w-none text-stone-800', className)} style={style}>
      <ReactMarkdown
        components={{
          a: ({ children, href, title }) => (
            <a
              className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
              href={href}
              rel="noreferrer"
              target="_blank"
              title={title}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-stone-300 pl-4 text-stone-700">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-sm text-stone-900">
              {children}
            </code>
          ),
          h1: ({ children }) => (
            <h1 className="text-[1.875em] font-bold leading-tight text-stone-950">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[1.5em] font-bold leading-tight text-stone-950">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[1.25em] font-semibold leading-tight text-stone-950">
              {children}
            </h3>
          ),
          hr: () => <hr className="border-stone-200" />,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-6">{children}</ol>
          ),
          p: ({ children }) => (
            <p className="text-[1em] leading-8 text-stone-800">{children}</p>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md bg-stone-100 p-4 text-[0.875em] leading-6 text-stone-900">
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
            <td className="border border-stone-200 px-3 py-2 align-top">
              {children}
            </td>
          ),
          th: ({ children }) => (
            <th className="border border-stone-300 bg-stone-100 px-3 py-2 font-semibold">
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
