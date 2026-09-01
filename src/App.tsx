import React, { useState, useEffect } from "react";
import { 
  PfmeaRow, 
  FastResponseComplaint, 
  FeedbackLog 
} from "./types";
import { 
  INITIAL_PFMEA_MASTER, 
  INITIAL_COMPLAINTS, 
  INITIAL_LOGS, 
  calculateAp 
} from "./data/initialData";
import { 
  exportPfmeaToExcel, 
  exportComplaintsToExcel, 
  exportFeedbackLogsToExcel, 
  downloadSampleTemplate 
} from "./utils/excelHandler";

import { Navbar } from "./components/Navbar";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { FastResponseView } from "./components/FastResponseView";
import { PfmeaMasterView } from "./components/PfmeaMasterView";
import { ChangeLogView } from "./components/ChangeLogView";
import { PaTableView } from "./components/PaTableView";
import { SodTablesView } from "./components/SodTablesView";
import { UploadModal } from "./components/UploadModal";
import { NewComplaintModal } from "./components/NewComplaintModal";
import { SeverityMatrixModal } from "./components/SeverityMatrixModal";
import { ConfirmModal } from "./components/ConfirmModal";

import { 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Layers, 
  TrendingUp, 
  RefreshCw, 
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Info
} from "lucide-react";

// Helper to guarantee unique IDs for state elements
function deduplicateComplaints(list: FastResponseComplaint[]): FastResponseComplaint[] {
  const seen = new Set<string>();
  return list.map((c, idx) => {
    let id = c.id?.trim() || `REC-${new Date().getFullYear()}-${String(idx + 101).padStart(3, "0")}`;
    if (seen.has(id)) {
      id = `${id}-${idx + 1}`;
    }
    seen.add(id);
    return { ...c, id };
  });
}

function deduplicatePfmea(list: PfmeaRow[]): PfmeaRow[] {
  const seen = new Set<string>();
  return list.map((r, idx) => {
    let id = r.id?.trim() || `PFMEA-${String(idx + 1).padStart(3, "0")}`;
    if (seen.has(id)) {
      id = `${id}-${idx + 1}`;
    }
    seen.add(id);
    return { ...r, id };
  });
}

function deduplicateLogs(list: FeedbackLog[]): FeedbackLog[] {
  const seen = new Set<string>();
  return list.map((l, idx) => {
    let id = l.id?.trim() || `LOG-${Date.now()}-${idx}`;
    if (seen.has(id)) {
      id = `${id}-${idx + 1}`;
    }
    seen.add(id);
    return { ...l, id };
  });
}

