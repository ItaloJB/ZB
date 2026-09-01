import React, { useState } from "react";
import { 
  Table, 
  Layers, 
  HelpCircle, 
  Info, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Search,
  Download,
  Printer,
  Compass,
  ArrowRight
} from "lucide-react";
import { calculateAp } from "../data/initialData";

interface PaTableViewProps {
  onGoToPfmea?: () => void;
}

export const PaTableView: React.FC<PaTableViewProps> = ({ onGoToPfmea }) => {
  // Live Simulator state
  const [simS, setSimS] = useState<number>(7);
  const [simO, setSimO] = useState<number>(3);
  const [simD, setSimD] = useState<number>(4);
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<"all" | "9-10" | "7-8" | "5-6" | "3-4" | "1-2">("all");

  const currentAp = calculateAp(simS, simO, simD);
  const currentRpn = simS * simO * simD;

  // Helper to determine which cluster a severity belongs to
  const getSeverityClusterKey = (s: number) => {
    if (s >= 9) return "9-10";
    if (s >= 7) return "7-8";
    if (s >= 5) return "5-6";
    if (s >= 3) return "3-4";
    return "1-2";
  };

  // Helper for cell color styling matching Annex 1
  const getCellClasses = (ap: "Alta" | "Média" | "Baixa", isSelected: boolean) => {
    let base = "text-center font-mono font-black text-xs transition-all relative border border-white/20 select-none ";
    if (isSelected) {
      base += "ring-3 ring-[#141414] scale-110 z-10 font-black shadow-lg ";
    }

    if (ap === "Alta") {
      return base + "bg-[#e86a45] text-white hover:brightness-110";
    }
    if (ap === "Média") {
      return base + "bg-[#f5b842] text-[#141414] hover:brightness-110";
    }
    return base + "bg-[#5fa5e8] text-white hover:brightness-110";
  };

  // Cell AP Code (H, M, L)
  const getCellCode = (ap: "Alta" | "Média" | "Baixa") => {
    if (ap === "Alta") return "H";
    if (ap === "Média") return "M";
    return "L";
  };

  // Render a Single Severity Cluster Grid
  const renderClusterGrid = (
    title: string,
    clusterKey: "9-10" | "7-8" | "5-6" | "3-4" | "1-2",
    sampleS: number
  ) => {
    const isCurrentActiveCluster = getSeverityClusterKey(simS) === clusterKey;

    // Detection headers definitions
    const detLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const occLevels = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    return (
      <div 
        key={`cluster-${clusterKey}`}
        className={`bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden flex flex-col justify-between transition-all ${
          isCurrentActiveCluster ? "ring-2 ring-blue-600 ring-offset-2" : ""
        }`}
      >
        {/* Cluster Top Bar */}
        <div className="bg-[#141414] text-[#E4E3E0] px-3.5 py-2 flex items-center justify-between border-b border-[#141414]">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              clusterKey === "9-10" ? "bg-red-500" :
              clusterKey === "7-8" ? "bg-orange-500" :
              clusterKey === "5-6" ? "bg-amber-400" : "bg-blue-400"
            }`} />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              {title}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#E4E3E0]/70">
            {clusterKey === "9-10" ? "Severidade Extrema / Segurança" :
             clusterKey === "7-8" ? "Severidade Alta / Parada" :
             clusterKey === "5-6" ? "Severidade Moderada" :
             clusterKey === "3-4" ? "Severidade Baixa" : "Severidade Mínima"}
          </span>
        </div>

        <div className="p-3 overflow-x-auto">
          {/* Main Matrix Table */}
          <div className="min-w-[500px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-16 p-1 text-[9px] font-mono font-bold uppercase text-[#141414]/70 text-left">
                    Occurrence
                  </th>
                  {detLevels.map(d => (
                    <th key={`th-det-${clusterKey}-${d}`} className="p-1 text-center font-mono font-bold text-xs bg-slate-100 border border-slate-300">
                      {d}
                    </th>
                  ))}
                  <th className="w-20 p-1 text-center text-[9px] font-mono font-bold uppercase text-[#141414]/70">
                    Detection
                  </th>
                </tr>
              </thead>
              <tbody>
                {occLevels.map(occ => {
                  const isOccHighlighted = isCurrentActiveCluster && simO === occ;

                  return (
                    <tr key={`row-occ-${clusterKey}-${occ}`} className={isOccHighlighted ? "bg-blue-50/50" : ""}>
                      <td className={`p-1 font-mono font-black text-xs text-center border border-slate-200 ${
                        isOccHighlighted ? "bg-blue-600 text-white" : "bg-slate-100 text-[#141414]"
                      }`}>
                        {occ}
                      </td>

                      {detLevels.map(det => {
                        const cellAp = calculateAp(sampleS, occ, det);
                        const isSelected = isCurrentActiveCluster && simO === occ && simD === det;

                        return (
                          <td 
                            key={`cell-${clusterKey}-${occ}-${det}`} 
                            onClick={() => {
                              setSimS(sampleS);
                              setSimO(occ);
                              setSimD(det);
                            }}
                            className={`p-0 h-7 w-8 cursor-pointer ${getCellClasses(cellAp, isSelected)}`}
                            title={`S=${sampleS}, O=${occ}, D=${det} ➔ PA: ${cellAp}`}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              {getCellCode(cellAp)}
                              {isSelected && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#141414] rounded-full border border-white"></span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-1 text-[8px] font-mono text-[#141414]/50 text-center border-l border-slate-200">
                        {occ === 10 ? "In-Station?" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Detection Hierarchy & Opportunity Descriptions (matching Annex 1) */}
            <div className="mt-2 text-[9px] font-mono border-t border-slate-300 pt-2 grid grid-cols-10 gap-0.5 text-center leading-tight">
              {/* D=1 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-[#141414] block">Poka Yoke</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">cannot be produced / always detected</span>
              </div>

              {/* D=2 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-blue-700 block">IN-STATION</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Machine-based</span>
              </div>

              {/* D=3 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-blue-700 block">DOWN-STREAM</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Machine-based automated</span>
              </div>

              {/* D=4 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-blue-700 block">DOWN-STREAM</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Machine-based (semi-auto)</span>
              </div>

              {/* D=5 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-purple-700 block">IN-STATION</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Human inspection</span>
              </div>

              {/* D=6 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-purple-700 block">DOWN-STREAM</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Human inspection (semi-auto)</span>
              </div>

              {/* D=7 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-slate-700 block">Not defined</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Machine-based (semi-auto)</span>
              </div>

              {/* D=8 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-slate-700 block">Not defined</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Human inspection</span>
              </div>

              {/* D=9 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-slate-500 block">Not defined</span>
                <span className="text-[7px] text-[#141414]/70 mt-1">Not Easily</span>
              </div>

              {/* D=10 */}
              <div className="p-1 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="font-bold text-[8px] text-red-600 block">Not defined</span>
                <span className="text-[7px] text-red-600 font-bold mt-1">Will NOT detect</span>
              </div>
            </div>

            {/* Opportunity of Detection Banner */}
            <div className="mt-1 grid grid-cols-10 gap-0.5 text-center text-[8px] font-mono font-black uppercase text-white">
              <div className="col-span-1 p-0.5 bg-emerald-700">Poka Yoke</div>
              <div className="col-span-3 p-0.5 bg-blue-700">Will (Machine-based)</div>
              <div className="col-span-2 p-0.5 bg-purple-700">Should</div>
              <div className="col-span-2 p-0.5 bg-amber-600">Not Easily</div>
              <div className="col-span-2 p-0.5 bg-red-700">Will NOT</div>
            </div>
          </div>
        </div>

        {/* Cluster Footer Note */}
        <div className="bg-slate-50 px-3.5 py-1.5 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-[#141414]/60">
          <span>P-FMEA Review Training | Identification of typical weaknesses</span>
          <span className="font-bold">Source: VDA / AIAG FMEA Handbook 1st Edition 2019</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 border border-[#141414] shadow-[4px_4px_0px_#141414] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center">
              <Table className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#141414]/50 block">
                P-FMEA Review Training • Version 8.0 • IATF 16949:2016
              </span>
              <h1 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-[#141414]">
                Tabela PA — Severidade X Ocorrência X Detecção
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#141414]/80 mt-1.5 max-w-3xl font-sans leading-relaxed">
            Matriz de <strong>Prioridade de Ação (PA / AP)</strong> do manual oficial <strong>AIAG & VDA FMEA (1ª Edição 2019)</strong>. 
            Prioriza o risco hierarquicamente: primeiro pela <strong>Severidade (S)</strong>, depois pela <strong>Ocorrência (O)</strong> e por fim pela <strong>Detecção (D)</strong>.
          </p>
        </div>

        {/* AP Badges Legend */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F8F9FA] p-3 border border-[#141414]">
          <span className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 mr-1 block sm:inline">
            Legenda PA:
          </span>
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase bg-[#e86a45] text-white border border-[#141414] shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            HIGH (H) / Alta
          </span>
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase bg-[#f5b842] text-[#141414] border border-[#141414] shadow-xs">
            MEDIUM (M) / Média
          </span>
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase bg-[#5fa5e8] text-white border border-[#141414] shadow-xs">
            LOW (L) / Baixa
          </span>
        </div>
      </div>

      {/* Interactive S/O/D Live Simulator & Diagnostic Card */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-[#141414]/20 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#141414]">
              Simulador Interativo em Tempo Real (S / O / D ➔ Prioridade de Ação)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#141414]/60">
            Ajuste os valores para localizar a célula exata na matriz abaixo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Severity Slider */}
          <div className="bg-slate-50 p-3 border border-slate-300">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-red-700 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Severidade (S)
              </label>
              <span className="px-2 py-0.5 text-xs font-mono font-black bg-red-600 text-white">
                {simS}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={simS}
              onChange={(e) => setSimS(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[8px] font-mono text-[#141414]/50 mt-1">
              <span>1 (Leve)</span>
              <span>Cluster: {getSeverityClusterKey(simS)}</span>
              <span>10 (Segurança)</span>
            </div>
          </div>

          {/* Occurrence Slider */}
          <div className="bg-slate-50 p-3 border border-slate-300">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Ocorrência (O)
              </label>
              <span className="px-2 py-0.5 text-xs font-mono font-black bg-amber-400 text-[#141414]">
                {simO}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={simO}
              onChange={(e) => setSimO(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[8px] font-mono text-[#141414]/50 mt-1">
              <span>1 (Quase nula)</span>
              <span>10 (Frequente)</span>
            </div>
          </div>

          {/* Detection Slider */}
          <div className="bg-slate-50 p-3 border border-slate-300">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-blue-800 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Detecção (D)
              </label>
              <span className="px-2 py-0.5 text-xs font-mono font-black bg-blue-600 text-white">
                {simD}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={simD}
              onChange={(e) => setSimD(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[8px] font-mono text-[#141414]/50 mt-1">
              <span>1 (Poka-Yoke)</span>
              <span>10 (Sem controle)</span>
            </div>
          </div>

          {/* Result Outcome */}
          <div className={`p-3 border-2 border-[#141414] shadow-[3px_3px_0px_#141414] text-center ${
            currentAp === "Alta" ? "bg-red-50 text-red-950" :
            currentAp === "Média" ? "bg-amber-50 text-amber-950" : "bg-blue-50 text-blue-950"
          }`}>
            <span className="text-[9px] font-mono uppercase tracking-widest block font-bold text-[#141414]/60">
              Resultado Prioridade (PA)
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`px-3 py-1 font-mono font-black text-sm uppercase tracking-wider border border-[#141414] ${
                currentAp === "Alta" ? "bg-[#e86a45] text-white" :
                currentAp === "Média" ? "bg-[#f5b842] text-[#141414]" : "bg-[#5fa5e8] text-white"
              }`}>
                {currentAp === "Alta" ? "🚨 ALTA (H)" : currentAp === "Média" ? "⚠️ MÉDIA (M)" : "✅ BAIXA (L)"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#141414]/70 mt-1 block">
              NPR clássico: <strong>{currentRpn}</strong> (S={simS} · O={simO} · D={simD})
            </span>
          </div>
        </div>

        {/* Action Guidance Callout */}
        <div className={`mt-3 p-2.5 text-xs font-mono border ${
          currentAp === "Alta" ? "bg-red-100 text-red-900 border-red-400" :
          currentAp === "Média" ? "bg-amber-100 text-amber-900 border-amber-400" : "bg-blue-100 text-blue-900 border-blue-400"
        }`}>
          {currentAp === "Alta" && (
            <p>
              <strong>🚨 Prioridade Alta (Ação Mandatória):</strong> A equipe DEVE obrigatoriamente identificar ações de prevenção (reduzir Ocorrência via Poka-Yoke ou melhoria de processo) ou de detecção 100% à prova de erro. Justificativa formal exigida pela auditoria IATF 16949.
            </p>
          )}
          {currentAp === "Média" && (
            <p>
              <strong>⚠️ Prioridade Média (Ação Recomendada):</strong> A equipe deve revisar e propor melhorias nos controles de processo ou demonstrar que os controles vigentes são adequados com base no histórico de conformidade.
            </p>
          )}
          {currentAp === "Baixa" && (
            <p>
              <strong>✅ Prioridade Baixa (Risco Sob Controle):</strong> Nível de risco aceitável sob as práticas atuais da fábrica. Ações podem ser consideradas no plano de melhoria contínua Kaizen.
            </p>
          )}
        </div>
      </div>

      {/* Cluster View Filter Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#141414] shadow-[3px_3px_0px_#141414]">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-mono font-bold uppercase text-[#141414]">
            Modo de Visualização dos Clusters:
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedClusterFilter("all")}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#141414] transition-colors cursor-pointer ${
              selectedClusterFilter === "all"
                ? "bg-[#141414] text-white shadow-[2px_2px_0px_#3b82f6]"
                : "bg-white text-[#141414] hover:bg-slate-100"
            }`}
          >
            Todos os 4 Clusters (Layout 2x2 Anexo 1)
          </button>
          <button
            onClick={() => setSelectedClusterFilter("9-10")}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#141414] transition-colors cursor-pointer ${
              selectedClusterFilter === "9-10"
                ? "bg-red-600 text-white shadow-[2px_2px_0px_#141414]"
                : "bg-white text-[#141414] hover:bg-slate-100"
            }`}
          >
            Cluster 9-10
          </button>
          <button
            onClick={() => setSelectedClusterFilter("7-8")}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#141414] transition-colors cursor-pointer ${
              selectedClusterFilter === "7-8"
                ? "bg-orange-600 text-white shadow-[2px_2px_0px_#141414]"
                : "bg-white text-[#141414] hover:bg-slate-100"
            }`}
          >
            Cluster 7-8
          </button>
          <button
            onClick={() => setSelectedClusterFilter("5-6")}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#141414] transition-colors cursor-pointer ${
              selectedClusterFilter === "5-6"
                ? "bg-amber-400 text-[#141414] shadow-[2px_2px_0px_#141414]"
                : "bg-white text-[#141414] hover:bg-slate-100"
            }`}
          >
            Cluster 5-6
          </button>
          <button
            onClick={() => setSelectedClusterFilter("3-4")}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#141414] transition-colors cursor-pointer ${
              selectedClusterFilter === "3-4"
                ? "bg-blue-600 text-white shadow-[2px_2px_0px_#141414]"
                : "bg-white text-[#141414] hover:bg-slate-100"
            }`}
          >
            Cluster 3-4
          </button>
        </div>
      </div>

      {/* CLUSTERS GRID (Exact reproduction of Annex 1) */}
      <div className={`grid gap-6 ${
        selectedClusterFilter === "all" ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
      }`}>
        {(selectedClusterFilter === "all" || selectedClusterFilter === "9-10") &&
          renderClusterGrid("Severity Cluster 9-10", "9-10", 9)
        }

        {(selectedClusterFilter === "all" || selectedClusterFilter === "7-8") &&
          renderClusterGrid("Severity Cluster 7-8", "7-8", 7)
        }

        {(selectedClusterFilter === "all" || selectedClusterFilter === "5-6") &&
          renderClusterGrid("Severity Cluster 5-6", "5-6", 5)
        }

        {(selectedClusterFilter === "all" || selectedClusterFilter === "3-4") &&
          renderClusterGrid("Severity Cluster 3-4", "3-4", 3)
        }
      </div>

      {/* Detailed Normative Explanations & Reference Tables */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#141414]/20 pb-2">
          <Compass className="w-4 h-4 text-blue-600" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#141414]">
            Fundamentação Técnica do Sistema de Prioridade de Ação (PA) — AIAG & VDA 1ª Edição
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-red-50/70 border border-red-600 shadow-[2px_2px_0px_#141414] space-y-2">
            <span className="font-mono font-black text-red-900 uppercase block">
              1. A Severidade (S) é Soberana
            </span>
            <p className="text-red-950 leading-relaxed font-sans">
              Falhas com Severidade 9 ou 10 (risco de segurança veicular ou não atendimento a requisitos legais) recebem Prioridade de Ação Alta (H) mesmo quando a Ocorrência é baixa, a menos que haja Poka-Yoke comprovado (D=1) com Ocorrência mínima.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-600 shadow-[2px_2px_0px_#141414] space-y-2">
            <span className="font-mono font-black text-amber-900 uppercase block">
              2. Fim do Limite Arbitrário de NPR
            </span>
            <p className="text-amber-950 leading-relaxed font-sans">
              O antigo critério de limite fixo de NPR (ex: NPR &gt; 100) mascarava falhas graves com baixa ocorrência. A Prioridade de Ação (PA) avalia combinações lógicas tridimensionais, eliminando falsos positivos e falsos negativos.
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-600 shadow-[2px_2px_0px_#141414] space-y-2">
            <span className="font-mono font-black text-blue-900 uppercase block">
              3. Detecção por Maturidade Tecnológica
            </span>
            <p className="text-blue-950 leading-relaxed font-sans">
              A escala de Detecção é baseada na oportunidade: desde sensores automatizados na estação (In-Station Machine-based) até inspeções humanas a jusante (Downstream Human), refletindo a confiabilidade real do controle.
            </p>
          </div>
        </div>

        {onGoToPfmea && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onGoToPfmea}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] cursor-pointer"
            >
              <span>Aplicar Regras no PFMEA Master</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
