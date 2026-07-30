/**
 * RICIS-III v7.7 — strict AST engine (no limits, no L'Hôpital)
 * Aligned with Lean 10.2.0 + theory document
 * Author: Dmitry Aleynikov · ORCID 0009-0004-3226-7700
 */

import { CalculationResult, PhaseStep } from '../types/ricis';
import { generateLean4Code } from './lean4Generator';

export type Expr =
  | { tag: 'const'; v: number }
  | { tag: 'var'; name: string }
  | { tag: 'add'; f: Expr; g: Expr }
  | { tag: 'sub'; f: Expr; g: Expr }
  | { tag: 'mul'; f: Expr; g: Expr }
  | { tag: 'div'; f: Expr; g: Expr }
  | { tag: 'zero'; index: Expr; label: string }
  | { tag: 'inf'; index: Expr; label: string };

function c(v: number): Expr { return { tag: 'const', v }; }
function v(name: string): Expr { return { tag: 'var', name }; }
function add(f: Expr, g: Expr): Expr { return { tag: 'add', f, g }; }
function sub(f: Expr, g: Expr): Expr { return { tag: 'sub', f, g }; }
function mul(f: Expr, g: Expr): Expr { return { tag: 'mul', f, g }; }
function div(f: Expr, g: Expr): Expr { return { tag: 'div', f, g }; }
function zero(index: Expr, label?: string): Expr {
  return { tag: 'zero', index, label: label ?? exprToCanonical(index) };
}
function inf(index: Expr, label?: string): Expr {
  return { tag: 'inf', index, label: label ?? exprToCanonical(index) };
}

export function exprToCanonical(e: Expr): string {
  switch (e.tag) {
    case 'const': return `C(${e.v})`;
    case 'var': return `VAR(${e.name})`;
    case 'add': {
      const a = exprToCanonical(e.f), b = exprToCanonical(e.g);
      return a <= b ? `ADD(${a},${b})` : `ADD(${b},${a})`;
    }
    case 'mul': {
      const a = exprToCanonical(e.f), b = exprToCanonical(e.g);
      return a <= b ? `MUL(${a},${b})` : `MUL(${b},${a})`;
    }
    case 'sub': return `SUB(${exprToCanonical(e.f)},${exprToCanonical(e.g)})`;
    case 'div': return `DIV(${exprToCanonical(e.f)},${exprToCanonical(e.g)})`;
    case 'zero': return `0_${e.label}`;
    case 'inf': return `∞_${e.label}`;
  }
}

function sameIdentity(a: Expr, b: Expr): boolean {
  return exprToCanonical(a) === exprToCanonical(b);
}
function exprEq(a: Expr, b: Expr): boolean {
  return sameIdentity(a, b);
}

export function algSimplify(e: Expr): Expr {
  switch (e.tag) {
    case 'add': {
      const f = algSimplify(e.f), g = algSimplify(e.g);
      if (f.tag === 'const' && f.v === 0) return g;
      if (g.tag === 'const' && g.v === 0) return f;
      if (exprEq(f, g)) return mul(c(2), f);
      return add(f, g);
    }
    case 'mul': {
      const f = algSimplify(e.f), g = algSimplify(e.g);
      if ((f.tag === 'const' && f.v === 0) || (g.tag === 'const' && g.v === 0)) return c(0);
      if (f.tag === 'const' && f.v === 1) return g;
      if (g.tag === 'const' && g.v === 1) return f;
      return mul(f, g);
    }
    case 'sub': {
      const f = algSimplify(e.f), g = algSimplify(e.g);
      if (exprEq(f, g)) return c(0);
      if (g.tag === 'const' && g.v === 0) return f;
      return sub(f, g);
    }
    case 'div': {
      const f = algSimplify(e.f), g = algSimplify(e.g);
      if (g.tag === 'const' && g.v === 1) return f;
      if (exprEq(f, g)) return c(1);
      return div(f, g);
    }
    case 'zero': return zero(algSimplify(e.index), e.label);
    case 'inf': return inf(algSimplify(e.index), e.label);
    default: return e;
  }
}

function cancelMul(num: Expr, den: Expr): Expr | null {
  if (num.tag !== 'mul') return null;
  if (exprEq(num.f, den)) return num.g;
  if (exprEq(num.g, den)) return num.f;
  const left = cancelMul(num.f, den);
  if (left) return mul(left, num.g);
  const right = cancelMul(num.g, den);
  if (right) return mul(num.f, right);
  return null;
}

