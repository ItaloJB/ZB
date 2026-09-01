export interface PfmeaRow {
  id: string; // e.g. "PFMEA-001"
  
  // AIAG-VDA 7-Step Model 30 Columns:
  // 1. Estrutura e Função
  process: string; // 1. Processo (Linha / Sistema)
  processStep: string; // 2. Etapa do Processo (Operação / Posto)
  workElements4M: string; // 3. Elementos de Trabalho (4M: Homem, Máquina, Material, Meio)
  processFunction: string; // 4. Função do Processo
  processStepFunction: string; // 5. Função da Etapa do Processo
  productCharacteristic: string; // 6. Característica do Produto
  workElementFunction: string; // 7. Função do Elemento de Trabalho
  processCharacteristic: string; // 8. Característica do Processo
  
  // 2. Análise de Falhas
  failureEffect: string; // 9. Efeito de Falha (FE)
  severity: number; // 10. Severidade (S) (1 a 10)
  failureMode: string; // 11. Modo de Falha (FM)
  potentialCause: string; // 12. Causa da Falha (FC)
  
  // 3. Análise de Risco (Estado Atual)
  currentPrevention: string; // 13. Controle de Prevenção (PC)
  occurrence: number; // 14. Ocorrência (O) (1 a 10)
  currentDetection: string; // 15. Controle de Detecção (DC)
  detection: number; // 16. Detecção (D) (1 a 10)
  actionPriority: "Baixa" | "Média" | "Alta"; // 17. PA (Prioridade de Ação) / PA PFMEA
  specialCharacteristic?: string; // 18. Característica Especial (*, Y, D, R, S, N/A)
  
  // 4. Otimização / Plano de Ação
  preventiveAction?: string; // 19. Ação Preventiva
  detectionAction?: string; // 20. Ação de Detecção
  responsiblePerson?: string; // 21. Pessoa Responsável
  targetDate?: string; // 22. Data Planejada para Conclusão
  actionTaken?: string; // 23. Ação Tomada (Evidenciar)
  completionDate?: string; // 24. Data de Conclusão
  
  // 5. Reavaliação de Risco (Estado Final / Pós-Ação)
  revisedSeverity?: number; // 25. Severidade (S) [Pós-Ação]
  revisedOccurrence?: number; // 26. Ocorrência (O) [Pós-Ação]
  revisedDetection?: number; // 27. Detecção (D) [Pós-Ação]
  revisedSpecialCharacteristic?: string; // 28. Característica Especial [Pós-Ação] (*, Y, D, R, S, N/A)
  revisedActionPriority?: "Baixa" | "Média" | "Alta"; // 29. PA (Prioridade de Ação) [Pós-Ação] / PFMEA AP
  observations?: string; // 30. Observações
  
  // Compatibility & metadata fields
  classification?: string; // Alias for specialCharacteristic
  rpn?: number; // S * O * D (NPR)
  searchTags?: string[]; // Sinônimos e palavras-chave para busca
  recommendedAction?: string; // Alias for preventiveAction/detectionAction
  responsible?: string; // Alias for responsiblePerson
  takenAction?: string; // Alias for actionTaken
  newSeverity?: number; // Alias for revisedSeverity
  newOccurrence?: number; // Alias for revisedOccurrence
  newDetection?: number; // Alias for revisedDetection
  newRpn?: number; // Revised NPR
  lastRevisionDate?: string;
  revisionVersion?: number;
}

// 8D & ZB PDCA Standard Interfaces
export interface TeamMember {
  id: string;
  name: string;
  department: string;
  role: string; // Líder, Engenheiro de Qualidade, Processos, Manutenção, Produção, etc.
  email: string;
}

export interface FiveWTwoH {
  what: string; // O que aconteceu?
  why: string; // Por que é um problema?
  where: string; // Onde foi detectado?
  when: string; // Quando ocorreu (data / lote)?
  who: string; // Quem detectou?
  how: string; // Como ocorreu o modo de falha?
  howMuch: string; // Quanto / quantidade de peças impactadas ou custo?
}

export interface ContainmentAction {
  id: string;
  description: string;
  location: string; // Linha interna, Estoque, Em trânsito, No cliente
  responsible: string;
  startDate: string;
  endDate: string;
  cutoffInvoice: string; // NF de Ponto de Corte
  status: "Em Andamento" | "Concluído" | "Pendente";
}

export type IshikawaItemStatus = "considered" | "discarded" | null;

export interface IshikawaItem {
  text: string;
  status?: IshikawaItemStatus; // "considered" (✓ considerado e faz sentido) | "discarded" (X desconsiderado)
}

export interface IshikawaDiagram {
  manpower: (string | IshikawaItem)[]; // Mão de Obra
  method: (string | IshikawaItem)[]; // Método
  material: (string | IshikawaItem)[]; // Material
  machine: (string | IshikawaItem)[]; // Máquina
  measurement: (string | IshikawaItem)[]; // Medição
  environment: (string | IshikawaItem)[]; // Meio Ambiente
  problemHead: string; // Cabeça do peixe (Problema)
}

