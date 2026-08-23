import { readFile } from "node:fs/promises";
import path from "node:path";

type LegalDocumentProps = {
  file: string;
};

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => htmlEntities[character] ?? character);
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(source: string) {
  const html: string[] = [];
  const paragraph: string[] = [];
  let list: "ul" | "ol" | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  };

  const closeList = () => {
    if (!list) return;
    html.push(`</${list}>`);
    list = null;
  };

  const openList = (next: "ul" | "ol") => {
    if (list === next) return;
    closeList();
    list = next;
    html.push(`<${next}>`);
  };

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const quote = trimmed.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const bullet = trimmed.match(/^(?:[-*•])\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      openList("ul");
      html.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    const ordered = trimmed.match(/^(?:\d+|[a-z])\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      openList("ol");
      html.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();
  return html.join("\n");
}

export async function LegalDocument({ file }: LegalDocumentProps) {
  const source = await readFile(path.join(process.cwd(), "content", "legal", file), "utf8");
  const html = renderMarkdown(source);

  return (
    <article className="reading-page shell legal-document">
      <p className="kicker">Legal / draft</p>
      <div className="notice">
        These repository-managed legal drafts require qualified legal review before publication as final terms.
      </div>
      <div className="document-body" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