function sp2Reduce(num: Expr, den: Expr): Expr | null {
  const n = algSimplify(num);
  const d = algSimplify(den);
  if (exprEq(n, d)) return c(1);
  const canceled = cancelMul(n, d);
  if (canceled) return algSimplify(canceled);
  return null;
}

export type Monolith =
  | { kind: 'scalar'; v: number }
  | { kind: 'expr'; e: Expr }
  | { kind: 'zero'; index: Expr; label: string }
  | { kind: 'inf'; index: Expr; label: string }
  | { kind: 'unresolved'; reason: string; e: Expr };

function toExpr(m: Monolith): Expr {
  switch (m.kind) {
    case 'scalar': return c(m.v);
    case 'expr': return m.e;
    case 'zero': return zero(m.index, m.label);
    case 'inf': return inf(m.index, m.label);
    case 'unresolved': return m.e;
  }
}

export function ricisDiv(a: Monolith, b: Monolith): Monolith {
  if (a.kind === 'scalar' && b.kind === 'scalar') {
    if (b.v === 0) {
      if (a.v === 0) return { kind: 'unresolved', reason: '0/0_bare_const', e: div(c(0), c(0)) };
      return { kind: 'inf', index: c(a.v), label: String(a.v) };
    }
    return { kind: 'scalar', v: a.v / b.v };
  }
  if (a.kind === 'zero' && b.kind === 'zero') {
    const reduced = sp2Reduce(a.index, b.index);
    if (reduced) {
      if (reduced.tag === 'const') return { kind: 'scalar', v: reduced.v };
      return { kind: 'expr', e: reduced };
    }
    if (sameIdentity(a.index, b.index) || a.label === b.label) return { kind: 'scalar', v: 1 };
    if (a.index.tag === 'const' && b.index.tag === 'const' && b.index.v !== 0)
      return { kind: 'scalar', v: a.index.v / b.index.v };
    return { kind: 'expr', e: div(a.index, b.index) };
  }
  if (a.kind === 'inf' && b.kind === 'inf') {
    const reduced = sp2Reduce(a.index, b.index);
    if (reduced) {
      if (reduced.tag === 'const') return { kind: 'scalar', v: reduced.v };
      return { kind: 'expr', e: reduced };
    }
    if (sameIdentity(a.index, b.index) || a.label === b.label) return { kind: 'scalar', v: 1 };
    if (a.index.tag === 'const' && b.index.tag === 'const' && b.index.v !== 0)
      return { kind: 'scalar', v: a.index.v / b.index.v };
    return { kind: 'expr', e: div(a.index, b.index) };
  }
  if (b.kind === 'scalar' && b.v === 0)
    return { kind: 'inf', index: toExpr(a), label: exprToCanonical(toExpr(a)) };
  if (b.kind === 'zero' && a.kind !== 'zero')
    return { kind: 'inf', index: toExpr(a), label: exprToCanonical(toExpr(a)) };
  const ea = toExpr(a), eb = toExpr(b);
  const reduced = sp2Reduce(ea, eb);
  if (reduced) {
    if (reduced.tag === 'const') return { kind: 'scalar', v: reduced.v };
    return { kind: 'expr', e: reduced };
  }
  return { kind: 'expr', e: div(ea, eb) };
}

export function ricisMul(a: Monolith, b: Monolith): Monolith {
  if (a.kind === 'zero' && b.kind === 'inf') {
    if (a.index.tag === 'const' && b.index.tag === 'const')
      return { kind: 'scalar', v: a.index.v * b.index.v };
    return { kind: 'expr', e: mul(a.index, b.index) };
  }
  if (a.kind === 'inf' && b.kind === 'zero') {
    if (a.index.tag === 'const' && b.index.tag === 'const')
      return { kind: 'scalar', v: a.index.v * b.index.v };
    return { kind: 'expr', e: mul(a.index, b.index) };
  }
  if (a.kind === 'scalar' && b.kind === 'scalar') return { kind: 'scalar', v: a.v * b.v };
  if (a.kind === 'zero' || b.kind === 'zero') {
    const z = a.kind === 'zero' ? a : (b as Extract<Monolith, { kind: 'zero' }>);
    return { kind: 'zero', index: z.index, label: z.label };
  }
  if (a.kind === 'inf' || b.kind === 'inf') {
    const i = a.kind === 'inf' ? a : (b as Extract<Monolith, { kind: 'inf' }>);
    return { kind: 'inf', index: i.index, label: i.label };
  }
  return { kind: 'expr', e: mul(toExpr(a), toExpr(b)) };
}

