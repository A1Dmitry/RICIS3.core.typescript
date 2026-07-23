import React, { useState } from 'react';
import { MASTER_17_PROBLEMS } from '../data/problemsData';
import { ProblemTask } from '../types/ricis';
import { MathView } from './MathView';
import { Award, ExternalLink, Play, CheckCircle, Search, Filter } from 'lucide-react';

interface ProblemRegistryViewProps {
  onLoadToSandbox: (expr: string) => void;
}

export const ProblemRegistryView: React.FC<ProblemRegistryViewProps> = ({ onLoadToSandbox }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'All', labelRu: 'Все 17 Задач' },
    { id: 'Millennium', labelRu: 'Проблемы Тысячелетия (Millennium)' },
    { id: 'IndeterminateForms', labelRu: 'Неопределенности (0/0, 0×∞)' },
    { id: 'DeepLearning', labelRu: 'Глубокое Обучение & LLM' },
    { id: 'Decipherment', labelRu: 'Рукопись Войнича' },
    { id: 'MonolithGeometry', labelRu: 'Геометрия Монолитов' },
    { id: 'AxiomsVerification', labelRu: 'Проверка Аксиом (SP1-SP4)' },
  ];

  const filteredProblems = MASTER_17_PROBLEMS.filter((p) => {
    const categoryMatches = selectedCategory === 'All' || p.category === selectedCategory;
    const queryMatches =
      p.titleRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descriptionRu.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && queryMatches;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/20 text-[#40E0D0]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Мастер-Реестр 17 Математических Проблем и Сингулярностей
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Официально зарегистрированный реестр DOIs: <a href="https://zenodo.org/records/21517353" target="_blank" rel="noreferrer" className="text-[#40E0D0] hover:underline">10.5281/zenodo.21517353</a> (Dmitry Aleinikov)
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по задачам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0F0F11] border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#40E0D0]"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 text-xs font-mono">
          <Filter className="w-4 h-4 text-white/30 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#40E0D0] text-[#0F0F11] font-semibold shadow-md shadow-[#40E0D0]/30'
                  : 'bg-[#0F0F11] text-white/50 border border-white/10 hover:text-white'
              }`}
            >
              {cat.labelRu}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Problem Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProblems.map((prob) => (
          <div
            key={prob.id}
            className="p-5 rounded-lg bg-[#16171D] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#40E0D0]/10 text-[#40E0D0] border border-[#40E0D0]/20 font-semibold">
                  {prob.category}
                </span>
                {prob.doi && (
                  <a
                    href={prob.zenodoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-[#40E0D0] hover:underline flex items-center gap-1"
                  >
                    DOI: {prob.doi} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h3 className="text-base font-bold text-white mt-3 leading-snug">
                {prob.titleRu}
              </h3>

              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                {prob.descriptionRu}
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#0F0F11] border border-white/10 font-mono text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/30 block uppercase">Формулировка:</span>
                  <span className="text-[#40E0D0] font-bold">
                    <MathView math={prob.expression} />
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/30 block uppercase">Результат RICIS-III:</span>
                  <span className="text-[#40E0D0] font-bold">
                    <MathView math={prob.expectedResultLatex} />
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-[10px] font-mono text-white/30 uppercase font-semibold">Шаги решения:</span>
                {prob.solutionStepsRu.map((step, idx) => (
                  <div key={idx} className="text-[11px] text-white/80 flex items-center gap-1.5 font-mono">
                    <CheckCircle className="w-3 h-3 text-[#40E0D0] shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-white/30 truncate max-w-[200px]" title={prob.leanTheorem}>
                Lean: {prob.leanTheorem}
              </span>

              <button
                onClick={() => onLoadToSandbox(prob.expression)}
                className="px-3.5 py-1.5 rounded-lg bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-[#0F0F11] font-mono text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#40E0D0]/30 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Запустить в Сандбоксе
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
