/**
 * Heuristic prompt-injection scanner for UNTRUSTED text (product descriptions,
 * merchant pages). Deterministic; an optional LLM classifier can be layered on
 * top later, but it may only make the verdict stricter.
 */

export type InjectionFinding = {
  kind: "hidden_html" | "zero_width" | "instruction" | "role_marker" | "concealment" | "price_instruction";
  weight: number; // 0..1 contribution to confidence
  quote: string; // the suspicious span, cleaned for display
  source: string; // url / id of the source
};

export type InjectionResult = {
  detected: boolean;
  confidence: number;
  evidence: string[];
  findings: InjectionFinding[];
};

export const INJECTION_THRESHOLD = 0.6;

const ZERO_WIDTH_RE = /[​-‏⁠-⁤﻿­]/g;

// Elements hidden from the human reader but visible to an LLM reading raw HTML.
const HIDDEN_STYLE =
  String.raw`display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0(?:px|pt|em|rem)?\s*(?:;|"|')|opacity\s*:\s*0(?:\.0+)?\s*(?:;|"|')|color\s*:\s*(?:#fff(?:fff)?|white|rgba?\(\s*255\s*,\s*255\s*,\s*255)|left\s*:\s*-\d{3,}px|height\s*:\s*0(?:px)?\s*;\s*overflow\s*:\s*hidden`;
const HIDDEN_ELEMENT_RE = new RegExp(
  String.raw`<([a-z][a-z0-9]*)\b[^>]*?(?:style\s*=\s*(["'])[^"']*?(?:${HIDDEN_STYLE})[^"']*?\2|\shidden(?:\s|>|=)|aria-hidden\s*=\s*["']true["'])[^>]*>([\s\S]*?)<\/\1\s*>`,
  "gi",
);
const HTML_COMMENT_RE = /<!--([\s\S]*?)-->/g;

type Pattern = { kind: InjectionFinding["kind"]; weight: number; re: RegExp };

const PATTERNS: Pattern[] = [
  {
    kind: "instruction",
    weight: 0.7,
    re: /\b(ignore|disregard|forget|bypass|skip)\b[^.\n]{0,40}?\b(previous|prior|above|earlier|all|any|your|the|user'?s?)\b[^.\n]{0,30}?\b(instructions?|rules?|prompts?|budget|limits?|constraints?|mandate|polic(y|ies)|caps?)\b/i,
  },
  {
    kind: "instruction",
    weight: 0.6,
    re: /\b(budget|spending limit|price cap|cap)\b[^.\n]{0,30}\b(does not|doesn'?t|no longer|not)\s+apply\b|\b(exceed|go over|raise)\b[^.\n]{0,20}\b(budget|limit|cap)\b/i,
  },
  { kind: "role_marker", weight: 0.5, re: /(^|[\s>"'[(])(system|assistant|developer)\s*(prompt)?\s*:/i },
  {
    kind: "instruction",
    weight: 0.5,
    re: /\b(you are now|act as|new instructions?|updated instructions?|override|admin mode|developer mode|jailbreak)\b/i,
  },
  {
    kind: "instruction",
    weight: 0.4,
    re: /\b(ai|shopping|llm)\s+(agent|assistant|model)s?\b[^.\n]{0,40}\b(must|should|need to|are required to|always)\b/i,
  },
  {
    kind: "concealment",
    weight: 0.6,
    re: /\b(do not|don'?t|never)\s+(tell|inform|mention|show|disclose|reveal)\b[^.\n]{0,30}\b(user|customer|buyer|human|them)\b/i,
  },
  {
    kind: "price_instruction",
    weight: 0.4,
    re: /\b(add|include|attach|apply|charge|bundle)\b[^.\n]{0,60}?(\$\s?\d+(\.\d{2})?|\b\d+(\.\d{2})?\s?usd\b)/i,
  },
];

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/** Strip zero-width chars, tags and entities; collapse whitespace. Used before pattern matching
 *  so attackers can't split keywords with invisible characters ("ig​nore"). */
export function normalizeText(raw: string): string {
  return decodeEntities(raw.replace(ZERO_WIDTH_RE, "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function clip(s: string, max = 180): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** Quote the sentence around a match. */
function sentenceAround(text: string, index: number, length: number): string {
  const start = Math.max(text.lastIndexOf(".", index) + 1, index - 120, 0);
  const endDot = text.indexOf(".", index + length);
  const end = Math.min(endDot === -1 ? text.length : endDot + 1, index + length + 120);
  return clip(text.slice(start, end).trim());
}

export function scanText(raw: string, source: string): InjectionFinding[] {
  const findings: InjectionFinding[] = [];

  const zw = raw.match(ZERO_WIDTH_RE);
  if (zw && zw.length > 0) {
    const codes = [...new Set(zw.map((c) => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`))];
    findings.push({
      kind: "zero_width",
      weight: 0.3,
      quote: `${zw.length} invisible zero-width character(s) (${codes.join(", ")})`,
      source,
    });
  }

  for (const m of raw.matchAll(HIDDEN_ELEMENT_RE)) {
    const inner = normalizeText(m[3] ?? "");
    if (inner) findings.push({ kind: "hidden_html", weight: 0.4, quote: clip(inner), source });
  }
  for (const m of raw.matchAll(HTML_COMMENT_RE)) {
    const inner = normalizeText(m[1] ?? "");
    if (inner.length > 12) findings.push({ kind: "hidden_html", weight: 0.3, quote: clip(inner), source });
  }

  const text = normalizeText(raw);
  for (const p of PATTERNS) {
    const m = p.re.exec(text);
    if (m) findings.push({ kind: p.kind, weight: p.weight, quote: sentenceAround(text, m.index, m[0].length), source });
  }
  return findings;
}

/** Noisy-OR over findings: independent signals compound, none alone is certain. */
function combine(findings: InjectionFinding[]): number {
  // Count each kind once (strongest), so repetition alone doesn't inflate the score.
  const strongest = new Map<string, number>();
  for (const f of findings) strongest.set(f.kind, Math.max(strongest.get(f.kind) ?? 0, f.weight));
  const notInjected = [...strongest.values()].reduce((acc, w) => acc * (1 - w), 1);
  return Math.round((1 - notInjected) * 100) / 100;
}

export function scanSources(sources: { url: string; text: string }[]): InjectionResult {
  const findings = sources.flatMap((s) => scanText(s.text, s.url));
  const confidence = combine(findings);
  const seen = new Set<string>();
  const evidence: string[] = [];
  for (const f of findings) {
    const line = `[${f.kind}] "${f.quote}" (${f.source})`;
    if (!seen.has(line)) {
      seen.add(line);
      evidence.push(line);
    }
  }
  return { detected: confidence >= INJECTION_THRESHOLD, confidence, evidence, findings };
}
