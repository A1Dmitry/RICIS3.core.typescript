import React, { useState } from 'react';
import { PUBLICATION_METADATA } from '../data/problemsData';
import { getRICIS3CoreModule } from '../engine/lean4Generator';
import { ExternalLink, Copy, Check, Download, BookMarked, Code } from 'lucide-react';

export const PublicationMetaView: React.FC = () => {
  const [copiedCore, setCopiedCore] = useState(false);
  const coreLeanCode = getRICIS3CoreModule();

  const handleCopyCore = () => {
    navigator.clipboard.writeText(coreLeanCode);
    setCopiedCore(true);
    setTimeout(() => setCopiedCore(false), 2000);
  };

  const handleDownloadCore = () => {
    const blob = new Blob([coreLeanCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RICIS3_Core.lean';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/20 text-[#40E0D0]">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Официальные Публикации, Реестр DOIs и Lean 4 Ядро
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Автор: <span className="text-white font-semibold">Дмитрий Алейников</span> (Dmitry Aleinikov), ORCID: <a href="https://orcid.org/0009-0004-3226-7700" target="_blank" rel="noreferrer" className="text-[#40E0D0] hover:underline">0009-0004-3226-7700</a>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of DOIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PUBLICATION_METADATA.map((pub, idx) => (
          <div
            key={idx}
            className="p-5 rounded-lg bg-[#16171D] border border-white/10 hover:border-white/20 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#40E0D0]/10 text-[#40E0D0] border border-[#40E0D0]/20 font-bold">
                  Zenodo Registered DOI
                </span>
                <span className="text-xs font-mono text-white/50">
                  ORCID: {pub.orcid}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-3">
                {pub.titleRu}
              </h3>
              <p className="text-xs text-white/50 mt-1 italic">
                {pub.titleEn}
              </p>

              <p className="text-xs text-white/80 mt-3 leading-relaxed">
                {pub.descriptionRu}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-[#40E0D0] font-bold">
                DOI: {pub.doi}
              </span>
              <a
                href={pub.zenodoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#40E0D0]/10 hover:bg-[#40E0D0]/20 text-[#40E0D0] border border-[#40E0D0]/30 font-mono text-xs flex items-center gap-1 transition-colors"
              >
                Zenodo Record <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Lean 4 Core Export Box */}
      <div className="p-6 rounded-lg bg-[#16171D] border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#40E0D0]" />
            <h3 className="text-base font-bold text-white font-mono">
              RICIS3.Core (Lean 4 Formal Module)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCore}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              {copiedCore ? <Check className="w-3.5 h-3.5 text-[#40E0D0]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCore ? 'Скопировано!' : 'Копировать модуль'}
            </button>

            <button
              onClick={handleDownloadCore}
              className="px-3 py-1.5 rounded-lg bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-[#0F0F11] font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-[#40E0D0]/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать RICIS3_Core.lean
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-[#0F0F11] border border-white/10 text-xs font-mono text-[#40E0D0] overflow-x-auto leading-relaxed">
          <code>{coreLeanCode}</code>
        </pre>
      </div>
    </div>
  );
};