export interface FiveWhysGroup {
  occurrence: string[]; // 5 Porquês de Ocorrência (1 a 5)
  detection: string[]; // 5 Porquês de Detecção (1 a 5)
  systemic: string[]; // 5 Porquês Sistêmicos (1 a 5)
  occurrenceRootCause?: string; // Causa Raiz de Ocorrência
  detectionRootCause?: string; // Causa Raiz de Detecção / Escape
  systemicRootCause?: string; // Causa Raiz Sistêmica / Gestão
}

export type ActionStatus = "G" | "Y" | "R"; // G: Verde (Concluído), Y: Amarelo (Pendente), R: Vermelho (Atrasado)

export interface ActionItem {
  id: number;
  description: string;
  responsible: string;
  targetDate: string;
  status: ActionStatus;
  evidence?: string;
}

export interface HenkatenItem {
  dimension: "Mão de Obra" | "Método" | "Material" | "Máquina" | "Medição" | "Meio Ambiente";
  changed: boolean;
  comment: string;
}

export interface RecurrenceInvestigation {
  plannedActionsImplemented: boolean;
  containmentPerformed: boolean;
  ongoingActions: boolean;
  previousActionsEffective: boolean;
  allFailurePotentialsConsidered: boolean;
  observations: string;
}

export interface IshikawaFactor {
  text: string;
  isRootCause: boolean; // true = [R] Causa Raiz / Provável, false = [X] Descartada
}

export interface IshikawaDiagramStructured {
  manpower: IshikawaFactor[];
  machine: IshikawaFactor[];
  measurement: IshikawaFactor[];
  method: IshikawaFactor[];
  material: IshikawaFactor[];
  environment: IshikawaFactor[];
  problemHead: string; // "Parafuso soldado invertido"
  canReproduce: boolean; // É possível a reprodução do problema?
  reproductionResult: string; // Se sim, qual o resultado? / Se não, por que não?
  processFlowEvaluated: boolean; // Fluxo de Processo foi Avaliado?
  subsequentProcessesAnalyzed: boolean; // Foram analisadas as causas potenciais para processos posteriores?
  occurrenceLocation: string; // Possível Local da Ocorrência (ex: "Máquina 171 / Op. 10")
  detectionFailureLocation: string; // Possível Local de Falha na Detecção (ex: "Máquina 171 / Op. 10")
}

export interface YokotenScope {
  applicableToOtherProcesses: boolean; // As ações definidas são aplicáveis a outros itens ou processos?
  scopeItems: string; // Se sim, listar itens da abrangência
}

export interface LessonsLearnedInfo {
  lessonsLearnedNumber: string; // Lições Aprendidas Nº (ex: "2415")
  releaseDate: string; // Data de Lançamento (ex: "08/06/2026")
  fmeaNumber: string; // FMEA Nº (ex: "027-24")
  fmeaFeedbackDate: string; // Data de Retroalimentação do FMEA (ex: "08/07/2026")
}

export interface EightDApprovals {
  auditor: string; // Auditor (ex: "Rogério")
  teamLeader: string; // Líder do Time (ex: "Cicero")
  superior: string; // Superior (ex: "Cleber")
  manager: string; // Gerente (ex: "Evandro")
  sgqFeedback?: string; // Feedback da Reprova (SGQ)
  stepApprovals: {
    d1: "APROVADO" | "REPROVADO" | "PENDENTE";
    d2: "APROVADO" | "REPROVADO" | "PENDENTE";
    d3: "APROVADO" | "REPROVADO" | "PENDENTE";
    d4: "APROVADO" | "REPROVADO" | "PENDENTE";
    d5: "APROVADO" | "REPROVADO" | "PENDENTE";
    d6: "APROVADO" | "REPROVADO" | "PENDENTE";
    d7: "APROVADO" | "REPROVADO" | "PENDENTE";
    d8: "APROVADO" | "REPROVADO" | "PENDENTE";
  };
}

export interface EightDReport {
  // Cabeçalho ZB
  client: string;
  partNumber: string; // Conjunto / Peça Nº
  partName: string; // Nome Conjunto / Peça
  departmentCausing: string; // Departamento Causador
  pdcaNumber: string; // PDCA Nº (ex: "080/26" ou "PDCA 080/26")
  identifiedProblem?: string; // Problema Identificado
  
  // D1 - Formação de Equipe
  d1Leader: TeamMember;
  d1Members: TeamMember[];

  // D2 - Descrição do Problema
  d2Type: "Interno - Processos ZB" | "Interno - Refugos e Operação Suplementar" | "Externo - Reclamação de Clientes";
  d2Recurrence: boolean; // Sim ou Não
  d2NonConformityDescription: string; // Descrição da Não conformidade
  d2SpecialCharacteristic: boolean; // Modo de falha vinculado a característica especial?
  d2SpecialCharacteristicDetails?: string; // CC, SC, Crítico, etc.
  d2ClientDocNumber: string; // Nº do Documento do cliente (ex: "SOR00248/26")
  d2ImageOkUrl?: string; // Imagem do item OK
  d2ImageNotOkUrl?: string; // Imagem do item NÃO OK (NG)
  d2FiveWTwoH: FiveWTwoH;

