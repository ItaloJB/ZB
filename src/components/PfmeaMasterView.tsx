import React, { useState, useRef, useEffect } from "react";
import { PfmeaRow } from "../types";
import { calculateAp } from "../data/initialData";
import { 
  Search, 
  Layers, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Info,
  Maximize2,
  CheckSquare,
  Square
} from "lucide-react";

interface PfmeaMasterViewProps {
  pfmeaList: PfmeaRow[];
  onUpdateRow: (row: PfmeaRow) => void;
  onAddRow: (row: PfmeaRow) => void;
  onDeleteRow: (id: string) => void;
  onDeleteRows?: (ids: string[]) => void;
  onExportPfmea: () => void;
}

export const PfmeaMasterView: React.FC<PfmeaMasterViewProps> = ({
  pfmeaList,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  onDeleteRows,
  onExportPfmea,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProcess, setFilterProcess] = useState("all");
  const [filterStep, setFilterStep] = useState("all");
  const [filterAp, setFilterAp] = useState("all");
  const [filterSpecial, setFilterSpecial] = useState("all");
  
  // Selection state for batch actions
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // Quick in-line editing
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<PfmeaRow>>({});

  // Full detailed modal view/edit
  const [detailModalRow, setDetailModalRow] = useState<PfmeaRow | null>(null);
  const [isDetailModalEditing, setIsDetailModalEditing] = useState<boolean>(false);
  const [modalFormData, setModalFormData] = useState<Partial<PfmeaRow>>({});

  // Distinct processes and steps for filters
  const processes = Array.from(new Set(pfmeaList.map(r => r.process || "Processo Geral")));
  const steps = Array.from(new Set(pfmeaList.map(r => r.processStep)));

  // KPI Metrics
  const isSpecialChar = (c?: string) => {
    if (!c) return false;
    const clean = c.trim().toUpperCase();
    return clean === "*" || clean === "Y" || clean === "D" || clean === "R" || clean === "S" ||
      clean.includes("CRÍTICO") || clean.includes("CRITICO") || clean.includes("IMPORTANTE") ||
      clean.includes("SEGURANÇA") || clean.includes("SEGURANCA") || clean.includes("REGULAMENTAR") ||
      clean.includes("SIGNIFICATIVA") || clean === "SC" || clean === "CC";
  };

  const totalRows = pfmeaList.length;
  const highApCount = pfmeaList.filter(r => r.actionPriority === "Alta").length;
  const medApCount = pfmeaList.filter(r => r.actionPriority === "Média").length;
  const lowApCount = pfmeaList.filter(r => r.actionPriority === "Baixa").length;
  const specialCount = pfmeaList.filter(r => isSpecialChar(r.specialCharacteristic) || isSpecialChar(r.classification)).length;

  const filtered = pfmeaList.filter(row => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      row.id.toLowerCase().includes(term) ||
      (row.process && row.process.toLowerCase().includes(term)) ||
      row.processStep.toLowerCase().includes(term) ||
      (row.workElements4M && row.workElements4M.toLowerCase().includes(term)) ||
      (row.failureMode && row.failureMode.toLowerCase().includes(term)) ||
      (row.failureEffect && row.failureEffect.toLowerCase().includes(term)) ||
      (row.potentialCause && row.potentialCause.toLowerCase().includes(term)) ||
      (row.currentPrevention && row.currentPrevention.toLowerCase().includes(term)) ||
      (row.currentDetection && row.currentDetection.toLowerCase().includes(term)) ||
      (row.preventiveAction && row.preventiveAction.toLowerCase().includes(term)) ||
      (row.responsiblePerson && row.responsiblePerson.toLowerCase().includes(term)) ||
      (row.specialCharacteristic && row.specialCharacteristic.toLowerCase().includes(term)) ||
      (row.searchTags || []).some(t => t.toLowerCase().includes(term));

    const matchesProcess = filterProcess === "all" || (row.process || "Processo Geral") === filterProcess;
    const matchesStep = filterStep === "all" || row.processStep === filterStep;
    const matchesAp = filterAp === "all" || row.actionPriority === filterAp;

    const rowChar = (row.specialCharacteristic || row.classification || "").trim();
    let matchesSpecial = true;
    if (filterSpecial === "all") {
      matchesSpecial = true;
    } else if (filterSpecial === "with_special") {
      matchesSpecial = isSpecialChar(rowChar);
    } else if (filterSpecial === "N/A") {
      matchesSpecial = !rowChar || rowChar === "N/A" || rowChar === "Standard" || rowChar === "-";
    } else {
      matchesSpecial = rowChar === filterSpecial || rowChar.startsWith(filterSpecial);
    }

    return matchesSearch && matchesProcess && matchesStep && matchesAp && matchesSpecial;
  });

  // Checkbox selection calculations
  const isAllVisibleSelected = filtered.length > 0 && filtered.every(r => selectedRowIds.includes(r.id));
  const isSomeVisibleSelected = filtered.some(r => selectedRowIds.includes(r.id)) && !isAllVisibleSelected;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeVisibleSelected;
    }
  }, [isSomeVisibleSelected]);

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      // Unselect all visible
      const visibleSet = new Set(filtered.map(r => r.id));
      setSelectedRowIds(prev => prev.filter(id => !visibleSet.has(id)));
    } else {
      // Select all visible
      const visibleIds = filtered.map(r => r.id);
      setSelectedRowIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedRowIds([]);
  };

  const handleDeleteSelected = () => {
    if (selectedRowIds.length === 0) return;
    if (onDeleteRows) {
      onDeleteRows(selectedRowIds);
    } else {
      // Fallback: delete one by one
      selectedRowIds.forEach(id => onDeleteRow(id));
    }
    setSelectedRowIds([]);
  };

  const handleStartEdit = (row: PfmeaRow) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row });
  };

  const handleSaveInlineEdit = () => {
    if (editingRowId && editFormData) {
      const s = Number(editFormData.severity) || 5;
      const o = Number(editFormData.occurrence) || 2;
      const d = Number(editFormData.detection) || 3;
      const ap = calculateAp(s, o, d);

      const revS = editFormData.revisedSeverity ? Number(editFormData.revisedSeverity) : undefined;
      const revO = editFormData.revisedOccurrence ? Number(editFormData.revisedOccurrence) : undefined;
      const revD = editFormData.revisedDetection ? Number(editFormData.revisedDetection) : undefined;
      const revAp = revS && revO && revD ? calculateAp(revS, revO, revD) : (editFormData.revisedActionPriority || undefined);

      onUpdateRow({
        ...(editFormData as PfmeaRow),
        severity: s,
        occurrence: o,
        detection: d,
        rpn: s * o * d,
        actionPriority: ap,
        revisedSeverity: revS,
        revisedOccurrence: revO,
        revisedDetection: revD,
        revisedActionPriority: revAp,
        lastRevisionDate: new Date().toISOString().slice(0, 10),
        revisionVersion: ((editFormData.revisionVersion || 1) + 1),
      });
      setEditingRowId(null);
      setEditFormData({});
    }
  };

  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleOpenDetailModal = (row: PfmeaRow, startEditing = false) => {
    setDetailModalRow(row);
    setModalFormData({ ...row });
    setIsDetailModalEditing(startEditing);
  };

  const handleSaveDetailModal = () => {
    if (detailModalRow && modalFormData) {
      const s = Number(modalFormData.severity) || 5;
      const o = Number(modalFormData.occurrence) || 2;
      const d = Number(modalFormData.detection) || 3;
      const ap = calculateAp(s, o, d);

      const revS = modalFormData.revisedSeverity ? Number(modalFormData.revisedSeverity) : undefined;
      const revO = modalFormData.revisedOccurrence ? Number(modalFormData.revisedOccurrence) : undefined;
      const revD = modalFormData.revisedDetection ? Number(modalFormData.revisedDetection) : undefined;
      const revAp = revS && revO && revD ? calculateAp(revS, revO, revD) : (modalFormData.revisedActionPriority || undefined);

      const updated: PfmeaRow = {
        ...(modalFormData as PfmeaRow),
        id: detailModalRow.id,
        severity: s,
        occurrence: o,
        detection: d,
        rpn: s * o * d,
        actionPriority: ap,
        revisedSeverity: revS,
        revisedOccurrence: revO,
        revisedDetection: revD,
        revisedActionPriority: revAp,
        lastRevisionDate: new Date().toISOString().slice(0, 10),
        revisionVersion: ((modalFormData.revisionVersion || 1) + 1),
      };

      onUpdateRow(updated);
      setDetailModalRow(updated);
      setIsDetailModalEditing(false);
    }
  };

  const handleCreateNewRow = () => {
    const nextId = `PFMEA-${String(pfmeaList.length + 1).padStart(3, "0")}`;
    const s = 7;
    const o = 2;
    const d = 3;
    const newRow: PfmeaRow = {
      id: nextId,
      process: "Linha de Processo Principal",
      processStep: "Nova Operação / Etapa",
      workElements4M: "Máquina: Prensa / Mão de Obra: Operador / Material: Componente",
      processFunction: "Garantir integridade e especificações do produto final",
      processStepFunction: "Executar montagem / conformação conforme desenho técnico",
      productCharacteristic: "Dimensão nominal e tolerância conforme especificado",
      workElementFunction: "Aplicar força/parâmetro controlado durante o ciclo",
      processCharacteristic: "Parâmetros controlados de pressão, torque e velocidade",
      failureEffect: "Impacto no cliente / produto em teste de rodagem ou montadora",
      severity: s,
      failureMode: "Modo de Falha Potencial a Definir",
      potentialCause: "Causa potencial de máquina, método ou mão de obra",
      currentPrevention: "Instrução de trabalho padrão e manutenção preventiva",
      occurrence: o,
      currentDetection: "Inspeção visual e dimensional por amostragem",
      detection: d,
      rpn: s * o * d,
      actionPriority: calculateAp(s, o, d),
      specialCharacteristic: "",
      classification: "",
      preventiveAction: "",
      detectionAction: "",
      responsiblePerson: "",
      targetDate: "",
      actionTaken: "",
      completionDate: "",
      revisedSeverity: undefined,
      revisedOccurrence: undefined,
      revisedDetection: undefined,
      revisedSpecialCharacteristic: "",
      revisedActionPriority: undefined,
      observations: "",
      searchTags: ["novo", "etapa", "processo"],
      lastRevisionDate: new Date().toISOString().slice(0, 10),
      revisionVersion: 1,
    };
    onAddRow(newRow);
    handleOpenDetailModal(newRow, true);
  };

  const getApBadge = (ap?: "Baixa" | "Média" | "Alta") => {
    if (ap === "Alta") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white border border-red-800 inline-flex items-center gap-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          Alta (H)
        </span>
      );
    }
    if (ap === "Média") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-[#141414] border border-[#141414] shadow-sm">
          Média (M)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white border border-emerald-800 shadow-sm">
        Baixa (L)
      </span>
    );
  };

  const getSpecialBadge = (char?: string) => {
    if (!char || char === "N/A" || char === "Standard" || char === "-" || char.trim() === "") {
      return <span className="text-[10px] text-[#141414]/40 font-mono">N/A</span>;
    }
    const clean = char.trim();
    if (clean === "*" || clean.toLowerCase().includes("crítico") || clean.toLowerCase().includes("critico")) {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-black bg-red-600 text-white border border-red-800 inline-flex items-center gap-1 shadow-xs" title="* - Crítico">
          <span className="font-bold text-[11px] leading-none">*</span>
          <span>Crítico</span>
        </span>
      );
    }
    if (clean === "Y" || clean.toLowerCase().includes("importante")) {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-black bg-amber-400 text-[#141414] border border-[#141414] inline-flex items-center gap-1 shadow-xs" title="Y - Importante">
          <span className="font-bold">Y</span>
          <span>Importante</span>
        </span>
      );
    }
    if (clean === "D" || clean.toLowerCase().includes("segurança") || clean.toLowerCase().includes("seguranca")) {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-black bg-rose-700 text-white border border-rose-900 inline-flex items-center gap-1 shadow-xs" title="D - Segurança">
          <span className="font-bold">D</span>
          <span>Segurança</span>
        </span>
      );
    }
    if (clean === "R" || clean.toLowerCase().includes("regulamentar")) {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-black bg-blue-600 text-white border border-blue-800 inline-flex items-center gap-1 shadow-xs" title="R - Regulamentar">
          <span className="font-bold">R</span>
          <span>Regulamentar</span>
        </span>
      );
    }
    if (clean === "S" || clean.toLowerCase().includes("significativa") || clean === "SC") {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-black bg-teal-600 text-white border border-teal-800 inline-flex items-center gap-1 shadow-xs" title="S - Significativa">
          <span className="font-bold">S</span>
          <span>Significativa</span>
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-200 text-slate-800 border border-slate-400">
        {clean}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Master Controls */}
      <div className="bg-white p-4 border border-[#141414] shadow-[4px_4px_0px_#141414] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[#141414]">
              PFMEA MASTER — MODELO AIAG-VDA 1ª EDIÇÃO (7 PASSOS / 30 COLUNAS)
            </h2>
          </div>
          <p className="text-xs text-[#141414]/70 mt-1 font-sans">
            Planilha Oficial de Análise de Modos de Falha e Efeitos de Processo alinhada à norma IATF 16949 com Prioridade de Ação (PA) e 30 colunas regulatórias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCreateNewRow}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Linha PFMEA</span>
          </button>

          <button
            onClick={onExportPfmea}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#141414] hover:bg-[#333] text-[#E4E3E0] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel (30 Colunas)</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white p-3 border border-[#141414] shadow-[2px_2px_0px_#141414]">
          <span className="text-[10px] font-mono font-bold text-[#141414]/60 uppercase block">Total de Modos de Falha</span>
          <span className="text-lg font-mono font-black text-[#141414]">{totalRows}</span>
        </div>
        <div className="bg-red-50 p-3 border border-red-800 shadow-[2px_2px_0px_#141414]">
          <span className="text-[10px] font-mono font-bold text-red-700 uppercase block">🚨 PA Alta (Ação Requerida)</span>
          <span className="text-lg font-mono font-black text-red-800">{highApCount}</span>
        </div>
        <div className="bg-amber-50 p-3 border border-amber-800 shadow-[2px_2px_0px_#141414]">
          <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">⚠️ PA Média (Revisar)</span>
          <span className="text-lg font-mono font-black text-amber-900">{medApCount}</span>
        </div>
        <div className="bg-emerald-50 p-3 border border-emerald-800 shadow-[2px_2px_0px_#141414]">
          <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">✅ PA Baixa (Controlado)</span>
          <span className="text-lg font-mono font-black text-emerald-900">{lowApCount}</span>
        </div>
        <div className="bg-blue-50 p-3 border border-blue-800 shadow-[2px_2px_0px_#141414] col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">🛡️ Carac. Especiais (*, Y, D, R, S)</span>
          <span className="text-lg font-mono font-black text-blue-900">{specialCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 border border-[#141414] shadow-[4px_4px_0px_#141414] grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Processo, Falha, Causa, 4M, Ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-medium"
          />
        </div>

        <select
          value={filterProcess}
          onChange={(e) => setFilterProcess(e.target.value)}
          className="text-xs p-1.5 bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-mono"
        >
          <option value="all">Todos os Processos ({processes.length})</option>
          {processes.map((p, idx) => (
            <option key={`proc-opt-${p}-${idx}`} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filterStep}
          onChange={(e) => setFilterStep(e.target.value)}
          className="text-xs p-1.5 bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-mono"
        >
          <option value="all">Todas as Etapas ({steps.length})</option>
          {steps.map((s, idx) => (
            <option key={`step-opt-${s}-${idx}`} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filterAp}
          onChange={(e) => setFilterAp(e.target.value)}
          className="text-xs p-1.5 bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-mono font-bold"
        >
          <option value="all">Todas as Prioridades de Ação (PA)</option>
          <option value="Alta">🚨 Alta (Ação Imediata Obrigatória)</option>
          <option value="Média">⚠️ Média (Ação Recomendada)</option>
          <option value="Baixa">✅ Baixa (Nível de Risco Aceitável)</option>
        </select>

        <select
          value={filterSpecial}
          onChange={(e) => setFilterSpecial(e.target.value)}
          className="text-xs p-1.5 bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-mono font-bold"
        >
          <option value="all">Todas Carac. Especiais</option>
          <option value="with_special">🛡️ Apenas com Característica Especial</option>
          <option value="*">* - Crítico</option>
          <option value="Y">Y - Importante</option>
          <option value="D">D - Segurança</option>
          <option value="R">R - Regulamentar</option>
          <option value="S">S - Significativa</option>
          <option value="N/A">N/A - Nenhuma</option>
        </select>
      </div>

      {/* Batch Action Toolbar when items are selected */}
      {selectedRowIds.length > 0 && (
        <div className="bg-amber-100 border-2 border-amber-800 p-3 shadow-[4px_4px_0px_#141414] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-800 text-white flex items-center justify-center font-mono font-bold text-sm">
              {selectedRowIds.length}
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-950 uppercase tracking-wide block">
                {selectedRowIds.length} {selectedRowIds.length === 1 ? "linha selecionada" : "linhas selecionadas"} no PFMEA Master
              </span>
              <span className="text-[11px] text-amber-900/80">
                Você pode excluir as linhas selecionadas em massa ou desmarcar a seleção.
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Selecionadas ({selectedRowIds.length})</span>
            </button>

            <button
              onClick={handleToggleSelectAll}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-[#141414] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer"
            >
              {isAllVisibleSelected ? <Square className="w-3.5 h-3.5 text-[#141414]" /> : <CheckSquare className="w-3.5 h-3.5 text-blue-700" />}
              <span>{isAllVisibleSelected ? "Desmarcar Visíveis" : `Marcar Todos Filtrados (${filtered.length})`}</span>
            </button>

            <button
              onClick={handleClearSelection}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-[#E4E3E0] hover:bg-slate-300 text-[#141414] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      )}

      {/* PFMEA Master Industrial AIAG-VDA 30 Columns Table */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
        <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20">
              {/* Grouping Header (7 Steps AIAG-VDA) */}
              <tr className="text-[10px] font-mono font-black uppercase tracking-wider text-center border-b border-[#141414]">
                <th className="bg-[#141414] text-white p-1.5 w-12 text-center sticky left-0 z-30 border-r border-[#333]">
                  Sel.
                </th>
                <th colSpan={8} className="bg-slate-200 text-slate-900 border-r border-[#141414] p-1.5">
                  1 & 2. Análise de Estrutura e Função (AIAG-VDA Passo 1 e 2)
                </th>
                <th colSpan={4} className="bg-purple-200 text-purple-950 border-r border-[#141414] p-1.5">
                  3. Análise de Falhas (AIAG-VDA Passo 3)
                </th>
                <th colSpan={6} className="bg-emerald-200 text-emerald-950 border-r border-[#141414] p-1.5">
                  4. Análise de Risco Atual (AIAG-VDA Passo 4)
                </th>
                <th colSpan={6} className="bg-amber-200 text-amber-950 border-r border-[#141414] p-1.5">
                  5 & 6. Otimização e Plano de Ação (AIAG-VDA Passo 5 e 6)
                </th>
                <th colSpan={6} className="bg-cyan-200 text-cyan-950 border-r border-[#141414] p-1.5">
                  7. Reavaliação de Risco Pós-Ação (AIAG-VDA Passo 7)
                </th>
                <th className="bg-[#141414] text-white p-1.5">
                  Ações
                </th>
              </tr>

              {/* Exact 30 Sub-Headers + Selection */}
              <tr className="bg-[#141414] text-[#E4E3E0] text-[10px] font-mono font-bold uppercase tracking-wider divide-x divide-[#333] border-b border-[#141414]">
                {/* Selection column */}
                <th className="p-2 w-12 text-center sticky left-0 bg-[#141414] z-30 border-r border-[#333]">
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer align-middle"
                    title={isAllVisibleSelected ? "Desmarcar todos" : "Selecionar todos os visíveis"}
                  />
                </th>

                {/* Structure & Function */}
                <th className="p-2.5 min-w-[140px]">Processo</th>
                <th className="p-2.5 min-w-[160px]">Etapa do Processo</th>
                <th className="p-2.5 min-w-[180px]">Elementos de Trabalho (4M)</th>
                <th className="p-2.5 min-w-[180px]">Função do Processo</th>
                <th className="p-2.5 min-w-[180px]">Função da Etapa do Processo</th>
                <th className="p-2.5 min-w-[180px]">Característica do Produto</th>
                <th className="p-2.5 min-w-[180px]">Função do Elemento de Trabalho</th>
                <th className="p-2.5 min-w-[180px] border-r-2 border-slate-400">Característica do Processo</th>

                {/* Failure Analysis */}
                <th className="p-2.5 min-w-[180px]">Efeito de Falha</th>
                <th className="p-2 text-center w-12 bg-red-950 text-red-200">S</th>
                <th className="p-2.5 min-w-[180px]">Modo de Falha</th>
                <th className="p-2.5 min-w-[180px] border-r-2 border-purple-400">Causa da Falha</th>

                {/* Risk Analysis (Current) */}
                <th className="p-2.5 min-w-[180px]">Controle de Prevenção</th>
                <th className="p-2 text-center w-12 bg-amber-950 text-amber-200">O</th>
                <th className="p-2.5 min-w-[180px]">Controle de Detecção</th>
                <th className="p-2 text-center w-12 bg-blue-950 text-blue-200">D</th>
                <th className="p-2 text-center w-28 bg-emerald-950 text-emerald-200">PA (Prioridade)</th>
                <th className="p-2 text-center w-24 border-r-2 border-emerald-400">Carac. Especial</th>

                {/* Optimization */}
                <th className="p-2.5 min-w-[170px]">Ação Preventiva</th>
                <th className="p-2.5 min-w-[170px]">Ação de Detecção</th>
                <th className="p-2.5 min-w-[140px]">Pessoa Responsável</th>
                <th className="p-2.5 min-w-[110px] text-center">Data Planejada</th>
                <th className="p-2.5 min-w-[170px]">Ação Tomada (Evidenciar)</th>
                <th className="p-2.5 min-w-[110px] text-center border-r-2 border-amber-400">Data Conclusão</th>

                {/* Risk Reassessment (Revised) */}
                <th className="p-2 text-center w-12 bg-red-950 text-red-200">S (Rev)</th>
                <th className="p-2 text-center w-12 bg-amber-950 text-amber-200">O (Rev)</th>
                <th className="p-2 text-center w-12 bg-blue-950 text-blue-200">D (Rev)</th>
                <th className="p-2 text-center w-24">Carac. Especial (Rev)</th>
                <th className="p-2 text-center w-28 bg-cyan-950 text-cyan-200">PA (Rev)</th>
                <th className="p-2.5 min-w-[180px] border-r-2 border-cyan-400">Observações</th>

                {/* Actions column */}
                <th className="p-2.5 text-center w-24 sticky right-0 bg-[#141414] z-10">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={32} className="p-8 text-center font-mono text-[#141414]/50">
                    Nenhum item do PFMEA encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => {
                  const isEditing = editingRowId === row.id;
                  const isSelected = selectedRowIds.includes(row.id);

                  if (isEditing) {
                    const inlineS = Number(editFormData.severity) || 5;
                    const inlineO = Number(editFormData.occurrence) || 2;
                    const inlineD = Number(editFormData.detection) || 3;
                    const inlineAp = calculateAp(inlineS, inlineO, inlineD);

                    return (
                      <tr key={`pfmea-edit-${row.id}-${idx}`} className="bg-blue-50/90 text-xs border-y-2 border-blue-600 align-top">
                        {/* Selection checkbox */}
                        <td className="p-2 text-center sticky left-0 bg-blue-100 z-10 border-r border-blue-300 align-top">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(row.id)}
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer mt-1"
                          />
                        </td>

                        {/* 1-8 */}
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.process || ""} onChange={(e) => setEditFormData({ ...editFormData, process: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono resize-y" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.processStep || ""} onChange={(e) => setEditFormData({ ...editFormData, processStep: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono font-bold resize-y" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.workElements4M || ""} onChange={(e) => setEditFormData({ ...editFormData, workElements4M: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.processFunction || ""} onChange={(e) => setEditFormData({ ...editFormData, processFunction: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.processStepFunction || ""} onChange={(e) => setEditFormData({ ...editFormData, processStepFunction: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.productCharacteristic || ""} onChange={(e) => setEditFormData({ ...editFormData, productCharacteristic: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.workElementFunction || ""} onChange={(e) => setEditFormData({ ...editFormData, workElementFunction: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 border-r-2 border-slate-400 align-top"><textarea rows={2} value={editFormData.processCharacteristic || ""} onChange={(e) => setEditFormData({ ...editFormData, processCharacteristic: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>

                        {/* 9-12 */}
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.failureEffect || ""} onChange={(e) => setEditFormData({ ...editFormData, failureEffect: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 text-center align-top"><input type="number" min={1} max={10} value={editFormData.severity || 1} onChange={(e) => setEditFormData({ ...editFormData, severity: Number(e.target.value) })} className="w-10 p-1 text-center bg-white border border-[#141414] text-xs font-mono font-bold" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.failureMode || ""} onChange={(e) => setEditFormData({ ...editFormData, failureMode: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs font-bold resize-y" /></td>
                        <td className="p-1.5 border-r-2 border-purple-400 align-top"><textarea rows={2} value={editFormData.potentialCause || ""} onChange={(e) => setEditFormData({ ...editFormData, potentialCause: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>

                        {/* 13-18 */}
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.currentPrevention || ""} onChange={(e) => setEditFormData({ ...editFormData, currentPrevention: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 text-center align-top"><input type="number" min={1} max={10} value={editFormData.occurrence || 1} onChange={(e) => setEditFormData({ ...editFormData, occurrence: Number(e.target.value) })} className="w-10 p-1 text-center bg-white border border-[#141414] text-xs font-mono font-bold" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.currentDetection || ""} onChange={(e) => setEditFormData({ ...editFormData, currentDetection: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 text-center align-top"><input type="number" min={1} max={10} value={editFormData.detection || 1} onChange={(e) => setEditFormData({ ...editFormData, detection: Number(e.target.value) })} className="w-10 p-1 text-center bg-white border border-[#141414] text-xs font-mono font-bold" /></td>
                        <td className="p-1.5 text-center align-top">{getApBadge(inlineAp)}</td>
                        <td className="p-1.5 border-r-2 border-emerald-400 align-top">
                          <select
                            value={editFormData.specialCharacteristic || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, specialCharacteristic: e.target.value, classification: e.target.value })}
                            className="w-full p-1 bg-white border border-[#141414] text-xs font-mono font-bold"
                          >
                            <option value="">N/A - Nenhuma</option>
                            <option value="*">* - Crítico</option>
                            <option value="Y">Y - Importante</option>
                            <option value="D">D - Segurança</option>
                            <option value="R">R - Regulamentar</option>
                            <option value="S">S - Significativa</option>
                            <option value="N/A">N/A - Nenhuma</option>
                          </select>
                        </td>

                        {/* 19-24 */}
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.preventiveAction || editFormData.recommendedAction || ""} onChange={(e) => setEditFormData({ ...editFormData, preventiveAction: e.target.value, recommendedAction: e.target.value })} placeholder="Ação Preventiva..." className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.detectionAction || ""} onChange={(e) => setEditFormData({ ...editFormData, detectionAction: e.target.value })} placeholder="Ação de Detecção..." className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 align-top"><input type="text" value={editFormData.responsiblePerson || editFormData.responsible || ""} onChange={(e) => setEditFormData({ ...editFormData, responsiblePerson: e.target.value, responsible: e.target.value })} placeholder="Responsável..." className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono" /></td>
                        <td className="p-1.5 align-top"><input type="date" value={editFormData.targetDate || ""} onChange={(e) => setEditFormData({ ...editFormData, targetDate: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono" /></td>
                        <td className="p-1.5 align-top"><textarea rows={2} value={editFormData.actionTaken || editFormData.takenAction || ""} onChange={(e) => setEditFormData({ ...editFormData, actionTaken: e.target.value, takenAction: e.target.value })} placeholder="Ação Tomada..." className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>
                        <td className="p-1.5 border-r-2 border-amber-400 align-top"><input type="date" value={editFormData.completionDate || ""} onChange={(e) => setEditFormData({ ...editFormData, completionDate: e.target.value })} className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono" /></td>

                        {/* 25-30 */}
                        <td className="p-1.5 text-center align-top"><input type="number" min={1} max={10} value={editFormData.revisedSeverity || ""} onChange={(e) => setEditFormData({ ...editFormData, revisedSeverity: Number(e.target.value) || undefined })} placeholder="S" className="w-10 p-1 text-center bg-white border border-[#141414] text-xs font-mono" /></td>
                        <td className="p-1.5 text-center align-top"><input type="number" min={1} max={10} value={editFormData.revisedOccurrence || ""} onChange={(e) => setEditFormData({ ...editFormData, revisedOccurrence: Number(e.target.value) || undefined })} placeholder="O" className="w-10 p-1 text-center bg-white border border-[#141414] text-xs font-mono" /></td>
                        <td className="p-1.5 text-center align-top"><input type="number" min={1} max={10} value={editFormData.revisedDetection || ""} onChange={(e) => setEditFormData({ ...editFormData, revisedDetection: Number(e.target.value) || undefined })} placeholder="D" className="w-10 p-1 text-center bg-white border border-[#141414] text-xs font-mono" /></td>
                        <td className="p-1.5 align-top">
                          <select
                            value={editFormData.revisedSpecialCharacteristic || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, revisedSpecialCharacteristic: e.target.value })}
                            className="w-full p-1 bg-white border border-[#141414] text-xs font-mono font-bold"
                          >
                            <option value="">N/A - Nenhuma</option>
                            <option value="*">* - Crítico</option>
                            <option value="Y">Y - Importante</option>
                            <option value="D">D - Segurança</option>
                            <option value="R">R - Regulamentar</option>
                            <option value="S">S - Significativa</option>
                            <option value="N/A">N/A - Nenhuma</option>
                          </select>
                        </td>
                        <td className="p-1.5 text-center align-top">
                          {editFormData.revisedSeverity && editFormData.revisedOccurrence && editFormData.revisedDetection
                            ? getApBadge(calculateAp(Number(editFormData.revisedSeverity), Number(editFormData.revisedOccurrence), Number(editFormData.revisedDetection)))
                            : <span className="text-[10px] font-mono text-[#141414]/50">-</span>}
                        </td>
                        <td className="p-1.5 border-r-2 border-cyan-400 align-top"><textarea rows={2} value={editFormData.observations || ""} onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })} placeholder="Observações..." className="w-full p-1.5 bg-white border border-[#141414] text-xs resize-y" /></td>

                        {/* Actions */}
                        <td className="p-1.5 text-center space-x-1 whitespace-nowrap sticky right-0 bg-blue-100 z-10 align-top">
                          <button
                            onClick={handleSaveInlineEdit}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-[#141414] cursor-pointer"
                            title="Salvar Alterações"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelInlineEdit}
                            className="p-1.5 bg-[#E4E3E0] hover:bg-slate-300 text-[#141414] border border-[#141414] cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const isHighSev = row.severity >= 8;
                  const isHighOcc = row.occurrence >= 6;
                  const isHighDet = row.detection >= 6;

                  return (
                    <tr key={`pfmea-row-${row.id}-${idx}`} className={`divide-x divide-[#141414]/10 transition-colors text-[11px] align-top ${
                      isSelected ? "bg-amber-50/90 font-medium" : "hover:bg-[#F8F9FA]"
                    }`}>
                      {/* Selection checkbox */}
                      <td className={`p-2.5 text-center sticky left-0 z-10 border-r border-slate-300 align-top ${
                        isSelected ? "bg-amber-100" : "bg-white"
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(row.id)}
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer align-middle mt-0.5"
                        />
                      </td>

                      {/* 1-8 Structure & Function */}
                      <td className="p-2.5 font-mono font-medium text-[#141414] min-w-[140px] break-words whitespace-normal align-top">
                        {row.process || "Estampagem Automotiva"}
                      </td>
                      <td className="p-2.5 font-bold text-[#141414] min-w-[160px] break-words whitespace-normal align-top">
                        {row.processStep || "Op. 10 - Estampagem"}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal align-top">
                        {row.workElements4M || "-"}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal align-top">
                        {row.processFunction || "-"}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal align-top">
                        {row.processStepFunction || "-"}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal align-top">
                        {row.productCharacteristic || "-"}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal align-top">
                        {row.workElementFunction || "-"}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal border-r-2 border-slate-300 align-top">
                        {row.processCharacteristic || "-"}
                      </td>

                      {/* 9-12 Failure Analysis */}
                      <td className="p-2.5 text-[#141414] min-w-[180px] break-words whitespace-normal align-top">
                        {row.failureEffect || "-"}
                      </td>
                      <td className="p-2 text-center font-black font-mono align-top">
                        <span className={`inline-block px-1.5 py-0.5 border text-xs ${
                          isHighSev ? "bg-red-600 text-white border-red-800" : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#141414] font-bold min-w-[180px] break-words whitespace-normal align-top">
                        {row.failureMode || "-"}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal border-r-2 border-purple-300 align-top">
                        {row.potentialCause || "-"}
                      </td>

                      {/* 13-18 Risk Analysis (Current) */}
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal align-top">
                        {row.currentPrevention || "-"}
                      </td>
                      <td className="p-2 text-center font-mono font-black align-top">
                        <span className={`inline-block px-1.5 py-0.5 border text-xs ${
                          isHighOcc ? "bg-amber-400 text-[#141414] border-[#141414]" : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {row.occurrence}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal align-top">
                        {row.currentDetection || "-"}
                      </td>
                      <td className="p-2 text-center font-mono font-black align-top">
                        <span className={`inline-block px-1.5 py-0.5 border text-xs ${
                          isHighDet ? "bg-blue-200 text-blue-900 border-blue-400" : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {row.detection}
                        </span>
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap align-top">
                        {getApBadge(row.actionPriority)}
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap border-r-2 border-emerald-300 align-top">
                        {getSpecialBadge(row.specialCharacteristic || row.classification)}
                      </td>

                      {/* 19-24 Optimization */}
                      <td className="p-2.5 text-[#141414] min-w-[170px] break-words whitespace-normal align-top">
                        {row.preventiveAction || row.recommendedAction || <span className="text-[#141414]/40 italic">-</span>}
                      </td>
                      <td className="p-2.5 text-[#141414] min-w-[170px] break-words whitespace-normal align-top">
                        {row.detectionAction || <span className="text-[#141414]/40 italic">-</span>}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#141414] min-w-[140px] break-words whitespace-normal align-top">
                        {row.responsiblePerson || row.responsible || <span className="text-[#141414]/40 italic">-</span>}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#141414] whitespace-nowrap text-center align-top">
                        {row.targetDate || "-"}
                      </td>
                      <td className="p-2.5 text-[#141414] min-w-[170px] break-words whitespace-normal align-top">
                        {row.actionTaken || row.takenAction || <span className="text-[#141414]/40 italic">-</span>}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#141414] whitespace-nowrap text-center border-r-2 border-amber-300 align-top">
                        {row.completionDate || "-"}
                      </td>

                      {/* 25-30 Risk Reassessment (Revised) */}
                      <td className="p-2 text-center font-mono font-bold text-[#141414] align-top">
                        {row.revisedSeverity ?? row.newSeverity ?? "-"}
                      </td>
                      <td className="p-2 text-center font-mono font-bold text-[#141414] align-top">
                        {row.revisedOccurrence ?? row.newOccurrence ?? "-"}
                      </td>
                      <td className="p-2 text-center font-mono font-bold text-[#141414] align-top">
                        {row.revisedDetection ?? row.newDetection ?? "-"}
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap align-top">
                        {getSpecialBadge(row.revisedSpecialCharacteristic)}
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap align-top">
                        {row.revisedActionPriority ? getApBadge(row.revisedActionPriority) : (
                          (row.revisedSeverity && row.revisedOccurrence && row.revisedDetection)
                            ? getApBadge(calculateAp(row.revisedSeverity, row.revisedOccurrence, row.revisedDetection))
                            : <span className="text-[10px] font-mono text-[#141414]/40">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-[#141414]/90 min-w-[180px] break-words whitespace-normal border-r-2 border-cyan-300 align-top">
                        {row.observations || "-"}
                      </td>

                      {/* Actions */}
                      <td className="p-2.5 text-center space-x-1 whitespace-nowrap sticky right-0 bg-white shadow-[-2px_0px_4px_rgba(0,0,0,0.05)] z-10 align-top">
                        <button
                          onClick={() => handleOpenDetailModal(row, false)}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-500 cursor-pointer inline-flex items-center"
                          title="Ficha Completa AIAG-VDA (Visualizar/Editar)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(row)}
                          className="p-1.5 text-[#141414] hover:bg-[#E4E3E0] border border-transparent hover:border-[#141414] cursor-pointer inline-flex items-center"
                          title="Edição Rápida na Linha"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRow(row.id)}
                          className="p-1.5 text-[#141414]/60 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-600 cursor-pointer inline-flex items-center"
                          title="Remover Linha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED MODAL: FICHA DE PROCESSO AIAG-VDA (7 PASSOS) */}
      {detailModalRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0px_#141414] w-full max-w-5xl my-6 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#141414] text-[#E4E3E0] p-4 flex items-center justify-between border-b border-[#141414]">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Ficha Técnica PFMEA AIAG-VDA — {modalFormData.processStep || detailModalRow.processStep}
                  </h3>
                  <span className="text-[10px] font-mono text-[#E4E3E0]/70">
                    Estrutura Completa de 7 Passos e 30 Colunas Normativas
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!isDetailModalEditing ? (
                  <button
                    onClick={() => setIsDetailModalEditing(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider border border-white/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Ficha</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveDetailModal}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider border border-white/20 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Dados</span>
                  </button>
                )}

                <button
                  onClick={() => setDetailModalRow(null)}
                  className="p-1.5 bg-[#333] hover:bg-[#555] text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: The 7 Step Cards */}
            <div className="p-5 overflow-y-auto space-y-5 bg-[#F8F9FA] text-xs">
              {/* PASSO 1 & 2: Estrutura e Função */}
              <div className="bg-white p-4 border border-[#141414] shadow-[3px_3px_0px_#141414]">
                <div className="flex items-center space-x-2 border-b border-[#141414]/20 pb-2 mb-3">
                  <span className="w-2.5 h-2.5 bg-slate-700"></span>
                  <h4 className="font-mono font-bold uppercase tracking-wider text-[#141414]">
                    Passo 1 & 2: Análise de Estrutura e Função do Processo
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Processo
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.process || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, process: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="font-bold text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.process || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Etapa do Processo
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.processStep || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, processStep: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs font-bold"
                      />
                    ) : (
                      <p className="font-bold text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.processStep || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Elementos de Trabalho (4M)
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.workElements4M || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, workElements4M: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.workElements4M || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Função do Processo
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.processFunction || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, processFunction: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.processFunction || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Função da Etapa do Processo
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.processStepFunction || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, processStepFunction: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.processStepFunction || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Característica do Produto
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.productCharacteristic || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, productCharacteristic: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.productCharacteristic || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Função do Elemento de Trabalho
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.workElementFunction || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, workElementFunction: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.workElementFunction || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Característica do Processo
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.processCharacteristic || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, processCharacteristic: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.processCharacteristic || "-"}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* PASSO 3: Análise de Falhas */}
              <div className="bg-white p-4 border border-[#141414] shadow-[3px_3px_0px_#141414]">
                <div className="flex items-center space-x-2 border-b border-[#141414]/20 pb-2 mb-3">
                  <span className="w-2.5 h-2.5 bg-purple-700"></span>
                  <h4 className="font-mono font-bold uppercase tracking-wider text-[#141414]">
                    Passo 3: Análise de Falhas (Cadeia de Falha FE → FM → FC)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Efeito de Falha (Impacto no Cliente / Planta)
                    </label>
                    {isDetailModalEditing ? (
                      <textarea
                        rows={2}
                        value={modalFormData.failureEffect || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, failureEffect: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-2 bg-purple-50 border border-purple-200">{modalFormData.failureEffect || "-"}</p>
                    )}
                  </div>

                  <div className="text-center">
                    <label className="text-[10px] font-mono font-bold uppercase text-red-700 block mb-1">
                      Severidade (S) [1-10]
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={modalFormData.severity || 1}
                        onChange={(e) => setModalFormData({ ...modalFormData, severity: Number(e.target.value) })}
                        className="w-16 p-2 text-center bg-white border border-[#141414] text-sm font-mono font-black mx-auto"
                      />
                    ) : (
                      <div className="p-2">
                        <span className="text-xl font-mono font-black text-red-700">{modalFormData.severity}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Característica Especial
                    </label>
                    {isDetailModalEditing ? (
                      <select
                        value={modalFormData.specialCharacteristic || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, specialCharacteristic: e.target.value, classification: e.target.value })}
                        className="w-full p-2 bg-white border border-[#141414] text-xs font-mono font-bold"
                      >
                        <option value="">N/A - Nenhuma</option>
                        <option value="*">* - Crítico</option>
                        <option value="Y">Y - Importante</option>
                        <option value="D">D - Segurança</option>
                        <option value="R">R - Regulamentar</option>
                        <option value="S">S - Significativa</option>
                        <option value="N/A">N/A - Nenhuma</option>
                      </select>
                    ) : (
                      <div className="p-2">
                        {getSpecialBadge(modalFormData.specialCharacteristic || modalFormData.classification)}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Modo de Falha
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.failureMode || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, failureMode: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs font-bold"
                      />
                    ) : (
                      <p className="font-bold text-[#141414] p-2 bg-purple-50 border border-purple-200">{modalFormData.failureMode || "-"}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Causa da Falha
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.potentialCause || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, potentialCause: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-2 bg-purple-50 border border-purple-200">{modalFormData.potentialCause || "-"}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* PASSO 4: Análise de Risco Atual */}
              <div className="bg-white p-4 border border-[#141414] shadow-[3px_3px_0px_#141414]">
                <div className="flex items-center space-x-2 border-b border-[#141414]/20 pb-2 mb-3">
                  <span className="w-2.5 h-2.5 bg-emerald-700"></span>
                  <h4 className="font-mono font-bold uppercase tracking-wider text-[#141414]">
                    Passo 4: Análise de Risco (Controles Atuais & Prioridade de Ação PA)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Controle de Prevenção (PC)
                    </label>
                    {isDetailModalEditing ? (
                      <textarea
                        rows={2}
                        value={modalFormData.currentPrevention || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, currentPrevention: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-2 bg-emerald-50 border border-emerald-200">{modalFormData.currentPrevention || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Controle de Detecção (DC)
                    </label>
                    {isDetailModalEditing ? (
                      <textarea
                        rows={2}
                        value={modalFormData.currentDetection || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, currentDetection: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-2 bg-blue-50 border border-blue-200">{modalFormData.currentDetection || "-"}</p>
                    )}
                  </div>

                  <div className="bg-[#F8F9FA] p-3 border border-[#141414] flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[10px] font-mono text-[#141414]/70 block">S</span>
                        <span className="font-mono font-black text-sm">{modalFormData.severity}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#141414]/70 block">Ocorrência (O)</span>
                        {isDetailModalEditing ? (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={modalFormData.occurrence || 1}
                            onChange={(e) => setModalFormData({ ...modalFormData, occurrence: Number(e.target.value) })}
                            className="w-12 p-1 text-center bg-white border border-[#141414] text-xs font-mono font-black mx-auto"
                          />
                        ) : (
                          <span className="font-mono font-black text-sm">{modalFormData.occurrence}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#141414]/70 block">Detecção (D)</span>
                        {isDetailModalEditing ? (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={modalFormData.detection || 1}
                            onChange={(e) => setModalFormData({ ...modalFormData, detection: Number(e.target.value) })}
                            className="w-12 p-1 text-center bg-white border border-[#141414] text-xs font-mono font-black mx-auto"
                          />
                        ) : (
                          <span className="font-mono font-black text-sm">{modalFormData.detection}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#141414]/20 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase">PA (Prioridade de Ação):</span>
                      {getApBadge(calculateAp(Number(modalFormData.severity) || 5, Number(modalFormData.occurrence) || 2, Number(modalFormData.detection) || 3))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PASSO 5 & 6: Otimização & Plano de Ação */}
              <div className="bg-white p-4 border border-[#141414] shadow-[3px_3px_0px_#141414]">
                <div className="flex items-center space-x-2 border-b border-[#141414]/20 pb-2 mb-3">
                  <span className="w-2.5 h-2.5 bg-amber-600"></span>
                  <h4 className="font-mono font-bold uppercase tracking-wider text-[#141414]">
                    Passo 5 & 6: Otimização e Implementação de Ações (IATF 16949)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Ação Preventiva (Reduzir O)
                    </label>
                    {isDetailModalEditing ? (
                      <textarea
                        rows={2}
                        value={modalFormData.preventiveAction || modalFormData.recommendedAction || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, preventiveAction: e.target.value, recommendedAction: e.target.value })}
                        placeholder="Ex: Poka-yoke de montagem..."
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-2 bg-amber-50 border border-amber-200">{modalFormData.preventiveAction || modalFormData.recommendedAction || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Ação de Detecção (Melhorar D)
                    </label>
                    {isDetailModalEditing ? (
                      <textarea
                        rows={2}
                        value={modalFormData.detectionAction || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, detectionAction: e.target.value })}
                        placeholder="Ex: Sensor óptico 100%..."
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-2 bg-amber-50 border border-amber-200">{modalFormData.detectionAction || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Ação Tomada (Evidenciar)
                    </label>
                    {isDetailModalEditing ? (
                      <textarea
                        rows={2}
                        value={modalFormData.actionTaken || modalFormData.takenAction || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, actionTaken: e.target.value, takenAction: e.target.value })}
                        placeholder="Evidências implementadas..."
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-2 bg-amber-50 border border-amber-200">{modalFormData.actionTaken || modalFormData.takenAction || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Pessoa Responsável
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.responsiblePerson || modalFormData.responsible || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, responsiblePerson: e.target.value, responsible: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono"
                      />
                    ) : (
                      <p className="font-mono text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.responsiblePerson || modalFormData.responsible || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Data Planejada para Conclusão
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="date"
                        value={modalFormData.targetDate || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, targetDate: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono"
                      />
                    ) : (
                      <p className="font-mono text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.targetDate || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Data de Conclusão
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="date"
                        value={modalFormData.completionDate || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, completionDate: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono"
                      />
                    ) : (
                      <p className="font-mono text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.completionDate || "-"}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* PASSO 7: Reavaliação de Risco (Pós-Ação) */}
              <div className="bg-white p-4 border border-[#141414] shadow-[3px_3px_0px_#141414]">
                <div className="flex items-center space-x-2 border-b border-[#141414]/20 pb-2 mb-3">
                  <span className="w-2.5 h-2.5 bg-cyan-700"></span>
                  <h4 className="font-mono font-bold uppercase tracking-wider text-[#141414]">
                    Passo 7: Reavaliação de Risco (Eficácia das Ações & PA Final)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-red-700 block mb-1">
                      Severidade (S) [Revisada]
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={modalFormData.revisedSeverity || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, revisedSeverity: Number(e.target.value) || undefined })}
                        placeholder="S"
                        className="w-full p-1.5 text-center bg-white border border-[#141414] text-xs font-mono font-bold"
                      />
                    ) : (
                      <p className="text-center font-mono font-black text-sm p-1.5 bg-cyan-50 border border-cyan-200">{modalFormData.revisedSeverity ?? modalFormData.newSeverity ?? "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-amber-700 block mb-1">
                      Ocorrência (O) [Revisada]
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={modalFormData.revisedOccurrence || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, revisedOccurrence: Number(e.target.value) || undefined })}
                        placeholder="O"
                        className="w-full p-1.5 text-center bg-white border border-[#141414] text-xs font-mono font-bold"
                      />
                    ) : (
                      <p className="text-center font-mono font-black text-sm p-1.5 bg-cyan-50 border border-cyan-200">{modalFormData.revisedOccurrence ?? modalFormData.newOccurrence ?? "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-blue-700 block mb-1">
                      Detecção (D) [Revisada]
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={modalFormData.revisedDetection || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, revisedDetection: Number(e.target.value) || undefined })}
                        placeholder="D"
                        className="w-full p-1.5 text-center bg-white border border-[#141414] text-xs font-mono font-bold"
                      />
                    ) : (
                      <p className="text-center font-mono font-black text-sm p-1.5 bg-cyan-50 border border-cyan-200">{modalFormData.revisedDetection ?? modalFormData.newDetection ?? "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414] block mb-1">
                      PA (Prioridade) [Revisada]
                    </label>
                    <div className="p-1.5 bg-cyan-50 border border-cyan-200 text-center">
                      {modalFormData.revisedSeverity && modalFormData.revisedOccurrence && modalFormData.revisedDetection ? (
                        getApBadge(calculateAp(modalFormData.revisedSeverity, modalFormData.revisedOccurrence, modalFormData.revisedDetection))
                      ) : (
                        <span className="text-[10px] font-mono text-[#141414]/50">-</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Característica Especial [Revisada]
                    </label>
                    {isDetailModalEditing ? (
                      <select
                        value={modalFormData.revisedSpecialCharacteristic || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, revisedSpecialCharacteristic: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs font-mono font-bold"
                      >
                        <option value="">N/A - Nenhuma</option>
                        <option value="*">* - Crítico</option>
                        <option value="Y">Y - Importante</option>
                        <option value="D">D - Segurança</option>
                        <option value="R">R - Regulamentar</option>
                        <option value="S">S - Significativa</option>
                        <option value="N/A">N/A - Nenhuma</option>
                      </select>
                    ) : (
                      <div className="p-1.5">
                        {getSpecialBadge(modalFormData.revisedSpecialCharacteristic)}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block mb-1">
                      Observações
                    </label>
                    {isDetailModalEditing ? (
                      <input
                        type="text"
                        value={modalFormData.observations || ""}
                        onChange={(e) => setModalFormData({ ...modalFormData, observations: e.target.value })}
                        placeholder="Observações técnicas..."
                        className="w-full p-1.5 bg-white border border-[#141414] text-xs"
                      />
                    ) : (
                      <p className="text-[#141414] p-1.5 bg-slate-50 border border-slate-200">{modalFormData.observations || "-"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-3 border-t border-[#141414] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#141414]/60">
                Última Revisão: {modalFormData.lastRevisionDate || new Date().toISOString().slice(0, 10)} (v{modalFormData.revisionVersion || 1})
              </span>

              <div className="flex items-center space-x-2">
                {isDetailModalEditing && (
                  <button
                    onClick={handleSaveDetailModal}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                )}
                <button
                  onClick={() => setDetailModalRow(null)}
                  className="px-4 py-2 bg-[#E4E3E0] hover:bg-slate-300 text-[#141414] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
