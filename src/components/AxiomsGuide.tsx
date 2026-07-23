import React from 'react';
import { MathView } from './MathView';
import { ShieldCheck, BookOpen, AlertTriangle, Layers } from 'lucide-react';

export const AxiomsGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/20 text-[#40E0D0]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Полный Справочник Аксиом и Протоколов Безопасности (RICIS-III v7.7)
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              4 Аксиоматических Протокола Безопасности (SP1–SP4) и 10 Фундаментальных Аксиом (A1–A10)
            </p>
          </div>
        </div>
      </div>

      {/* Safety Protocols SP1 - SP4 */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#40E0D0]" />
          Протоколы Безопасности Сингулярностей (Safety Protocols SP1–SP4)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0F0F11] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#40E0D0] uppercase">
                SP1: Locality Rule (Правило Локальности)
              </span>
            </div>
            <div className="mt-2 font-mono text-sm text-[#40E0D0]">
              <MathView math="\frac{0_F \cdot tail}{0_F} = 1 \cdot tail" />
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Запрет тотальной амнезии. Сокращение 0/0 применяется ТОЛЬКО к идентичным факторам. "Хвост" (tail) выражения полностью сохраняет активность.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F11] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#40E0D0] uppercase">
                SP2: Reduction Priority (Приоритет Сокращения)
              </span>
            </div>
            <div className="mt-2 font-mono text-sm text-[#40E0D0]">
              <MathView math="\text{Simplify}(E) \text{ BEFORE } \text{Singularity Evaluation}" />
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Алгебраическое упрощение и факторизация выполняются ДО применения аксиом сингулярностей для устраненения "ложных нулей".
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F11] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#40E0D0] uppercase">
                SP3: Index Law (Закон Индекса)
              </span>
            </div>
            <div className="mt-2 font-mono text-sm text-[#40E0D0]">
              <MathView math="\frac{0_F}{0_G} = \frac{F}{G}" />
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Если сокращение невозможно, отношение нулей строго определяется отношением их генерирующих индексов $F/G$.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F11] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#40E0D0] uppercase">
                SP4: Semantic Priority (Семантический Приоритет)
              </span>
            </div>
            <div className="mt-2 font-mono text-sm text-[#40E0D0]">
              <MathView math="0_{E(x)|_{x=a}} \quad (\text{Index by Parent Expression})" />
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Индексация сингулярностей производится по порождающему алгебраическому выражению $E(x)$ в точке $x=a$, а не по числовому значению. Гарантирует конвергенцию путей.
            </p>
          </div>
        </div>
      </div>

      {/* Axioms Engine Table A1 - A10 */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-[#40E0D0]" />
          Движок Аксиом Сингулярности (Axioms Engine A1–A10)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 bg-[#0F0F11]/60">
                <th className="p-3">Аксиома</th>
                <th className="p-3">Формула</th>
                <th className="p-3">Название & Описание</th>
                <th className="p-3">Спец. Случаи</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A1</td>
                <td className="p-3 text-white"><MathView math="F / 0 \rightarrow \infty_F" /></td>
                <td className="p-3 text-white/80">Индексированная Бесконечность</td>
                <td className="p-3 text-white/50">∀ F ≠ 0</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A2</td>
                <td className="p-3 text-white"><MathView math="\infty_0 \equiv 1" /></td>
                <td className="p-3 text-white/80">Нулевая Бесконечность (L1: 0/0 = 1)</td>
                <td className="p-3 text-white/50">Тождество L1</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A3</td>
                <td className="p-3 text-white"><MathView math="0_F \neq 0_G \quad (F \neq G)" /></td>
                <td className="p-3 text-white/80">Нетождественность Нулей с Разной Предысторией</td>
                <td className="p-3 text-white/50">Сохранение генерирующего происхождения</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A4</td>
                <td className="p-3 text-white"><MathView math="0_F / 0_G = F / G" /></td>
                <td className="p-3 text-white/80">Отношение Нулей (Zero Ratio)</td>
                <td className="p-3 text-white/50">Раскрытие 0/0</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A5</td>
                <td className="p-3 text-white"><MathView math="\infty_F / \infty_G = F / G" /></td>
                <td className="p-3 text-white/80">Отношение Бесконечностей (Infinity Ratio)</td>
                <td className="p-3 text-white/50">Раскрытие ∞/∞</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A6_GENERAL</td>
                <td className="p-3 text-[#40E0D0] font-bold"><MathView math="0_F \times \infty_G = F \cdot G" /></td>
                <td className="p-3 text-white font-bold">Обобщенное Произведение (Unifying Product)</td>
                <td className="p-3 text-[#40E0D0]/80">Диагональный Телескоп: <MathView math="0_F \times \infty_F = F^2" /></td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A7</td>
                <td className="p-3 text-white"><MathView math="\infty_F - \infty_G = \infty_{F-G}" /></td>
                <td className="p-3 text-white/80">Разность Бесконечностей</td>
                <td className="p-3 text-white/50">Сохранение типов</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A8</td>
                <td className="p-3 text-white"><MathView math="0_F - 0_G = 0_{F-G}" /></td>
                <td className="p-3 text-white/80">Разность Нулей</td>
                <td className="p-3 text-white/50">Индексная разность</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A9</td>
                <td className="p-3 text-white"><MathView math="F \cdot 0 = 0_F" /></td>
                <td className="p-3 text-white/80">Умножение Скаляра на Ноль</td>
                <td className="p-3 text-white/50">Порождение нулей</td>
              </tr>
              <tr>
                <td className="p-3 text-[#40E0D0] font-bold">A10</td>
                <td className="p-3 text-white"><MathView math="F / 0 = \infty_F" /></td>
                <td className="p-3 text-white/80">Деление Скаляра на Ноль</td>
                <td className="p-3 text-white/50">Порождение бесконечностей</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