  // D3 - Ações de Contenção
  d3ContainmentActions: ContainmentAction[];

  // D4 - Análise da Causa Raiz
  d4Henkaten: {
    hasHenkaten: boolean; // Sim ou Não
    comments: string;
    items?: HenkatenItem[];
  };
  d4RecurrenceInvestigation?: string; // 4.2 Processo de Investigação (Em caso de Reincidência)
  d4RecurrenceChecklist?: RecurrenceInvestigation;
  d4Ishikawa: IshikawaDiagram; // 4.3 Diagrama de Ishikawa (Espinha de Peixe)
  d4IshikawaStructured?: IshikawaDiagramStructured;
  d4FiveWhys: FiveWhysGroup; // 4.4 5 Porquês (Ocorrência, Detecção, Sistêmicos)

  // D5 & D6 - Ações Corretivas e Implementação
  d5OccurrenceActions: ActionItem[]; // 1 a 6
  d5DetectionActions: ActionItem[]; // 1 a 6
  d5SystemicActions: ActionItem[]; // 1 a 6
  
  // D6 Perguntas Adicionais & Eficácia
  d6SideEffectsRisk?: boolean; // As Ações (Etapas D5 E D6) Poderão Gerar Modos De Falha Não Previstos No PFMEA?
  d6PredictedInFmea?: boolean; // O Modo De Falha Referente À Reclamação Está Previsto No FMEA?
  d6EfficacyRobust?: boolean; // A Eficácia das ações Implementadas Foram Robustas?
  d6EfficacyProof: string; // 6.1 Comprovação da eficácia (Se sim, descreva / Se não, informe)

  // D7 - Prevenção de Reocorrência
  d7Standardization: string; // Padronização / Atualização PFMEA / IT / PC / Treinamento
  d7Yokoten?: YokotenScope; // 7.1 Abrangência / Yokoten / Read Across
  d7LessonsLearned?: LessonsLearnedInfo; // 7.2 Lições Aprendidas / Lessons Learned

  // D8 - Fechamento
  d8ClosingDate: string;
  d8QualityApproval: string;
  d8ManagementApproval: string;
  d8ClosingStatus: "Aberto" | "Fechado" | "Em Validação";
  d8Approvals?: EightDApprovals;
}

export interface FastResponseComplaint {
  id: string; // ID da Reclamação / RNC (ex: "PDCA 000/26" ou "REC-2024-085")
  date: string; // Data da Ocorrência
  client: string; // Cliente / Montadora
  partNumber: string; // Código da Peça
  partName: string; // Nome da Peça / Produto
  rawDescription: string; // Descrição original do e-mail / cliente
  processStep: string; // Etapa relacionada identificada
  realFailureMode: string; // Modo de Falha Real
  impactDescription: string; // Impacto no cliente
  reportedSeverity: number; // Severidade avaliada (1-10)
  rootCause: string; // Causa Raiz apurada (5 Porquês / Ishikawa)
  origin: "Cliente Externo (Campo)" | "Montadora (Linha 0km)" | "Fast Response Interno" | "Auditoria";
  status: "Pendente de Análise" | "Retroalimentado no PFMEA" | "Em Ação Corretiva" | "Arquivado / Isolado";
  feedbackDate?: string;
  associatedPfmeaId?: string;
  
  // ZB 8D Report Data
  eightD?: EightDReport;
}

export interface FeedbackSuggestion {
  complaintId: string;
  targetPfmeaId: string | null;
  matchScore: number;
  matchConfidence: "Alta" | "Média" | "Baixa" | "Não Encontrado";
  isNewFailureMode: boolean;
  isNewCause: boolean;
  matchReason: string;
  
  // Current values
  currentS: number;
  currentO: number;
  currentD: number;
  currentRpn: number;
  currentAp: "Baixa" | "Média" | "Alta";
  
  // Suggested values
  suggestedS: number;
  suggestedO: number;
  suggestedD: number;
  suggestedRpn: number;
  suggestedAp: "Baixa" | "Média" | "Alta";
  
  sRationale: string;
  oRationale: string;
  dRationale: string;
  
  suggestedPrevention: string;
  suggestedDetection: string;
  suggestedActionPlan: string;
  technicalAnalysis?: string;
  auditNote?: string;
}

export interface FeedbackLog {
  id: string;
  timestamp: string;
  complaintId: string;
  client: string;
  partNumber: string;
  pfmeaId: string;
  processStep: string;
  failureMode: string;
  oldS: number;
  newS: number;
  oldO: number;
  newO: number;
  oldD: number;
  newD: number;
  oldRpn: number;
  newRpn: number;
  decision: "Aprovado" | "Pendente" | "Isolado / Não Aplicável";
  actionPlan: string;
  responsible: string;
  targetDate: string;
  justification: string;
  engineerName: string;
}
