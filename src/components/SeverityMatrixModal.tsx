import React, { useState } from "react";
import { 
  X, 
  BookOpen, 
  ShieldAlert, 
  TrendingUp, 
  Search, 
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { SEVERITY_TABLE, OCCURRENCE_TABLE, DETECTION_TABLE } from "../data/initialData";

interface SeverityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPaTable?: () => void;
}

export const SeverityMatrixModal: React.FC<SeverityMatrixModalProps> = ({
  isOpen,
  onClose,
  onOpenPaTable,
}) => {
  const [activeTab, setActiveTab] = useState<"severity" | "occurrence" | "detection" | "ap">("severity");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-[#141414] shadow-[6px_6px_0px_#141414] max-w-4xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#141414] text-[#E4E3E0] px-6 py-4 flex items-center justify-between border-b border-[#141414]">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest">
              Tabelas de Critérios & Índices S/O/D (AIAG-VDA / IATF 16949)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#E4E3E0]/70 hover:text-white p-1 hover:bg-[#333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#141414] bg-[#E4E3E0] px-6 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab("severity")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-t border-x border-[#141414] transition-colors cursor-pointer ${
              activeTab === "severity"
                ? "bg-white text-red-700 -mb-px shadow-[2px_0px_0px_#141414]"
                : "bg-[#E4E3E0] text-[#141414]/70 hover:text-[#141414]"
            }`}
          >
            Severidade (S)
          </button>

          <button
            onClick={() => setActiveTab("occurrence")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-t border-x border-[#141414] transition-colors cursor-pointer ${
              activeTab === "occurrence"
                ? "bg-white text-amber-700 -mb-px shadow-[2px_0px_0px_#141414]"
                : "bg-[#E4E3E0] text-[#141414]/70 hover:text-[#141414]"
            }`}
          >
            Ocorrência (O)
          </button>

          <button
            onClick={() => setActiveTab("detection")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-t border-x border-[#141414] transition-colors cursor-pointer ${
              activeTab === "detection"
                ? "bg-white text-purple-700 -mb-px shadow-[2px_0px_0px_#141414]"
                : "bg-[#E4E3E0] text-[#141414]/70 hover:text-[#141414]"
            }`}
          >
            Detecção (D)
          </button>

          <button
            onClick={() => setActiveTab("ap")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-t border-x border-[#141414] transition-colors cursor-pointer ${
              activeTab === "ap"
                ? "bg-white text-blue-700 -mb-px shadow-[2px_0px_0px_#141414]"
                : "bg-[#E4E3E0] text-[#141414]/70 hover:text-[#141414]"
            }`}
          >
            Prioridade de Ação (AP)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === "severity" && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 text-red-950 border border-red-600 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Severidade (1 a 10):</strong> Avalia o impacto do modo de falha na montadora ou usuário final. Não é alterada por controles, apenas por redesign ou contenção funcional.
                </span>
              </div>

              <table className="w-full text-left text-xs border border-[#141414] overflow-hidden">
                <thead className="bg-[#141414] text-[#E4E3E0] font-mono font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5 w-14 text-center">Nota</th>
                    <th className="p-2.5 w-36">Classificação</th>
                    <th className="p-2.5">Critérios & Efeito no Cliente / Montadora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                  {SEVERITY_TABLE.map(item => (
                    <tr key={`sev-item-${item.score}`} className="hover:bg-[#F8F9FA]">
                      <td className="p-2.5 text-center font-mono font-black">
                        <span className={`px-2 py-0.5 border text-xs ${
                          item.score >= 9 ? "bg-red-600 text-white border-red-800" : item.score >= 7 ? "bg-amber-400 text-[#141414] border-[#141414]" : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#141414]">{item.level}</td>
                      <td className="p-2.5 text-[#141414]/80 leading-relaxed">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "occurrence" && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 text-amber-950 border border-amber-500 text-xs flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Ocorrência (1 a 10):</strong> Estima a probabilidade de a causa da falha ocorrer. A reincidência de reclamações no Fast Response eleva diretamente este índice!
                </span>
              </div>

              <table className="w-full text-left text-xs border border-[#141414] overflow-hidden">
                <thead className="bg-[#141414] text-[#E4E3E0] font-mono font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5 w-14 text-center">Nota</th>
                    <th className="p-2.5 w-36">Probabilidade</th>
                    <th className="p-2.5">Taxa de Falhas / Frequência Estimada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                  {OCCURRENCE_TABLE.map(item => (
                    <tr key={`occ-item-${item.score}`} className="hover:bg-[#F8F9FA]">
                      <td className="p-2.5 text-center font-mono font-black">
                        <span className={`px-2 py-0.5 border text-xs ${
                          item.score >= 7 ? "bg-amber-400 text-[#141414] border-[#141414]" : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#141414]">{item.level}</td>
                      <td className="p-2.5 text-[#141414]/80 leading-relaxed">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "detection" && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 text-purple-950 border border-purple-600 text-xs flex items-center space-x-2">
                <Search className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>Detecção (1 a 10):</strong> Avalia a capacidade dos controles atuais de detectar a falha antes da expedição. <em>(1 = Impossível escapar / Poka-Yoke; 10 = Sem controle, certeza de escape)</em>.
                </span>
              </div>

              <table className="w-full text-left text-xs border border-[#141414] overflow-hidden">
                <thead className="bg-[#141414] text-[#E4E3E0] font-mono font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5 w-14 text-center">Nota</th>
                    <th className="p-2.5 w-36">Oportunidade</th>
                    <th className="p-2.5">Maturidade do Método de Detecção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                  {DETECTION_TABLE.map(item => (
                    <tr key={`det-item-${item.score}`} className="hover:bg-[#F8F9FA]">
                      <td className="p-2.5 text-center font-mono font-black">
                        <span className={`px-2 py-0.5 border text-xs ${
                          item.score >= 7 ? "bg-purple-600 text-white border-purple-800" : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#141414]">{item.level}</td>
                      <td className="p-2.5 text-[#141414]/80 leading-relaxed">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "ap" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-950 border border-blue-600 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-mono font-bold text-xs uppercase tracking-wider text-blue-950">
                  <Info className="w-4 h-4 text-blue-700" />
                  <span>Matriz de Prioridade de Ação (AIAG-VDA 1ª Edição)</span>
                </div>
                <p>
                  No padrão AIAG-VDA da IATF 16949, a Prioridade de Ação (AP) substitui a decisão puramente baseada no NPR limite, priorizando primeiro a <strong>Severidade</strong>, em seguida a <strong>Ocorrência</strong> e por último a <strong>Detecção</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-[#141414] bg-red-50/70 shadow-[3px_3px_0px_#141414] space-y-2">
                  <span className="px-2.5 py-1 border border-red-800 bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider inline-block">
                    🚨 AP: Alta (High)
                  </span>
                  <p className="text-xs text-red-950 font-medium">
                    Ação corretiva <strong>obrigatória</strong>. A equipe DEVE identificar ação preventiva ou de contenção robusta (Poka-yoke) ou justificar tecnicamente o motivo de não implementar.
                  </p>
                </div>

                <div className="p-4 border border-[#141414] bg-amber-50/70 shadow-[3px_3px_0px_#141414] space-y-2">
                  <span className="px-2.5 py-1 border border-[#141414] bg-amber-400 text-[#141414] font-mono font-bold text-xs uppercase tracking-wider inline-block">
                    ⚠️ AP: Média (Medium)
                  </span>
                  <p className="text-xs text-amber-950 font-medium">
                    A equipe deve identificar ações para melhorar a prevenção ou detecção, ou documentar os controles existentes como adequados.
                  </p>
                </div>

                <div className="p-4 border border-[#141414] bg-emerald-50/70 shadow-[3px_3px_0px_#141414] space-y-2">
                  <span className="px-2.5 py-1 border border-emerald-700 bg-emerald-600 text-white font-mono font-bold text-xs uppercase tracking-wider inline-block">
                    ✅ AP: Baixa (Low)
                  </span>
                  <p className="text-xs text-emerald-950 font-medium">
                    Risco controlado. Ações podem ser consideradas para melhoria contínua dos processos.
                  </p>
                </div>
              </div>

              {onOpenPaTable && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPaTable();
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] cursor-pointer"
                  >
                    <span>Abrir Tabela PA Completa (4 Clusters)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#E4E3E0] px-6 py-3 border-t border-[#141414] flex items-center justify-between">
          {onOpenPaTable ? (
            <button
              onClick={() => {
                onClose();
                onOpenPaTable();
              }}
              className="text-xs font-mono font-bold text-blue-700 hover:underline cursor-pointer"
            >
              ➔ Acessar Pasta da Tabela PA (AIAG-VDA)
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#141414] hover:bg-[#333] text-[#E4E3E0] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
          >
            Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
