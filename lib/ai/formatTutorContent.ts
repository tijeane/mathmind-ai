/**
 * Turns common LaTeX fragments from tutor replies into plain text kids can read.
 * Defense in depth alongside the system prompt asking for ASCII math.
 */
export function formatTutorContent(content: string): string {
  let text = content;

  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner: string) => latexFragmentToPlain(inner));
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner: string) => latexFragmentToPlain(inner));
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner: string) => latexFragmentToPlain(inner));
  text = text.replace(/\$([^$\n]+)\$/g, (_, inner: string) => latexFragmentToPlain(inner));

  return latexFragmentToPlain(text);
}

function latexFragmentToPlain(value: string): string {
  return value
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1/$2")
    .replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, "$1/$2")
    .replace(/\\cdot\b/g, "·")
    .replace(/\\times\b/g, "×")
    .replace(/\\div\b/g, "÷")
    .replace(/\\left|\\right/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
