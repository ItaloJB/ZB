import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  PlusCircle, 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  RefreshCw, 
  Download,
  Users,
  AlertOctagon,
  ShieldCheck,
  Search,
  Check,
  AlertTriangle,
  FileCheck2,
  Trash2,
  Plus,
  Image,
  Layers,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { 
  FastResponseComplaint, 
  EightDReport, 
  TeamMember, 
  ContainmentAction, 
  IshikawaDiagram, 
  IshikawaDiagramStructured,
  FiveWhysGroup, 
  ActionItem, 
  ActionStatus,
  HenkatenItem,
  YokotenScope,
  LessonsLearnedInfo,
  EightDApprovals 
} from "../types";
import { 
  parseSingleComplaintExcel, 
  extractNcNumberFromFileName, 
  downloadSingleComplaintTemplate 
} from "../utils/excelHandler";
import { IshikawaFishbone } from "./IshikawaFishbone";

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComplaint: (complaint: FastResponseComplaint) => void;
  initialComplaint?: FastResponseComplaint | null;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSaveComplaint,
  initialComplaint,
}) => {
  const currentYear = new Date().getFullYear().toString().slice(2);
  const nextId = `PDCA 001/${currentYear}`;

  // Active step / tab in the 8D workflow
  const [activeTab, setActiveTab] = useState<"zb" | "d1" | "d2" | "d3" | "d4" | "d5" | "d6" | "d7" | "d8">("zb");

  // Excel Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [excelSuccessInfo, setExcelSuccessInfo] = useState<{
    fileName: string;
    ncNumber: string;
    detectedFields: string[];
  } | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- 0. CABEÇALHO ZB & DADOS GERAIS ---
  const [pdcaNumber, setPdcaNumber] = useState(nextId);
  const [client, setClient] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [partName, setPartName] = useState("");
  const [departmentCausing, setDepartmentCausing] = useState("Usinagem / Qualidade");
  const [identifiedProblem, setIdentifiedProblem] = useState("");
  const [occurrenceDate, setOccurrenceDate] = useState(new Date().toISOString().slice(0, 10));
  const [processStep, setProcessStep] = useState("");
  const [reportedSeverity, setReportedSeverity] = useState(8);

  // --- D1. FORMAÇÃO DE EQUIPE ---
  const [d1Leader, setD1Leader] = useState<TeamMember>({
    id: "leader-1",
    name: "",
    department: "Garantia da Qualidade",
    role: "Líder 8D",
    email: "",
  });
  const [d1Members, setD1Members] = useState<TeamMember[]>([
    { id: "member-1", name: "", department: "Engenharia de Processos", role: "Engenheiro de Processo", email: "" },
    { id: "member-2", name: "", department: "Manutenção", role: "Técnico de Manutenção", email: "" },
  ]);

  // --- D2. DESCRIÇÃO DO PROBLEMA & 5W2H ---
  const [d2Type, setD2Type] = useState<EightDReport["d2Type"]>("Externo - Reclamação de Clientes");
  const [d2Recurrence, setD2Recurrence] = useState(false);
  const [d2NonConformityDescription, setD2NonConformityDescription] = useState("");
  const [d2SpecialCharacteristic, setD2SpecialCharacteristic] = useState(false);
  const [d2SpecialCharacteristicDetails, setD2SpecialCharacteristicDetails] = useState("CC / SC Crítica");
  const [d2ClientDocNumber, setD2ClientDocNumber] = useState("");
  const [d2ImageOkUrl, setD2ImageOkUrl] = useState("");
  const [d2ImageNotOkUrl, setD2ImageNotOkUrl] = useState("");
  const [d2FiveWTwoH, setD2FiveWTwoH] = useState({
    what: "",
    why: "",
    where: "",
    when: "",
    who: "",
    how: "",
    howMuch: "",
  });

  // --- D3. AÇÕES DE CONTENÇÃO ---
  const [d3ContainmentActions, setD3ContainmentActions] = useState<ContainmentAction[]>([
    {
      id: "cont-1",
      description: "Bloqueio preventivo e triagem 100% de peças em estoque",
      location: "Estoque Interno ZB",
      responsible: "Qualidade",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      cutoffInvoice: "",
      status: "Em Andamento",
    }
  ]);

  // --- D4. ANÁLISE DA CAUSA RAIZ ---
  const [d4Henkaten, setD4Henkaten] = useState<{
    hasHenkaten: boolean;
    comments: string;
    items?: HenkatenItem[];
  }>({
    hasHenkaten: false,
    comments: "Nenhuma alteração de 4M registrada nas últimas 48h.",
    items: [
      { dimension: "Mão de Obra", changed: false, comment: "" },
      { dimension: "Método", changed: false, comment: "" },
      { dimension: "Material", changed: false, comment: "" },
      { dimension: "Máquina", changed: false, comment: "" },
      { dimension: "Medição", changed: false, comment: "" },
      { dimension: "Meio Ambiente", changed: false, comment: "" },
    ]
  });
  const [d4RecurrenceInvestigation, setD4RecurrenceInvestigation] = useState("");
  const [d4Ishikawa, setD4Ishikawa] = useState<IshikawaDiagram>({
    manpower: [""],
    method: [""],
    material: [""],
    machine: [""],
    measurement: [""],
    environment: [""],
    problemHead: "",
  });
  const [d4IshikawaQuestions, setD4IshikawaQuestions] = useState({
    canReproduce: false,
    reproductionResult: "",
    processFlowEvaluated: true,
    subsequentProcessesAnalyzed: true,
    occurrenceLocation: "",
    detectionFailureLocation: "",
  });
  const [d4FiveWhys, setD4FiveWhys] = useState<FiveWhysGroup>({
    occurrence: ["", "", "", "", ""],
    detection: ["", "", "", "", ""],
    systemic: ["", "", "", "", ""],
    occurrenceRootCause: "",
    detectionRootCause: "",
    systemicRootCause: "",
  });

  // --- D5 & D6. AÇÕES CORRETIVAS E IMPLEMENTAÇÃO (G/Y/R) ---
  const [d5OccurrenceActions, setD5OccurrenceActions] = useState<ActionItem[]>([
    { id: 1, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
    { id: 2, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
  ]);
  const [d5DetectionActions, setD5DetectionActions] = useState<ActionItem[]>([
    { id: 1, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
    { id: 2, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
  ]);
  const [d5SystemicActions, setD5SystemicActions] = useState<ActionItem[]>([
    { id: 1, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
    { id: 2, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
  ]);
  const [d6SideEffectsRisk, setD6SideEffectsRisk] = useState(false);
  const [d6PredictedInFmea, setD6PredictedInFmea] = useState(true);
  const [d6EfficacyRobust, setD6EfficacyRobust] = useState(true);
  const [d6EfficacyProof, setD6EfficacyProof] = useState("");

  // --- D7. PREVENÇÃO DE REOCORRÊNCIA ---
  const [d7Standardization, setD7Standardization] = useState(
    "Atualização formal do PFMEA, Plano de Controle (PC), Instrução de Trabalho (IT) e treinamento com lista de presença da equipe operacional."
  );
  const [d7Yokoten, setD7Yokoten] = useState<YokotenScope>({
    applicableToOtherProcesses: false,
    scopeItems: "",
  });
  const [d7LessonsLearned, setD7LessonsLearned] = useState<LessonsLearnedInfo>({
    lessonsLearnedNumber: "",
    releaseDate: new Date().toISOString().slice(0, 10),
    fmeaNumber: "",
    fmeaFeedbackDate: "",
  });

  // --- D8. FECHAMENTO ---
  const [d8ClosingDate, setD8ClosingDate] = useState("");
  const [d8QualityApproval, setD8QualityApproval] = useState("");
  const [d8ManagementApproval, setD8ManagementApproval] = useState("");
  const [d8ClosingStatus, setD8ClosingStatus] = useState<EightDReport["d8ClosingStatus"]>("Aberto");
  const [d8Approvals, setD8Approvals] = useState<EightDApprovals>({
    auditor: "",
    teamLeader: "",
    superior: "",
    manager: "",
    sgqFeedback: "",
    stepApprovals: {
      d1: "APROVADO",
      d2: "APROVADO",
      d3: "APROVADO",
      d4: "APROVADO",
      d5: "APROVADO",
      d6: "APROVADO",
      d7: "APROVADO",
      d8: "PENDENTE",
    },
  });

  // Sync state when initialComplaint is provided or modal opens
  useEffect(() => {
    if (initialComplaint && isOpen) {
      if (initialComplaint.id) setPdcaNumber(initialComplaint.id);
      if (initialComplaint.client) setClient(initialComplaint.client);
      if (initialComplaint.partNumber) setPartNumber(initialComplaint.partNumber);
      if (initialComplaint.partName) setPartName(initialComplaint.partName);
      if (initialComplaint.date) setOccurrenceDate(initialComplaint.date);
      if (initialComplaint.processStep) setProcessStep(initialComplaint.processStep);
      if (initialComplaint.reportedSeverity !== undefined) setReportedSeverity(initialComplaint.reportedSeverity);

      const eightD = initialComplaint.eightD;
      if (eightD) {
        if (eightD.pdcaNumber) setPdcaNumber(eightD.pdcaNumber);
        if (eightD.departmentCausing) setDepartmentCausing(eightD.departmentCausing);
        if (eightD.identifiedProblem) {
          setIdentifiedProblem(eightD.identifiedProblem);
        } else if (initialComplaint.realFailureMode) {
          setIdentifiedProblem(initialComplaint.realFailureMode);
        }
        if (eightD.d1Leader) setD1Leader(eightD.d1Leader);
        if (eightD.d1Members && eightD.d1Members.length > 0) setD1Members(eightD.d1Members);
        if (eightD.d2Type) setD2Type(eightD.d2Type);
        if (eightD.d2Recurrence !== undefined) setD2Recurrence(eightD.d2Recurrence);
        if (eightD.d2NonConformityDescription) setD2NonConformityDescription(eightD.d2NonConformityDescription);
        if (eightD.d2SpecialCharacteristic !== undefined) setD2SpecialCharacteristic(eightD.d2SpecialCharacteristic);
        if (eightD.d2SpecialCharacteristicDetails) setD2SpecialCharacteristicDetails(eightD.d2SpecialCharacteristicDetails);
        if (eightD.d2ClientDocNumber) setD2ClientDocNumber(eightD.d2ClientDocNumber);
        if (eightD.d2ImageOkUrl) setD2ImageOkUrl(eightD.d2ImageOkUrl);
        if (eightD.d2ImageNotOkUrl) setD2ImageNotOkUrl(eightD.d2ImageNotOkUrl);
        if (eightD.d2FiveWTwoH) setD2FiveWTwoH(eightD.d2FiveWTwoH);
        if (eightD.d3ContainmentActions && eightD.d3ContainmentActions.length > 0) setD3ContainmentActions(eightD.d3ContainmentActions);
        if (eightD.d4Henkaten) setD4Henkaten(eightD.d4Henkaten);
        if (eightD.d4Ishikawa) setD4Ishikawa(eightD.d4Ishikawa);
        if (eightD.d4FiveWhys) setD4FiveWhys(eightD.d4FiveWhys);
        if (eightD.d5OccurrenceActions && eightD.d5OccurrenceActions.length > 0) setD5OccurrenceActions(eightD.d5OccurrenceActions);
        if (eightD.d5DetectionActions && eightD.d5DetectionActions.length > 0) setD5DetectionActions(eightD.d5DetectionActions);
        if (eightD.d5SystemicActions && eightD.d5SystemicActions.length > 0) setD5SystemicActions(eightD.d5SystemicActions);
        if (eightD.d6SideEffectsRisk !== undefined) setD6SideEffectsRisk(eightD.d6SideEffectsRisk);
        if (eightD.d6PredictedInFmea !== undefined) setD6PredictedInFmea(eightD.d6PredictedInFmea);
        if (eightD.d6EfficacyRobust !== undefined) setD6EfficacyRobust(eightD.d6EfficacyRobust);
        if (eightD.d6EfficacyProof) setD6EfficacyProof(eightD.d6EfficacyProof);
        if (eightD.d7Standardization) setD7Standardization(eightD.d7Standardization);
        if (eightD.d7Yokoten) setD7Yokoten(eightD.d7Yokoten);
        if (eightD.d7LessonsLearned) setD7LessonsLearned(eightD.d7LessonsLearned);
        if (eightD.d8ClosingDate) setD8ClosingDate(eightD.d8ClosingDate);
        if (eightD.d8QualityApproval) setD8QualityApproval(eightD.d8QualityApproval);
        if (eightD.d8ManagementApproval) setD8ManagementApproval(eightD.d8ManagementApproval);
        if (eightD.d8ClosingStatus) setD8ClosingStatus(eightD.d8ClosingStatus);
        if (eightD.d8Approvals) setD8Approvals(eightD.d8Approvals);
      } else {
        if (initialComplaint.rawDescription) setD2NonConformityDescription(initialComplaint.rawDescription);
        if (initialComplaint.realFailureMode) setIdentifiedProblem(initialComplaint.realFailureMode);
        if (initialComplaint.impactDescription) {
          setD2FiveWTwoH(prev => ({ ...prev, why: initialComplaint.impactDescription }));
        }
        if (initialComplaint.rootCause) {
          setD4FiveWhys(prev => ({
            ...prev,
            occurrence: [initialComplaint.rootCause, "", "", "", ""],
          }));
        }
      }
    }
  }, [initialComplaint, isOpen]);

  if (!isOpen) return null;

  // Handle Excel Auto-Fill
  const handleExcelUpload = async (file: File) => {
    if (!file) return;
    setIsProcessingExcel(true);
    setExcelError(null);

    try {
      const parsed = await parseSingleComplaintExcel(file);

      if (parsed.id) setPdcaNumber(parsed.id);
      if (parsed.client) setClient(parsed.client);
      if (parsed.partNumber) setPartNumber(parsed.partNumber);
      if (parsed.partName) setPartName(parsed.partName);
      if (parsed.departmentCausing) setDepartmentCausing(parsed.departmentCausing);
      if (parsed.eightD?.identifiedProblem) {
        setIdentifiedProblem(parsed.eightD.identifiedProblem);
      } else if (parsed.realFailureMode) {
        setIdentifiedProblem(parsed.realFailureMode);
      }
      if (parsed.processStep) setProcessStep(parsed.processStep);
      if (parsed.date) setOccurrenceDate(parsed.date);
      if (parsed.reportedSeverity !== undefined) setReportedSeverity(parsed.reportedSeverity);
      if (parsed.rawDescription) setD2NonConformityDescription(parsed.rawDescription);

      // Deep 8D Fill if available
      if (parsed.eightD) {
        const e8 = parsed.eightD;
        if (e8.d1Leader && e8.d1Leader.name) setD1Leader(e8.d1Leader);
        if (e8.d1Members && e8.d1Members.length > 0) setD1Members(e8.d1Members);
        if (e8.d2Type) setD2Type(e8.d2Type);
        setD2Recurrence(Boolean(e8.d2Recurrence));
        if (e8.d2NonConformityDescription) setD2NonConformityDescription(e8.d2NonConformityDescription);
        setD2SpecialCharacteristic(Boolean(e8.d2SpecialCharacteristic));
        if (e8.d2SpecialCharacteristicDetails) setD2SpecialCharacteristicDetails(e8.d2SpecialCharacteristicDetails);
        if (e8.d2ClientDocNumber) setD2ClientDocNumber(e8.d2ClientDocNumber);
        if (e8.d2FiveWTwoH) setD2FiveWTwoH({ ...d2FiveWTwoH, ...e8.d2FiveWTwoH });
        if (e8.d3ContainmentActions && e8.d3ContainmentActions.length > 0) setD3ContainmentActions(e8.d3ContainmentActions);
        
        if (e8.d4Henkaten) {
          setD4Henkaten(e8.d4Henkaten);
        }
        if (e8.d4RecurrenceInvestigation) setD4RecurrenceInvestigation(e8.d4RecurrenceInvestigation);
        if (e8.d4Ishikawa) setD4Ishikawa(e8.d4Ishikawa);
        if (e8.d4IshikawaStructured) {
          setD4IshikawaQuestions({
            canReproduce: Boolean(e8.d4IshikawaStructured.canReproduce),
            reproductionResult: e8.d4IshikawaStructured.reproductionResult || "",
            processFlowEvaluated: Boolean(e8.d4IshikawaStructured.processFlowEvaluated),
            subsequentProcessesAnalyzed: Boolean(e8.d4IshikawaStructured.subsequentProcessesAnalyzed),
            occurrenceLocation: e8.d4IshikawaStructured.occurrenceLocation || "",
            detectionFailureLocation: e8.d4IshikawaStructured.detectionFailureLocation || "",
          });
        }
        if (e8.d4FiveWhys) setD4FiveWhys(e8.d4FiveWhys);
        if (e8.d5OccurrenceActions && e8.d5OccurrenceActions.length > 0) setD5OccurrenceActions(e8.d5OccurrenceActions);
        if (e8.d5DetectionActions && e8.d5DetectionActions.length > 0) setD5DetectionActions(e8.d5DetectionActions);
        if (e8.d5SystemicActions && e8.d5SystemicActions.length > 0) setD5SystemicActions(e8.d5SystemicActions);
        
        if (e8.d6SideEffectsRisk !== undefined) setD6SideEffectsRisk(e8.d6SideEffectsRisk);
        if (e8.d6PredictedInFmea !== undefined) setD6PredictedInFmea(e8.d6PredictedInFmea);
        if (e8.d6EfficacyRobust !== undefined) setD6EfficacyRobust(e8.d6EfficacyRobust);
        if (e8.d6EfficacyProof) setD6EfficacyProof(e8.d6EfficacyProof);
        
        if (e8.d7Standardization) setD7Standardization(e8.d7Standardization);
        if (e8.d7Yokoten) setD7Yokoten(e8.d7Yokoten);
        if (e8.d7LessonsLearned) setD7LessonsLearned(e8.d7LessonsLearned);
        
        if (e8.d8ClosingDate) setD8ClosingDate(e8.d8ClosingDate);
        if (e8.d8QualityApproval) setD8QualityApproval(e8.d8QualityApproval);
        if (e8.d8ManagementApproval) setD8ManagementApproval(e8.d8ManagementApproval);
        if (e8.d8ClosingStatus) setD8ClosingStatus(e8.d8ClosingStatus);
        if (e8.d8Approvals) {
          setD8Approvals(e8.d8Approvals);
          if (e8.d8Approvals.auditor && !e8.d8QualityApproval) setD8QualityApproval(e8.d8Approvals.auditor);
          if (e8.d8Approvals.manager && !e8.d8ManagementApproval) setD8ManagementApproval(e8.d8Approvals.manager);
        }
      }

      setExcelSuccessInfo({
        fileName: file.name,
        ncNumber: parsed.id,
        detectedFields: parsed.detectedFields,
      });
    } catch (err: any) {
      console.error("Erro ao processar planilha de reclamação:", err);
      setExcelError("Não foi possível ler o arquivo Excel. Verifique se a planilha é válida (.xlsx, .xls ou .csv).");
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleExcelUpload(file);
    e.target.value = "";
  };

  // Helper for image upload to data URL
  const handleImageUpload = (file: File, type: "ok" | "not_ok") => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        if (type === "ok") setD2ImageOkUrl(reader.result as string);
        else setD2ImageNotOkUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Check all active actions in D5/D6
  const allActiveD5Actions = [
    ...d5OccurrenceActions.filter(a => a.description?.trim()),
    ...d5DetectionActions.filter(a => a.description?.trim()),
    ...d5SystemicActions.filter(a => a.description?.trim()),
  ];
  const areAllD6ActionsG = allActiveD5Actions.length > 0 && allActiveD5Actions.every(a => a.status === "G");
  const pendingActionsCount = allActiveD5Actions.filter(a => a.status !== "G").length;

  // Check completion of each 8D stage
  const stageStatus = {
    zb: Boolean(client && partNumber && partName && pdcaNumber && (identifiedProblem || d2NonConformityDescription)),
    d1: Boolean(d1Leader.name && d1Leader.department && d1Members.some(m => m.name)),
    d2: Boolean((d2NonConformityDescription || identifiedProblem) && (d2FiveWTwoH.what || d2FiveWTwoH.where)),
    d3: Boolean(d3ContainmentActions.length > 0 && d3ContainmentActions.some(a => a.description)),
    d4: Boolean(
      (d4Ishikawa.manpower[0] || d4Ishikawa.method[0] || d4Ishikawa.material[0] || d4Ishikawa.machine[0]) &&
      (d4FiveWhys.occurrence[0] || d4FiveWhys.detection[0])
    ),
    d5: Boolean(d5OccurrenceActions.some(a => a.description) || d5DetectionActions.some(a => a.description)),
    d6: areAllD6ActionsG && Boolean(d6EfficacyProof?.trim() || d6EfficacyRobust),
    d7: Boolean(d7Standardization && d7Standardization.length > 10),
    d8: areAllD6ActionsG && Boolean(d8ClosingDate && (d8QualityApproval || d8Approvals.auditor) && d8ClosingStatus === "Fechado"),
  };

  const completedStagesCount = Object.values(stageStatus).filter(Boolean).length;
  const isFullyClosed = completedStagesCount === 9;

  // Submit & Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !pdcaNumber || (!d2NonConformityDescription && !identifiedProblem)) {
      alert("Por favor, preencha os campos essenciais: Cliente, PDCA Nº e Problema Identificado / Descrição da Não Conformidade.");
      return;
    }

    if (d8ClosingStatus === "Fechado" && !areAllD6ActionsG) {
      alert("Validação D8 Bloqueada: O relatório 8D/PDCA só pode ser concluído com status 'Fechado' quando 100% dos campos de ações em D6 estiverem na legenda G (OK / Concluído). Atualmente existem ações em status Y (Em Andamento) ou R (Atrasado).");
      return;
    }

    const fullEightD: EightDReport = {
      client,
      partNumber: partNumber || "PN-NÃO-INFORMADO",
      partName: partName || "Componente",
      departmentCausing,
      pdcaNumber,
      identifiedProblem: identifiedProblem || d2NonConformityDescription,
      d1Leader,
      d1Members,
      d2Type,
      d2Recurrence,
      d2NonConformityDescription: d2NonConformityDescription || identifiedProblem,
      d2SpecialCharacteristic,
      d2SpecialCharacteristicDetails,
      d2ClientDocNumber,
      d2ImageOkUrl,
      d2ImageNotOkUrl,
      d2FiveWTwoH,
      d3ContainmentActions,
      d4Henkaten,
      d4RecurrenceInvestigation,
      d4Ishikawa,
      d4IshikawaStructured: {
        manpower: d4Ishikawa.manpower.map(t => ({ text: t, isRootCause: false })),
        machine: d4Ishikawa.machine.map(t => ({ text: t, isRootCause: false })),
        measurement: d4Ishikawa.measurement.map(t => ({ text: t, isRootCause: false })),
        method: d4Ishikawa.method.map(t => ({ text: t, isRootCause: false })),
        material: d4Ishikawa.material.map(t => ({ text: t, isRootCause: false })),
        environment: d4Ishikawa.environment.map(t => ({ text: t, isRootCause: false })),
        problemHead: d4Ishikawa.problemHead || identifiedProblem || d2NonConformityDescription,
        canReproduce: d4IshikawaQuestions.canReproduce,
        reproductionResult: d4IshikawaQuestions.reproductionResult,
        processFlowEvaluated: d4IshikawaQuestions.processFlowEvaluated,
        subsequentProcessesAnalyzed: d4IshikawaQuestions.subsequentProcessesAnalyzed,
        occurrenceLocation: d4IshikawaQuestions.occurrenceLocation,
        detectionFailureLocation: d4IshikawaQuestions.detectionFailureLocation,
      },
      d4FiveWhys,
      d5OccurrenceActions,
      d5DetectionActions,
      d5SystemicActions,
      d6SideEffectsRisk,
      d6PredictedInFmea,
      d6EfficacyRobust,
      d6EfficacyProof,
      d7Standardization,
      d7Yokoten,
      d7LessonsLearned,
      d8ClosingDate,
      d8QualityApproval: areAllD6ActionsG ? (d8QualityApproval || d8Approvals.auditor) : "",
      d8ManagementApproval: areAllD6ActionsG ? (d8ManagementApproval || d8Approvals.manager) : "",
      d8ClosingStatus: !areAllD6ActionsG && d8ClosingStatus === "Fechado" ? "Em Validação" : d8ClosingStatus,
      d8Approvals: {
        ...d8Approvals,
        auditor: areAllD6ActionsG ? (d8QualityApproval || d8Approvals.auditor) : "",
        teamLeader: areAllD6ActionsG ? d8Approvals.teamLeader : "",
        superior: areAllD6ActionsG ? d8Approvals.superior : "",
        manager: areAllD6ActionsG ? (d8ManagementApproval || d8Approvals.manager) : "",
      }
    };

    const complaint: FastResponseComplaint = {
      id: pdcaNumber,
      date: occurrenceDate,
      client,
      partNumber: partNumber || "PN-NÃO-INFORMADO",
      partName: partName || "Componente",
      rawDescription: d2NonConformityDescription || identifiedProblem,
      processStep: processStep || "Usinagem / Geral",
      realFailureMode: identifiedProblem || d2NonConformityDescription || "Problema de qualidade",
      impactDescription: d2FiveWTwoH.why || "Não conformidade de qualidade com cliente",
      reportedSeverity: Number(reportedSeverity) || 8,
      rootCause: d4FiveWhys.occurrenceRootCause || d4FiveWhys.occurrence.filter(Boolean).slice(-1)[0] || d4Ishikawa.problemHead || identifiedProblem || "Causa apurada via 8D",
      origin: d2Type === "Externo - Reclamação de Clientes" ? "Montadora (Linha 0km)" : "Fast Response Interno",
      status: d8ClosingStatus === "Fechado" ? "Retroalimentado no PFMEA" : "Em Ação Corretiva",
      eightD: fullEightD,
    };

    onSaveComplaint(complaint);
    onClose();
  };

  // Helper to update action lists in D5/D6
  const updateAction = (
    listType: "occurrence" | "detection" | "systemic",
    index: number,
    field: keyof ActionItem,
    value: any
  ) => {
    if (listType === "occurrence") {
      const updated = [...d5OccurrenceActions];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
        setD5OccurrenceActions(updated);
      }
    } else if (listType === "detection") {
      const updated = [...d5DetectionActions];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
        setD5DetectionActions(updated);
      }
    } else {
      const updated = [...d5SystemicActions];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
        setD5SystemicActions(updated);
      }
    }
  };

  // Helper to add a new action to a specific topic in D5
  const addAction = (listType: "occurrence" | "detection" | "systemic") => {
    const newAction: ActionItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      description: "",
      responsible: "",
      targetDate: "",
      status: "Y",
      evidence: "",
    };
    if (listType === "occurrence") {
      setD5OccurrenceActions(prev => [...prev, newAction]);
    } else if (listType === "detection") {
      setD5DetectionActions(prev => [...prev, newAction]);
    } else {
      setD5SystemicActions(prev => [...prev, newAction]);
    }
  };

  // Helper to remove an action by index in D5
  const removeAction = (listType: "occurrence" | "detection" | "systemic", index: number) => {
    if (listType === "occurrence") {
      setD5OccurrenceActions(prev => prev.filter((_, i) => i !== index));
    } else if (listType === "detection") {
      setD5DetectionActions(prev => prev.filter((_, i) => i !== index));
    } else {
      setD5SystemicActions(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Helper to clear empty/unused actions from a topic
  const removeEmptyActions = (listType: "occurrence" | "detection" | "systemic") => {
    if (listType === "occurrence") {
      const filtered = d5OccurrenceActions.filter(a => a.description.trim() !== "" || a.responsible.trim() !== "");
      setD5OccurrenceActions(filtered.length > 0 ? filtered : [{ id: Date.now(), description: "", responsible: "", targetDate: "", status: "Y", evidence: "" }]);
    } else if (listType === "detection") {
      const filtered = d5DetectionActions.filter(a => a.description.trim() !== "" || a.responsible.trim() !== "");
      setD5DetectionActions(filtered.length > 0 ? filtered : [{ id: Date.now(), description: "", responsible: "", targetDate: "", status: "Y", evidence: "" }]);
    } else {
      const filtered = d5SystemicActions.filter(a => a.description.trim() !== "" || a.responsible.trim() !== "");
      setD5SystemicActions(filtered.length > 0 ? filtered : [{ id: Date.now(), description: "", responsible: "", targetDate: "", status: "Y", evidence: "" }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0px_#141414] max-w-6xl w-full flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* TOP BRANDING & CORPORATE HEADER */}
        <div className="bg-[#141414] text-[#E4E3E0] px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-[#141414] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 border border-white flex items-center justify-center text-[#141414] font-black font-mono text-sm shadow-[2px_2px_0px_#fff]">
              ZB
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-mono font-black text-sm uppercase tracking-wider text-white">
                  ZB - PDCA Análise e Soluções de Problemas
                </h3>
                <span className="px-2 py-0.5 bg-amber-400 text-[#141414] text-[10px] font-mono font-black uppercase">
                  Metodologia 8D
                </span>
              </div>
              <p className="text-[11px] text-[#E4E3E0]/70 font-mono">
                Padrão Automotivo para Registro, Contenção, Causa Raiz e Fechamento de Não Conformidades
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => downloadSingleComplaintTemplate()}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-[#141414] font-mono text-[11px] font-bold border border-white shadow-[2px_2px_0px_#fff] flex items-center space-x-1 cursor-pointer"
              title="Baixar modelo de planilha 8D ZB"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Modelo .xlsx</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingExcel}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold uppercase tracking-wider border border-white shadow-[2px_2px_0px_#fff] flex items-center space-x-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Excel</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#E4E3E0]/80 hover:text-white p-1 hover:bg-[#333] transition-colors cursor-pointer border border-transparent hover:border-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden Excel File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={onFileInputChange}
          className="hidden"
        />

        {/* EXCEL AUTO-FILL CONFIRMATION ALERT */}
        {excelSuccessInfo && (
          <div className="bg-emerald-50 border-b-2 border-emerald-600 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-2 text-emerald-900 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Planilha <strong>"{excelSuccessInfo.fileName}"</strong> importada com sucesso! PDCA identificado: <strong>{excelSuccessInfo.ncNumber}</strong>. ({excelSuccessInfo.detectedFields.length} campos preenchidos).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExcelSuccessInfo(null)}
              className="text-xs text-emerald-800 hover:underline font-mono"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* 8D STATUS PROGRESS & NAVIGATION TABS */}
        <div className="bg-slate-100 border-b-2 border-[#141414] px-4 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-2">
          {/* Status summary */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold uppercase text-[#141414]">
              Status 8D:
            </span>
            <span className={`px-2 py-0.5 text-xs font-mono font-black border border-[#141414] ${isFullyClosed ? "bg-emerald-500 text-white" : "bg-amber-400 text-[#141414]"}`}>
              {completedStagesCount} de 9 Seções Preenchidas {isFullyClosed ? "— PRONTO PARA FECHAMENTO" : "— EM ANDAMENTO"}
            </span>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full">
            {[
              { id: "zb", label: "0. Cabeçalho ZB", done: stageStatus.zb },
              { id: "d1", label: "D1: Equipe", done: stageStatus.d1 },
              { id: "d2", label: "D2: 5W2H / Problema", done: stageStatus.d2 },
              { id: "d3", label: "D3: Contenção", done: stageStatus.d3 },
              { id: "d4", label: "D4: Causa / Ishikawa", done: stageStatus.d4 },
              { id: "d5", label: "D5: Ações Corretivas", done: stageStatus.d5 },
              { id: "d6", label: "D6: Implementação (G/Y/R)", done: stageStatus.d6 },
              { id: "d7", label: "D7: Prevenção", done: stageStatus.d7 },
              { id: "d8", label: "D8: Fechamento", done: stageStatus.d8 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-mono font-bold border border-[#141414] shadow-[1px_1px_0px_#141414] transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                  activeTab === tab.id
                    ? "bg-[#141414] text-white"
                    : "bg-white hover:bg-slate-200 text-[#141414]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.done ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Etapa preenchida" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Etapa pendente" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN FORM BODY */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 0: CABEÇALHO ZB & DADOS GERAIS */}
          {activeTab === "zb" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-amber-500 border border-[#141414]" />
                  <span>Identificação Principal — Padrão ZB</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Campos obrigatórios do cabeçalho corporativo ZB para registro do PDCA e rastreabilidade da Não Conformidade.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    PDCA Nº *
                  </label>
                  <input
                    type="text"
                    required
                    value={pdcaNumber}
                    onChange={(e) => setPdcaNumber(e.target.value)}
                    placeholder={`ex: PDCA 000/${currentYear}`}
                    className="w-full text-xs font-mono font-bold p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none focus:bg-amber-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="ex: Volkswagen do Brasil, GM, Stellantis..."
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none focus:bg-amber-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Conjunto / Peça Nº *
                  </label>
                  <input
                    type="text"
                    required
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="ex: 5U0-820-045-A"
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none focus:bg-amber-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Nome Conjunto / Peça *
                  </label>
                  <input
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="ex: Suporte de Fixação do Alternador"
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none focus:bg-amber-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Departamento Causador *
                  </label>
                  <input
                    type="text"
                    required
                    value={departmentCausing}
                    onChange={(e) => setDepartmentCausing(e.target.value)}
                    placeholder="ex: Usinagem CNC / Qualidade"
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none focus:bg-amber-50"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1 flex items-center justify-between">
                    <span>Problema Identificado *</span>
                    <span className="text-[10px] font-mono text-amber-700 font-bold">Campo do Cabeçalho PDCA</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identifiedProblem}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIdentifiedProblem(val);
                      if (!d2NonConformityDescription) {
                        setD2NonConformityDescription(val);
                      }
                      if (!d4Ishikawa.problemHead) {
                        setD4Ishikawa(prev => ({ ...prev, problemHead: val }));
                      }
                    }}
                    placeholder="ex: Parafusos girando em falso na fixação do suporte devido a rosca M8 com filete danificado."
                    className="w-full text-xs font-mono font-bold p-2.5 bg-amber-50/50 border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none focus:bg-amber-100/60"
                  />
                  <p className="text-[10px] font-mono text-[#141414]/65 mt-1">
                    Identificação concisa da não conformidade ou falha reportada no cabeçalho corporativo do PDCA.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Data da Ocorrência *
                  </label>
                  <input
                    type="date"
                    required
                    value={occurrenceDate}
                    onChange={(e) => setOccurrenceDate(e.target.value)}
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Etapa do Processo Relacionada
                  </label>
                  <input
                    type="text"
                    value={processStep}
                    onChange={(e) => setProcessStep(e.target.value)}
                    placeholder="ex: Rosqueamento M8 / Montagem de Rolamento"
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Severidade Inicial (1 a 10)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reportedSeverity}
                      onChange={(e) => setReportedSeverity(Number(e.target.value))}
                      className="flex-1 accent-red-600 cursor-pointer"
                    />
                    <span className="w-8 text-center text-xs font-mono font-bold p-1.5 bg-[#141414] text-white border border-[#141414]">
                      {reportedSeverity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: D1 - FORMAÇÃO DE EQUIPE */}
          {activeTab === "d1" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-700" />
                  <span>D1 - Formação de Equipe Multidisciplinar</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Defina o Líder do 8D e todos os membros da equipe multidisciplinar envolvidos na contenção e solução.
                </p>
              </div>

              {/* Líder */}
              <div className="p-3 bg-white border-2 border-blue-600 shadow-[3px_3px_0px_#141414] space-y-3">
                <div className="flex items-center justify-between border-b border-[#141414] pb-2">
                  <span className="text-xs font-mono font-black uppercase text-blue-900">
                    ★ Líder do 8D (Champion)
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 border border-blue-400">
                    Responsável Técnico Principal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={d1Leader.name}
                      onChange={(e) => setD1Leader({ ...d1Leader, name: e.target.value })}
                      placeholder="Nome do Líder..."
                      className="w-full text-xs font-mono p-2 bg-white border border-[#141414] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      value={d1Leader.department}
                      onChange={(e) => setD1Leader({ ...d1Leader, department: e.target.value })}
                      placeholder="ex: Garantia da Qualidade"
                      className="w-full text-xs font-mono p-2 bg-white border border-[#141414] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                      Função *
                    </label>
                    <input
                      type="text"
                      value={d1Leader.role}
                      onChange={(e) => setD1Leader({ ...d1Leader, role: e.target.value })}
                      placeholder="ex: Especialista em Confiabilidade"
                      className="w-full text-xs font-mono p-2 bg-white border border-[#141414] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={d1Leader.email}
                      onChange={(e) => setD1Leader({ ...d1Leader, email: e.target.value })}
                      placeholder="lider@empresa.com"
                      className="w-full text-xs font-mono p-2 bg-white border border-[#141414] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Membros */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-mono font-bold uppercase text-[#141414]">
                    Membros da Equipe ({d1Members.length})
                  </h5>
                  <button
                    type="button"
                    onClick={() => setD1Members([...d1Members, { id: `member-${Date.now()}`, name: "", department: "", role: "Membro", email: "" }])}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#141414] font-mono text-xs border border-[#141414] shadow-[2px_2px_0px_#141414] flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Membro</span>
                  </button>
                </div>

                {d1Members.map((member, idx) => (
                  <div key={member.id} className="p-3 bg-slate-50 border border-[#141414] shadow-[2px_2px_0px_#141414] flex flex-col md:flex-row items-center gap-3">
                    <span className="font-mono font-bold text-xs text-[#141414]/50 w-6">
                      #{idx + 1}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 flex-1 w-full">
                      <input
                        type="text"
                        value={member.name}
                        placeholder="Nome do Membro..."
                        onChange={(e) => {
                          const upd = [...d1Members];
                          upd[idx].name = e.target.value;
                          setD1Members(upd);
                        }}
                        className="text-xs font-mono p-1.5 bg-white border border-[#141414]"
                      />
                      <input
                        type="text"
                        value={member.department}
                        placeholder="Departamento..."
                        onChange={(e) => {
                          const upd = [...d1Members];
                          upd[idx].department = e.target.value;
                          setD1Members(upd);
                        }}
                        className="text-xs font-mono p-1.5 bg-white border border-[#141414]"
                      />
                      <input
                        type="text"
                        value={member.role}
                        placeholder="Função..."
                        onChange={(e) => {
                          const upd = [...d1Members];
                          upd[idx].role = e.target.value;
                          setD1Members(upd);
                        }}
                        className="text-xs font-mono p-1.5 bg-white border border-[#141414]"
                      />
                      <input
                        type="email"
                        value={member.email}
                        placeholder="E-mail..."
                        onChange={(e) => {
                          const upd = [...d1Members];
                          upd[idx].email = e.target.value;
                          setD1Members(upd);
                        }}
                        className="text-xs font-mono p-1.5 bg-white border border-[#141414]"
                      />
                    </div>
                    {d1Members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setD1Members(d1Members.filter((_, i) => i !== idx))}
                        className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-600 cursor-pointer"
                        title="Remover membro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: D2 - DESCRIÇÃO DO PROBLEMA & 5W2H */}
          {activeTab === "d2" && (
            <div className="space-y-6">
              <div className="p-3 bg-red-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-red-700" />
                  <span>D2 - Descrição do Problema & 5W2H Estruturado</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Caracterize o tipo de falha, reincidência, características especiais, imagens comparativas OK/NÃO OK e o detalhamento 5W2H.
                </p>
              </div>

              {/* Classificação do Problema */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Tipo de Ocorrência *
                  </label>
                  <select
                    value={d2Type}
                    onChange={(e) => setD2Type(e.target.value as any)}
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] shadow-[2px_2px_0px_#141414]"
                  >
                    <option value="Externo - Reclamação de Clientes">Externo - Reclamação de Clientes</option>
                    <option value="Interno - Processos ZB">Interno - Processos ZB</option>
                    <option value="Interno - Refugos e Operação Suplementar">Interno - Refugos e Operação Suplementar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Reincidência? *
                  </label>
                  <div className="flex items-center space-x-4 p-2 bg-white border-2 border-[#141414]">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-mono">
                      <input
                        type="radio"
                        name="recurrence"
                        checked={!d2Recurrence}
                        onChange={() => setD2Recurrence(false)}
                        className="accent-red-600"
                      />
                      <span>Não</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-mono text-red-600 font-bold">
                      <input
                        type="radio"
                        name="recurrence"
                        checked={d2Recurrence}
                        onChange={() => setD2Recurrence(true)}
                        className="accent-red-600"
                      />
                      <span>Sim (Reincidente)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                    Nº do Documento do Cliente (RNC/Chamado)
                  </label>
                  <input
                    type="text"
                    value={d2ClientDocNumber}
                    onChange={(e) => setD2ClientDocNumber(e.target.value)}
                    placeholder="ex: RNC-VW-2026-8819"
                    className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414]"
                  />
                </div>
              </div>

              {/* Característica Especial */}
              <div className="p-3 bg-amber-50/70 border border-[#141414] space-y-2">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-xs font-mono font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d2SpecialCharacteristic}
                      onChange={(e) => setD2SpecialCharacteristic(e.target.checked)}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <span>Modo de falha vinculado a Característica Especial (CC / SC / Segurança / Crítica)?</span>
                  </label>
                </div>
                {d2SpecialCharacteristic && (
                  <input
                    type="text"
                    value={d2SpecialCharacteristicDetails}
                    onChange={(e) => setD2SpecialCharacteristicDetails(e.target.value)}
                    placeholder="Especifique a característica (ex: CC - Dimensão Crítica do Furo M8, Torque de Segurança)..."
                    className="w-full text-xs font-mono p-2 bg-white border border-[#141414]"
                  />
                )}
              </div>

              {/* Descrição da Não Conformidade */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                  Descrição Detalhada da Não Conformidade *
                </label>
                <textarea
                  rows={3}
                  required
                  value={d2NonConformityDescription}
                  onChange={(e) => {
                    setD2NonConformityDescription(e.target.value);
                    if (!d4Ishikawa.problemHead) {
                      setD4Ishikawa({ ...d4Ishikawa, problemHead: e.target.value });
                    }
                  }}
                  placeholder="Descreva com exatidão o que foi constatado, sintomas, condições de montagem e impacto observado..."
                  className="w-full text-xs font-mono p-2 bg-white border-2 border-[#141414] focus:outline-none"
                />
              </div>

              {/* Imagens Comparativas OK vs NÃO OK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Imagem OK */}
                <div className="p-3 bg-emerald-50 border-2 border-emerald-600 shadow-[3px_3px_0px_#141414] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-emerald-900 uppercase">
                      ✓ Imagem do Item OK (Padrão Aceitável)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={d2ImageOkUrl}
                    onChange={(e) => setD2ImageOkUrl(e.target.value)}
                    placeholder="URL ou link da foto da peça OK..."
                    className="w-full text-xs font-mono p-1.5 bg-white border border-emerald-700"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="px-2 py-1 bg-white hover:bg-emerald-100 text-xs font-mono border border-emerald-700 cursor-pointer flex items-center space-x-1">
                      <Image className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Upload Foto OK</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "ok")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {d2ImageOkUrl && (
                    <div className="mt-2 border border-emerald-700 bg-white p-1 max-h-40 overflow-hidden flex items-center justify-center">
                      <img src={d2ImageOkUrl} alt="Item OK" className="max-h-36 object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                {/* Imagem NÃO OK */}
                <div className="p-3 bg-red-50 border-2 border-red-600 shadow-[3px_3px_0px_#141414] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-red-900 uppercase">
                      ✗ Imagem do Item NÃO OK (Defeito Encontrado)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={d2ImageNotOkUrl}
                    onChange={(e) => setD2ImageNotOkUrl(e.target.value)}
                    placeholder="URL ou link da foto da peça com defeito..."
                    className="w-full text-xs font-mono p-1.5 bg-white border border-red-700"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="px-2 py-1 bg-white hover:bg-red-100 text-xs font-mono border border-red-700 cursor-pointer flex items-center space-x-1">
                      <Image className="w-3.5 h-3.5 text-red-700" />
                      <span>Upload Foto NÃO OK</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "not_ok")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {d2ImageNotOkUrl && (
                    <div className="mt-2 border border-red-700 bg-white p-1 max-h-40 overflow-hidden flex items-center justify-center">
                      <img src={d2ImageNotOkUrl} alt="Item NÃO OK" className="max-h-36 object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              {/* Matriz 5W2H */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <div className="border-b border-[#141414] pb-2">
                  <h5 className="text-xs font-mono font-black uppercase text-[#141414]">
                    Matriz 5W2H — Detalhamento da Ocorrência
                  </h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#141414] mb-1">
                      What (O que aconteceu?)
                    </label>
                    <input
                      type="text"
                      value={d2FiveWTwoH.what}
                      onChange={(e) => setD2FiveWTwoH({ ...d2FiveWTwoH, what: e.target.value })}
                      placeholder="Descrição exata do modo de falha..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#141414] mb-1">
                      Why (Por que é um problema / impacto?)
                    </label>
                    <input
                      type="text"
                      value={d2FiveWTwoH.why}
                      onChange={(e) => setD2FiveWTwoH({ ...d2FiveWTwoH, why: e.target.value })}
                      placeholder="Consequência funcional ou perigo..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#141414] mb-1">
                      Where (Onde foi detectado / local?)
                    </label>
                    <input
                      type="text"
                      value={d2FiveWTwoH.where}
                      onChange={(e) => setD2FiveWTwoH({ ...d2FiveWTwoH, where: e.target.value })}
                      placeholder="Posto de trabalho, linha da montadora..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#141414] mb-1">
                      When (Quando ocorreu / data e lote?)
                    </label>
                    <input
                      type="text"
                      value={d2FiveWTwoH.when}
                      onChange={(e) => setD2FiveWTwoH({ ...d2FiveWTwoH, when: e.target.value })}
                      placeholder="Data, turno, número do lote..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#141414] mb-1">
                      Who (Quem detectou / responsável?)
                    </label>
                    <input
                      type="text"
                      value={d2FiveWTwoH.who}
                      onChange={(e) => setD2FiveWTwoH({ ...d2FiveWTwoH, who: e.target.value })}
                      placeholder="Operador, inspetor, cliente..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-[#141414] mb-1">
                      How (Como ocorreu o modo de falha?)
                    </label>
                    <input
                      type="text"
                      value={d2FiveWTwoH.how}
                      onChange={(e) => setD2FiveWTwoH({ ...d2FiveWTwoH, how: e.target.value })}
                      placeholder="Mecanismo físico do defeito..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-mono font-bold text-[#141414] mb-1">
                      How much (Quanto / quantidade de peças impactadas ou custo?)
                    </label>
                    <input
                      type="text"
                      value={d2FiveWTwoH.howMuch}
                      onChange={(e) => setD2FiveWTwoH({ ...d2FiveWTwoH, howMuch: e.target.value })}
                      placeholder="ex: 45 peças no cliente, 200 em estoque..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: D3 - AÇÕES DE CONTENÇÃO */}
          {activeTab === "d3" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>D3 - Ações de Contenção Imediata</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Proteção imediata do cliente (bloqueio de estoque, inspeção 100%, triagem e definição de NF de Ponto de Corte).
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#141414]">
                  Lista de Ações de Contenção ({d3ContainmentActions.length})
                </span>
                <button
                  type="button"
                  onClick={() => setD3ContainmentActions([
                    ...d3ContainmentActions,
                    {
                      id: `cont-${Date.now()}`,
                      description: "",
                      location: "Estoque",
                      responsible: "",
                      startDate: new Date().toISOString().slice(0, 10),
                      endDate: "",
                      cutoffInvoice: "",
                      status: "Em Andamento",
                    }
                  ])}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#141414] font-mono text-xs border border-[#141414] shadow-[2px_2px_0px_#141414] flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Contenção</span>
                </button>
              </div>

              <div className="space-y-3">
                {d3ContainmentActions.map((action, idx) => (
                  <div key={action.id} className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#141414]/20 pb-1">
                      <span className="text-xs font-mono font-black text-[#141414]">
                        Contenção #{idx + 1}
                      </span>
                      {d3ContainmentActions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setD3ContainmentActions(d3ContainmentActions.filter((_, i) => i !== idx))}
                          className="p-1 text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#141414]">
                          Descrição da Ação *
                        </label>
                        <input
                          type="text"
                          value={action.description}
                          placeholder="Ação de contenção..."
                          onChange={(e) => {
                            const upd = [...d3ContainmentActions];
                            upd[idx].description = e.target.value;
                            setD3ContainmentActions(upd);
                          }}
                          className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#141414]">
                          Local da Contenção *
                        </label>
                        <input
                          type="text"
                          value={action.location}
                          placeholder="ex: Estoque ZB, Linha Cliente..."
                          onChange={(e) => {
                            const upd = [...d3ContainmentActions];
                            upd[idx].location = e.target.value;
                            setD3ContainmentActions(upd);
                          }}
                          className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#141414]">
                          Responsável *
                        </label>
                        <input
                          type="text"
                          value={action.responsible}
                          placeholder="Nome / Área..."
                          onChange={(e) => {
                            const upd = [...d3ContainmentActions];
                            upd[idx].responsible = e.target.value;
                            setD3ContainmentActions(upd);
                          }}
                          className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#141414]">
                          Início da Contenção
                        </label>
                        <input
                          type="date"
                          value={action.startDate}
                          onChange={(e) => {
                            const upd = [...d3ContainmentActions];
                            upd[idx].startDate = e.target.value;
                            setD3ContainmentActions(upd);
                          }}
                          className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#141414]">
                          Conclusão da Contenção
                        </label>
                        <input
                          type="date"
                          value={action.endDate}
                          onChange={(e) => {
                            const upd = [...d3ContainmentActions];
                            upd[idx].endDate = e.target.value;
                            setD3ContainmentActions(upd);
                          }}
                          className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#141414]">
                          NF de Ponto de Corte
                        </label>
                        <input
                          type="text"
                          value={action.cutoffInvoice}
                          placeholder="ex: NF-44910 / Lote Limpo 28-A"
                          onChange={(e) => {
                            const upd = [...d3ContainmentActions];
                            upd[idx].cutoffInvoice = e.target.value;
                            setD3ContainmentActions(upd);
                          }}
                          className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#141414]">
                          Status
                        </label>
                        <select
                          value={action.status}
                          onChange={(e) => {
                            const upd = [...d3ContainmentActions];
                            upd[idx].status = e.target.value as any;
                            setD3ContainmentActions(upd);
                          }}
                          className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        >
                          <option value="Em Andamento">Em Andamento</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Pendente">Pendente</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: D4 - ANÁLISE DA CAUSA RAIZ */}
          {activeTab === "d4" && (
            <div className="space-y-6">
              <div className="p-3 bg-purple-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <Search className="w-4 h-4 text-purple-700" />
                  <span>D4 - Análise da Causa Raiz (Henkaten, Ishikawa 6M & 5 Porquês)</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Investigação sistemática: Análise de Mudanças Henkaten, Diagrama Espinha de Peixe e desdobramento dos 5 Porquês de Ocorrência, Detecção e Sistêmico.
                </p>
              </div>

              {/* 4.1 Henkaten */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black uppercase text-[#141414]">
                    4.1 - Processo de Investigação Henkaten (Mudanças 4M / 6M)
                  </span>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1 text-xs font-mono cursor-pointer">
                      <input
                        type="radio"
                        name="henkaten"
                        checked={!d4Henkaten.hasHenkaten}
                        onChange={() => setD4Henkaten({ ...d4Henkaten, hasHenkaten: false })}
                        className="accent-purple-600"
                      />
                      <span>Não</span>
                    </label>
                    <label className="flex items-center space-x-1 text-xs font-mono text-purple-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="henkaten"
                        checked={d4Henkaten.hasHenkaten}
                        onChange={() => setD4Henkaten({ ...d4Henkaten, hasHenkaten: true })}
                        className="accent-purple-600"
                      />
                      <span>Sim (Houve Mudança)</span>
                    </label>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={d4Henkaten.comments}
                  onChange={(e) => setD4Henkaten({ ...d4Henkaten, comments: e.target.value })}
                  placeholder="Comentários gerais sobre troca de ferramenta, novo operador, alteração de fornecedor de matéria-prima ou manutenção não programada..."
                  className="w-full text-xs font-mono p-2 bg-white border border-[#141414]"
                />

                {/* Henkaten 6M Grid */}
                {d4Henkaten.items && d4Henkaten.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                    {d4Henkaten.items.map((item, idx) => (
                      <div key={item.dimension} className={`p-2 border text-xs font-mono ${item.changed ? "bg-purple-50 border-purple-600" : "bg-slate-50 border-slate-300"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#141414]">{item.dimension}</span>
                          <label className="flex items-center space-x-1 text-[10px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.changed}
                              onChange={(e) => {
                                const newItems = [...(d4Henkaten.items || [])];
                                newItems[idx] = { ...item, changed: e.target.checked };
                                setD4Henkaten({ ...d4Henkaten, items: newItems, hasHenkaten: newItems.some(i => i.changed) });
                              }}
                              className="accent-purple-600"
                            />
                            <span className={item.changed ? "font-bold text-purple-700" : "text-slate-500"}>Alteração</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={item.comment}
                          onChange={(e) => {
                            const newItems = [...(d4Henkaten.items || [])];
                            newItems[idx] = { ...item, comment: e.target.value };
                            setD4Henkaten({ ...d4Henkaten, items: newItems });
                          }}
                          placeholder={`Detalhe sobre ${item.dimension.toLowerCase()}...`}
                          className="w-full text-[11px] p-1 bg-white border border-[#141414]/40"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4.2 Reincidência */}
              {d2Recurrence && (
                <div className="p-3 bg-red-50 border-2 border-red-600 shadow-[3px_3px_0px_#141414] space-y-2">
                  <span className="text-xs font-mono font-black uppercase text-red-900">
                    4.2 - Processo de Investigação (Em caso de Reincidência)
                  </span>
                  <textarea
                    rows={2}
                    value={d4RecurrenceInvestigation}
                    onChange={(e) => setD4RecurrenceInvestigation(e.target.value)}
                    placeholder="Por que a ação corretiva do PDCA anterior falhou em evitar a reincidência? Analise o modo de escape..."
                    className="w-full text-xs font-mono p-2 bg-white border border-red-700"
                  />
                </div>
              )}

              {/* 4.3 Diagrama de Ishikawa 6M (Espinha de Peixe) */}
              <IshikawaFishbone
                data={d4Ishikawa}
                onChange={setD4Ishikawa}
                problemTitle={d2NonConformityDescription}
              />

              {/* Perguntas Complementares da Análise de Processo & Locais */}
              <div className="p-3 bg-slate-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <span className="text-xs font-mono font-black uppercase text-[#141414]">
                  Análise Complementar do Fluxo & Locais da Causa
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-[#141414]">
                        É possível a reprodução do problema?
                      </label>
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="canReproduce"
                            checked={d4IshikawaQuestions.canReproduce}
                            onChange={() => setD4IshikawaQuestions({ ...d4IshikawaQuestions, canReproduce: true })}
                            className="accent-purple-600"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="canReproduce"
                            checked={!d4IshikawaQuestions.canReproduce}
                            onChange={() => setD4IshikawaQuestions({ ...d4IshikawaQuestions, canReproduce: false })}
                            className="accent-purple-600"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={d4IshikawaQuestions.reproductionResult}
                      onChange={(e) => setD4IshikawaQuestions({ ...d4IshikawaQuestions, reproductionResult: e.target.value })}
                      placeholder="Se sim, qual resultado? Se não, por que não?"
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#141414]">Fluxo de Processo foi avaliado?</span>
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="procFlow"
                            checked={d4IshikawaQuestions.processFlowEvaluated}
                            onChange={() => setD4IshikawaQuestions({ ...d4IshikawaQuestions, processFlowEvaluated: true })}
                            className="accent-purple-600"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="procFlow"
                            checked={!d4IshikawaQuestions.processFlowEvaluated}
                            onChange={() => setD4IshikawaQuestions({ ...d4IshikawaQuestions, processFlowEvaluated: false })}
                            className="accent-purple-600"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#141414]">Analisadas causas para processos posteriores?</span>
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="subProc"
                            checked={d4IshikawaQuestions.subsequentProcessesAnalyzed}
                            onChange={() => setD4IshikawaQuestions({ ...d4IshikawaQuestions, subsequentProcessesAnalyzed: true })}
                            className="accent-purple-600"
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="subProc"
                            checked={!d4IshikawaQuestions.subsequentProcessesAnalyzed}
                            onChange={() => setD4IshikawaQuestions({ ...d4IshikawaQuestions, subsequentProcessesAnalyzed: false })}
                            className="accent-purple-600"
                          />
                          <span>Não</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-0.5">
                      Possível Local da Ocorrência
                    </label>
                    <input
                      type="text"
                      value={d4IshikawaQuestions.occurrenceLocation}
                      onChange={(e) => setD4IshikawaQuestions({ ...d4IshikawaQuestions, occurrenceLocation: e.target.value })}
                      placeholder="ex: Máquina 171 / Op. 10..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-0.5">
                      Possível Local de Falha na Detecção
                    </label>
                    <input
                      type="text"
                      value={d4IshikawaQuestions.detectionFailureLocation}
                      onChange={(e) => setD4IshikawaQuestions({ ...d4IshikawaQuestions, detectionFailureLocation: e.target.value })}
                      placeholder="ex: Máquina 171 / Op. 10 / Inspeção Final..."
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>
                </div>
              </div>

              {/* 4.4 5 Porquês (Ocorrência, Detecção, Sistêmico) */}
              <div className="p-4 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-4">
                <div className="border-b border-[#141414] pb-2">
                  <h4 className="text-xs font-mono font-black uppercase text-[#141414]">
                    4.4 - Desdobramento dos 5 Porquês (Triplo Eixo)
                  </h4>
                  <p className="text-[10px] font-mono text-[#141414]/60">
                    Preencha a cadeia causal de Porquês para Ocorrência (falha), Detecção (escape) e Sistêmico (gestão), definindo a Causa Raiz conclusiva abaixo de cada eixo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 5 Porquês de Ocorrência */}
                  <div className="p-3 bg-red-50/50 border-2 border-red-400 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-red-300 pb-1">
                        <span className="text-xs font-mono font-black text-red-900 uppercase">
                          1. Ocorrência (Por que ocorreu?)
                        </span>
                        <span className="text-[9px] font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 border border-red-300">
                          Falha Técnica
                        </span>
                      </div>
                      {d4FiveWhys.occurrence.map((why, idx) => (
                        <div key={`occ-${idx}`} className="flex items-center space-x-1">
                          <span className="text-[10px] font-mono font-bold text-red-800 w-5 shrink-0">
                            {idx + 1}P:
                          </span>
                          <input
                            type="text"
                            value={why}
                            placeholder={`Por quê ${idx + 1}...`}
                            onChange={(e) => {
                              const upd = [...d4FiveWhys.occurrence];
                              upd[idx] = e.target.value;
                              setD4FiveWhys({ ...d4FiveWhys, occurrence: upd });
                            }}
                            className="flex-1 text-xs font-mono p-1 bg-white border border-[#141414] focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Campo de Causa Raiz da Ocorrência */}
                    <div className="pt-2 border-t-2 border-red-300 mt-2 space-y-1">
                      <label className="block text-[11px] font-mono font-black text-red-950 uppercase">
                        🎯 Causa Raiz de Ocorrência *
                      </label>
                      <textarea
                        rows={2}
                        value={d4FiveWhys.occurrenceRootCause || ""}
                        onChange={(e) => setD4FiveWhys({ ...d4FiveWhys, occurrenceRootCause: e.target.value })}
                        placeholder="Conclusão da causa raiz da ocorrência (mecanismo que gerou a falha no processo)..."
                        className="w-full text-xs font-mono p-1.5 bg-white border-2 border-red-600 text-red-950 font-medium placeholder-red-950/40 focus:outline-none focus:ring-1 focus:ring-red-600 shadow-[2px_2px_0px_#b91c1c]"
                      />
                    </div>
                  </div>

                  {/* 5 Porquês de Detecção */}
                  <div className="p-3 bg-blue-50/50 border-2 border-blue-400 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-blue-300 pb-1">
                        <span className="text-xs font-mono font-black text-blue-900 uppercase">
                          2. Detecção (Por que escapou?)
                        </span>
                        <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 border border-blue-300">
                          Falha no Controle
                        </span>
                      </div>
                      {d4FiveWhys.detection.map((why, idx) => (
                        <div key={`det-${idx}`} className="flex items-center space-x-1">
                          <span className="text-[10px] font-mono font-bold text-blue-800 w-5 shrink-0">
                            {idx + 1}P:
                          </span>
                          <input
                            type="text"
                            value={why}
                            placeholder={`Por quê ${idx + 1}...`}
                            onChange={(e) => {
                              const upd = [...d4FiveWhys.detection];
                              upd[idx] = e.target.value;
                              setD4FiveWhys({ ...d4FiveWhys, detection: upd });
                            }}
                            className="flex-1 text-xs font-mono p-1 bg-white border border-[#141414] focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Campo de Causa Raiz da Detecção */}
                    <div className="pt-2 border-t-2 border-blue-300 mt-2 space-y-1">
                      <label className="block text-[11px] font-mono font-black text-blue-950 uppercase">
                        🎯 Causa Raiz de Detecção / Escape *
                      </label>
                      <textarea
                        rows={2}
                        value={d4FiveWhys.detectionRootCause || ""}
                        onChange={(e) => setD4FiveWhys({ ...d4FiveWhys, detectionRootCause: e.target.value })}
                        placeholder="Conclusão da causa raiz da detecção (por que os dispositivos/inspeções não pegaram)..."
                        className="w-full text-xs font-mono p-1.5 bg-white border-2 border-blue-600 text-blue-950 font-medium placeholder-blue-950/40 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-[2px_2px_0px_#1d4ed8]"
                      />
                    </div>
                  </div>

                  {/* 5 Porquês Sistêmicos */}
                  <div className="p-3 bg-emerald-50/50 border-2 border-emerald-400 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-emerald-300 pb-1">
                        <span className="text-xs font-mono font-black text-emerald-900 uppercase">
                          3. Sistêmico (Por que o sistema falhou?)
                        </span>
                        <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 border border-emerald-300">
                          Gestão & FMEA
                        </span>
                      </div>
                      {d4FiveWhys.systemic.map((why, idx) => (
                        <div key={`sys-${idx}`} className="flex items-center space-x-1">
                          <span className="text-[10px] font-mono font-bold text-emerald-800 w-5 shrink-0">
                            {idx + 1}P:
                          </span>
                          <input
                            type="text"
                            value={why}
                            placeholder={`Por quê ${idx + 1}...`}
                            onChange={(e) => {
                              const upd = [...d4FiveWhys.systemic];
                              upd[idx] = e.target.value;
                              setD4FiveWhys({ ...d4FiveWhys, systemic: upd });
                            }}
                            className="flex-1 text-xs font-mono p-1 bg-white border border-[#141414] focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Campo de Causa Raiz Sistêmica */}
                    <div className="pt-2 border-t-2 border-emerald-300 mt-2 space-y-1">
                      <label className="block text-[11px] font-mono font-black text-emerald-950 uppercase">
                        🎯 Causa Raiz Sistêmica / Gestão *
                      </label>
                      <textarea
                        rows={2}
                        value={d4FiveWhys.systemicRootCause || ""}
                        onChange={(e) => setD4FiveWhys({ ...d4FiveWhys, systemicRootCause: e.target.value })}
                        placeholder="Conclusão da causa raiz sistêmica (lacuna em procedimentos, treinamento, PFMEA ou auditorias)..."
                        className="w-full text-xs font-mono p-1.5 bg-white border-2 border-emerald-600 text-emerald-950 font-medium placeholder-emerald-950/40 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-[2px_2px_0px_#047857]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: D5 - AÇÕES CORRETIVAS */}
          {activeTab === "d5" && (
            <div className="space-y-6">
              <div className="p-3 bg-emerald-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>D5 - Definição das Ações Corretivas Estruturadas</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Defina as ações corretivas para cada eixo causal. Utilize os botões para incluir mais ações ou excluir linhas não utilizadas.
                </p>
              </div>

              {/* 5.1 Ações para Ocorrência */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-900 border border-red-600 font-mono text-[10px] font-black uppercase">
                      5.1 Eixo Ocorrência
                    </span>
                    <span className="text-xs font-mono font-bold text-[#141414]">
                      Ações para Eliminar a Causa Raiz da Ocorrência ({d5OccurrenceActions.length})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {d5OccurrenceActions.some(a => !a.description.trim() && !a.responsible.trim()) && (
                      <button
                        type="button"
                        onClick={() => removeEmptyActions("occurrence")}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-[#141414] font-mono text-[10px] font-bold border border-[#141414] cursor-pointer transition-colors"
                        title="Remover linhas vazias"
                      >
                        Limpar Linhas Vazias
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => addAction("occurrence")}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold border border-[#141414] shadow-[2px_2px_0px_#141414] flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Adicionar Ação (Ocorrência)</span>
                    </button>
                  </div>
                </div>

                {d5OccurrenceActions.length === 0 ? (
                  <div className="p-4 bg-red-50/50 border border-dashed border-red-300 text-center space-y-2">
                    <p className="text-xs font-mono text-red-800">
                      Nenhuma ação de ocorrência cadastrada.
                    </p>
                    <button
                      type="button"
                      onClick={() => addAction("occurrence")}
                      className="px-3 py-1 bg-red-600 text-white font-mono text-xs font-bold border border-[#141414] cursor-pointer"
                    >
                      + Incluir Primeira Ação de Ocorrência
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {d5OccurrenceActions.map((action, idx) => (
                      <div key={action.id || `occ-act-${idx}`} className="flex items-center space-x-2 p-1.5 bg-red-50/30 border border-[#141414] hover:bg-red-50/60 transition-colors">
                        <span className="text-xs font-mono font-bold text-red-900 w-7 shrink-0 text-center">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={action.description}
                          placeholder={`Descrição da ação corretiva #${idx + 1} para ocorrência (eliminar causa raiz)...`}
                          onChange={(e) => updateAction("occurrence", idx, "description", e.target.value)}
                          className="flex-1 text-xs font-mono p-1.5 bg-white border border-[#141414] focus:ring-1 focus:ring-red-500"
                        />
                        <input
                          type="text"
                          value={action.responsible}
                          placeholder="Responsável..."
                          onChange={(e) => updateAction("occurrence", idx, "responsible", e.target.value)}
                          className="w-36 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                        <input
                          type="date"
                          value={action.targetDate}
                          onChange={(e) => updateAction("occurrence", idx, "targetDate", e.target.value)}
                          className="w-36 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                        <button
                          type="button"
                          onClick={() => removeAction("occurrence", idx)}
                          className="p-1.5 bg-white hover:bg-red-600 text-red-600 hover:text-white border border-red-600 shadow-[1px_1px_0px_#141414] cursor-pointer transition-colors shrink-0"
                          title={`Excluir ação #${idx + 1} de ocorrência`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5.2 Ações para Detecção */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-600 font-mono text-[10px] font-black uppercase">
                      5.2 Eixo Detecção
                    </span>
                    <span className="text-xs font-mono font-bold text-[#141414]">
                      Ações para Reforçar a Detecção e Evitar Escape ({d5DetectionActions.length})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {d5DetectionActions.some(a => !a.description.trim() && !a.responsible.trim()) && (
                      <button
                        type="button"
                        onClick={() => removeEmptyActions("detection")}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-[#141414] font-mono text-[10px] font-bold border border-[#141414] cursor-pointer transition-colors"
                        title="Remover linhas vazias"
                      >
                        Limpar Linhas Vazias
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => addAction("detection")}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold border border-[#141414] shadow-[2px_2px_0px_#141414] flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Adicionar Ação (Detecção)</span>
                    </button>
                  </div>
                </div>

                {d5DetectionActions.length === 0 ? (
                  <div className="p-4 bg-blue-50/50 border border-dashed border-blue-300 text-center space-y-2">
                    <p className="text-xs font-mono text-blue-800">
                      Nenhuma ação de detecção cadastrada.
                    </p>
                    <button
                      type="button"
                      onClick={() => addAction("detection")}
                      className="px-3 py-1 bg-blue-600 text-white font-mono text-xs font-bold border border-[#141414] cursor-pointer"
                    >
                      + Incluir Primeira Ação de Detecção
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {d5DetectionActions.map((action, idx) => (
                      <div key={action.id || `det-act-${idx}`} className="flex items-center space-x-2 p-1.5 bg-blue-50/30 border border-[#141414] hover:bg-blue-50/60 transition-colors">
                        <span className="text-xs font-mono font-bold text-blue-900 w-7 shrink-0 text-center">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={action.description}
                          placeholder={`Descrição da ação corretiva #${idx + 1} para detecção (poka-yoke, sensores, gabaritos)...`}
                          onChange={(e) => updateAction("detection", idx, "description", e.target.value)}
                          className="flex-1 text-xs font-mono p-1.5 bg-white border border-[#141414] focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={action.responsible}
                          placeholder="Responsável..."
                          onChange={(e) => updateAction("detection", idx, "responsible", e.target.value)}
                          className="w-36 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                        <input
                          type="date"
                          value={action.targetDate}
                          onChange={(e) => updateAction("detection", idx, "targetDate", e.target.value)}
                          className="w-36 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                        <button
                          type="button"
                          onClick={() => removeAction("detection", idx)}
                          className="p-1.5 bg-white hover:bg-red-600 text-red-600 hover:text-white border border-red-600 shadow-[1px_1px_0px_#141414] cursor-pointer transition-colors shrink-0"
                          title={`Excluir ação #${idx + 1} de detecção`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5.3 Ações Sistêmicas */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-600 font-mono text-[10px] font-black uppercase">
                      5.3 Eixo Sistêmico
                    </span>
                    <span className="text-xs font-mono font-bold text-[#141414]">
                      Ações Corretivas Sistêmicas (Gestão, Procedimentos & FMEA) ({d5SystemicActions.length})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {d5SystemicActions.some(a => !a.description.trim() && !a.responsible.trim()) && (
                      <button
                        type="button"
                        onClick={() => removeEmptyActions("systemic")}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-[#141414] font-mono text-[10px] font-bold border border-[#141414] cursor-pointer transition-colors"
                        title="Remover linhas vazias"
                      >
                        Limpar Linhas Vazias
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => addAction("systemic")}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold border border-[#141414] shadow-[2px_2px_0px_#141414] flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Adicionar Ação (Sistêmica)</span>
                    </button>
                  </div>
                </div>

                {d5SystemicActions.length === 0 ? (
                  <div className="p-4 bg-emerald-50/50 border border-dashed border-emerald-300 text-center space-y-2">
                    <p className="text-xs font-mono text-emerald-800">
                      Nenhuma ação sistêmica cadastrada.
                    </p>
                    <button
                      type="button"
                      onClick={() => addAction("systemic")}
                      className="px-3 py-1 bg-emerald-600 text-white font-mono text-xs font-bold border border-[#141414] cursor-pointer"
                    >
                      + Incluir Primeira Ação Sistêmica
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {d5SystemicActions.map((action, idx) => (
                      <div key={action.id || `sys-act-${idx}`} className="flex items-center space-x-2 p-1.5 bg-emerald-50/30 border border-[#141414] hover:bg-emerald-50/60 transition-colors">
                        <span className="text-xs font-mono font-bold text-emerald-900 w-7 shrink-0 text-center">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={action.description}
                          placeholder={`Descrição da ação corretiva sistêmica #${idx + 1} (revisão de normas, treinamentos, PFMEA)...`}
                          onChange={(e) => updateAction("systemic", idx, "description", e.target.value)}
                          className="flex-1 text-xs font-mono p-1.5 bg-white border border-[#141414] focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={action.responsible}
                          placeholder="Responsável..."
                          onChange={(e) => updateAction("systemic", idx, "responsible", e.target.value)}
                          className="w-36 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                        <input
                          type="date"
                          value={action.targetDate}
                          onChange={(e) => updateAction("systemic", idx, "targetDate", e.target.value)}
                          className="w-36 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                        />
                        <button
                          type="button"
                          onClick={() => removeAction("systemic", idx)}
                          className="p-1.5 bg-white hover:bg-red-600 text-red-600 hover:text-white border border-red-600 shadow-[1px_1px_0px_#141414] cursor-pointer transition-colors shrink-0"
                          title={`Excluir ação #${idx + 1} sistêmica`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: D6 - IMPLEMENTAÇÃO DAS AÇÕES CORRETIVAS (G / Y / R) */}
          {activeTab === "d6" && (
            <div className="space-y-6">
              <div className="p-3 bg-slate-100 border-2 border-[#141414] shadow-[3px_3px_0px_#141414] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-0.5 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#141414]" />
                    <span>D6 - Implementação das Ações Corretivas (Status G/Y/R)</span>
                  </h4>
                  <p className="text-[11px] font-mono text-[#141414]/70">
                    Acompanhe o status e as evidências de cada ação corretiva.
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center space-x-2 text-[10px] font-mono font-bold">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white border border-[#141414]">G: Concluído</span>
                  <span className="px-2 py-0.5 bg-amber-400 text-[#141414] border border-[#141414]">Y: Pendente</span>
                  <span className="px-2 py-0.5 bg-red-600 text-white border border-[#141414]">R: Atrasado</span>
                </div>
              </div>

              {/* Perguntas Críticas D6 / FMEA */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <span className="text-xs font-mono font-black uppercase text-[#141414]">
                  Avaliação de Impactos & Integração FMEA
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-300 space-y-1">
                    <span className="text-xs font-mono font-bold block text-[#141414]">
                      As Ações (D5/D6) Poderão Gerar Modos De Falha Não Previstos no PFMEA?
                    </span>
                    <div className="flex items-center space-x-3 pt-1 text-xs font-mono">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="sideEffects"
                          checked={d6SideEffectsRisk}
                          onChange={() => setD6SideEffectsRisk(true)}
                          className="accent-purple-600"
                        />
                        <span className="font-bold text-red-700">Sim (Risco)</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="sideEffects"
                          checked={!d6SideEffectsRisk}
                          onChange={() => setD6SideEffectsRisk(false)}
                          className="accent-purple-600"
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-300 space-y-1">
                    <span className="text-xs font-mono font-bold block text-[#141414]">
                      O Modo De Falha Referente À Reclamação Está Previsto no FMEA?
                    </span>
                    <div className="flex items-center space-x-3 pt-1 text-xs font-mono">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="predictedInFmea"
                          checked={d6PredictedInFmea}
                          onChange={() => setD6PredictedInFmea(true)}
                          className="accent-emerald-600"
                        />
                        <span>Sim</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="predictedInFmea"
                          checked={!d6PredictedInFmea}
                          onChange={() => setD6PredictedInFmea(false)}
                          className="accent-emerald-600"
                        />
                        <span className="font-bold text-amber-700">Não</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-300 space-y-1">
                    <span className="text-xs font-mono font-bold block text-[#141414]">
                      A Eficácia das ações Implementadas Foram Robustas?
                    </span>
                    <div className="flex items-center space-x-3 pt-1 text-xs font-mono">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="efficacyRobust"
                          checked={d6EfficacyRobust}
                          onChange={() => setD6EfficacyRobust(true)}
                          className="accent-emerald-600"
                        />
                        <span className="font-bold text-emerald-700">Sim</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="efficacyRobust"
                          checked={!d6EfficacyRobust}
                          onChange={() => setD6EfficacyRobust(false)}
                          className="accent-emerald-600"
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Implementação D6 com Responsável, Data e Status G/Y/R */}
              <div className="space-y-4">
                {/* Resumo dos Status de Ações */}
                <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black uppercase text-[#141414]">
                      Acompanhamento de Status das Ações Corretivas (G / Y / R)
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase border ${
                      areAllD6ActionsG ? "bg-emerald-600 text-white border-emerald-800" : "bg-amber-400 text-[#141414] border-[#141414]"
                    }`}>
                      {areAllD6ActionsG ? "100% G (OK) — Liberado para D8" : `${pendingActionsCount} Ação(ões) Pendente(s)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-50 border border-[#141414] flex items-center justify-between">
                      <span className="text-[10px] text-[#141414]/70 uppercase">Total Ações:</span>
                      <span className="font-bold">{allActiveD5Actions.length}</span>
                    </div>
                    <div className="p-2 bg-emerald-50 border border-emerald-600 flex items-center justify-between text-emerald-900">
                      <span className="text-[10px] uppercase font-bold">G (Concluído/OK):</span>
                      <span className="font-black text-sm">{allActiveD5Actions.filter(a => a.status === "G").length}</span>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-600 flex items-center justify-between text-amber-900">
                      <span className="text-[10px] uppercase font-bold">Y (Em Andamento):</span>
                      <span className="font-black text-sm">{allActiveD5Actions.filter(a => a.status === "Y").length}</span>
                    </div>
                    <div className="p-2 bg-red-50 border border-red-600 flex items-center justify-between text-red-900">
                      <span className="text-[10px] uppercase font-bold">R (Atrasado):</span>
                      <span className="font-black text-sm">{allActiveD5Actions.filter(a => a.status === "R").length}</span>
                    </div>
                  </div>
                </div>

                {[
                  { title: "Ações para Ocorrência (Causa Raiz)", list: d5OccurrenceActions, type: "occurrence" as const },
                  { title: "Ações para Detecção (Modo de Escape)", list: d5DetectionActions, type: "detection" as const },
                  { title: "Ações Sistêmicas (FMEA / Padronização)", list: d5SystemicActions, type: "systemic" as const },
                ].map((group) => (
                  <div key={group.title} className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-2.5">
                    <span className="text-xs font-mono font-black uppercase text-[#141414] block border-b border-[#141414] pb-1">
                      {group.title}
                    </span>
                    {group.list.map((action, idx) => (
                      <div key={`${group.type}-${idx}`} className="p-2.5 bg-slate-50 border border-[#141414] flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <span className="text-xs font-mono font-black text-[#141414] w-6 shrink-0">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={action.description}
                            placeholder="Descrição da ação corretiva..."
                            onChange={(e) => updateAction(group.type, idx, "description", e.target.value)}
                            className="flex-1 text-xs font-mono p-1.5 bg-white border border-[#141414] font-medium"
                          />
                          <input
                            type="text"
                            value={action.responsible}
                            placeholder="Responsável..."
                            onChange={(e) => updateAction(group.type, idx, "responsible", e.target.value)}
                            className="w-full sm:w-36 text-xs font-mono p-1.5 bg-white border border-[#141414] font-bold"
                          />
                          <input
                            type="date"
                            value={action.targetDate}
                            onChange={(e) => updateAction(group.type, idx, "targetDate", e.target.value)}
                            className="w-full sm:w-32 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-slate-200">
                          <input
                            type="text"
                            value={action.evidence || ""}
                            placeholder="Evidência prática de conclusão / Homologação..."
                            onChange={(e) => updateAction(group.type, idx, "evidence", e.target.value)}
                            className="flex-1 text-xs font-mono p-1.5 bg-white border border-[#141414]"
                          />
                          
                          {/* Status G/Y/R Selector com Legend */}
                          <div className="flex items-center space-x-1 shrink-0 self-end sm:self-auto">
                            <span className="text-[10px] font-mono font-bold text-[#141414]/70 mr-1">Status:</span>
                            <button
                              type="button"
                              onClick={() => updateAction(group.type, idx, "status", "G")}
                              className={`px-2.5 py-1 font-mono font-black text-xs border border-[#141414] cursor-pointer flex items-center space-x-1 ${
                                action.status === "G" 
                                  ? "bg-emerald-600 text-white shadow-[2px_2px_0px_#141414] ring-2 ring-emerald-400" 
                                  : "bg-white text-emerald-800 hover:bg-emerald-50"
                              }`}
                              title="G (Verde) - OK / Concluído"
                            >
                              <span>G</span>
                              <span className="text-[9px]">OK</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateAction(group.type, idx, "status", "Y")}
                              className={`px-2.5 py-1 font-mono font-black text-xs border border-[#141414] cursor-pointer flex items-center space-x-1 ${
                                action.status === "Y" 
                                  ? "bg-amber-400 text-[#141414] shadow-[2px_2px_0px_#141414] ring-2 ring-amber-300" 
                                  : "bg-white text-amber-800 hover:bg-amber-50"
                              }`}
                              title="Y (Amarelo) - Em Andamento / Pendente"
                            >
                              <span>Y</span>
                              <span className="text-[9px]">Pendente</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateAction(group.type, idx, "status", "R")}
                              className={`px-2.5 py-1 font-mono font-black text-xs border border-[#141414] cursor-pointer flex items-center space-x-1 ${
                                action.status === "R" 
                                  ? "bg-red-600 text-white shadow-[2px_2px_0px_#141414] ring-2 ring-red-400" 
                                  : "bg-white text-red-800 hover:bg-red-50"
                              }`}
                              title="R (Vermelho) - Atrasado / Crítico"
                            >
                              <span>R</span>
                              <span className="text-[9px]">Atrasado</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* 6.1 Comprovante de Eficácia */}
              <div className="p-3 bg-emerald-50 border-2 border-emerald-700 shadow-[3px_3px_0px_#141414] space-y-2">
                <span className="text-xs font-mono font-black text-emerald-950 uppercase">
                  6.1 - Comprovante de Eficácia das Ações Implementadas
                </span>
                <textarea
                  rows={3}
                  value={d6EfficacyProof}
                  onChange={(e) => setD6EfficacyProof(e.target.value)}
                  placeholder="Relatório de validação: Lotes auditados, índice de refugo pós-implementação, auditoria de processo de 30 dias com 0 PPM..."
                  className="w-full text-xs font-mono p-2 bg-white border border-emerald-700"
                />
              </div>
            </div>
          )}

          {/* TAB 7: D7 - PREVENÇÃO DE REOCORRÊNCIA */}
          {activeTab === "d7" && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-teal-700" />
                  <span>D7 - Prevenção de Reocorrência (Padronização, Abrangência & Lições Aprendidas)</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Retroalimentação dos documentos da qualidade (PFMEA, Plano de Controle, Instrução de Trabalho), Abrangência (Yokoten) e Lições Aprendidas.
                </p>
              </div>

              {/* 7.1 Yokoten / Abrangência */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black uppercase text-[#141414]">
                    7.1 - Abrangência / Yokoten (Outros Processos / Peças Similares)
                  </span>
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="yokotenApp"
                        checked={d7Yokoten.applicableToOtherProcesses}
                        onChange={() => setD7Yokoten({ ...d7Yokoten, applicableToOtherProcesses: true })}
                        className="accent-teal-600"
                      />
                      <span className="font-bold text-teal-800">Sim (Aplicável)</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="yokotenApp"
                        checked={!d7Yokoten.applicableToOtherProcesses}
                        onChange={() => setD7Yokoten({ ...d7Yokoten, applicableToOtherProcesses: false })}
                        className="accent-teal-600"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={d7Yokoten.scopeItems}
                  onChange={(e) => setD7Yokoten({ ...d7Yokoten, scopeItems: e.target.value })}
                  placeholder="Se sim, liste os itens/linhas de abrangência (ex: Peças famílias ZB-200, Máquinas 170, 172)..."
                  className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                />
              </div>

              {/* 7.2 Lições Aprendidas & Integração FMEA */}
              <div className="p-3 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-2">
                <span className="text-xs font-mono font-black uppercase text-[#141414]">
                  7.2 - Lições Aprendidas & Retroalimentação do FMEA
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#141414] mb-0.5">
                      Lições Aprendidas Nº
                    </label>
                    <input
                      type="text"
                      value={d7LessonsLearned.lessonsLearnedNumber}
                      onChange={(e) => setD7LessonsLearned({ ...d7LessonsLearned, lessonsLearnedNumber: e.target.value })}
                      placeholder="ex: 2415"
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#141414] mb-0.5">
                      Data de Lançamento
                    </label>
                    <input
                      type="date"
                      value={d7LessonsLearned.releaseDate}
                      onChange={(e) => setD7LessonsLearned({ ...d7LessonsLearned, releaseDate: e.target.value })}
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#141414] mb-0.5">
                      FMEA Nº
                    </label>
                    <input
                      type="text"
                      value={d7LessonsLearned.fmeaNumber}
                      onChange={(e) => setD7LessonsLearned({ ...d7LessonsLearned, fmeaNumber: e.target.value })}
                      placeholder="ex: 027-24"
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#141414] mb-0.5">
                      Data Retroalimentação FMEA
                    </label>
                    <input
                      type="date"
                      value={d7LessonsLearned.fmeaFeedbackDate}
                      onChange={(e) => setD7LessonsLearned({ ...d7LessonsLearned, fmeaFeedbackDate: e.target.value })}
                      className="w-full text-xs font-mono p-1.5 bg-white border border-[#141414]"
                    />
                  </div>
                </div>
              </div>

              {/* Padronização */}
              <div className="p-4 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-3">
                <label className="block text-xs font-mono font-bold uppercase text-[#141414]">
                  Padronização e Atualizações Documentais *
                </label>
                <textarea
                  rows={3}
                  value={d7Standardization}
                  onChange={(e) => setD7Standardization(e.target.value)}
                  placeholder="Detalhes da revisão do PFMEA, atualização do Plano de Controle, aprovação da IT e treinamento operacional..."
                  className="w-full text-xs font-mono p-2 bg-white border border-[#141414]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center space-x-2 p-2 bg-slate-50 border border-[#141414] text-xs font-mono cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span>PFMEA Atualizado</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-slate-50 border border-[#141414] text-xs font-mono cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span>Plano de Controle Revisado</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-slate-50 border border-[#141414] text-xs font-mono cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span>Instrução de Trabalho Validada</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: D8 - FECHAMENTO */}
          {activeTab === "d8" && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border-2 border-[#141414] shadow-[3px_3px_0px_#141414]">
                <h4 className="text-xs font-mono font-black uppercase text-[#141414] mb-1 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>D8 - Fechamento, Aprovação Formal & Assinaturas</span>
                </h4>
                <p className="text-[11px] font-mono text-[#141414]/70">
                  Encerramento formal do relatório 8D com assinaturas de Auditor, Líder, Superior e Gerente.
                </p>
              </div>

              {/* Fechamento Checklist */}
              <div className="p-4 bg-white border-2 border-[#141414] shadow-[3px_3px_0px_#141414] space-y-4">
                <div className="border-b border-[#141414] pb-2 flex items-center justify-between">
                  <h5 className="text-xs font-mono font-black uppercase text-[#141414]">
                    Auditoria de Conformidade D1 à D8
                  </h5>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                    areAllD6ActionsG ? "bg-emerald-100 text-emerald-900 border-emerald-500" : "bg-red-100 text-red-900 border-red-500"
                  }`}>
                    {areAllD6ActionsG ? "Requisito D6 (100% G): Atendido" : "Requisito D6 (100% G): Pendente"}
                  </span>
                </div>

                {/* Banner de Validação da Regra D6 -> D8 */}
                <div className={`p-3 border-2 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                  areAllD6ActionsG 
                    ? "bg-emerald-50 border-emerald-600 text-emerald-950" 
                    : "bg-red-50 border-red-600 text-red-950"
                }`}>
                  <div className="flex items-start space-x-2.5">
                    {areAllD6ActionsG ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-black block uppercase text-xs">
                        {areAllD6ActionsG 
                          ? "✓ Requisito D6 Homologado: 100% das Ações em G (OK)" 
                          : "⛔ Bloqueio de Aprovação D8: Ações Pendentes no D6"}
                      </span>
                      <span className="text-[11px] leading-tight block mt-0.5">
                        {areAllD6ActionsG 
                          ? "Todas as ações corretivas de Ocorrência, Detecção e Sistêmica estão com status verde (G). O 8D/PDCA está apto para aprovação e encerramento formal." 
                          : "Regra IATF/SGQ: O relatório 8D NÃO pode ser aprovado e nem concluído (Status 'Fechado') enquanto houver ações nas legendas Y (Em Andamento) ou R (Atrasado)."}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase border shrink-0 ${
                    areAllD6ActionsG ? "bg-emerald-600 text-white border-emerald-800" : "bg-red-600 text-white border-red-800"
                  }`}>
                    {areAllD6ActionsG ? "Aprovação Liberada" : `Bloqueado (${pendingActionsCount} Pendente${pendingActionsCount > 1 ? "s" : ""})`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "D1: Equipe Formada", ok: stageStatus.d1 },
                    { label: "D2: 5W2H Descrito", ok: stageStatus.d2 },
                    { label: "D3: Contenção Realizada", ok: stageStatus.d3 },
                    { label: "D4: Causa Raiz Fechada", ok: stageStatus.d4 },
                    { label: "D5: Ações Definidas", ok: stageStatus.d5 },
                    { label: "D6: Implementação G", ok: stageStatus.d6 },
                    { label: "D7: Padronização", ok: stageStatus.d7 },
                    { label: "D8: Validação Qualidade", ok: areAllD6ActionsG && Boolean(d8QualityApproval || d8Approvals.auditor) },
                  ].map((chk) => (
                    <div key={chk.label} className={`p-2 border border-[#141414] text-xs font-mono flex items-center space-x-1.5 ${chk.ok ? "bg-emerald-50 text-emerald-900 font-bold" : "bg-amber-50 text-amber-900"}`}>
                      {chk.ok ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{chk.label}</span>
                    </div>
                  ))}
                </div>

                {/* Assinaturas Formais com Trava de Bloqueio se houver pendências */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-black uppercase text-[#141414]">
                      Quadro de Assinaturas e Aprovações Formais
                    </span>
                    <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border ${
                      areAllD6ActionsG 
                        ? "bg-emerald-50 text-emerald-900 border-emerald-600" 
                        : "bg-red-50 text-red-900 border-red-600"
                    }`}>
                      {areAllD6ActionsG ? "✓ Assinaturas Habilitadas" : "🔒 Assinaturas Bloqueadas (Requer 100% G no D6)"}
                    </span>
                  </div>

                  {!areAllD6ActionsG && (
                    <div className="mb-2 p-2 bg-amber-50 border border-amber-400 text-amber-900 text-[11px] font-mono flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong>Atenção:</strong> Os campos de aprovação do Auditor, Líder, Superior e Gerente só aceitam homologação após todas as ações corretivas estarem concluídas (Status G).
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                        Auditor (SGQ)
                      </label>
                      <input
                        type="text"
                        disabled={!areAllD6ActionsG}
                        value={d8Approvals.auditor || d8QualityApproval}
                        onChange={(e) => {
                          setD8QualityApproval(e.target.value);
                          setD8Approvals({ ...d8Approvals, auditor: e.target.value });
                        }}
                        placeholder={areAllD6ActionsG ? "ex: Rogério" : "🔒 Requer 100% G no D6"}
                        className={`w-full text-xs font-mono p-2 border border-[#141414] ${
                          !areAllD6ActionsG ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-[#141414]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                        Líder do Time
                      </label>
                      <input
                        type="text"
                        disabled={!areAllD6ActionsG}
                        value={d8Approvals.teamLeader}
                        onChange={(e) => setD8Approvals({ ...d8Approvals, teamLeader: e.target.value })}
                        placeholder={areAllD6ActionsG ? "ex: Cicero" : "🔒 Requer 100% G no D6"}
                        className={`w-full text-xs font-mono p-2 border border-[#141414] ${
                          !areAllD6ActionsG ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-[#141414]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                        Superior
                      </label>
                      <input
                        type="text"
                        disabled={!areAllD6ActionsG}
                        value={d8Approvals.superior}
                        onChange={(e) => setD8Approvals({ ...d8Approvals, superior: e.target.value })}
                        placeholder={areAllD6ActionsG ? "ex: Cleber" : "🔒 Requer 100% G no D6"}
                        className={`w-full text-xs font-mono p-2 border border-[#141414] ${
                          !areAllD6ActionsG ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-[#141414]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                        Gerente de Planta
                      </label>
                      <input
                        type="text"
                        disabled={!areAllD6ActionsG}
                        value={d8Approvals.manager || d8ManagementApproval}
                        onChange={(e) => {
                          setD8ManagementApproval(e.target.value);
                          setD8Approvals({ ...d8Approvals, manager: e.target.value });
                        }}
                        placeholder={areAllD6ActionsG ? "ex: Evandro" : "🔒 Requer 100% G no D6"}
                        className={`w-full text-xs font-mono p-2 border border-[#141414] ${
                          !areAllD6ActionsG ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-[#141414]"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback SGQ e Status com Cores Dedicadas (Aberto: Amarelo, Em Validação: Azul, Fechado: Verde) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                      Data de Fechamento
                    </label>
                    <input
                      type="date"
                      value={d8ClosingDate}
                      onChange={(e) => setD8ClosingDate(e.target.value)}
                      className="w-full text-xs font-mono p-2 bg-white border border-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                      Status do 8D (D8)
                    </label>
                    
                    {/* Botoes de Status Coloridos */}
                    <div className="grid grid-cols-3 gap-1 mb-1.5">
                      <button
                        type="button"
                        onClick={() => setD8ClosingStatus("Aberto")}
                        className={`py-1.5 px-2 text-[11px] font-mono font-bold uppercase border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          d8ClosingStatus === "Aberto"
                            ? "bg-amber-400 text-amber-950 border-amber-600 shadow-[2px_2px_0px_#141414] ring-2 ring-amber-300 font-black"
                            : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-mono font-black text-amber-950">Aberto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setD8ClosingStatus("Em Validação")}
                        className={`py-1.5 px-2 text-[11px] font-mono font-bold uppercase border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          d8ClosingStatus === "Em Validação"
                            ? "bg-blue-600 text-white border-blue-800 shadow-[2px_2px_0px_#141414] ring-2 ring-blue-300 font-black"
                            : "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                        }`}
                      >
                        <span className={`text-[10px] uppercase font-mono font-black ${d8ClosingStatus === "Em Validação" ? "text-white" : "text-blue-900"}`}>
                          Em Validação
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!areAllD6ActionsG) {
                            alert("Aprovação D8 Bloqueada: O status 'Fechado' só é liberado quando 100% das ações em D6 estiverem concluídas com a legenda G (OK).");
                            return;
                          }
                          setD8ClosingStatus("Fechado");
                        }}
                        disabled={!areAllD6ActionsG}
                        className={`py-1.5 px-2 text-[11px] font-mono font-bold uppercase border transition-all flex flex-col items-center justify-center ${
                          !areAllD6ActionsG
                            ? "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
                            : d8ClosingStatus === "Fechado"
                            ? "bg-emerald-600 text-white border-emerald-800 shadow-[2px_2px_0px_#141414] ring-2 ring-emerald-300 font-black cursor-pointer"
                            : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer"
                        }`}
                        title={!areAllD6ActionsG ? "Bloqueado: Requer 100% G no D6" : "Marcar 8D como Fechado"}
                      >
                        <span className={`text-[10px] uppercase font-mono font-black ${
                          !areAllD6ActionsG 
                            ? "text-slate-400" 
                            : d8ClosingStatus === "Fechado" 
                            ? "text-white" 
                            : "text-emerald-900"
                        }`}>
                          {areAllD6ActionsG ? "Fechado" : "🔒 Fechado"}
                        </span>
                      </button>
                    </div>

                    <select
                      value={d8ClosingStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        if (val === "Fechado" && !areAllD6ActionsG) {
                          alert("Aprovação D8 Bloqueada: O status 'Fechado' só é liberado quando 100% das ações em D6 estiverem concluídas com a legenda G (OK).");
                          return;
                        }
                        setD8ClosingStatus(val);
                      }}
                      className={`w-full text-xs font-mono p-2 border-2 font-black ${
                        d8ClosingStatus === "Aberto"
                          ? "bg-amber-100 text-amber-900 border-amber-500"
                          : d8ClosingStatus === "Em Validação"
                          ? "bg-blue-100 text-blue-900 border-blue-500"
                          : "bg-emerald-100 text-emerald-900 border-emerald-500"
                      }`}
                    >
                      <option value="Aberto" className="bg-amber-50 text-amber-900 font-bold">● Aberto (Amarelo)</option>
                      <option value="Em Validação" className="bg-blue-50 text-blue-900 font-bold">● Em Validação (Azul)</option>
                      <option value="Fechado" disabled={!areAllD6ActionsG} className="bg-emerald-50 text-emerald-900 font-bold">
                        ● Fechado (Verde) {areAllD6ActionsG ? "— 100% Concluído" : "— Bloqueado (Requer 100% G no D6)"}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-[#141414] mb-1">
                      Feedback da Reprova / SGQ
                    </label>
                    <input
                      type="text"
                      value={d8Approvals.sgqFeedback || ""}
                      onChange={(e) => setD8Approvals({ ...d8Approvals, sgqFeedback: e.target.value })}
                      placeholder="Observações do auditor SGQ..."
                      className="w-full text-xs font-mono p-2 bg-white border border-[#141414]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM SUBMIT BAR */}
          <div className="bg-slate-100 p-4 border-2 border-[#141414] shadow-[4px_4px_0px_#141414] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#141414]">
              <span className="font-bold">Nº PDCA:</span>
              <span className="px-2 py-0.5 bg-[#141414] text-white font-mono font-black">{pdcaNumber}</span>
              <span className="text-[#141414]/60">|</span>
              <span className="font-bold">Cliente:</span>
              <span>{client || "(Não preenchido)"}</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-200 text-[#141414] font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar PDCA / 8D e Integrar ao PFMEA</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