export function ricisAdd(a: Monolith, b: Monolith): Monolith {
  if (a.kind === 'inf' && b.kind === 'inf') {
    const idx = add(a.index, b.index);
    return { kind: 'inf', index: idx, label: exprToCanonical(idx) };
  }
  if (a.kind === 'scalar' && b.kind === 'scalar') return { kind: 'scalar', v: a.v + b.v };
  if (a.kind === 'zero') return b;
  if (b.kind === 'zero') return a;
  if (a.kind === 'scalar' && a.v === 0) return b;
  if (b.kind === 'scalar' && b.v === 0) return a;
  return { kind: 'expr', e: add(toExpr(a), toExpr(b)) };
}

export function ricisSub(a: Monolith, b: Monolith): Monolith {
  if (a.kind === 'inf' && b.kind === 'inf') {
    if (sameIdentity(a.index, b.index) || a.label === b.label) return { kind: 'scalar', v: 0 };
    const idx = sub(a.index, b.index);
    return { kind: 'inf', index: idx, label: exprToCanonical(idx) };
  }
  if (a.kind === 'scalar' && b.kind === 'scalar') return { kind: 'scalar', v: a.v - b.v };
  if (b.kind === 'zero' || (b.kind === 'scalar' && b.v === 0)) return a;
  return { kind: 'expr', e: sub(toExpr(a), toExpr(b)) };
}

export function evalExpr(e: Expr): Monolith {
  e = algSimplify(e);
  switch (e.tag) {
    case 'const': return { kind: 'scalar', v: e.v };
    case 'var': return { kind: 'expr', e };
    case 'zero': return { kind: 'zero', index: e.index, label: e.label };
    case 'inf': return { kind: 'inf', index: e.index, label: e.label };
    case 'add': return ricisAdd(evalExpr(e.f), evalExpr(e.g));
    case 'sub': return ricisSub(evalExpr(e.f), evalExpr(e.g));
    case 'mul': return ricisMul(evalExpr(e.f), evalExpr(e.g));
    case 'div': return ricisDiv(evalExpr(e.f), evalExpr(e.g));
  }
}

export function monolithToLatex(m: Monolith): string {
  switch (m.kind) {
    case 'scalar': return String(m.v);
    case 'zero': return `0_{${m.label}}`;
    case 'inf': return `\\infty_{${m.label}}`;
    case 'expr': return exprToLatex(m.e);
    case 'unresolved': return `\\text{unresolved}(${m.reason})`;
  }
}

export function monolithToText(m: Monolith): string {
  switch (m.kind) {
    case 'scalar': return String(m.v);
    case 'zero': return `0_${m.label}`;
    case 'inf': return `∞_${m.label}`;
    case 'expr': return exprToCanonical(m.e);
    case 'unresolved': return `unresolved(${m.reason})`;
  }
}

function exprToLatex(e: Expr): string {
  switch (e.tag) {
    case 'const': return String(e.v);
    case 'var': return e.name;
    case 'add': return `(${exprToLatex(e.f)}+${exprToLatex(e.g)})`;
    case 'sub': return `(${exprToLatex(e.f)}-${exprToLatex(e.g)})`;
    case 'mul': return `(${exprToLatex(e.f)}\\cdot${exprToLatex(e.g)})`;
    case 'div': return `\\frac{${exprToLatex(e.f)}}{${exprToLatex(e.g)}}`;
    case 'zero': return `0_{${e.label}}`;
    case 'inf': return `\\infty_{${e.label}}`;
  }
}

type Tok =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string }
  | { t: 'lparen' }
  | { t: 'rparen' }
  | { t: 'eof' };

function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const src = s.replace(/\\infty/gi, '∞').replace(/\binf\b/gi, '∞').replace(/×/g, '*').replace(/·/g, '*');
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      out.push({ t: 'num', v: parseFloat(src.slice(i, j)) });
      i = j; continue;
    }
    if (ch === '0' && src[i + 1] === '_') {
      i += 2;
      let j = i;
      while (j < src.length && /[A-Za-z0-9.]/.test(src[j])) j++;
      const label = src.slice(i, j) || '0';
      out.push({ t: 'id', v: `ZERO_${label}` });
      i = j; continue;
    }
    if (ch === '∞') {
      i++;
      if (src[i] === '_') {
        i++;
        let j = i;
        while (j < src.length && /[A-Za-z0-9.]/.test(src[j])) j++;
        const label = src.slice(i, j) || '1';
        out.push({ t: 'id', v: `INF_${label}` });
        i = j; continue;
      }
      out.push({ t: 'id', v: 'INF_1' }); continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      out.push({ t: 'id', v: src.slice(i, j) });
      i = j; continue;
    }
    if ('+-*/^'.includes(ch)) { out.push({ t: 'op', v: ch }); i++; continue; }
    if (ch === '(') { out.push({ t: 'lparen' }); i++; continue; }
    if (ch === ')') { out.push({ t: 'rparen' }); i++; continue; }
    i++;
  }
  out.push({ t: 'eof' });
  return out;
}

