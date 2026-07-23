import React, { useState } from 'react';
import { MathView } from './MathView';
import { Layers, Box, Disc, Activity, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface MonolithLevel {
  order: number;
  nameRu: string;
  nameEn: string;
  symbolLatex: string;
  definitionRu: string;
  exampleLatex: string;
  icon: React.ReactNode;
}

const MONOLITH_LEVELS: MonolithLevel[] = [
  {
    order: 0,
    nameRu: 'Порядок 0: Атомарный Монолит (Точка)',
    nameEn: 'Order 0: Atomic Monolith (Point)',
    symbolLatex: 'F, \\quad 0_F, \\quad \\infty_F',
    definitionRu: 'Чистая генерирующая идентичность без внутренней рекурсивной структуры. Точка как первичный монад.',
    exampleLatex: '0_5, \\quad \\infty_3',
    icon: <Disc className="w-5 h-5 text-indigo-400" />,
  },
  {
    order: 1,
    nameRu: 'Порядок 1: Монолит Первого Порядка (Линия)',
    nameEn: 'Order 1: First-Order Monolith (Line)',
    symbolLatex: '\\text{Monolith}_1(L)',
    definitionRu: 'Композиция элементов Порядка 0, замкнутая относительно операций RICIS-III. Не является суммой точек!',
    exampleLatex: 'L = \\text{Line}_1 \\quad (\\text{Primary Entity})',
    icon: <Activity className="w-5 h-5 text-emerald-400" />,
  },
  {
    order: 2,
    nameRu: 'Порядок 2: Монолит Второго Порядка (Плоскость)',
    nameEn: 'Order 2: Second-Order Monolith (Plane)',
    symbolLatex: '\\infty_{(\\text{Time}, \\text{Space})}',
    definitionRu: 'Взаимосвязанная система Монолитов Порядков 0-1 с рекурсивным разворачиванием типов.',
    exampleLatex: '\\infty_{\\text{Time}} + \\infty_{\\text{Space}} = \\infty_{(\\text{Time}, \\text{Space})}',
    icon: <Layers className="w-5 h-5 text-purple-400" />,
  },
  {
    order: 3,
    nameRu: 'Порядок 3: Монолит Третьего Порядка (Объем / Система)',
    nameEn: 'Order 3: Third-Order Monolith (Volume)',
    symbolLatex: '\\mathcal{M}_3(\\Omega)',
    definitionRu: 'Самоорганизующаяся многомерная система с автономной навигацией сингулярностей.',
    exampleLatex: '\\mathcal{M}_3(\\text{Quantum Field Space})',
    icon: <Box className="w-5 h-5 text-amber-400" />,
  },
];

export const MonolithExplorer: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<number>(1);

  const activeMonolith = MONOLITH_LEVELS.find((m) => m.order === selectedOrder) || MONOLITH_LEVELS[1];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/20 text-[#40E0D0]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Геометрия Монолитов и Исправление Классических Ошибок
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Иерархия Монолитов Порядков 0–3 в системе RICIS-III v7.7
            </p>
          </div>
        </div>

        {/* Order Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {MONOLITH_LEVELS.map((mono) => (
            <button
              key={mono.order}
              onClick={() => setSelectedOrder(mono.order)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedOrder === mono.order
                  ? 'bg-[#40E0D0]/20 border-[#40E0D0] text-white shadow-lg shadow-[#40E0D0]/20'
                  : 'bg-[#0F0F11] border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {mono.icon}
                <span className="font-mono text-xs font-bold uppercase">
                  Order {mono.order}
                </span>
              </div>
              <h3 className="text-sm font-bold mt-2 text-white">
                {mono.nameRu.split(':')[1]}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Monolith Details */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#40E0D0] font-mono text-xs uppercase font-bold">
            {activeMonolith.icon} {activeMonolith.nameRu}
          </div>
          <div className="mt-3 p-4 rounded-xl bg-[#0F0F11] border border-white/10 font-mono text-base text-[#40E0D0]">
            <MathView math={activeMonolith.symbolLatex} block />
          </div>
          <p className="text-sm text-white/80 mt-4 leading-relaxed">
            {activeMonolith.definitionRu}
          </p>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-white/30 font-bold">
              Пример Выражения в RICIS-III:
            </span>
            <div className="mt-2 p-4 rounded-xl bg-[#0F0F11] border border-white/10 font-mono text-base text-[#40E0D0]">
              <MathView math={activeMonolith.exampleLatex} block />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/30 text-[#40E0D0] text-xs leading-relaxed font-mono">
            <span className="font-bold text-[#40E0D0] block mb-1">
              Фрактальный Закон Сохранения Информации (Fractal Law):
            </span>
            <div className="mt-1">
              <MathView math="R(Q) = \{Q, T(Q), \infty_Q, 0_Q, R(\infty_Q), R(0_Q)\}" /> — Потенциально бесконечное разворачивание без потери системного тождества.
            </div>
          </div>
        </div>
      </div>

      {/* Geometry Correction Section */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-[#FFB347]" />
          Коррекция Геометрических Парадоксов Классической Математики
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="p-4 rounded-xl bg-[#FFB347]/10 border border-[#FFB347]/30">
            <div className="text-[#FFB347] font-mono text-xs font-bold uppercase flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" /> Ошибка Классического Подхода
            </div>
            <div className="mt-2 font-mono text-sm text-[#FFB347]">
              <MathView math="\text{Line} = \sum \text{Points}" />
            </div>
            <p className="text-xs text-[#FFB347]/80 mt-2 leading-relaxed">
              Недопустимый прыжок типов: Type(0-мерная точка) ≠ Type(1-мерная линия). Сумма непрерывного множества нулей не может давать ненулевую длину без потери тождества L1.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/30">
            <div className="text-[#40E0D0] font-mono text-xs font-bold uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Строгое Решение RICIS-III v7.7
            </div>
            <div className="mt-2 font-mono text-sm text-[#40E0D0]">
              <MathView math="\text{Point} = \text{Line}_1 \cap 0_{\text{observer}}" />
            </div>
            <p className="text-xs text-[#40E0D0]/80 mt-2 leading-relaxed">
              Линия — первичный Монолит Порядка 1. Точка является вторичным производным объектом пересечения Линии с нулевым оператором наблюдателя <MathView math="0_{\text{observer}}" />.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
