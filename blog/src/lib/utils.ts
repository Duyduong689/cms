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

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: [], isValid: false };
  }

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("At least 8 characters");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters");
  }

  // Additional length bonus
  if (password.length >= 12) {
    score = Math.min(score + 1, 4);
  }

  return {
    score: Math.min(score, 4),
    feedback: feedback.length > 0 ? feedback : ["Strong password!"],
    isValid: score >= 4,
  };
};

export const getStrengthColor = (score: number): string => {
  if (score <= 1) return "bg-red-500";
  if (score <= 2) return "bg-orange-500";
  if (score <= 3) return "bg-yellow-500";
  return "bg-green-500";
};

export const getStrengthLabel = (score: number): string => {
  if (score <= 1) return "Very Weak";
  if (score <= 2) return "Weak";
  if (score <= 3) return "Good";
  return "Strong";
};
