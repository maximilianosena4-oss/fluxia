// Sanitización de inputs — A3 OWASP (Injection Prevention)
// DOMPurify para HTML, delimitadores para prompts LLM

// Palabras clave de jailbreak/prompt injection a filtrar
const JAILBREAK_PATTERNS = [
  /ignore (previous|above|all) instructions?/gi,
  /forget (everything|all|previous)/gi,
  /you are now/gi,
  /act as (if you are|a|an)/gi,
  /pretend (you are|to be)/gi,
  /roleplay as/gi,
  /\[system\]/gi,
  /<\|system\|>/gi,
  /###\s*instruction/gi,
];

export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic strip
    return dirty.replace(/<[^>]*>/g, "").trim();
  }
  // Client-side: use DOMPurify
  const DOMPurify = require("isomorphic-dompurify");
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/\0/g, "") // null bytes
    .slice(0, 10000);   // max length guard
}

export function wrapForLLM(userInput: string): string {
  const sanitized = sanitizeText(userInput);
  return `<user_input>${sanitized}</user_input>`;
}

export function hasPromptInjection(input: string): boolean {
  return JAILBREAK_PATTERNS.some((pattern) => pattern.test(input));
}

export function sanitizeForLLM(input: string): { safe: boolean; sanitized: string } {
  if (hasPromptInjection(input)) {
    return { safe: false, sanitized: "" };
  }
  return { safe: true, sanitized: wrapForLLM(input) };
}
