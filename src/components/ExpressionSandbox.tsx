import React, { useState, useEffect } from 'react';
import { evaluateRicisExpression } from '../engine/ricisEngine';
import { PhaseTraceView } from './PhaseTraceView';
import { MathView } from './MathView';
import { Play, Sparkles, RefreshCw, Calculator } from 'lucide-react';

interface SandboxPreset {
  label: string;
  expr: string;
  category: string;
}

const PRESETS: SandboxPreset[] = [
  { label: '5 / 0', expr: '5 / 0', category: 'Деление на ноль' },
  { label: '0_5 × ∞_3', expr: '0_5 * ∞_3', category: 'Произведение 0×∞' },
  { label: '0_5 × ∞_5', expr: '0_5 * ∞_5', category: 'Диагональный телескоп (F²)' },
  { label: '∞_6 / ∞_2', expr: '∞_6 / ∞_2', category: 'Отношение бесконечностей' },
  { label: '0_8 / 0_2', expr: '0_8 / 0_2', category: 'Отношение нулей' },
  { label: '(x² - 4) / (x - 2)', expr: '(x^2 - 4)/(x - 2)', category: 'Конвергенция путей (x=2)' },
  { label: '(x-5)(x+5) / (x-5)', expr: '(x-5)*(x+5)/(x-5)', category: 'Правило локальности SP1' },
  { label: 'sin(x) / x', expr: 'sin(x)/x', category: 'Фундаментальный предел' },
  { label: '∞_Time + ∞_Space', expr: '∞_Time + ∞_Space', category: 'Составной монолит (TCP)' },
];

export const ExpressionSandbox: React.FC = () => {
  const [expression, setExpression] = useState('0_5 * ∞_3');
  const [activePreset, setActivePreset] = useState('0_5 * ∞_3');
  const [evaluation, setEvaluation] = useState(() => evaluateRicisExpression('0_5 * ∞_3'));

  const handleEvaluate = (exprToRun?: string) => {
    const targetExpr = exprToRun || expression;
    const res = evaluateRicisExpression(targetExpr);
    setEvaluation(res);
  };

  useEffect(() => {
    handleEvaluate(expression);
  }, []);

  const selectPreset = (preset: SandboxPreset) => {
    setExpression(preset.expr);
    setActivePreset(preset.expr);
    handleEvaluate(preset.expr);
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Header Box */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/20 text-[#40E0D0]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Интерактивный Вычислитель Сингулярностей RICIS-III v7.7
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Вводите любые математические выражения с делением на нуль, неопределенностями $0_F \times \infty_G$ или индексированными монолитами.
            </p>
          </div>
        </div>

        {/* Input Box */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Например: 0_5 * ∞_3, (x^2 - 4)/(x - 2), 5 / 0, ∞_Time + ∞_Space"
              className="w-full px-4 py-3 bg-[#0F0F11] border border-white/10 rounded-xl text-white font-mono text-base focus:outline-none focus:border-[#40E0D0] focus:ring-1 focus:ring-[#40E0D0] transition-all placeholder:text-white/30"
              onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
            />
            {expression && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#40E0D0]/80 pointer-events-none hidden sm:block">
                RICIS-III Parser Active
              </div>
            )}
          </div>

          <button
            onClick={() => handleEvaluate()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-[#0F0F11] font-mono font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#40E0D0]/30 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Вычислить (Phases -1 to 6)
          </button>
        </div>

        {/* Preset Shortcuts */}
        <div className="mt-4">
          <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block mb-2 font-semibold">
            Быстрые Шорткаты (Пресеты):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => selectPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
                  activePreset === p.expr
                    ? 'bg-[#40E0D0]/20 text-[#40E0D0] border-[#40E0D0]/50 shadow-sm shadow-[#40E0D0]/20 font-bold'
                    : 'bg-[#0F0F11] text-white/50 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#40E0D0]" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Phase Trace View */}
      {evaluation && <PhaseTraceView result={evaluation} />}
    </div>
  );
};
