import React, { useState } from 'react';
import { Header } from './components/Header';
import { ExpressionSandbox } from './components/ExpressionSandbox';
import { ProblemRegistryView } from './components/ProblemRegistryView';
import { MonolithExplorer } from './components/MonolithExplorer';
import { AxiomsGuide } from './components/AxiomsGuide';
import { PublicationMetaView } from './components/PublicationMetaView';
import { MathView } from './components/MathView';
import { ShieldCheck, Cpu, Award, Layers, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('sandbox');

  const handleLoadToSandbox = (expr: string) => {
    setActiveTab('sandbox');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#E0E0E6] flex flex-col font-sans selection:bg-[#40E0D0]/30 selection:text-[#40E0D0]">
      {/* Top Header Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Summary Info */}
        <div className="mb-6 p-4 rounded-2xl bg-[#16171D] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#40E0D0]/20 text-[#40E0D0] font-mono text-xs font-bold">
              v7.7
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Рекурсивное Индексное Исчисление Тождества и Сингулярностей (RICIS-III)
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Ликвидация классических неопределенностей $0/0$, $0 \times \infty$, $\infty/\infty$ через аксиому $0_F \times \infty_G = F \cdot G$.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#40E0D0] font-bold px-2.5 py-1 bg-[#40E0D0]/10 rounded-lg border border-[#40E0D0]/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> L0 Continuity Enforced
            </span>
          </div>
        </div>

        {/* Tab Switcher Body */}
        {activeTab === 'sandbox' && <ExpressionSandbox />}
        {activeTab === 'problems' && <ProblemRegistryView onLoadToSandbox={handleLoadToSandbox} />}
        {activeTab === 'monoliths' && <MonolithExplorer />}
        {activeTab === 'axioms' && <AxiomsGuide />}
        {activeTab === 'publications' && <PublicationMetaView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0F0F11] py-6 text-xs text-white/50 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            RICIS-III v7.7 System | Author: <span className="text-white/80">Dmitry Aleinikov</span> (ORCID: 0009-0004-3226-7700)
          </div>

          <div className="flex items-center gap-4">
            <a href="https://zenodo.org/records/17872755" target="_blank" rel="noreferrer" className="hover:text-[#40E0D0] transition-colors">
              Zenodo 10.5281/zenodo.17872755
            </a>
            <span>•</span>
            <a href="https://zenodo.org/records/21517353" target="_blank" rel="noreferrer" className="hover:text-[#40E0D0] transition-colors">
              Master Registry 21517353
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
