import type { ReactNode } from "react";

interface MarkdownMessageProps {
  text: string;
}

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; text: string };

type InlineToken =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; text: string }
  | { type: "emphasis"; text: string }
  | { type: "link"; text: string; href: string };

const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((https?:\/\/[^)\s]+)\))/g;

function parseMarkdown(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", text: codeLines.join("\n") });
      index += index < lines.length ? 1 : 0;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length === 1 ? 2 : 3,
        text: heading[2],
      });
      index += 1;
      continue;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (unorderedMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = /^[-*]\s+(.+)$/.exec(lines[index].trim());
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    const orderedMatch = /^\d+[.)]\s+(.+)$/.exec(trimmed);
    if (orderedMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = /^\d+[.)]\s+(.+)$/.exec(lines[index].trim());
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        next.startsWith("```") ||
        /^(#{1,3})\s+/.test(next) ||
        /^[-*]\s+/.test(next) ||
        /^\d+[.)]\s+/.test(next)
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    if (match.index === undefined) continue;
    if (match.index > lastIndex) {
      tokens.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }

    const value = match[0];
    const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(value);

    if (link) {
      tokens.push({ type: "link", text: link[1], href: link[2] });
    } else if (value.startsWith("`")) {
      tokens.push({ type: "code", text: value.slice(1, -1) });
    } else if (value.startsWith("**")) {
      tokens.push({ type: "strong", text: value.slice(2, -2) });
    } else {
      tokens.push({ type: "emphasis", text: value.slice(1, -1) });
    }

    lastIndex = match.index + value.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", text: text.slice(lastIndex) });
  }

  return tokens;
}

function renderInline(text: string): ReactNode {
  return parseInline(text).map((token, index) => {
    switch (token.type) {
      case "code":
        return (
          <code key={index} className="rounded bg-slate-950 px-1 py-0.5 text-[0.85em] text-cyan-200">
            {token.text}
          </code>
        );
      case "strong":
        return <strong key={index} className="font-semibold text-slate-50">{token.text}</strong>;
      case "emphasis":
        return <em key={index} className="text-slate-100">{token.text}</em>;
      case "link":
        return (
          <a
            key={index}
            href={token.href}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 underline decoration-cyan-500/60 underline-offset-2 hover:text-cyan-200"
          >
            {token.text}
          </a>
        );
      default:
        return token.text;
    }
  });
}

export default function MarkdownMessage({ text }: MarkdownMessageProps) {
  const blocks = parseMarkdown(text);

  return (
    <div className="space-y-3 leading-relaxed">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const HeadingTag = block.level === 2 ? "h2" : "h3";
            return (
              <HeadingTag key={index} className="font-semibold text-slate-50">
                {renderInline(block.text)}
              </HeadingTag>
            );
          }
          case "unordered-list":
            return (
              <ul key={index} className="list-disc space-y-1 pl-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ordered-list":
            return (
              <ol key={index} className="list-decimal space-y-1 pl-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200"
              >
                <code>{block.text}</code>
              </pre>
            );
          default:
            return <p key={index}>{renderInline(block.text)}</p>;
        }
      })}
    </div>
  );
}
