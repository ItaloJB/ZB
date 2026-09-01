import React, { useState } from "react";
import { 
  BookOpen, 
  ShieldAlert, 
  TrendingUp, 
  Search, 
  Layers, 
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { SEVERITY_TABLE, OCCURRENCE_TABLE, DETECTION_TABLE } from "../data/initialData";

interface SodTablesViewProps {
  onGoToPaTable?: () => void;
}

export const SodTablesView: React.FC<SodTablesViewProps> = ({ onGoToPaTable }) => {
  const [activeTab, setActiveTab] = useState<"severity" | "occurrence" | "detection">("severity");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredSeverity = SEVERITY_TABLE.filter(item => 
    item.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.score).includes(searchTerm)
  );

  const filteredOccurrence = OCCURRENCE_TABLE.filter(item => 
    item.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.score).includes(searchTerm)
  );

  const filteredDetection = DETECTION_TABLE.filter(item => 
    item.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.score).includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 border border-[#141414] shadow-[4px_4px_0px_#141414] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#141414]/50 block">
                Tabelas Normativas AIAG-VDA 1ª Edição • IATF 16949
              </span>
              <h1 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-[#141414]">
                Tabelas de Critérios & Índices S / O / D
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#141414]/80 mt-1.5 max-w-3xl font-sans leading-relaxed">
            Consulte as diretrizes oficiais de pontuação de 1 a 10 para <strong>Severidade (S)</strong>, <strong>Ocorrência (O)</strong> e <strong>Detecção (D)</strong> para elaboração e auditoria do PFMEA.
          </p>
        </div>

        {onGoToPaTable && (
          <button
            onClick={onGoToPaTable}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#141414] hover:bg-[#333] text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
          >
            <span>Ver Tabela PA (Matriz 3D)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation Tabs & Search */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("severity")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "severity"
                ? "bg-red-600 text-white shadow-[2px_2px_0px_#141414]"
                : "bg-slate-100 text-[#141414] hover:bg-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Severidade (S)</span>
          </button>

          <button
            onClick={() => setActiveTab("occurrence")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "occurrence"
                ? "bg-amber-400 text-[#141414] shadow-[2px_2px_0px_#141414]"
                : "bg-slate-100 text-[#141414] hover:bg-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ocorrência (O)</span>
          </button>

          <button
            onClick={() => setActiveTab("detection")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "detection"
                ? "bg-purple-600 text-white shadow-[2px_2px_0px_#141414]"
                : "bg-slate-100 text-[#141414] hover:bg-slate-200"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Detecção (D)</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Filtrar por texto, nível ou nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-50 border border-[#141414] focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-[#141414]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Tab Content Tables */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] p-5">
        {activeTab === "severity" && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 text-red-950 border border-red-600 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Severidade (1 a 10):</strong> Avalia o impacto do modo de falha na montadora ou usuário final. Não é alterada por controles, apenas por redesign do produto ou alteração de processo.
              </span>
            </div>

            <table className="w-full text-left text-xs border border-[#141414]">
              <thead className="bg-[#141414] text-[#E4E3E0] font-mono font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 w-16 text-center">Nota</th>
                  <th className="p-2.5 w-44">Classificação</th>
                  <th className="p-2.5">Critérios & Efeito no Cliente / Montadora (IATF 16949)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                {filteredSeverity.map(item => (
                  <tr key={`sev-row-${item.score}`} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-mono font-black">
                      <span className={`px-2.5 py-1 border text-xs font-mono font-black ${
                        item.score >= 9 ? "bg-red-600 text-white border-red-800" :
                        item.score >= 7 ? "bg-amber-400 text-[#141414] border-[#141414]" :
                        "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                      }`}>
                        {item.score}
                      </span>
                    </td>
                    <td className="p-3 font-bold font-mono text-[#141414]">{item.level}</td>
                    <td className="p-3 text-[#141414]/90 leading-relaxed font-sans">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "occurrence" && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 text-amber-950 border border-amber-500 text-xs flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Ocorrência (1 a 10):</strong> Estima a probabilidade de a causa da falha ocorrer. A reincidência de reclamações no Fast Response eleva diretamente este índice!
              </span>
            </div>

            <table className="w-full text-left text-xs border border-[#141414]">
              <thead className="bg-[#141414] text-[#E4E3E0] font-mono font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 w-16 text-center">Nota</th>
                  <th className="p-2.5 w-44">Probabilidade</th>
                  <th className="p-2.5">Taxa de Falhas / Frequência Estimada de Processo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                {filteredOccurrence.map(item => (
                  <tr key={`occ-row-${item.score}`} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-mono font-black">
                      <span className={`px-2.5 py-1 border text-xs font-mono font-black ${
                        item.score >= 7 ? "bg-amber-400 text-[#141414] border-[#141414]" :
                        "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                      }`}>
                        {item.score}
                      </span>
                    </td>
                    <td className="p-3 font-bold font-mono text-[#141414]">{item.level}</td>
                    <td className="p-3 text-[#141414]/90 leading-relaxed font-sans">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "detection" && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 text-purple-950 border border-purple-600 text-xs flex items-center space-x-2">
              <Search className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>Detecção (1 a 10):</strong> Avalia a capacidade dos controles atuais de detectar a falha antes da expedição. <em>(1 = Impossível escapar / Poka-Yoke; 10 = Sem controle / Certeza de escape)</em>.
              </span>
            </div>

            <table className="w-full text-left text-xs border border-[#141414]">
              <thead className="bg-[#141414] text-[#E4E3E0] font-mono font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 w-16 text-center">Nota</th>
                  <th className="p-2.5 w-44">Oportunidade</th>
                  <th className="p-2.5">Maturidade do Método de Detecção e Inspeção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                {filteredDetection.map(item => (
                  <tr key={`det-row-${item.score}`} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-mono font-black">
                      <span className={`px-2.5 py-1 border text-xs font-mono font-black ${
                        item.score >= 7 ? "bg-purple-600 text-white border-purple-800" :
                        "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                      }`}>
                        {item.score}
                      </span>
                    </td>
                    <td className="p-3 font-bold font-mono text-[#141414]">{item.level}</td>
                    <td className="p-3 text-[#141414]/90 leading-relaxed font-sans">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
