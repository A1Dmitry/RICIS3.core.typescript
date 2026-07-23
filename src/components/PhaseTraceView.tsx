import React, { useState } from 'react';
import { CalculationResult } from '../types/ricis';
import { MathView } from './MathView';
import { CheckCircle2, AlertTriangle, ArrowRight, Code, FileText, Check, Copy } from 'lucide-react';

interface PhaseTraceViewProps {
  result: CalculationResult;
}

export const PhaseTraceView: React.FC<PhaseTraceViewProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<'trace' | 'lean'>('trace');
  const [copied, setCopied] = useState(false);

  const handleCopyLean = () => {
    navigator.clipboard.writeText(result.leanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#16171D] rounded-lg border border-white/10 p-6 shadow-xl">
      {/* Result Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#40E0D0] font-semibold">
            Детерминированный Результат Вычисления (RICIS-III v7.7)
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <MathView math={result.rawExpression} />
              <ArrowRight className="w-5 h-5 text-[#40E0D0]" />
              <span className="text-[#40E0D0] px-3 py-1 bg-[#40E0D0]/10 border border-[#40E0D0]/30 rounded-xl">
                <MathView math={result.finalResult.latex} />
              </span>
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#0F0F11] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode('trace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
              viewMode === 'trace' ? 'bg-[#40E0D0] text-[#0F0F11] font-semibold' : 'text-white/50 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Трассировка Алгоритма (Phases -1 to 6)
          </button>
          <button
            onClick={() => setViewMode('lean')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
              viewMode === 'lean' ? 'bg-[#40E0D0] text-[#0F0F11] font-semibold' : 'text-white/50 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Lean 4 Формализация
          </button>
        </div>
      </div>

      {/* Comparison Panel with Classical Failure */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/30 text-[#40E0D0]">
          <div className="flex items-center gap-2 text-[#40E0D0] font-mono text-xs font-bold uppercase">
            <CheckCircle2 className="w-4 h-4" /> RICIS-III v7.7 Результат
          </div>
          <div className="text-lg font-bold font-mono text-[#40E0D0] mt-2">
            <MathView math={result.finalResult.latex} />
          </div>
          <p className="text-xs text-[#40E0D0]/80 mt-1">
            Детерминированная монада с нулевым рывком непрерывности и точным сохранением типа L1.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFB347]/10 border border-[#FFB347]/30 text-[#FFB347]">
          <div className="flex items-center gap-2 text-[#FFB347] font-mono text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4" /> Сбой Классического Анализа
          </div>
          <div className="text-base font-bold font-mono text-[#FFB347] mt-2">
            {result.classicalFailure.result}
          </div>
          <p className="text-xs text-[#FFB347]/80 mt-1">
            {result.classicalFailure.reasonRu}
          </p>
        </div>
      </div>

      {/* View Mode: Tracing Phases */}
      {viewMode === 'trace' ? (
        <div className="space-y-3 mt-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 mb-3">
            Пошаговая Алгоритмическая Трассировка (Phases -1 → 6)
          </h3>

          {result.phases.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#0F0F11] border border-white/10 hover:border-white/20 transition-all phase-step"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#40E0D0]/20 text-[#40E0D0] border border-[#40E0D0]/30 font-mono text-xs font-bold flex items-center justify-center">
                    Ф{step.phase}
                  </span>
                  <span className="font-mono text-sm font-semibold text-white/90">
                    {step.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/50 font-mono">
                    {step.ruleApplied}
                  </span>
                </div>

                {step.axiomOrProtocol && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FFB347]/10 text-[#FFB347] border border-[#FFB347]/20">
                    {step.axiomOrProtocol}
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#16171D] p-3 rounded-lg border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-mono text-white/40">Входное выражение:</span>
                  <div className="font-mono text-sm text-white/80 mt-0.5">
                    <MathView math={step.latexInput} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-white/40">Преобразование:</span>
                  <div className="font-mono text-sm text-[#40E0D0] mt-0.5">
                    <MathView math={step.latexOutput} />
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                {step.explanationRu}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* View Mode: Lean 4 Code */
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-white/50 uppercase font-bold">
              Сгенерированный Lean 4 Код доказательства (`RICIS3.Core`)
            </span>
            <button
              onClick={handleCopyLean}
              className="px-3 py-1 rounded-lg bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-[#0F0F11] text-xs font-mono flex items-center gap-1.5 transition-colors font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Скопировано!' : 'Копировать Lean 4'}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#0F0F11] border border-white/10 text-xs font-mono text-[#40E0D0] overflow-x-auto leading-relaxed">
            <code>{result.leanCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