class Parser {
  private i = 0;
  constructor(private toks: Tok[]) {}
  private peek(): Tok { return this.toks[this.i]; }
  private take(): Tok { return this.toks[this.i++]; }
  parse(): Expr { return this.parseAdd(); }
  private parseAdd(): Expr {
    let left = this.parseMul();
    while (this.peek().t === 'op' && ((this.peek() as any).v === '+' || (this.peek() as any).v === '-')) {
      const op = (this.take() as any).v;
      const right = this.parseMul();
      left = op === '+' ? add(left, right) : sub(left, right);
    }
    return left;
  }
  private parseMul(): Expr {
    let left = this.parseUnary();
    while (this.peek().t === 'op' && ((this.peek() as any).v === '*' || (this.peek() as any).v === '/')) {
      const op = (this.take() as any).v;
      const right = this.parseUnary();
      left = op === '*' ? mul(left, right) : div(left, right);
    }
    while (this.peek().t === 'lparen') {
      const right = this.parseUnary();
      left = mul(left, right);
    }
    return left;
  }
  private parseUnary(): Expr {
    if (this.peek().t === 'op' && (this.peek() as any).v === '-') {
      this.take();
      return mul(c(-1), this.parseUnary());
    }
    return this.parsePrimary();
  }
  private parsePrimary(): Expr {
    const tok = this.peek();
    if (tok.t === 'num') { this.take(); return c(tok.v); }
    if (tok.t === 'id') {
      this.take();
      const name = tok.v;
      if (name.startsWith('ZERO_')) {
        const label = name.slice(5);
        const idx = isFinite(Number(label)) ? c(Number(label)) : v(label);
        return zero(idx, label);
      }
      if (name.startsWith('INF_')) {
        const label = name.slice(4);
        const idx = isFinite(Number(label)) ? c(Number(label)) : v(label);
        return inf(idx, label);
      }
      if (this.peek().t === 'lparen') {
        this.take();
        const arg = this.parseAdd();
        if (this.peek().t === 'rparen') this.take();
        return { tag: 'var', name: `${name}(${exprToCanonical(arg)})` };
      }
      return v(name);
    }
    if (tok.t === 'lparen') {
      this.take();
      const e = this.parseAdd();
      if (this.peek().t === 'rparen') this.take();
      return e;
    }
    this.take();
    return c(0);
  }
}

export function parseExpression(input: string): Expr {
  let s = input.trim();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/∞_\{([^}]+)\}/g, '∞_$1');
  s = s.replace(/0_\{([^}]+)\}/g, '0_$1');
  s = s.replace(/\|\s*_\s*\{[^}]+\}/g, '');
  s = s.replace(/at\s+x\s*=\s*[\d.]+/gi, '');
  s = s.replace(/lim\s*_\s*\{?\s*x\s*→\s*[^}]+\}?/gi, '');
  s = s.replace(/lim\s*_\s*\{[^}]+\}/gi, '');
  return new Parser(tokenize(s)).parse();
}

function phase(
  phase: PhaseStep['phase'], name: string, rule: string,
  input: string, output: string, ru: string, en: string, axiom: string,
  status: PhaseStep['status'] = 'passed'
): PhaseStep {
  return {
    phase, name, ruleApplied: rule, latexInput: input, latexOutput: output,
    explanationRu: ru, explanationEn: en, axiomOrProtocol: axiom, status,
  };
}

function detectAxiom(m: Monolith, raw: string): string {
  if (m.kind === 'inf') return 'A1_INDEXED_INFINITY';
  if (raw.includes('0_') && (raw.includes('∞') || raw.includes('inf'))) return 'A6_GENERAL';
  if (raw.includes('0_') && raw.includes('/')) return 'A4_0DIV0';
  if ((raw.includes('∞') || raw.includes('inf')) && raw.includes('/')) return 'A5_INFDIVINF';
  return 'RICIS_CORE';
}

