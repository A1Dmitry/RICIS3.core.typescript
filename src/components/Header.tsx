import React from 'react';
import { ShieldCheck, Cpu, BookOpen, Layers, Award, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-white/10 bg-[#16171D]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#40E0D0] p-0.5 shadow-lg shadow-[#40E0D0]/20">
              <div className="w-full h-full bg-[#0F0F11] rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#40E0D0]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  RICIS-III <span className="text-xs px-2 py-0.5 rounded-full bg-[#40E0D0]/20 text-[#40E0D0] border border-[#40E0D0]/30 font-mono">v7.7 Complete</span>
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#40E0D0]/10 text-[#40E0D0] border border-[#40E0D0]/20 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" /> Logically Complete & Secure
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Recursive Indexed Calculus of Identity and Singularity | Author: <span className="text-white/80 font-semibold">Dmitry Aleinikov</span> (ORCID: <a href="https://orcid.org/0009-0004-3226-7700" target="_blank" rel="noreferrer" className="text-[#40E0D0] hover:underline">0009-0004-3226-7700</a>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <a
              href="https://zenodo.org/records/17872755"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 flex items-center gap-1 transition-colors"
            >
              DOI: 10.5281/zenodo.17872755 <ExternalLink className="w-3 h-3 text-white/50" />
            </a>
            <a
              href="https://www.academia.edu/170637753/Singularity_17_tasks_solved"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#40E0D0]/10 hover:bg-[#40E0D0]/20 text-[#40E0D0] border border-[#40E0D0]/30 flex items-center gap-1 transition-colors"
            >
              Academia Record <ExternalLink className="w-3 h-3 text-[#40E0D0]" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 border-t border-white/10 pt-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'sandbox'
                ? 'bg-[#40E0D0] text-[#0F0F11] font-bold shadow-md shadow-[#40E0D0]/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Интерактивный Сандбокс (Sandbox)
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'problems'
                ? 'bg-[#40E0D0] text-[#0F0F11] font-bold shadow-md shadow-[#40E0D0]/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" />
            Мастер-Реестр 17 Задач
          </button>

          <button
            onClick={() => setActiveTab('monoliths')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'monoliths'
                ? 'bg-[#40E0D0] text-[#0F0F11] font-bold shadow-md shadow-[#40E0D0]/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            Геометрия Монолитов
          </button>

          <button
            onClick={() => setActiveTab('axioms')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'axioms'
                ? 'bg-[#40E0D0] text-[#0F0F11] font-bold shadow-md shadow-[#40E0D0]/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Аксиомы & Протоколы (SP1–SP4)
          </button>

          <button
            onClick={() => setActiveTab('publications')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'publications'
                ? 'bg-[#40E0D0] text-[#0F0F11] font-bold shadow-md shadow-[#40E0D0]/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Публикации & Lean 4 Код
          </button>
        </nav>
      </div>
    </header>
  );
};
