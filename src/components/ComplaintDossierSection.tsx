import React, { useState } from "react";
import { FastResponseComplaint, EightDReport, TeamMember, ContainmentAction, ActionItem, HenkatenItem } from "../types";
import { 
  Building2, 
  User, 
  Users, 
  Calendar, 
  Tag, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles, 
  CheckSquare, 
  Share2, 
  Award, 
  Eye, 
  Image as ImageIcon,
  AlertOctagon,
  FileCheck,
  Check,
  X
} from "lucide-react";

interface ComplaintDossierSectionProps {
  complaint: FastResponseComplaint;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ComplaintDossierSection: React.FC<ComplaintDossierSectionProps> = ({
  complaint,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "zb" | "d1" | "d2" | "d3" | "d4" | "d5" | "d6" | "d7" | "d8">("zb");
  const [isExpanded, setIsExpanded] = useState(true);

  const eightD = complaint.eightD;

  // Fallback data helper when eightD object is partially defined
  const pdcaNumber = eightD?.pdcaNumber || complaint.id;
  const client = eightD?.client || complaint.client;
  const partNumber = eightD?.partNumber || complaint.partNumber;
  const partName = eightD?.partName || complaint.partName;
  const departmentCausing = eightD?.departmentCausing || "Usinagem / Qualidade";
  const identifiedProblem = eightD?.identifiedProblem || complaint.realFailureMode || complaint.rawDescription;
  const occurrenceDate = complaint.date;
  const origin = complaint.origin;
  const processStep = complaint.processStep;
  const reportedSeverity = complaint.reportedSeverity;

  // D1
  const d1Leader: TeamMember = eightD?.d1Leader || {
    id: "leader-1",
    name: "Eng. Qualidade Assegurada",
    department: "Garantia da Qualidade",
    role: "Líder 8D / PDCA",
    email: "qualidade@empresa.com.br",
  };

  const d1Members: TeamMember[] = eightD?.d1Members && eightD.d1Members.length > 0 
    ? eightD.d1Members 
    : [
        { id: "m-1", name: "Resp. Processos", department: "Engenharia de Processos", role: "Engenheiro de Processo", email: "processos@empresa.com.br" },
        { id: "m-2", name: "Resp. Produção", department: "Produção / Usinagem", role: "Supervisor de Linha", email: "producao@empresa.com.br" },
      ];

  // D2
  const d2Type = eightD?.d2Type || (origin.includes("Cliente") || origin.includes("Montadora") ? "Externo - Reclamação de Clientes" : "Interno - Processos ZB");
  const d2Recurrence = eightD?.d2Recurrence !== undefined ? eightD.d2Recurrence : false;
  const d2SpecialCharacteristic = eightD?.d2SpecialCharacteristic !== undefined ? eightD.d2SpecialCharacteristic : true;
  const d2SpecialCharacteristicDetails = eightD?.d2SpecialCharacteristicDetails || "CC / SC Crítica (Segurança / Regulamentar)";
  const d2ClientDocNumber = eightD?.d2ClientDocNumber || `RNC-${complaint.id}`;
  const d2NonConformityDescription = eightD?.d2NonConformityDescription || complaint.rawDescription;
  const d2ImageOkUrl = eightD?.d2ImageOkUrl;
  const d2ImageNotOkUrl = eightD?.d2ImageNotOkUrl;
  const d2FiveWTwoH = eightD?.d2FiveWTwoH || {
    what: complaint.realFailureMode,
    why: complaint.impactDescription,
    where: complaint.processStep,
    when: complaint.date,
    who: client,
    how: "Detectado na linha de montagem durante operação",
    howMuch: "1 lote afetado",
  };

  // D3
  const d3ContainmentActions: ContainmentAction[] = eightD?.d3ContainmentActions && eightD.d3ContainmentActions.length > 0
    ? eightD.d3ContainmentActions
    : [
        {
          id: "cont-1",
          description: "Bloqueio de estoque e triagem 100% de peças em quarentena",
          location: "Estoque e Expedição",
          responsible: "Garantia da Qualidade",
          startDate: complaint.date,
          endDate: complaint.date,
          cutoffInvoice: "NF-PontoCorte-01",
          status: "Eficaz",
        }
      ];

  // D4
  const d4Henkaten = eightD?.d4Henkaten || {
    hasHenkaten: false,
    comments: "Nenhuma alteração de 4M/6M registrada nas 48h anteriores à ocorrência.",
    items: [
      { dimension: "Mão de Obra (Man)", changed: false, details: "Operadores qualificados e treinados" },
      { dimension: "Máquina (Machine)", changed: false, details: "Parâmetros conforme folha de processo" },
      { dimension: "Material (Material)", changed: false, details: "Matéria-prima de fornecedor homologado" },
      { dimension: "Método (Method)", changed: false, details: "Instrução de trabalho vigente" },
      { dimension: "Meio Ambiente (Milieu)", changed: false, details: "Condições normais de fábrica" },
      { dimension: "Medição (Measurement)", changed: false, details: "Dispositivos de medição calibrados" },
    ],
  };

  const d4Ishikawa = eightD?.d4Ishikawa || {
    manpower: ["Falta de atenção pontual no encaixe", "Dúvida no torque aplicado"],
    machine: ["Folga residual no dispositivo de fixação", "Desgaste na ferramenta"],
    measurement: ["Gabarito de verificação com folga de desgaste"],
    method: ["Falta de aviso sonoro no aperto do parafuso"],
    material: ["Variação dimensional no lote de fixadores"],
    environment: ["Iluminação baixa na bancada de montagem"],
    problemHead: identifiedProblem || complaint.realFailureMode,
  };

  const d4IshikawaStructured = eightD?.d4IshikawaStructured;

  const d4FiveWhys = eightD?.d4FiveWhys || {
    occurrence: [
      complaint.realFailureMode,
      "Dispositivo não travou a montagem incorreta",
      "Falta de sensor de posicionamento",
      "Processo dependente exclusivamente da atenção do operador",
      complaint.rootCause || "Ausência de dispositivo Poka-Yoke com intertravamento mecânico/elétrico",
    ],
    detection: [
      "Peça fora do padrão enviada ao cliente",
      "Inspeção por amostragem não detectou o defeito",
      "Gabarito de controle não bloqueava passagem",
      "Dispositivo com desgaste e resolução insuficiente",
      "Falta de barreira de detecção 100% automatizada no posto",
    ],
    systemic: [
      "Falha não prevista como de alta criticidade na concepção inicial",
      "FMEA inicial subestimou o índice de Ocorrência e Detecção",
      "Revisão periódica de lições aprendidas não realizada",
      "Falta de integração entre dados de campo e engenharia",
      "Processo de retroalimentação não automatizado",
    ],
  };

  // D5 & D6
  const d5OccurrenceActions: ActionItem[] = eightD?.d5OccurrenceActions && eightD.d5OccurrenceActions.length > 0
    ? eightD.d5OccurrenceActions
    : [
        {
          id: 1,
          description: "Instalação de sensor poka-yoke para travamento de montagem",
          responsible: "Engenharia de Processos",
          targetDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
          status: "Y",
          evidence: "Solicitação de compra de sensor SC-042",
        }
      ];

  const d5DetectionActions: ActionItem[] = eightD?.d5DetectionActions && eightD.d5DetectionActions.length > 0
    ? eightD.d5DetectionActions
    : [
        {
          id: 2,
          description: "Implementação de teste 100% com registro serial",
          responsible: "Qualidade Assegurada",
          targetDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
          status: "G",
          evidence: "Dispositivo de teste calibrado e ativo",
        }
      ];

  const d5SystemicActions: ActionItem[] = eightD?.d5SystemicActions && eightD.d5SystemicActions.length > 0
    ? eightD.d5SystemicActions
    : [
        {
          id: 3,
          description: "Retroalimentação obrigatória no PFMEA Master e Plano de Controle",
          responsible: "Eng. Qualidade",
          targetDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
          status: "G",
          evidence: "PFMEA Rev 04 atualizado",
        }
      ];

  const d6SideEffectsRisk = eightD?.d6SideEffectsRisk !== undefined ? eightD.d6SideEffectsRisk : false;
  const d6PredictedInFmea = eightD?.d6PredictedInFmea !== undefined ? eightD.d6PredictedInFmea : true;
  const d6EfficacyRobust = eightD?.d6EfficacyRobust !== undefined ? eightD.d6EfficacyRobust : true;
  const d6EfficacyProof = eightD?.d6EfficacyProof || "Lote piloto de 500 peças produzido sem nenhuma não conformidade registrada.";

  // D7
  const d7Standardization = eightD?.d7Standardization || "Atualização formal do PFMEA Master, Plano de Controle (PC) e Instrução de Trabalho (IT).";
  const d7Yokoten = eightD?.d7Yokoten || {
    applicableToOtherProcesses: true,
    scopeItems: `Aplicável às linhas similares do produto ${partName} e famílias de suportes.`,
  };
  const d7LessonsLearned = eightD?.d7LessonsLearned || {
    lessonsLearnedNumber: `LL-${complaint.id}`,
    releaseDate: complaint.date,
    fmeaNumber: `PFMEA-${partNumber}`,
    fmeaFeedbackDate: new Date().toISOString().slice(0, 10),
  };

  // D8
  const d8Approvals = eightD?.d8Approvals || {
    auditor: "Eng. Auditor SGQ",
    teamLeader: "Líder do Time 8D",
    superior: "Gerência Industrial",
    manager: "Diretoria de Operações",
    sgqFeedback: "8D aprovado conforme requisitos IATF 16949 / VDA.",
    stepApprovals: {
      d1: "APROVADO",
      d2: "APROVADO",
      d3: "APROVADO",
      d4: "APROVADO",
      d5: "APROVADO",
      d6: "APROVADO",
      d7: "APROVADO",
      d8: "APROVADO",
    }
  };
  const d8ClosingDate = eightD?.d8ClosingDate || new Date().toISOString().slice(0, 10);
  const d8ClosingStatus = eightD?.d8ClosingStatus || (complaint.status === "Retroalimentado no PFMEA" ? "Fechado" : "Em Validação");

  const tabs: { id: typeof activeTab; label: string; count?: string }[] = [
    { id: "all", label: "Exibir Todos os Campos" },
    { id: "zb", label: "0. Cabeçalho ZB" },
    { id: "d1", label: "D1. Equipe" },
    { id: "d2", label: "D2. 5W2H & Problema" },
    { id: "d3", label: "D3. Contenção" },
    { id: "d4", label: "D4. Causa Raiz (6M & 5W)" },
    { id: "d5", label: "D5. Ações Corretivas" },
    { id: "d6", label: "D6. Validação & FMEA" },
    { id: "d7", label: "D7. Yokoten & Padronização" },
    { id: "d8", label: "D8. Fechamento & Assinaturas" },
  ];

  return (
    <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
      {/* Top Main Dossier Bar */}
      <div className="bg-[#141414] text-[#E4E3E0] px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#141414]">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 bg-blue-600 text-white font-mono text-xs font-bold border border-blue-400">
            {pdcaNumber}
          </span>
          <span className="text-sm font-black text-[#E4E3E0]">
            {client}
          </span>
          <span className="text-xs text-[#E4E3E0]/40">|</span>
          <span className="text-xs font-mono text-[#E4E3E0]/90">
            PN: {partNumber} ({partName})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#222] text-[#E4E3E0]/80 border border-[#333]">
            Origem: {origin}
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
            complaint.status === "Retroalimentado no PFMEA"
              ? "bg-emerald-950 text-emerald-300 border-emerald-500"
              : "bg-amber-950 text-amber-300 border-amber-500"
          }`}>
            {complaint.status}
          </span>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase bg-blue-700 hover:bg-blue-600 text-white border border-blue-400 shadow-[2px_2px_0px_#141414] transition-all flex items-center space-x-1.5 cursor-pointer ml-1"
              title="Abrir formulário completo de edição 8D / PDCA"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Editar Dossiê Completo</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-2 py-1 text-[11px] font-mono font-bold uppercase bg-red-950 hover:bg-red-900 text-red-300 border border-red-700 hover:border-red-500 transition-colors flex items-center space-x-1 cursor-pointer"
              title={`Excluir ${complaint.id}`}
            >
              <Trash2 className="w-3 h-3 text-red-400" />
              <span>Excluir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1 text-[#E4E3E0]/70 hover:text-white transition-colors cursor-pointer ml-1"
            title={isExpanded ? "Recolher Dossiê" : "Expandir Dossiê"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Sub-Navigation Tabs for Dossier */}
          <div className="bg-[#E4E3E0] px-3 py-2 border-b border-[#141414] flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono font-black uppercase text-[#141414]/70 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#141414]" />
              <span>Dossiê 8D / PDCA:</span>
            </span>
            {tabs.map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#141414] text-white border-[#141414] shadow-[2px_2px_0px_#3b82f6]"
                      : "bg-white text-[#141414] border-[#141414] hover:bg-amber-100 shadow-[1px_1px_0px_#141414]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 space-y-4 bg-[#F8F9FA]">
            {/* 0. CABEÇALHO ZB & GERAL */}
            {(activeTab === "all" || activeTab === "zb") && (
              <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-blue-600 border border-[#141414]"></span>
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                      0. Cabeçalho ZB & Dados Cadastrais da Reclamação
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#141414]/60">Padrão Corporativo ZB</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">PDCA Nº</span>
                    <span className="font-mono font-black text-sm text-[#141414]">{pdcaNumber}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Cliente / Montadora</span>
                    <span className="font-bold text-sm text-[#141414]">{client}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Conjunto / Peça Nº</span>
                    <span className="font-mono font-bold text-sm text-blue-700">{partNumber}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Nome Conjunto / Peça</span>
                    <span className="font-bold text-xs text-[#141414]">{partName}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Departamento Causador</span>
                    <span className="font-medium text-xs text-[#141414]">{departmentCausing}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Data da Ocorrência</span>
                    <span className="font-mono text-xs text-[#141414]">{occurrenceDate}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Etapa Relacionada</span>
                    <span className="font-mono font-bold text-xs text-blue-700">{processStep}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Severidade Relatada</span>
                    <span className="font-mono font-black text-sm text-red-600">{reportedSeverity}/10</span>
                  </div>
                </div>

                {/* PROBLEMA IDENTIFICADO DESTACADO */}
                <div className="bg-amber-50/80 p-3.5 border-2 border-[#141414] shadow-[2px_2px_0px_#141414]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Problema Identificado (Cabeçalho PDCA)</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 border border-amber-800">
                      Campo Oficial ZB
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#141414] leading-relaxed">
                    {identifiedProblem || "Não preenchido."}
                  </p>
                </div>
              </div>
            )}

            {/* D1. FORMAÇÃO DE EQUIPE */}
            {(activeTab === "all" || activeTab === "d1") && (
              <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                      D1. Formação de Equipe Multidisciplinar
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#141414]/60">Líder & Membros 8D</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-blue-50/60 p-3 border border-blue-600 shadow-[2px_2px_0px_#141414] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-black uppercase text-blue-900">Líder do Time 8D</span>
                      <User className="w-3.5 h-3.5 text-blue-700" />
                    </div>
                    <div className="font-bold text-sm text-[#141414]">{d1Leader.name || "Engenheiro da Qualidade"}</div>
                    <div className="text-[11px] font-mono text-[#141414]/70">Depto: {d1Leader.department}</div>
                    <div className="text-[11px] font-mono text-[#141414]/70">Função: {d1Leader.role}</div>
                    {d1Leader.email && <div className="text-[10px] font-mono text-blue-800 truncate">{d1Leader.email}</div>}
                  </div>

                  <div className="md:col-span-2 bg-[#F8F9FA] p-3 border border-[#141414] space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-[#141414]/70 block">Membros Multidisciplinares</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {d1Members.map((m, idx) => (
                        <div key={`membro-${idx}`} className="bg-white p-2 border border-[#141414] text-xs">
                          <div className="font-bold text-[#141414]">{m.name || `Membro ${idx + 1}`}</div>
                          <div className="text-[10px] font-mono text-[#141414]/70">{m.department} • {m.role}</div>
                          {m.email && <div className="text-[9px] font-mono text-[#141414]/50 truncate">{m.email}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* D2. DESCRIÇÃO DO PROBLEMA & 5W2H */}
            {(activeTab === "all" || activeTab === "d2") && (
              <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                      D2. Descrição da Não Conformidade & Metodologia 5W2H
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#141414]/60">Detalhamento do Fato</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Tipo de Reclamação</span>
                    <span className="font-bold text-[#141414]">{d2Type}</span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Reincidência</span>
                    <span className={`font-black font-mono ${d2Recurrence ? "text-red-600" : "text-emerald-700"}`}>
                      {d2Recurrence ? "SIM (Reincidente)" : "NÃO (Ocorrência Nova)"}
                    </span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Característica Especial</span>
                    <span className="font-bold text-[#141414]">
                      {d2SpecialCharacteristic ? `SIM (${d2SpecialCharacteristicDetails})` : "NÃO"}
                    </span>
                  </div>

                  <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Nº Documento Cliente</span>
                    <span className="font-mono font-bold text-blue-700">{d2ClientDocNumber || "—"}</span>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] p-3 border border-[#141414]">
                  <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block mb-1">
                    Descrição Completa da Não Conformidade
                  </span>
                  <p className="text-xs text-[#141414] leading-relaxed">
                    {d2NonConformityDescription}
                  </p>
                </div>

                {/* 5W2H Grid */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono font-black text-[#141414] uppercase tracking-wider block">
                    Estrutura 5W2H:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-blue-800 uppercase block">1. O Que (What)</span>
                      <span className="text-[#141414] text-[11px]">{d2FiveWTwoH.what || "—"}</span>
                    </div>

                    <div className="bg-white p-2 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-blue-800 uppercase block">2. Por Que (Why)</span>
                      <span className="text-[#141414] text-[11px]">{d2FiveWTwoH.why || "—"}</span>
                    </div>

                    <div className="bg-white p-2 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-blue-800 uppercase block">3. Onde (Where)</span>
                      <span className="text-[#141414] text-[11px]">{d2FiveWTwoH.where || "—"}</span>
                    </div>

                    <div className="bg-white p-2 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-blue-800 uppercase block">4. Quando (When)</span>
                      <span className="text-[#141414] text-[11px]">{d2FiveWTwoH.when || "—"}</span>
                    </div>

                    <div className="bg-white p-2 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-blue-800 uppercase block">5. Quem (Who)</span>
                      <span className="text-[#141414] text-[11px]">{d2FiveWTwoH.who || "—"}</span>
                    </div>

                    <div className="bg-white p-2 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-blue-800 uppercase block">6. Como (How)</span>
                      <span className="text-[#141414] text-[11px]">{d2FiveWTwoH.how || "—"}</span>
                    </div>

                    <div className="sm:col-span-2 bg-white p-2 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-blue-800 uppercase block">7. Quantos / Qtd Afetada (How Many)</span>
                      <span className="text-[#141414] text-[11px] font-bold">{d2FiveWTwoH.howMuch || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Evidências Visuais: Comparativo Produto OK vs Produto NÃO OK (NOK) */}
                <div className="space-y-2 pt-2 border-t border-[#141414]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-800" />
                      <span className="text-[10px] font-mono font-black uppercase text-[#141414] tracking-wider">
                        Evidências Visuais da Análise 8D / PDCA: Produto OK vs Produto NÃO OK (NOK)
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Padrão Técnico de Inspeção</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Produto OK */}
                    <div className="p-3 bg-emerald-50/50 border-2 border-emerald-600 shadow-[2px_2px_0px_#059669] flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-600/30">
                          <span className="text-xs font-mono font-black text-emerald-950 uppercase flex items-center gap-1.5">
                            <span className="w-4 h-4 bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                            Produto OK (Padrão Conforme)
                          </span>
                          <span className="text-[9px] font-mono font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.5 border border-emerald-600">
                            PADRÃO APROVADO
                          </span>
                        </div>
                        {d2ImageOkUrl ? (
                          <div className="border border-emerald-600 bg-white p-1 mb-2 max-h-56 overflow-hidden flex items-center justify-center">
                            <img 
                              src={d2ImageOkUrl} 
                              alt="Produto OK - Padrão Conforme" 
                              className="max-h-52 w-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="h-36 border border-dashed border-emerald-500 bg-white/80 flex flex-col items-center justify-center text-center p-3 mb-2 space-y-1">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-mono font-bold text-emerald-950">Foto da Peça / Produto Conforme</span>
                            <span className="text-[10px] font-mono text-emerald-800/80">Sem folgas, montagem alinhada com torque e especificação nominal.</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-mono bg-white p-2 border border-emerald-600 text-emerald-950">
                        <span className="font-bold block">Critério de Aceitação:</span>
                        Peça em conformidade com o desenho técnico, tolerâncias dimensionais e requisitos funcionais.
                      </div>
                    </div>

                    {/* Produto NÃO OK */}
                    <div className="p-3 bg-red-50/50 border-2 border-red-600 shadow-[2px_2px_0px_#dc2626] flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-red-600/30">
                          <span className="text-xs font-mono font-black text-red-950 uppercase flex items-center gap-1.5">
                            <span className="w-4 h-4 bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">✕</span>
                            Produto NÃO OK / NOK (Modo de Falha)
                          </span>
                          <span className="text-[9px] font-mono font-black bg-red-200 text-red-900 px-1.5 py-0.5 border border-red-600">
                            DEFEITO RECLAMADO
                          </span>
                        </div>
                        {d2ImageNotOkUrl ? (
                          <div className="border border-red-600 bg-white p-1 mb-2 max-h-56 overflow-hidden flex items-center justify-center">
                            <img 
                              src={d2ImageNotOkUrl} 
                              alt="Produto Não OK - Modo de Falha" 
                              className="max-h-52 w-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="h-36 border border-dashed border-red-500 bg-white/80 flex flex-col items-center justify-center text-center p-3 mb-2 space-y-1">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-mono font-bold text-red-950">Foto da Não Conformidade Reclamada</span>
                            <span className="text-[10px] font-mono text-red-800/80">Evidência visual do modo de falha / desvio reportado pelo cliente.</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-mono bg-white p-2 border border-red-600 text-red-950">
                        <span className="font-bold block">Desvio Detectado:</span>
                        {d2NonConformityDescription || identifiedProblem || "Não conformidade apurada em linha / campo."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* D3. AÇÕES DE CONTENÇÃO */}
            {(activeTab === "all" || activeTab === "d3") && (
              <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                      D3. Ações de Contenção Imediata & Ponto de Corte
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#141414]/60">Proteção ao Cliente</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#141414]">
                    <thead className="bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border-r border-[#333]">Descrição da Ação de Contenção</th>
                        <th className="p-2 border-r border-[#333]">Local</th>
                        <th className="p-2 border-r border-[#333]">Responsável</th>
                        <th className="p-2 border-r border-[#333]">Início / Fim</th>
                        <th className="p-2 border-r border-[#333]">Nº NF Ponto Corte</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141414]">
                      {d3ContainmentActions.map((act, idx) => (
                        <tr key={act.id || idx} className="hover:bg-amber-50/50">
                          <td className="p-2 font-medium text-[#141414] border-r border-[#141414]">{act.description}</td>
                          <td className="p-2 text-[#141414]/80 border-r border-[#141414]">{act.location}</td>
                          <td className="p-2 text-[#141414]/80 border-r border-[#141414]">{act.responsible}</td>
                          <td className="p-2 font-mono text-[10px] border-r border-[#141414]">{act.startDate} {act.endDate ? `➔ ${act.endDate}` : ""}</td>
                          <td className="p-2 font-mono text-blue-700 font-bold border-r border-[#141414]">{act.cutoffInvoice || "—"}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-700">
                              {act.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* D4. CAUSA RAIZ (HENKATEN, ISHIKAWA 6M & 5 PORQUÊS) */}
            {(activeTab === "all" || activeTab === "d4") && (
              <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                      D4. Análise da Causa Raiz (Henkaten 4M/6M, Ishikawa & 5 Porquês Triplo Eixo)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#141414]/60">Investigação Profunda</span>
                </div>

                {/* 4.1 Henkaten */}
                <div className="bg-[#F8F9FA] p-3 border border-[#141414] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase text-[#141414]">
                      4.1 Investigação Henkaten (Alterações de 4M / 6M)
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                      d4Henkaten.hasHenkaten ? "bg-red-100 text-red-900 border-red-700" : "bg-emerald-100 text-emerald-900 border-emerald-700"
                    }`}>
                      {d4Henkaten.hasHenkaten ? "Houve Mudança de 4M" : "Sem Mudança de 4M"}
                    </span>
                  </div>
                  <p className="text-xs text-[#141414]/80 italic">"{d4Henkaten.comments}"</p>
                  
                  {d4Henkaten.items && d4Henkaten.items.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 pt-1">
                      {d4Henkaten.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-2 border border-[#141414] text-[10px]">
                          <span className="font-mono font-bold block text-[#141414]">{item.dimension.split(" ")[0]}</span>
                          <span className={item.changed ? "text-red-700 font-bold" : "text-emerald-700"}>
                            {item.changed ? "Alterado" : "Normal"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4.2 Ishikawa Diagram Preview */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase text-[#141414] block">
                      4.2 Diagrama de Ishikawa (Espinha de Peixe 6M)
                    </span>
                    <div className="flex items-center space-x-2 text-[9px] font-mono">
                      <span className="flex items-center space-x-0.5 text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 border border-emerald-400">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Considerado (Faz Sentido)</span>
                      </span>
                      <span className="flex items-center space-x-0.5 text-red-800 font-bold bg-red-100 px-1.5 py-0.5 border border-red-400">
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Desconsiderado</span>
                      </span>
                    </div>
                  </div>

                  {/* Cabeça da Espinha (Efeito / Problema Causado) */}
                  <div className="p-3 bg-red-50 border-2 border-red-700 shadow-[2px_2px_0px_#141414] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 bg-red-700 text-white font-mono font-black text-xs flex items-center justify-center border border-[#141414] shrink-0">
                        🐟
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-black text-red-950 uppercase tracking-wider block">
                          Cabeça da Espinha de Peixe (Efeito / Problema Causado)
                        </span>
                        <span className="text-xs font-mono font-black text-red-900 leading-tight">
                          {d4Ishikawa.problemHead || identifiedProblem || complaint.realFailureMode || d2NonConformityDescription}
                        </span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-red-900 bg-red-100/90 px-2 py-1 border border-red-400 shrink-0 font-bold">
                      Efeito Alvo sob Análise dos 6M
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {[
                      { key: "manpower" as const, title: "Mão de Obra", border: "border-blue-600", bg: "bg-blue-50/50", headerText: "text-blue-900", items: d4Ishikawa.manpower },
                      { key: "machine" as const, title: "Máquina", border: "border-purple-600", bg: "bg-purple-50/50", headerText: "text-purple-900", items: d4Ishikawa.machine },
                      { key: "material" as const, title: "Material", border: "border-amber-600", bg: "bg-amber-50/50", headerText: "text-amber-900", items: d4Ishikawa.material },
                      { key: "method" as const, title: "Método", border: "border-indigo-600", bg: "bg-indigo-50/50", headerText: "text-indigo-900", items: d4Ishikawa.method },
                      { key: "measurement" as const, title: "Medição", border: "border-emerald-600", bg: "bg-emerald-50/50", headerText: "text-emerald-900", items: d4Ishikawa.measurement },
                      { key: "environment" as const, title: "Meio Ambiente", border: "border-teal-600", bg: "bg-teal-50/50", headerText: "text-teal-900", items: d4Ishikawa.environment },
                    ].map((cat) => (
                      <div key={cat.key} className={`${cat.bg} p-2.5 border ${cat.border}`}>
                        <span className={`text-[9px] font-mono font-black ${cat.headerText} uppercase block mb-1`}>
                          {cat.title}
                        </span>
                        <ul className="text-[11px] space-y-1 text-[#141414]">
                          {cat.items.map((rawItem, i) => {
                            const text = typeof rawItem === "string" ? rawItem : rawItem?.text || "";
                            const status = typeof rawItem === "string" ? null : rawItem?.status || null;
                            if (!text) return null;
                            return (
                              <li key={i} className="flex items-start justify-between gap-1.5 leading-snug">
                                <span className={`flex-1 ${
                                  status === "discarded"
                                    ? "line-through text-gray-400"
                                    : status === "considered"
                                    ? "font-bold text-emerald-950"
                                    : "text-[#141414]"
                                }`}>
                                  • {text}
                                </span>
                                {status === "considered" && (
                                  <span className="shrink-0 flex items-center space-x-0.5 text-[8px] font-mono font-black text-emerald-800 bg-emerald-200/80 px-1 py-0.2 border border-emerald-500">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>Válido</span>
                                  </span>
                                )}
                                {status === "discarded" && (
                                  <span className="shrink-0 flex items-center space-x-0.5 text-[8px] font-mono font-black text-red-700 bg-red-200/80 px-1 py-0.2 border border-red-400">
                                    <X className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>Descartado</span>
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4.3 5 Porquês Triplo Eixo */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black uppercase text-[#141414] block">
                    4.3 5 Porquês Triplo Eixo (Ocorrência, Detecção & Sistêmico)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Eixo Ocorrência */}
                    <div className="bg-white p-3 border-2 border-red-600 shadow-[2px_2px_0px_#141414] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-black uppercase text-red-700 block border-b border-red-200 pb-1">
                          Eixo 1: Por que Ocorreu?
                        </span>
                        {d4FiveWhys.occurrence.map((w, i) => w ? (
                          <div key={i} className="text-[11px] text-[#141414]">
                            <span className="font-mono font-bold text-red-600">{i + 1}P:</span> {w}
                          </div>
                        ) : null)}
                      </div>
                      {d4FiveWhys.occurrenceRootCause && (
                        <div className="pt-2 border-t-2 border-red-200 bg-red-50 p-2 mt-2">
                          <span className="text-[9px] font-mono font-black text-red-950 uppercase block mb-0.5">
                            🎯 Causa Raiz Ocorrência:
                          </span>
                          <span className="text-[11px] font-mono font-bold text-red-900 leading-tight block">
                            {d4FiveWhys.occurrenceRootCause}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Eixo Detecção */}
                    <div className="bg-white p-3 border-2 border-blue-600 shadow-[2px_2px_0px_#141414] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-black uppercase text-blue-700 block border-b border-blue-200 pb-1">
                          Eixo 2: Por que Não Detectou (Escape)?
                        </span>
                        {d4FiveWhys.detection.map((w, i) => w ? (
                          <div key={i} className="text-[11px] text-[#141414]">
                            <span className="font-mono font-bold text-blue-600">{i + 1}P:</span> {w}
                          </div>
                        ) : null)}
                      </div>
                      {d4FiveWhys.detectionRootCause && (
                        <div className="pt-2 border-t-2 border-blue-200 bg-blue-50 p-2 mt-2">
                          <span className="text-[9px] font-mono font-black text-blue-950 uppercase block mb-0.5">
                            🎯 Causa Raiz Detecção:
                          </span>
                          <span className="text-[11px] font-mono font-bold text-blue-900 leading-tight block">
                            {d4FiveWhys.detectionRootCause}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Eixo Sistêmico */}
                    <div className="bg-white p-3 border-2 border-emerald-600 shadow-[2px_2px_0px_#141414] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-black uppercase text-emerald-700 block border-b border-emerald-200 pb-1">
                          Eixo 3: Por que o Sistema Falhou?
                        </span>
                        {d4FiveWhys.systemic.map((w, i) => w ? (
                          <div key={i} className="text-[11px] text-[#141414]">
                            <span className="font-mono font-bold text-emerald-600">{i + 1}P:</span> {w}
                          </div>
                        ) : null)}
                      </div>
                      {d4FiveWhys.systemicRootCause && (
                        <div className="pt-2 border-t-2 border-emerald-200 bg-emerald-50 p-2 mt-2">
                          <span className="text-[9px] font-mono font-black text-emerald-950 uppercase block mb-0.5">
                            🎯 Causa Raiz Sistêmica:
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-900 leading-tight block">
                            {d4FiveWhys.systemicRootCause}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* D5. AÇÕES CORRETIVAS */}
            {(activeTab === "all" || activeTab === "d5") && (
              <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                      D5. Definição das Ações Corretivas Estruturadas
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#141414]/60">Eliminação da Causa Raiz</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#141414]">
                    <thead className="bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border-r border-[#333]">Eixo / Tipo</th>
                        <th className="p-2 border-r border-[#333]">Descrição da Ação Corretiva</th>
                        <th className="p-2 border-r border-[#333]">Responsável</th>
                        <th className="p-2 border-r border-[#333]">Prazo</th>
                        <th className="p-2 border-r border-[#333]">Evidência Prática</th>
                        <th className="p-2">Status (G/Y/R)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141414]">
                      {[
                        ...d5OccurrenceActions.map(a => ({ ...a, category: "Ocorrência (Causa)" })),
                        ...d5DetectionActions.map(a => ({ ...a, category: "Detecção (Escape)" })),
                        ...d5SystemicActions.map(a => ({ ...a, category: "Sistêmica (FMEA)" })),
                      ].map((act, idx) => (
                        <tr key={act.id || idx} className="hover:bg-amber-50/50">
                          <td className="p-2 font-mono text-[10px] font-bold border-r border-[#141414] text-blue-800">{act.category}</td>
                          <td className="p-2 text-[#141414] border-r border-[#141414] font-medium">{act.description}</td>
                          <td className="p-2 text-[#141414]/80 border-r border-[#141414]">{act.responsible}</td>
                          <td className="p-2 font-mono text-[10px] border-r border-[#141414]">{act.targetDate}</td>
                          <td className="p-2 text-[11px] text-[#141414]/80 border-r border-[#141414]">{act.evidence || "—"}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border ${
                              act.status === "G"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-700"
                                : act.status === "Y"
                                ? "bg-amber-100 text-amber-900 border-amber-700"
                                : "bg-red-100 text-red-900 border-red-700"
                            }`}>
                              {act.status === "G" ? "G - Concluído" : act.status === "Y" ? "Y - Em Andamento" : "R - Atrasado"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* D6. VALIDAÇÃO & FMEA */}
            {(activeTab === "all" || activeTab === "d6") && (() => {
              const allActionsList = [
                ...d5OccurrenceActions.filter(a => a.description?.trim()).map(a => ({ ...a, category: "Ocorrência (Causa)" })),
                ...d5DetectionActions.filter(a => a.description?.trim()).map(a => ({ ...a, category: "Detecção (Escape)" })),
                ...d5SystemicActions.filter(a => a.description?.trim()).map(a => ({ ...a, category: "Sistêmica (FMEA)" })),
              ];
              const totalActions = allActionsList.length;
              const gCount = allActionsList.filter(a => a.status === "G").length;
              const yCount = allActionsList.filter(a => a.status === "Y").length;
              const rCount = allActionsList.filter(a => a.status === "R").length;
              const isAllG = totalActions > 0 && gCount === totalActions;

              return (
                <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-3.5 h-3.5 text-blue-700" />
                      <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                        D6. Implementação, Validação das Ações & Verificação do Status (G / Y / R)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#141414]/60">Acompanhamento e Eficácia</span>
                  </div>

                  {/* Resumo dos Status G / Y / R */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 border border-[#141414] flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/70 uppercase">Total Ações</span>
                      <span className="font-mono font-black text-sm text-[#141414]">{totalActions}</span>
                    </div>

                    <div className="bg-emerald-50 p-2 border border-emerald-600 flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-emerald-900 uppercase">G (Concluído / OK)</span>
                      <span className="font-mono font-black text-sm text-emerald-700">{gCount}</span>
                    </div>

                    <div className="bg-amber-50 p-2 border border-amber-600 flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-amber-900 uppercase">Y (Em Andamento)</span>
                      <span className="font-mono font-black text-sm text-amber-700">{yCount}</span>
                    </div>

                    <div className="bg-red-50 p-2 border border-red-600 flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-red-900 uppercase">R (Atrasado)</span>
                      <span className="font-mono font-black text-sm text-red-700">{rCount}</span>
                    </div>
                  </div>

                  {/* Banner de Condição para D8 */}
                  <div className={`p-2.5 border-2 text-xs font-mono flex items-center justify-between gap-2 ${
                    isAllG 
                      ? "bg-emerald-50 border-emerald-600 text-emerald-950" 
                      : "bg-amber-50 border-amber-600 text-amber-950"
                  }`}>
                    <div className="flex items-center space-x-2">
                      {isAllG ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      )}
                      <div>
                        <span className="font-black block uppercase text-[10px]">
                          {isAllG ? "Status D6: 100% em G (OK) — Liberado para Conclusão D8" : "Status D6: Pendências Detectadas (Bloqueio D8 Ativo)"}
                        </span>
                        <span className="text-[11px]">
                          {isAllG 
                            ? "Todas as ações foram implementadas com evidências anexadas e status verde (G)."
                            : "Para concluir o D8 (Status Fechado), todas as ações devem estar na legenda G (OK)."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tabela de Ações com Responsável, Data e Status G/Y/R */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-black uppercase text-[#141414] block">
                      6.1 Quadro de Ações Corretivas com Responsável, Prazo e Status G/Y/R:
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-[#141414]">
                        <thead className="bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase">
                          <tr>
                            <th className="p-2 border-r border-[#333]">Eixo</th>
                            <th className="p-2 border-r border-[#333]">Ação Corretiva</th>
                            <th className="p-2 border-r border-[#333]">Responsável</th>
                            <th className="p-2 border-r border-[#333]">Prazo / Data</th>
                            <th className="p-2 border-r border-[#333]">Evidência de Conclusão</th>
                            <th className="p-2">Status G/Y/R</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141414]">
                          {allActionsList.map((act, idx) => (
                            <tr key={act.id || idx} className="hover:bg-slate-50">
                              <td className="p-2 font-mono text-[10px] font-bold border-r border-[#141414] text-blue-800 shrink-0">
                                {act.category}
                              </td>
                              <td className="p-2 text-[#141414] border-r border-[#141414] font-medium">
                                {act.description}
                              </td>
                              <td className="p-2 text-[#141414] font-bold border-r border-[#141414] whitespace-nowrap">
                                {act.responsible || "—"}
                              </td>
                              <td className="p-2 font-mono text-[10px] text-[#141414] border-r border-[#141414] whitespace-nowrap">
                                {act.targetDate || "—"}
                              </td>
                              <td className="p-2 text-[11px] text-[#141414]/80 border-r border-[#141414]">
                                {act.evidence || "—"}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <span className={`px-2 py-0.5 text-[10px] font-mono font-black border flex items-center gap-1 w-fit ${
                                  act.status === "G"
                                    ? "bg-emerald-600 text-white border-emerald-800 shadow-[1px_1px_0px_#141414]"
                                    : act.status === "Y"
                                    ? "bg-amber-500 text-white border-amber-800 shadow-[1px_1px_0px_#141414]"
                                    : "bg-red-600 text-white border-red-800 shadow-[1px_1px_0px_#141414]"
                                }`}>
                                  <span>{act.status}</span>
                                  <span>-</span>
                                  <span>{act.status === "G" ? "OK / Concluído" : act.status === "Y" ? "Pendente" : "Atrasado"}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Geração de Novos Riscos no PFMEA?</span>
                      <span className={`font-mono font-bold ${d6SideEffectsRisk ? "text-red-600" : "text-emerald-700"}`}>
                        {d6SideEffectsRisk ? "SIM (Requer Novo Modo de Falha)" : "NÃO (Sem Efeitos Colaterais)"}
                      </span>
                    </div>

                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Modo Previsto no FMEA Atual?</span>
                      <span className="font-mono font-bold text-[#141414]">
                        {d6PredictedInFmea ? "SIM (Modo Existente)" : "NÃO (Modo Inédito)"}
                      </span>
                    </div>

                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Eficácia das Ações Robusta?</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {d6EfficacyRobust ? "SIM (Eficaz)" : "NÃO (Em Teste)"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F8F9FA] p-3 border border-[#141414]">
                    <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block mb-1">
                      6.2 Comprovação da Eficácia (Evidência Prática de Homologação)
                    </span>
                    <p className="text-xs text-[#141414] leading-relaxed">
                      {d6EfficacyProof}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* D7. YOKOTEN & PADRONIZAÇÃO */}
            {(activeTab === "all" || activeTab === "d7") && (
              <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                  <div className="flex items-center space-x-2">
                    <Share2 className="w-3.5 h-3.5 text-indigo-700" />
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                      D7. Prevenção de Reocorrência (Yokoten, Lições Aprendidas & Padronização)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#141414]/60">Read Across</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#F8F9FA] p-3 border border-[#141414] space-y-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase text-[#141414]/70 block">
                      7.1 Yokoten / Abrangência para Outros Processos
                    </span>
                    <div className="font-bold text-[#141414]">
                      {d7Yokoten.applicableToOtherProcesses ? "Aplicável a Outras Linhas / Peças" : "Item Específico / Não Aplicável"}
                    </div>
                    <p className="text-[11px] text-[#141414]/80">{d7Yokoten.scopeItems || "—"}</p>
                  </div>

                  <div className="bg-[#F8F9FA] p-3 border border-[#141414] space-y-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase text-[#141414]/70 block">
                      7.2 Lições Aprendidas & Integração FMEA
                    </span>
                    <div className="text-[11px] font-mono text-[#141414] space-y-0.5">
                      <div>Lição Aprendida Nº: <span className="font-bold text-blue-700">{d7LessonsLearned.lessonsLearnedNumber}</span></div>
                      <div>Lançamento: <span className="font-bold">{d7LessonsLearned.releaseDate}</span></div>
                      <div>FMEA Nº: <span className="font-bold text-blue-700">{d7LessonsLearned.fmeaNumber}</span></div>
                      <div>Data Retroalimentação: <span className="font-bold">{d7LessonsLearned.fmeaFeedbackDate}</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-3 border border-emerald-600">
                  <span className="text-[9px] font-mono font-bold text-emerald-900 uppercase block mb-1">
                    Padronização de Documentos Obrigatórios
                  </span>
                  <p className="text-xs text-[#141414] leading-relaxed">
                    {d7Standardization}
                  </p>
                </div>
              </div>
            )}

            {/* D8. FECHAMENTO & ASSINATURAS */}
            {(activeTab === "all" || activeTab === "d8") && (() => {
              const allActionsList = [
                ...d5OccurrenceActions.filter(a => a.description?.trim()),
                ...d5DetectionActions.filter(a => a.description?.trim()),
                ...d5SystemicActions.filter(a => a.description?.trim()),
              ];
              const totalActions = allActionsList.length;
              const gCount = allActionsList.filter(a => a.status === "G").length;
              const isAllG = totalActions > 0 && gCount === totalActions;

              return (
                <div className="bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
                    <div className="flex items-center space-x-2">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
                        D8. Fechamento & Quadro de Assinaturas Formais
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#141414]/60">Aprovação IATF 16949</span>
                  </div>

                  {/* Validação de Regra de Negócio: Fechamento D8 requer 100% G */}
                  <div className={`p-3 border-2 text-xs font-mono flex items-center justify-between gap-2 ${
                    isAllG 
                      ? "bg-emerald-50 border-emerald-600 text-emerald-950" 
                      : "bg-red-50 border-red-600 text-red-950"
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      {isAllG ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertOctagon className="w-5 h-5 text-red-700 shrink-0" />
                      )}
                      <div>
                        <span className="font-black text-xs block uppercase">
                          {isAllG 
                            ? "✓ Requisito D6 Homologado: 100% das Ações em G (OK)" 
                            : "⛔ Bloqueio de Fechamento D8: Ações Pendentes no D6"}
                        </span>
                        <span className="text-[11px] leading-tight block mt-0.5">
                          {isAllG 
                            ? "Todas as ações corretivas foram executadas com status G. O relatório 8D está apto para encerramento formal." 
                            : "Regra SGQ: O item D8 só pode ser concluído (Fechado) quando todas as ações do D6 estiverem na legenda G (OK)."}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-mono font-black uppercase border shrink-0 ${
                      isAllG 
                        ? "bg-emerald-600 text-white border-emerald-800" 
                        : "bg-red-600 text-white border-red-800"
                    }`}>
                      {isAllG ? "Liberado" : "Bloqueado"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414] text-center">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Auditor SGQ</span>
                      <span className="font-bold text-xs text-[#141414] block mt-0.5">{d8Approvals.auditor || "—"}</span>
                      <span className={`text-[9px] font-mono font-bold block mt-1 ${isAllG ? "text-emerald-700" : "text-red-700"}`}>
                        {isAllG ? "APROVADO" : "BLOQUEADO (PENDÊNCIAS EM D6)"}
                      </span>
                    </div>

                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414] text-center">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Líder do Time</span>
                      <span className="font-bold text-xs text-[#141414] block mt-0.5">{d8Approvals.teamLeader || "—"}</span>
                      <span className={`text-[9px] font-mono font-bold block mt-1 ${isAllG ? "text-emerald-700" : "text-red-700"}`}>
                        {isAllG ? "APROVADO" : "BLOQUEADO (PENDÊNCIAS EM D6)"}
                      </span>
                    </div>

                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414] text-center">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Superior Imediato</span>
                      <span className="font-bold text-xs text-[#141414] block mt-0.5">{d8Approvals.superior || "—"}</span>
                      <span className={`text-[9px] font-mono font-bold block mt-1 ${isAllG ? "text-emerald-700" : "text-red-700"}`}>
                        {isAllG ? "APROVADO" : "BLOQUEADO (PENDÊNCIAS EM D6)"}
                      </span>
                    </div>

                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414] text-center">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Gerente de Planta</span>
                      <span className="font-bold text-xs text-[#141414] block mt-0.5">{d8Approvals.manager || "—"}</span>
                      <span className={`text-[9px] font-mono font-bold block mt-1 ${isAllG ? "text-emerald-700" : "text-red-700"}`}>
                        {isAllG ? "APROVADO" : "BLOQUEADO (PENDÊNCIAS EM D6)"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414]">
                      <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Feedback / Parecer SGQ</span>
                      <p className="text-xs text-[#141414] mt-0.5">
                        {isAllG 
                          ? (d8Approvals.sgqFeedback || "Aprovado sem ressalvas.")
                          : "Parecer SGQ: Bloqueado para homologação formal até a conclusão de 100% das ações em D6 com legenda G."}
                      </p>
                    </div>

                    <div className="bg-[#F8F9FA] p-2.5 border border-[#141414] flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block mb-1">
                          Status do 8D / PDCA
                        </span>
                        <span className={`font-mono font-black text-xs uppercase px-2.5 py-1 border shadow-[1px_1px_0px_#141414] inline-flex items-center space-x-1.5 ${
                          d8ClosingStatus === "Aberto"
                            ? "bg-amber-100 text-amber-900 border-amber-500"
                            : d8ClosingStatus === "Em Validação"
                            ? "bg-blue-100 text-blue-900 border-blue-500"
                            : "bg-emerald-100 text-emerald-900 border-emerald-500"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            d8ClosingStatus === "Aberto"
                              ? "bg-amber-500"
                              : d8ClosingStatus === "Em Validação"
                              ? "bg-blue-600"
                              : "bg-emerald-600"
                          }`}></span>
                          <span>{d8ClosingStatus}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase block">Data de Fechamento</span>
                        <span className="font-mono text-xs font-bold text-[#141414]">{d8ClosingDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};
