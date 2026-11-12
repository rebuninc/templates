// react-markdown skips raw HTML, so CMS content can't inject markup.
import ReactMarkdown, { type Components } from "react-markdown"

const h2 =
  "mt-4 text-2xl leading-tight font-[590] tracking-[-0.012em] text-fg first:mt-0"
const pre =
  "overflow-x-auto rounded-lg border border-line bg-island p-4 font-mono text-sm leading-relaxed text-fg [&_code]:bg-transparent [&_code]:p-0"

// Tailwind preflight strips the default block styles, so each tag gets its own.
const components: Components = {
  h1: ({ node: _, ...props }) => <h2 {...props} className={h2} />,
  h2: ({ node: _, ...props }) => <h2 {...props} className={h2} />,
  h3: ({ node: _, ...props }) => (
    <h3 {...props} className="mt-2 text-xl font-[590] text-fg first:mt-0" />
  ),
  p: ({ node: _, ...props }) => <p {...props} className="text-pretty" />,
  a: ({ node: _, ...props }) => (
    <a
      {...props}
      className="text-fg underline underline-offset-4 hover:no-underline"
    />
  ),
  strong: ({ node: _, ...props }) => (
    <strong {...props} className="font-[590] text-fg" />
  ),
  blockquote: ({ node: _, ...props }) => (
    <blockquote {...props} className="border-l-2 border-line pl-4" />
  ),
  ul: ({ node: _, ...props }) => (
    <ul {...props} className="grid list-inside list-disc gap-1" />
  ),
  ol: ({ node: _, ...props }) => (
    <ol {...props} className="grid list-inside list-decimal gap-1" />
  ),
  pre: ({ node: _, ...props }) => <pre {...props} className={pre} />,
  code: ({ node: _, ...props }) => (
    <code
      {...props}
      className="rounded-md bg-island px-1.5 py-0.5 font-mono text-[0.875em] text-fg"
    />
  ),
  img: ({ node: _, ...props }) => (
    <img {...props} className="w-full rounded-lg border border-line" />
  ),
  hr: ({ node: _, ...props }) => <hr {...props} className="border-line" />,
}

// Renders blocks with no outer margins; the parent sets the gap.
export function Markdown({ source }: { source: string }) {
  return <ReactMarkdown components={components}>{source}</ReactMarkdown>
}