export default function App() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<"feedback" | "fast-response" | "pfmea" | "audit" | "criteria" | "pa-table">("feedback");

  // Persistent States
  const [pfmeaList, setPfmeaList] = useState<PfmeaRow[]>(() => {
    const saved = localStorage.getItem("pfmea_feedback_master");
    const cleanedFlag = localStorage.getItem("pfmea_feedback_cleaned_v4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!cleanedFlag) {
            localStorage.setItem("pfmea_feedback_cleaned_v4", "true");
            return deduplicatePfmea(parsed.map(r => ({
              ...r,
              processStep: "Op. 10 - Estampagem",
              processStepFunction: r.processStepFunction ? r.processStepFunction.replace(/^Operação 10\b/i, "Op. 10") : "Op. 10 - Conformação e repuxo da peça estampada na geometria e embutimento especificados",
              preventiveAction: r.preventiveAction || "",
              detectionAction: r.detectionAction || "",
              responsiblePerson: r.responsiblePerson || "",
              targetDate: r.targetDate || "",
              actionTaken: r.actionTaken || "",
              completionDate: r.completionDate || "",
              revisedSeverity: r.revisedSeverity,
              revisedOccurrence: r.revisedOccurrence,
              revisedDetection: r.revisedDetection,
              revisedSpecialCharacteristic: r.revisedSpecialCharacteristic || "",
              revisedActionPriority: r.revisedActionPriority,
              observations: r.observations || "",
            })));
          }
          return deduplicatePfmea(parsed.map(r => ({
            ...r,
            processStep: r.processStep === "Operação 10 - Estampagem" || !r.processStep ? "Op. 10 - Estampagem" : r.processStep
          })));
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem("pfmea_feedback_cleaned_v4", "true");
    return deduplicatePfmea(INITIAL_PFMEA_MASTER);
  });

  const [complaints, setComplaints] = useState<FastResponseComplaint[]>(() => {
    const saved = localStorage.getItem("pfmea_feedback_complaints");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateComplaints(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return deduplicateComplaints(INITIAL_COMPLAINTS);
  });

  const [logs, setLogs] = useState<FeedbackLog[]>(() => {
    const saved = localStorage.getItem("pfmea_feedback_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateLogs(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return deduplicateLogs(INITIAL_LOGS);
  });

  // Selected complaint in feedback panel
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(
    complaints[0]?.id || ""
  );

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<FastResponseComplaint | null>(null);
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    detail?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem("pfmea_feedback_master", JSON.stringify(pfmeaList));
  }, [pfmeaList]);

  useEffect(() => {
    localStorage.setItem("pfmea_feedback_complaints", JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem("pfmea_feedback_logs", JSON.stringify(logs));
  }, [logs]);

  // Handle Feedback Validation & PFMEA Update
  const handleApplyFeedback = (
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
  ) => {
    const targetComp = complaints.find(c => c.id === complaintId);
    if (!targetComp) return;

    let affectedPfmeaId = pfmeaId;
    let oldS = 0;
    let oldO = 0;
    let oldD = 0;
    let oldRpn = 0;
    let stepName = targetComp.processStep;
    let failureModeName = targetComp.realFailureMode;

    const newRpn = validatedData.newS * validatedData.newO * validatedData.newD;
    const newAp = calculateAp(validatedData.newS, validatedData.newO, validatedData.newD);

    if (validatedData.isNewRow || !pfmeaId) {
      // Create new PFMEA Row
      const newId = `PFMEA-${String(pfmeaList.length + 1).padStart(3, "0")}`;
      affectedPfmeaId = newId;

      const createdRow: PfmeaRow = {
        id: newId,
        process: validatedData.newRowData?.process || "Processo Geral",
        processStep: validatedData.newRowData?.processStep || targetComp.processStep,
        workElements4M: validatedData.newRowData?.workElements4M || "Máquina / Mão de Obra / Método",
        processFunction: validatedData.newRowData?.processFunction || `Garantir requisitos do processo para ${targetComp.partName}`,
        processStepFunction: validatedData.newRowData?.processStepFunction || `Garantir conformidade da etapa ${targetComp.processStep}`,
        productCharacteristic: validatedData.newRowData?.productCharacteristic || `Especificação nominal ${targetComp.partName}`,
        workElementFunction: validatedData.newRowData?.workElementFunction || "Controle operacional do posto de trabalho",
        processCharacteristic: validatedData.newRowData?.processCharacteristic || "Parâmetros operacionais do processo",
        failureEffect: validatedData.newRowData?.failureEffect || targetComp.impactDescription,
        severity: validatedData.newS,
        failureMode: validatedData.newRowData?.failureMode || targetComp.realFailureMode,
        potentialCause: validatedData.newRowData?.potentialCause || targetComp.rootCause,
        currentPrevention: validatedData.prevention || "Instrução e padrão operacional",
        occurrence: validatedData.newO,
        currentDetection: validatedData.detection || "Inspeção de controle",
        detection: validatedData.newD,
        rpn: newRpn,
        actionPriority: newAp,
        specialCharacteristic: validatedData.newRowData?.specialCharacteristic || "Standard",
        classification: validatedData.newRowData?.classification || "Standard",
        preventiveAction: validatedData.actionPlan,
        detectionAction: validatedData.detection || "",
        responsiblePerson: validatedData.responsible,
        targetDate: validatedData.targetDate,
        actionTaken: "",
        completionDate: "",
        revisedSeverity: validatedData.newS,
        revisedOccurrence: 1,
        revisedDetection: 1,
        revisedSpecialCharacteristic: "Standard",
        revisedActionPriority: "Baixa",
        observations: `Retroalimentado via RNC Fast Response ${targetComp.id} (${targetComp.client}).`,
        recommendedAction: validatedData.actionPlan,
        responsible: validatedData.responsible,
        lastRevisionDate: new Date().toISOString().slice(0, 10),
        revisionVersion: 1,
        searchTags: [targetComp.partName, targetComp.realFailureMode, targetComp.client],
      };

      setPfmeaList(prev => [createdRow, ...prev]);
    } else {
      // Update existing PFMEA Row
      const existing = pfmeaList.find(r => r.id === pfmeaId);
      if (existing) {
        oldS = existing.severity;
        oldO = existing.occurrence;
        oldD = existing.detection;
        oldRpn = existing.rpn;
        stepName = existing.processStep;
        failureModeName = existing.failureMode;

        setPfmeaList(prev =>
          prev.map(r => {
            if (r.id === pfmeaId) {
              return {
                ...r,
                severity: validatedData.decision === "Aprovado" ? validatedData.newS : r.severity,
                occurrence: validatedData.decision === "Aprovado" ? validatedData.newO : r.occurrence,
                detection: validatedData.decision === "Aprovado" ? validatedData.newD : r.detection,
                rpn: validatedData.decision === "Aprovado" ? newRpn : r.rpn,
                actionPriority: validatedData.decision === "Aprovado" ? newAp : r.actionPriority,
                currentPrevention: validatedData.prevention || r.currentPrevention,
                currentDetection: validatedData.detection || r.currentDetection,
                recommendedAction: validatedData.actionPlan,
                responsible: validatedData.responsible,
                targetDate: validatedData.targetDate,
                lastRevisionDate: new Date().toISOString().slice(0, 10),
                revisionVersion: (r.revisionVersion || 1) + 1,
              };
            }
            return r;
          })
        );
      }
    }

    // Update Complaint Status
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status:
              validatedData.decision === "Aprovado"
                ? "Retroalimentado no PFMEA"
                : validatedData.decision === "Pendente"
                ? "Pendente de Análise"
                : "Arquivado / Isolado",
            associatedPfmeaId: affectedPfmeaId || undefined,
            feedbackDate: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );

    // Create Audit Log Entry
    const newLog: FeedbackLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      complaintId,
      client: targetComp.client,
      partNumber: targetComp.partNumber,
      pfmeaId: affectedPfmeaId || "Nova Linha",
      processStep: stepName,
      failureMode: failureModeName,
      oldS,
      newS: validatedData.newS,
      oldO,
      newO: validatedData.newO,
      oldD,
      newD: validatedData.newD,
      oldRpn,
      newRpn,
      decision: validatedData.decision,
      actionPlan: validatedData.actionPlan,
      responsible: validatedData.responsible,
      targetDate: validatedData.targetDate,
      justification: validatedData.justification,
      engineerName: validatedData.responsible,
    };

    setLogs(prev => [newLog, ...prev]);

    // Select next pending complaint if available
    const nextPending = complaints.find(
      c => c.id !== complaintId && c.status === "Pendente de Análise"
    );
    if (nextPending) {
      setSelectedComplaintId(nextPending.id);
    }
  };

  // Delete Complaint from Fast Response
  const handleDeleteComplaint = (complaintId: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    setConfirmModal({
      isOpen: true,
      title: "Excluir Reclamação / RNC",
      message: `Deseja realmente excluir a reclamação ${complaintId}?`,
      detail: complaint ? `${complaint.client} — ${complaint.realFailureMode} (Etapa: ${complaint.processStep})` : undefined,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        setComplaints(prev => {
          const next = prev.filter(c => c.id !== complaintId);
          if (selectedComplaintId === complaintId) {
            setSelectedComplaintId(next[0]?.id || "");
          }
          return next;
        });
      },
    });
  };

  // Delete Single PFMEA Row
  const handleDeletePfmeaRow = (rowId: string) => {
    const row = pfmeaList.find(r => r.id === rowId);
    setConfirmModal({
      isOpen: true,
      title: "Remover Linha do PFMEA Master",
      message: `Deseja realmente remover o item ${rowId} do PFMEA?`,
      detail: row ? `${row.processStep} — ${row.failureMode}` : undefined,
      confirmText: "Sim, Remover",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        setPfmeaList(prev => prev.filter(r => r.id !== rowId));
      },
    });
  };

  // Delete Multiple PFMEA Rows
  const handleDeleteMultiplePfmeaRows = (rowIds: string[]) => {
    if (rowIds.length === 0) return;
    const count = rowIds.length;
    const sampleNames = rowIds
      .slice(0, 3)
      .map(id => {
        const item = pfmeaList.find(r => r.id === id);
        return item ? `${item.id} (${item.processStep})` : id;
      })
      .join(", ");

    setConfirmModal({
      isOpen: true,
      title: "Excluir Múltiplas Linhas do PFMEA",
      message: `Deseja realmente excluir ${count} ${count === 1 ? "linha selecionada" : "linhas selecionadas"} do PFMEA Master?`,
      detail: `Itens: ${sampleNames}${count > 3 ? ` e mais ${count - 3} item(ns)...` : ""}`,
      confirmText: `Sim, Excluir ${count} ${count === 1 ? "Linha" : "Linhas"}`,
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        const toDelete = new Set(rowIds);
        setPfmeaList(prev => prev.filter(r => !toDelete.has(r.id)));
      },
    });
  };

  // Reset database to initial test state
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: "Restaurar Dados de Fábrica",
      message: "Deseja restaurar todos os dados de exemplo de fábrica?",
      detail: "Todas as alterações manuais, novas RNCs e registros de auditoria serão redefinidos para os valores padrão.",
      confirmText: "Restaurar Dados",
      cancelText: "Cancelar",
      variant: "warning",
      onConfirm: () => {
        setPfmeaList(deduplicatePfmea(INITIAL_PFMEA_MASTER));
        setComplaints(deduplicateComplaints(INITIAL_COMPLAINTS));
        setLogs(deduplicateLogs(INITIAL_LOGS));
        setSelectedComplaintId(INITIAL_COMPLAINTS[0]?.id || "");
        localStorage.removeItem("pfmea_feedback_master");
        localStorage.removeItem("pfmea_feedback_complaints");
        localStorage.removeItem("pfmea_feedback_logs");
      },
    });
  };

  // Calculations for KPIs
  const pendingCount = complaints.filter(c => c.status === "Pendente de Análise").length;
  const feedbackedCount = complaints.filter(c => c.status === "Retroalimentado no PFMEA").length;
  const closureRate = complaints.length > 0 ? Math.round((feedbackedCount / complaints.length) * 100) : 0;
  const highApCount = pfmeaList.filter(r => r.actionPriority === "Alta").length;

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] flex flex-col font-sans">
      {/* Top Industrial Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => {
          if (t === "criteria") {
            setIsCriteriaOpen(true);
          } else {
            setActiveTab(t);
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExportPfmea={() => exportPfmeaToExcel(pfmeaList)}
        onExportLogs={() => exportFeedbackLogsToExcel(logs)}
        onOpenNewComplaint={() => {
          setEditingComplaint(null);
          setIsNewComplaintOpen(true);
        }}
        onDownloadTemplate={downloadSampleTemplate}
        pendingCount={pendingCount}
        pfmeaCount={pfmeaList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* KPI High Density Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 border border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#141414]/60 uppercase tracking-widest block font-mono">
                Total Reclamações
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-2xl font-black font-mono text-[#141414]">{complaints.length}</span>
                <span className="text-[10px] font-mono text-[#141414]/50">registros</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="bg-white p-3.5 border border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#141414]/60 uppercase tracking-widest block font-mono">
                Pendentes Análise
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className={`text-2xl font-black font-mono ${pendingCount > 0 ? "text-amber-600" : "text-emerald-700"}`}>
                  {pendingCount}
                </span>
                <span className="text-[10px] font-mono text-[#141414]/50">itens</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="bg-white p-3.5 border border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#141414]/60 uppercase tracking-widest block font-mono">
                PFMEA AP: Alta (Crítico)
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className={`text-2xl font-black font-mono ${highApCount > 0 ? "text-red-600" : "text-emerald-700"}`}>
                  {highApCount}
                </span>
                <span className="text-[10px] font-mono text-[#141414]/50">linhas</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
          </div>

          <div className="bg-white p-3.5 border border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#141414]/60 uppercase tracking-widest block font-mono">
                Fechamento IATF
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-2xl font-black font-mono text-emerald-700">{closureRate}%</span>
                <span className="text-[10px] font-mono text-[#141414]/50">concluído</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === "feedback" && (
          <ComparisonPanel
            complaints={complaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            pfmeaList={pfmeaList}
            onDeleteComplaint={handleDeleteComplaint}
            onOpenEditComplaint={(comp) => {
              setEditingComplaint(comp);
              setIsNewComplaintOpen(true);
            }}
            onApplyFeedback={handleApplyFeedback}
            onOpenCriteriaGuide={() => setIsCriteriaOpen(true)}
          />
        )}

        {activeTab === "fast-response" && (
          <FastResponseView
            complaints={complaints}
            onSelectAndAnalyze={(id) => {
              setSelectedComplaintId(id);
              setActiveTab("feedback");
            }}
            onOpenNewComplaint={() => {
              setEditingComplaint(null);
              setIsNewComplaintOpen(true);
            }}
            onDeleteComplaint={handleDeleteComplaint}
            onExportComplaints={() => exportComplaintsToExcel(complaints)}
          />
        )}

        {activeTab === "pfmea" && (
          <PfmeaMasterView
            pfmeaList={pfmeaList}
            onUpdateRow={(updated) => {
              setPfmeaList(prev => prev.map(r => (r.id === updated.id ? updated : r)));
            }}
            onAddRow={(newRow) => {
              setPfmeaList(prev => [newRow, ...prev]);
            }}
            onDeleteRow={handleDeletePfmeaRow}
            onDeleteRows={handleDeleteMultiplePfmeaRows}
            onExportPfmea={() => exportPfmeaToExcel(pfmeaList)}
          />
        )}

        {activeTab === "audit" && (
          <ChangeLogView
            logs={logs}
            onExportLogs={() => exportFeedbackLogsToExcel(logs)}
          />
        )}

        {activeTab === "criteria" && (
          <SodTablesView
            onGoToPaTable={() => setActiveTab("pa-table")}
          />
        )}

        {activeTab === "pa-table" && (
          <PaTableView
            onGoToPfmea={() => setActiveTab("pfmea")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#141414] py-3.5 px-6 text-xs text-[#141414]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-bold">IATF 16949:2016</span>
            <span className="text-[#141414]/40">|</span>
            <span className="text-[#141414]/70">Sistema de Fechamento de Ciclo (Fast Response ➔ PFMEA AIAG-VDA)</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <button
              onClick={() => setIsCriteriaOpen(true)}
              className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
            >
              Manual AIAG-VDA S/O/D
            </button>
            <span className="text-[#141414]/30">•</span>
            <button
              onClick={handleResetData}
              className="text-[#141414]/50 hover:text-[#141414] underline cursor-pointer"
            >
              Restaurar Dados Originais
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportPfmea={(rows) => {
          setPfmeaList(deduplicatePfmea(rows));
          setActiveTab("pfmea");
        }}
        onImportComplaints={(newComplaints) => {
          setComplaints(prev => deduplicateComplaints([...newComplaints, ...prev]));
          if (newComplaints[0]) {
            setSelectedComplaintId(newComplaints[0].id);
          }
          setActiveTab("fast-response");
        }}
      />

      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        initialComplaint={editingComplaint}
        onClose={() => {
          setIsNewComplaintOpen(false);
          setEditingComplaint(null);
        }}
        onSaveComplaint={(savedComp) => {
          setComplaints(prev => {
            const exists = prev.some(c => c.id === savedComp.id);
            if (exists) {
              return prev.map(c => (c.id === savedComp.id ? savedComp : c));
            }
            return deduplicateComplaints([savedComp, ...prev]);
          });
          setSelectedComplaintId(savedComp.id);
          setIsNewComplaintOpen(false);
          setEditingComplaint(null);
          setActiveTab("feedback");
        }}
      />

      <SeverityMatrixModal
        isOpen={isCriteriaOpen}
        onClose={() => setIsCriteriaOpen(false)}
        onOpenPaTable={() => setActiveTab("pa-table")}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        detail={confirmModal.detail}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
