import React, { useState, useEffect } from "react";
import { 
  FastResponseComplaint, 
  PfmeaRow, 
  FeedbackSuggestion,
  FeedbackLog
} from "../types";
import { 
  findBestPfmeaMatch, 
  generateFeedbackSuggestion 
} from "../utils/fuzzyMatch";
import { calculateAp } from "../data/initialData";
import confetti from "canvas-confetti";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  User, 
  Layers, 
  Search, 
  Check, 
  X, 
  HelpCircle,
  RefreshCw,
  PlusCircle,
  FileCheck,
  ChevronRight,
  Zap,
  Info,
  Trash2,
  Edit3
} from "lucide-react";
import { ComplaintDossierSection } from "./ComplaintDossierSection";

interface ComparisonPanelProps {
  complaints: FastResponseComplaint[];
  selectedComplaintId: string;
  onSelectComplaint: (id: string) => void;
  pfmeaList: PfmeaRow[];
  onDeleteComplaint?: (id: string) => void;
  onOpenEditComplaint?: (complaint: FastResponseComplaint) => void;
  onApplyFeedback: (
    complaintId: string,
    pfmeaId: string | null,
    validatedData: {
      newS: number;
      newO: number;
      newD: number;
      actionPlan: string;
      prevention: string;
      detection: string;
      justification: string;
      responsible: string;
      targetDate: string;
      decision: "Aprovado" | "Pendente" | "Isolado / Não Aplicável";
      isNewRow?: boolean;
      newRowData?: Partial<PfmeaRow>;
    }
  ) => void;
  onOpenCriteriaGuide: () => void;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  pfmeaList,
  onDeleteComplaint,
  onOpenEditComplaint,
  onApplyFeedback,
  onOpenCriteriaGuide,
}) => {
  const currentComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  // Matched PFMEA Row
  const [selectedPfmeaId, setSelectedPfmeaId] = useState<string | null>(null);
  const [manualMatchOverride, setManualMatchOverride] = useState<boolean>(false);

  // Editable suggestion states
  const [editS, setEditS] = useState<number>(7);
  const [editO, setEditO] = useState<number>(5);
  const [editD, setEditD] = useState<number>(7);
  
  const [actionPlan, setActionPlan] = useState<string>("");
  const [justification, setJustification] = useState<string>("");
  const [preventionText, setPreventionText] = useState<string>("");
  const [detectionText, setDetectionText] = useState<string>("");
  const [responsible, setResponsible] = useState<string>("Eng. Qualidade Assegurada");
  const [targetDate, setTargetDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  // AI Analysis state
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<any | null>(null);

  // Calculate matching & baseline suggestions
  const matchResult = currentComplaint
    ? findBestPfmeaMatch(currentComplaint, pfmeaList)
    : { bestRow: null, score: 0, candidateList: [] };

  const activePfmeaRow = manualMatchOverride
    ? pfmeaList.find(r => r.id === selectedPfmeaId) || null
    : matchResult.bestRow;

  const baselineSuggestion = currentComplaint
    ? generateFeedbackSuggestion(currentComplaint, activePfmeaRow, complaints)
    : null;

  // Sync suggestion values when complaint or matched row changes
  useEffect(() => {
    if (baselineSuggestion) {
      setEditS(baselineSuggestion.suggestedS);
      setEditO(baselineSuggestion.suggestedO);
      setEditD(baselineSuggestion.suggestedD);
      setActionPlan(baselineSuggestion.suggestedActionPlan || "");
      setPreventionText(baselineSuggestion.suggestedPrevention || "");
      setDetectionText(baselineSuggestion.suggestedDetection || "");
      setJustification(
        `Retroalimentação referente à reclamação ${currentComplaint?.id} (${currentComplaint?.client}). ${baselineSuggestion.matchReason}`
      );
      setAiInsights(null);
      setAiError(null);
    }
  }, [currentComplaint?.id, activePfmeaRow?.id]);

  if (!currentComplaint) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
        <p>Nenhuma reclamação carregada no Fast Response.</p>
      </div>
    );
  }

  // Calculated NPR & AP for suggested values
  const currentRpn = activePfmeaRow ? activePfmeaRow.severity * activePfmeaRow.occurrence * activePfmeaRow.detection : 0;
  const currentAp = activePfmeaRow ? activePfmeaRow.actionPriority : "Baixa";
  
  const suggestedRpn = editS * editO * editD;
  const suggestedAp = calculateAp(editS, editO, editD);
  const rpnDelta = suggestedRpn - currentRpn;

  // Run Server-Side Gemini AI Analysis
  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/ai/analyze-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint: currentComplaint,
          pfmeaCatalog: pfmeaList.map(r => ({
            id: r.id,
            processStep: r.processStep,
            failureMode: r.failureMode,
            potentialCause: r.potentialCause,
            severity: r.severity,
            occurrence: r.occurrence,
            detection: r.detection,
          })),
          historyOccurrences: complaints.filter(c => c.processStep === currentComplaint.processStep).length,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const aiData = json.data;
        setAiInsights(aiData);

        if (aiData.suggestedValues) {
          if (aiData.suggestedValues.severity) setEditS(aiData.suggestedValues.severity);
          if (aiData.suggestedValues.occurrence) setEditO(aiData.suggestedValues.occurrence);
          if (aiData.suggestedValues.detection) setEditD(aiData.suggestedValues.detection);
        }

        if (aiData.recommendedControls) {
          if (aiData.recommendedControls.actionPlanText) setActionPlan(aiData.recommendedControls.actionPlanText);
          if (aiData.recommendedControls.prevention) setPreventionText(aiData.recommendedControls.prevention);
          if (aiData.recommendedControls.detection) setDetectionText(aiData.recommendedControls.detection);
        }

        if (aiData.technicalAnalysis) {
          setJustification(`[Análise Técnica IA]: ${aiData.technicalAnalysis}`);
        }

        // If AI matched a specific PFMEA ID
        if (aiData.matchedPfmeaId && pfmeaList.some(r => r.id === aiData.matchedPfmeaId)) {
          setSelectedPfmeaId(aiData.matchedPfmeaId);
          setManualMatchOverride(true);
        }
      } else {
        setAiError(json.error || "Não foi possível obter resposta da IA.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError("Falha de conexão com a API de IA do servidor.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleValidation = (decision: "Aprovado" | "Pendente" | "Isolado / Não Aplicável") => {
    if (decision === "Aprovado") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // fallback if canvas not available
      }
    }

    const isNew = !activePfmeaRow;

    onApplyFeedback(currentComplaint.id, activePfmeaRow ? activePfmeaRow.id : null, {
      newS: editS,
      newO: editO,
      newD: editD,
      actionPlan,
      prevention: preventionText,
      detection: detectionText,
      justification,
      responsible,
      targetDate,
      decision,
      isNewRow: isNew,
      newRowData: isNew
        ? {
            processStep: currentComplaint.processStep,
            processFunction: `Garantir requisitos da etapa ${currentComplaint.processStep}`,
            failureMode: currentComplaint.realFailureMode,
            failureEffect: currentComplaint.impactDescription,
            potentialCause: currentComplaint.rootCause,
            currentPrevention: preventionText,
            currentDetection: detectionText,
            searchTags: [currentComplaint.partName, currentComplaint.realFailureMode, currentComplaint.processStep],
          }
        : undefined,
    });
  };

  // Helper colors for AP
  const getApBadge = (ap: "Baixa" | "Média" | "Alta") => {
    switch (ap) {
      case "Alta":
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white border border-[#141414] shadow-[1px_1px_0px_#141414] inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            AP: Alta (Crítico)
          </span>
        );
      case "Média":
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-[#141414] border border-[#141414] shadow-[1px_1px_0px_#141414]">
            AP: Média (Revisar)
          </span>
        );
      case "Baixa":
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white border border-[#141414] shadow-[1px_1px_0px_#141414]">
            AP: Baixa (Controlado)
          </span>
        );
    }
  };

  const getRpnBadge = (rpn: number) => {
    if (rpn >= 200) {
      return <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-red-600 text-white border border-[#141414]">NPR {rpn} - Crítico</span>;
    }
    if (rpn >= 100) {
      return <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-amber-400 text-[#141414] border border-[#141414]">NPR {rpn} - Alto</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-emerald-600 text-white border border-[#141414]">NPR {rpn} - Controlado</span>;
  };

  if (!currentComplaint) {
    return (
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#141414] mb-2 font-mono uppercase">
          Nenhuma Reclamação / RNC Cadastrada
        </h3>
        <p className="text-xs text-[#141414]/70 max-w-md mx-auto">
          Todas as reclamações foram concluídas ou excluídas. Cadastre uma nova reclamação no Fast Response ou importe uma planilha para iniciar a análise de retroalimentação no PFMEA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Complaint Selector Strip */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#141414]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-amber-500 border border-[#141414] animate-pulse"></span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#141414]">
              1. Seleção de RNC / Reclamação (Fast Response)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#141414]/60">
            {complaints.length} reclamações ativas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {complaints.map((c, idx) => {
            const isSelected = c.id === currentComplaint.id;
            const isFeedbacked = c.status === "Retroalimentado no PFMEA";
            return (
              <button
                key={`comp-card-${c.id}-${idx}`}
                onClick={() => {
                  onSelectComplaint(c.id);
                  setManualMatchOverride(false);
                }}
                className={`p-2.5 text-left border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#141414] bg-[#E4E3E0] shadow-[3px_3px_0px_#3b82f6] -translate-y-0.5"
                    : "border-[#141414] hover:bg-[#F8F9FA] bg-white shadow-[2px_2px_0px_#141414]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#141414]">{c.id}</span>
                  {isFeedbacked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <span className="w-2 h-2 bg-amber-500 border border-[#141414]"></span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-[#141414] truncate mt-1">
                  {c.client}
                </div>
                <div className="text-[10px] font-mono text-[#141414]/60 truncate">
                  {c.realFailureMode}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Full Complaint Dossier (All Fields from Creation / 8D PDCA) */}
      <ComplaintDossierSection
        complaint={currentComplaint}
        onEdit={onOpenEditComplaint ? () => onOpenEditComplaint(currentComplaint) : undefined}
        onDelete={onDeleteComplaint ? () => onDeleteComplaint(currentComplaint.id) : undefined}
      />

      {/* 3. Matching Status & Match Override Strip */}
      <div className="bg-[#141414] text-[#E4E3E0] border border-[#141414] shadow-[4px_4px_0px_#141414] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 flex items-center justify-center font-mono font-black text-sm border ${
            activePfmeaRow ? "bg-emerald-950 text-emerald-400 border-emerald-600" : "bg-amber-950 text-amber-400 border-amber-600"
          }`}>
            {activePfmeaRow ? `${matchResult.score}%` : "0%"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#E4E3E0]">
                {activePfmeaRow
                  ? `Catálogo PFMEA: ${activePfmeaRow.id} — ${activePfmeaRow.processStep}`
                  : "⚠️ Modo de Falha Não Encontrado no Catálogo Atual"}
              </span>
              {activePfmeaRow && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                  {baselineSuggestion?.matchConfidence}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[#E4E3E0]/70 mt-0.5">
              {baselineSuggestion?.matchReason}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Manual Match Selector */}
          <div className="flex items-center space-x-2 bg-[#222] px-2.5 py-1.5 border border-[#333]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E4E3E0]/50 whitespace-nowrap">Vincular a:</span>
            <select
              value={activePfmeaRow?.id || ""}
              onChange={(e) => {
                if (e.target.value === "new") {
                  setSelectedPfmeaId(null);
                  setManualMatchOverride(true);
                } else {
                  setSelectedPfmeaId(e.target.value);
                  setManualMatchOverride(true);
                }
              }}
              className="bg-[#141414] text-[#E4E3E0] text-xs font-mono px-2 py-1 border border-[#444] focus:outline-none"
            >
              <option value="new">+ Criar Nova Linha no PFMEA</option>
              {pfmeaList.map((r, idx) => (
                <option key={`pfmea-opt-${r.id}-${idx}`} value={r.id}>
                  {r.id} - {r.processStep} ({r.failureMode.slice(0, 24)}...)
                </option>
              ))}
            </select>
          </div>

          {/* AI Gemini Analysis Trigger */}
          <button
            onClick={handleRunAiAnalysis}
            disabled={isAiLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider border border-blue-400 shadow-[2px_2px_0px_#141414] transition-all cursor-pointer disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processando IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Análise Inteligente IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-3 bg-amber-100 border border-[#141414] shadow-[2px_2px_0px_#141414] text-[#141414] text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>{aiError} Utilizando motor local de regras IATF 16949.</span>
          </div>
          <button onClick={() => setAiError(null)} className="text-[#141414] hover:text-red-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. THE HEART OF THE APP: SIDE-BY-SIDE HIGH DENSITY COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN: Current PFMEA Master */}
        <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden flex flex-col">
          <div className="bg-[#141414] text-[#E4E3E0] px-4 py-3 flex items-center justify-between border-b border-[#141414]">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#E4E3E0]">
                PFMEA Atual (Registro Master)
              </h3>
            </div>
            {activePfmeaRow && (
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                {activePfmeaRow.id} (v{activePfmeaRow.revisionVersion || 1})
              </span>
            )}
          </div>

          {activePfmeaRow ? (
            <div className="p-4 space-y-3.5 flex-1">
              <div>
                <label className="text-[10px] font-bold font-mono text-[#141414]/60 uppercase tracking-widest block mb-1">
                  Etapa do Processo
                </label>
                <div className="text-xs font-mono font-bold text-[#141414] bg-[#F8F9FA] p-2 border border-[#141414]">
                  {activePfmeaRow.processStep}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono text-[#141414]/60 uppercase tracking-widest block mb-1">
                  Modo de Falha & Efeito
                </label>
                <div className="bg-[#F8F9FA] p-2 border border-[#141414] text-xs space-y-1">
                  <div className="font-bold text-[#141414]">
                    Falha: {activePfmeaRow.failureMode}
                  </div>
                  <div className="text-[#141414]/70">
                    Efeito: {activePfmeaRow.failureEffect}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono text-[#141414]/60 uppercase tracking-widest block mb-1">
                  Causa Potencial Atual
                </label>
                <div className="text-xs text-[#141414] bg-[#F8F9FA] p-2 border border-[#141414]">
                  {activePfmeaRow.potentialCause}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono text-[#141414]/60 uppercase tracking-widest block mb-1">
                  Controles Atuais (Prevenção & Detecção)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F8F9FA] p-2 border border-[#141414]">
                    <span className="font-bold font-mono text-[#141414]/60 block text-[9px] uppercase">Prevenção:</span>
                    <span className="text-[#141414] text-[11px]">{activePfmeaRow.currentPrevention}</span>
                  </div>
                  <div className="bg-[#F8F9FA] p-2 border border-[#141414]">
                    <span className="font-bold font-mono text-[#141414]/60 block text-[9px] uppercase">Detecção:</span>
                    <span className="text-[#141414] text-[11px]">{activePfmeaRow.currentDetection}</span>
                  </div>
                </div>
              </div>

              {/* S / O / D Metric Grid */}
              <div className="pt-2 border-t border-[#141414]">
                <div className="grid grid-cols-3 gap-2 text-center mb-2">
                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Severidade (S)</span>
                    <span className="text-2xl font-black font-mono text-[#141414]">{activePfmeaRow.severity}</span>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Ocorrência (O)</span>
                    <span className="text-2xl font-black font-mono text-[#141414]">{activePfmeaRow.occurrence}</span>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Detecção (D)</span>
                    <span className="text-2xl font-black font-mono text-[#141414]">{activePfmeaRow.detection}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#141414] text-[#E4E3E0]">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase text-[#E4E3E0]/70">NPR Atual:</span>
                    <span className="text-xl font-black font-mono text-[#E4E3E0]">{currentRpn}</span>
                  </div>
                  <div>
                    {getApBadge(currentAp)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#141414]/60 space-y-2 flex-1 flex flex-col justify-center items-center">
              <ShieldAlert className="w-10 h-10 text-[#141414]/40" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#141414]">
                Modo de falha novo não catalogado
              </p>
              <p className="text-xs text-[#141414]/60 max-w-xs">
                A validação desta ocorrência criará automaticamente um novo registro no PFMEA Master.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: App Suggestion (Intelligent Feedback) */}
        <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#3b82f6] overflow-hidden flex flex-col">
          <div className="bg-[#141414] text-[#E4E3E0] px-4 py-3 flex items-center justify-between border-b border-[#141414]">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#E4E3E0]">
                Sugestão de Retroalimentação (Fast Response)
              </h3>
            </div>
            <button
              onClick={onOpenCriteriaGuide}
              className="text-[10px] font-mono text-blue-400 hover:text-blue-300 uppercase underline flex items-center space-x-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Critérios AIAG-VDA</span>
            </button>
          </div>

          <div className="p-4 space-y-3.5 flex-1 bg-[#F8F9FA]">
            {/* Interactive Sliders for S / O / D */}
            <div className="grid grid-cols-3 gap-2">
              {/* Severity Slider */}
              <div className="bg-white p-2.5 border border-[#141414] shadow-[2px_2px_0px_#141414]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase">Sugerido S</span>
                  <span className={`text-lg font-black font-mono ${editS >= 8 ? "text-red-600" : "text-blue-700"}`}>
                    {editS}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={editS}
                  onChange={(e) => setEditS(Number(e.target.value))}
                  className="w-full h-1 bg-[#E4E3E0] rounded-none appearance-none cursor-pointer accent-[#141414]"
                />
                <p className="text-[9px] font-mono text-[#141414]/60 mt-1 leading-tight line-clamp-2" title={baselineSuggestion?.sRationale}>
                  {baselineSuggestion?.sRationale || "Impacto no cliente."}
                </p>
              </div>

              {/* Occurrence Slider */}
              <div className="bg-white p-2.5 border border-[#141414] shadow-[2px_2px_0px_#141414]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase">Sugerido O</span>
                  <span className={`text-lg font-black font-mono ${editO >= 6 ? "text-amber-600" : "text-blue-700"}`}>
                    {editO}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={editO}
                  onChange={(e) => setEditO(Number(e.target.value))}
                  className="w-full h-1 bg-[#E4E3E0] rounded-none appearance-none cursor-pointer accent-amber-600"
                />
                <p className="text-[9px] font-mono text-[#141414]/60 mt-1 leading-tight line-clamp-2" title={baselineSuggestion?.oRationale}>
                  {baselineSuggestion?.oRationale || "Reincidência RNC."}
                </p>
              </div>

              {/* Detection Slider */}
              <div className="bg-white p-2.5 border border-[#141414] shadow-[2px_2px_0px_#141414]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase">Sugerido D</span>
                  <span className={`text-lg font-black font-mono ${editD >= 7 ? "text-purple-600" : "text-blue-700"}`}>
                    {editD}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={editD}
                  onChange={(e) => setEditD(Number(e.target.value))}
                  className="w-full h-1 bg-[#E4E3E0] rounded-none appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[9px] font-mono text-[#141414]/60 mt-1 leading-tight line-clamp-2" title={baselineSuggestion?.dRationale}>
                  {baselineSuggestion?.dRationale || "Barreira de detecção."}
                </p>
              </div>
            </div>

            {/* NPR Result Banner */}
            <div className="p-3.5 bg-[#141414] text-[#E4E3E0] border border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#E4E3E0]/60 uppercase tracking-widest block">
                  Novo NPR Calculado (S × O × D)
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-white">{suggestedRpn}</span>
                  {activePfmeaRow && (
                    <span className={`text-xs font-mono font-bold ${rpnDelta > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {rpnDelta > 0 ? `+${rpnDelta} (Risco Elevado)` : rpnDelta === 0 ? "Mantido" : `${rpnDelta} (Mitigado)`}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono font-bold text-[#E4E3E0]/60 uppercase tracking-widest block mb-1">
                  Prioridade de Ação (AP)
                </span>
                {getApBadge(suggestedAp)}
              </div>
            </div>

            {/* Recommended Preventive & Detective Controls */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold font-mono text-[#141414] block mb-1 uppercase tracking-wider">
                  Controle de Prevenção Recomendado
                </label>
                <input
                  type="text"
                  value={preventionText}
                  onChange={(e) => setPreventionText(e.target.value)}
                  placeholder="Ex: Poka-yoke de torque eletrônico..."
                  className="w-full text-xs p-2 bg-white border border-[#141414] font-medium outline-none focus:bg-[#FFFDF5]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono text-[#141414] block mb-1 uppercase tracking-wider">
                  Controle de Detecção Recomendado (Anti-Escape)
                </label>
                <input
                  type="text"
                  value={detectionText}
                  onChange={(e) => setDetectionText(e.target.value)}
                  placeholder="Ex: Sensor óptico de presença 100%..."
                  className="w-full text-xs p-2 bg-white border border-[#141414] font-medium outline-none focus:bg-[#FFFDF5]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ACTION PLAN, AUDIT JUSTIFICATION & CLOSING BUTTONS */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] p-4 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#141414] pb-2.5">
          <FileCheck className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-[#141414]">
            3. Validação de Fechamento & Registro de Ações (IATF 16949)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#141414] block mb-1">
              Plano de Ação Recomendado (Coluna de Ações do PFMEA)
            </label>
            <textarea
              rows={3}
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="Descreva a ação corretiva/preventiva que será sincronizada no PFMEA..."
              className="w-full text-xs p-2 bg-[#F8F9FA] border border-[#141414] font-sans outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#141414] block mb-1">
              Justificativa Técnica (Trilha de Auditoria / Lição Aprendida)
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Justifique o ajuste dos índices S/O/D com base na evidência do campo..."
              className="w-full text-xs p-2 bg-[#F8F9FA] border border-[#141414] font-sans outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#141414]/70 block mb-1">
              Engenheiro Validador
            </label>
            <div className="flex items-center space-x-1.5 bg-[#F8F9FA] p-2 border border-[#141414]">
              <User className="w-3.5 h-3.5 text-[#141414]/50" />
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none text-[#141414] font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#141414]/70 block mb-1">
              Prazo para Implementação
            </label>
            <div className="flex items-center space-x-1.5 bg-[#F8F9FA] p-2 border border-[#141414]">
              <Clock className="w-3.5 h-3.5 text-[#141414]/50" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none text-[#141414] font-mono"
              />
            </div>
          </div>

          <div className="flex items-end">
            <div className="text-[10px] font-mono text-[#141414]/70 bg-[#F8F9FA] p-2 border border-[#141414] w-full flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Conformidade com os requisitos IATF 16949 (Cláusula 10.2.3).</span>
            </div>
          </div>
        </div>

        {/* DECISION ACTION BUTTONS */}
        <div className="pt-3 border-t border-[#141414] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleValidation("Isolado / Não Aplicável")}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-red-50 text-[#141414] hover:text-red-700 border border-[#141414] text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Ignorar (Isolado)</span>
            </button>

            <button
              onClick={() => handleValidation("Pendente")}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-[#141414] border border-[#141414] text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Manter Pendente (8D)</span>
            </button>
          </div>

          <button
            onClick={() => handleValidation("Aprovado")}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[4px_4px_0px_#141414] transition-all transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Validar & Atualizar PFMEA Master</span>
          </button>
        </div>
      </div>
    </div>
  );
};