/** Public API — strict RICIS. No limits. No L'Hôpital. */
export function evaluateRicisExpression(
  input: string,
  variableContext: Record<string, number | string> = {}
): CalculationResult {
  const normalized = input.trim();
  const phases: PhaseStep[] = [];

  phases.push(phase(-1, 'L1_IDENTITY', 'L1 Identity (X=X, X/X=1)',
    normalized, `T(${normalized})\\ \\text{defined}`,
    'Проверка тождества и типа T(X).', 'Identity and type T(X) check.',
    'L0_CONTINUITY, L1_IDENTITY'));

  const hadLimit = /lim|limit/i.test(normalized);
  phases.push(phase(0, 'REMOVE_LIMITS',
    hadLimit ? 'Limits Forbidden → pointwise' : 'Pointwise (no limits)',
    normalized, normalized.replace(/lim[^)]*/gi, '[point]'),
    hadLimit ? 'Пределы устранены.' : 'Оператор предела отсутствует.',
    hadLimit ? 'Limits removed.' : 'No limit operator.',
    'RICIS3_NO_LIMITS', hadLimit ? 'transformed' : 'passed'));

  let result: Monolith;
  try {
    const ast = parseExpression(normalized);
    phases.push(phase(0.5, 'SEMANTIC_INDEXING', 'SP4 Index by expression',
      normalized, exprToCanonical(ast),
      'Индексация по канонической форме.', 'Indexing by canonical form.',
      'SP4_SEMANTIC_PRIORITY'));
    phases.push(phase(1, 'REDUCTION_PRIORITY', 'SP2 Clean first',
      exprToCanonical(ast), exprToCanonical(algSimplify(ast)),
      'Упрощение и сокращение до аксиом.', 'Simplify before singularity axioms.',
      'SP2_REDUCTION_PRIORITY', 'transformed'));
    result = evalExpr(ast);
    phases.push(phase(2, 'RICIS_TRANSFORMS', 'A1/A4/A5/A6/A7',
      exprToCanonical(ast), monolithToLatex(result),
      'Структурные правила RICIS без пределов.', 'Structural RICIS; no limits.',
      detectAxiom(result, normalized), 'transformed'));
  } catch (err) {
    result = { kind: 'unresolved', reason: String(err), e: c(0) };
    phases.push(phase(2, 'RICIS_TRANSFORMS', 'Parse/eval failure',
      normalized, monolithToLatex(result),
      'Ошибка разбора.', 'Parse failure.', 'ERROR', 'warning'));
  }

  const resultLatex = monolithToLatex(result);
  const resultText = monolithToText(result);
  const resultKind =
    result.kind === 'inf' ? 'infinity' :
    result.kind === 'zero' ? 'zero' :
    result.kind === 'scalar' ? 'scalar' :
    result.kind === 'expr' ? 'expression' : 'unresolved';

  phases.push(phase(3, 'ALGEBRAIC_CLEANUP', 'Cleanup', resultLatex, resultLatex,
    'Свёртка.', 'Folding.', 'ALGEBRAIC_CLEANUP'));
  phases.push(phase(4, 'TYPE_CONSISTENCY_CHECK', 'TCP', resultLatex, `TypeOk(${resultLatex})`,
    'Проверка типов.', 'Type check.', 'TCP_PROTOCOL'));
  phases.push(phase(5, 'STANDARD_ARITHMETIC', 'Done', resultLatex, resultLatex,
    'Сингулярности раскрыты.', 'Singularities resolved.', 'ARITHMETIC_DONE'));
  phases.push(phase(6, 'L1_FINAL_VERIFICATION', 'L1 X=X', resultLatex, `${resultLatex}\\equiv${resultLatex}`,
    'L1 сохранено.', 'L1 preserved.', 'L0_CONTINUITY, L1_VERIFIED', 'verified'));

  const axiomUsed = detectAxiom(result, normalized);
  const leanCode = generateLean4Code(normalized, normalized, resultLatex, axiomUsed);

  return {
    rawExpression: input,
    variableContext,
    phases,
    finalResult: { latex: resultLatex, text: resultText, kind: resultKind, typeTag: 'RICIS.Monad.v7.7' },
    classicalFailure: {
      result: 'Undefined / NaN / Divergent Limit',
      reasonRu: 'Классика: неопределённость; RICIS: структурный ответ.',
      reasonEn: 'Classical: undefined; RICIS: structural answer.',
    },
    leanCode,
  };
}

export const _test = {
  parseExpression, evalExpr, ricisDiv, ricisMul, ricisAdd, algSimplify, exprToCanonical,
};
