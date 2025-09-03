import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export function mdToHtml(md: string): string {
  let html = md;
  // code blocks
  html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/g, (_m, code) => `<pre class="bg-secondary p-3 rounded"><code>${
    code.replace(/[&<>]/g, (c: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!) )
  }</code></pre>`);
  // headings
  html = html.replace(/^###\s?(.*)$/gim, '<h3 class="text-lg font-semibold mt-4">$1</h3>');
  html = html.replace(/^##\s?(.*)$/gim, '<h2 class="text-xl font-bold mt-5">$1</h2>');
  html = html.replace(/^#\s?(.*)$/gim, '<h1 class="text-2xl font-extrabold mt-6">$1</h1>');
  // bold/italic/code
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\`([^\`]+)\`/g, '<code class="bg-secondary px-1 rounded">$1</code>');
  // links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a class="text-primary underline" href="$2" target="_blank" rel="noreferrer">$1<\/a>');
  // lists
  html = html.replace(/^(?:-\s.*(?:\n|$))+?/gim, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((l) => l.replace(/^-\s?/, "").trim())
      .map((t) => `<li class="ml-4 list-disc">${t}</li>`) 
      .join("");
    return `<ul class="space-y-1 my-2">${items}</ul>`;
  });
  // paragraphs
  html = html
    .split(/\n\n+/)
    .map((p) => (p.match(/<(h\d|ul|pre)/) ? p : `<p class="my-2 leading-7">${p}</p>`))
    .join("");
  return html;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}