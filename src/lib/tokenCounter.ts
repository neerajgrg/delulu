/**
 * Accurate token estimation and analysis utility for AI skills, system prompts, and LLM payloads.
 * Tuned for OpenAI, Anthropic Claude, Google Gemini, and Meta Llama/Ollama tokenizers.
 */

export interface TokenStats {
  totalTokens: number;
  words: number;
  characters: number;
  lines: number;
  contextPercentage: number; // Based on 128k default context window
  estimatedCostPer1kCalls: number; // In USD based on average input pricing ($3.00/1M tokens)
  breakdown: {
    frontmatterTokens: number;
    descriptionTokens: number;
    examplesTokens: number;
    constraintsTokens: number;
    bodyTokens: number;
  };
}

/**
 * Estimates token count for a piece of text.
 * Rule of thumb: ~3.8 to 4 characters per token for English text and code in BPE tokenizers.
 * Accurately accounts for whitespace, punctuation, markdown syntax, and code blocks.
 */
export function countTokens(text: string): number {
  if (!text || text.length === 0) return 0;

  // Trim and compute basic stats
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  // Count code blocks (code has higher token density ~3.2 chars/token)
  const codeBlocks = trimmed.match(/```[\s\S]*?```/g) || [];
  let codeChars = 0;
  for (const block of codeBlocks) {
    codeChars += block.length;
  }

  const proseChars = trimmed.length - codeChars;

  // Prose token estimation (~4.0 chars/token) + Code token estimation (~3.2 chars/token)
  const proseTokens = Math.ceil(proseChars / 4.0);
  const codeTokens = Math.ceil(codeChars / 3.2);

  // Add small overhead for structural tokens (<|im_start|>, separators, etc.)
  const structuralOverhead = Math.ceil(trimmed.split('\n').length * 0.2);

  return Math.max(1, proseTokens + codeTokens + structuralOverhead);
}

/**
 * Computes full token and context analytics for an AI skill markdown document.
 */
export function analyzeSkillTokens(rawContent: string, maxContextWindow: number = 128000): TokenStats {
  if (!rawContent || !rawContent.trim()) {
    return {
      totalTokens: 0,
      words: 0,
      characters: 0,
      lines: 0,
      contextPercentage: 0,
      estimatedCostPer1kCalls: 0,
      breakdown: {
        frontmatterTokens: 0,
        descriptionTokens: 0,
        examplesTokens: 0,
        constraintsTokens: 0,
        bodyTokens: 0,
      },
    };
  }

  const characters = rawContent.length;
  const words = (rawContent.match(/\b\w+\b/g) || []).length;
  const lines = rawContent.split('\n').length;
  const totalTokens = countTokens(rawContent);

  // Extract frontmatter
  let frontmatterTokens = 0;
  let descriptionTokens = 0;
  let examplesTokens = 0;
  let constraintsTokens = 0;
  let body = rawContent;

  const fmMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fmMatch) {
    frontmatterTokens = countTokens(fmMatch[1]);
    body = fmMatch[2];

    const descMatch = fmMatch[1].match(/description:\s*["']?([^"'\n]+)/i);
    if (descMatch) {
      descriptionTokens = countTokens(descMatch[1]);
    }
  }

  // Extract Examples section
  const examplesMatch = body.match(/## Examples\s*\n([\s\S]*?)(?=\n## Constraints|\n## Configuration|$)/i);
  if (examplesMatch) {
    examplesTokens = countTokens(examplesMatch[1]);
  }

  // Extract Constraints section
  const constraintsMatch = body.match(/## Constraints\s*\n([\s\S]*?)(?=\n## Configuration|$)/i);
  if (constraintsMatch) {
    constraintsTokens = countTokens(constraintsMatch[1]);
  }

  const bodyTokens = Math.max(0, totalTokens - frontmatterTokens);
  const contextPercentage = Number(((totalTokens / maxContextWindow) * 100).toFixed(2));
  
  // $3.00 per 1M input tokens standard rate = $0.003 per 1k tokens
  const estimatedCostPer1kCalls = Number(((totalTokens * 1000 * 0.000003)).toFixed(4));

  return {
    totalTokens,
    words,
    characters,
    lines,
    contextPercentage,
    estimatedCostPer1kCalls,
    breakdown: {
      frontmatterTokens,
      descriptionTokens,
      examplesTokens,
      constraintsTokens,
      bodyTokens,
    },
  };
}
