import { PfmeaRow, FastResponseComplaint, FeedbackLog } from "../types";

export function calculateAp(s: number, o: number, d: number): "Baixa" | "Média" | "Alta" {
  // Official AIAG & VDA FMEA 1st Edition (2019) Action Priority (AP) Matrix
  // Severity Cluster 9-10 (Extrema)
  if (s >= 9) {
    if (o >= 8) return "Alta"; // O: 10,9,8 -> D: 1..10 all High
    if (o >= 6) return "Alta"; // O: 7,6 -> D: 1..10 all High
    if (o >= 4) { // O: 5,4
      if (d === 1) return "Média";
      return "Alta"; // D: 2..10 High
    }
    if (o >= 2) { // O: 3,2
      if (d <= 4) return "Baixa"; // D: 1..4 Low
      if (d <= 6) return "Média"; // D: 5..6 Medium
      return "Alta"; // D: 7..10 High
    }
    // O = 1
    return "Baixa"; // D: 1..10 all Low
  }

  // Severity Cluster 7-8 (Alta)
  if (s >= 7) {
    if (o >= 8) return "Alta"; // O: 10,9,8 -> D: 1..10 all High
    if (o >= 6) { // O: 7,6
      if (d === 1) return "Média";
      return "Alta"; // D: 2..10 High
    }
    if (o >= 4) { // O: 5,4
      if (d === 1) return "Baixa";
      if (d <= 6) return "Média";
      return "Alta"; // D: 7..10 High
    }
    if (o >= 2) { // O: 3,2
      if (d <= 6) return "Baixa";
      return "Média"; // D: 7..10 Medium
    }
    // O = 1
    return "Baixa"; // D: 1..10 all Low
  }

  // Severity Cluster 5-6 (Moderada)
  if (s >= 5) {
    if (o >= 8) { // O: 10,9,8
      if (d <= 4) return "Média";
      return "Alta"; // D: 5..10 High
    }
    if (o >= 6) { // O: 7,6
      if (d === 1) return "Baixa";
      return "Média"; // D: 2..10 Medium
    }
    if (o >= 4) { // O: 5,4
      if (d <= 6) return "Baixa";
      return "Média"; // D: 7..10 Medium
    }
    if (o >= 2) { // O: 3,2
      return "Baixa"; // D: 1..10 all Low
    }
    // O = 1
    return "Baixa"; // D: 1..10 all Low
  }

  // Severity Cluster 3-4 (Baixa)
  if (s >= 3) {
    if (o >= 8) { // O: 10,9,8
      if (d <= 4) return "Baixa";
      return "Média"; // D: 5..10 Medium
    }
    // O: 7 down to 1
    return "Baixa";
  }

  // Severity Cluster 1-2 (Mínima / Nula)
  return "Baixa";
}

export const initialPfmeaMaster: PfmeaRow[] = [
  {
    id: "PFMEA-001",
    process: "Estampagem Automotiva",
    processStep: "Op. 10 - Estampagem",
    workElements4M: "Máquina: Prensa Hidráulica/Mecânica 1200T / Ferramenta: Matriz de Repuxo / Material: Chapa de Aço Estampagem / Operador",
    processFunction: "Conformar a chapa de aço na geometria final com integridade estrutural e sem trincas",
    processStepFunction: "Op. 10 - Conformação e repuxo da peça estampada na geometria e embutimento especificados",
    productCharacteristic: "Espessura mínima na área de estricção ≥ 0.85mm, sem trincas ou estricção visível",
    workElementFunction: "Aplicar força uniforme no prensachapas e curso da prensa com lubrificação controlada",
    processCharacteristic: "Força do prensa-chapas: 150 kN ± 10 kN / Curso: 350mm / Vazão de óleo: 1.5 g/m²",
    failureEffect: "Ruptura estrutural do componente, perda de resistência mecânica em impacto no veículo e parada de linha na montadora",
    severity: 8,
    failureMode: "Trinca no raio de repuxo / Ruptura da chapa durante a conformação",
    potentialCause: "Força excessiva do prensa-chapas, folga insuficiente entre punção e matriz ou lubrificação deficiente da chapa",
    currentPrevention: "Simulação de conformação AutoForm no projeto de ferramentas, manutenção preventiva dos anéis prensa-chapa e controle de espessura do lote",
    occurrence: 2,
    currentDetection: "Inspeção visual 100% na saída da prensa e ensaio de líquido penetrante amostral (1 pç/lote)",
    detection: 3,
    rpn: 48,
    actionPriority: "Baixa",
    specialCharacteristic: "D",
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
    classification: "D",
    recommendedAction: "",
    responsible: "",
    takenAction: "",
    newSeverity: undefined,
    newOccurrence: undefined,
    newDetection: undefined,
    newRpn: undefined,
    searchTags: ["estampagem", "trinca", "repuxo", "ruptura", "chapa", "prensa", "estricção"],
    lastRevisionDate: "2026-08-20",
    revisionVersion: 1,
  },
  {
    id: "PFMEA-002",
    process: "Estampagem Automotiva",
    processStep: "Op. 10 - Estampagem",
    workElements4M: "Máquina: Prensa Mecânica 800T / Ferramenta: Facas de Corte e Punções de Furação / Material: Bobina de Aço",
    processFunction: "Cortar e perfurar o blank mantendo arestas regulares e furos calibrados",
    processStepFunction: "Op. 10 - Realizar corte de contorno e puncionamento de furos conforme desenho técnico",
    productCharacteristic: "Altura de rebarba ≤ 0.05 mm, diâmetro dos furos Ø 8.5 ± 0.1 mm",
    workElementFunction: "Efetuar cisalhamento com folga de corte de 8% a 10% da espessura da chapa",
    processCharacteristic: "Folga de corte matriz/punção: 0.08 mm a 0.12 mm / Afiação da faca a cada 50.000 golpes",
    failureEffect: "Dificuldade no encaixe na soldagem subsequente, risco de corte para operador e perda de estanqueidade",
    severity: 6,
    failureMode: "Rebarba cortante excessiva nas bordas e furos puncionados",
    potentialCause: "Desgaste do fio de corte dos punções/facas ou folga excessiva entre punção e matriz de corte",
    currentPrevention: "Plano de afiação preventiva de ferramentas a cada 40.000 golpes e revestimento TiCN nos punções",
    occurrence: 3,
    currentDetection: "Verificação táctil e medição da altura de rebarba com micrômetro/relógio comparador (5 peças/turno)",
    detection: 3,
    rpn: 54,
    actionPriority: "Baixa",
    specialCharacteristic: "S",
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
    classification: "S",
    recommendedAction: "",
    responsible: "",
    takenAction: "",
    newSeverity: undefined,
    newOccurrence: undefined,
    newDetection: undefined,
    newRpn: undefined,
    searchTags: ["rebarba", "corte", "furação", "punção", "faca", "afiamento", "cisalhamento"],
    lastRevisionDate: "2026-08-10",
    revisionVersion: 1,
  },
  {
    id: "PFMEA-003",
    process: "Estampagem Automotiva",
    processStep: "Op. 10 - Estampagem",
    workElements4M: "Máquina: Prensa de Estampagem / Ferramenta: Matriz com Quebra-Rugas (Drawbeads) / Material: Chapa",
    processFunction: "Conformar painel liso e sem ondulações para acabamento estético e montagem",
    processStepFunction: "Op. 10 - Controlar o escoamento do material com quebra-rugas durante o curso de descida",
    productCharacteristic: "Superfície isenta de rugas e ondulações (perfil de planicidade classe A / B)",
    workElementFunction: "Retenção uniforme do material na matriz pelo prensachapas com pressão dosada",
    processCharacteristic: "Pressão de cilindros de nitrogênio: 120 bar ± 5 bar / Raio do quebra-rugas: R 4.0 mm",
    failureEffect: "Não assentamento com peças adjacentes, retrabalho de lixamento na montadora e defeito estético perceptível",
    severity: 6,
    failureMode: "Enrugamento superficial no flange e dobras de material no raio",
    potentialCause: "Pressão insuficiente do prensa-chapas, desgaste nos drawbeads ou escoamento descontrolado do blank",
    currentPrevention: "Monitoramento contínuo da pressão dos cilindros de nitrogênio e manutenção das superfícies de prensagem",
    occurrence: 2,
    currentDetection: "Inspeção visual 100% com pedra de óleo (Stoning) e gabarito de perfil de superfície",
    detection: 2,
    rpn: 24,
    actionPriority: "Baixa",
    specialCharacteristic: "Y",
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
    classification: "Y",
    recommendedAction: "",
    responsible: "",
    takenAction: "",
    newSeverity: undefined,
    newOccurrence: undefined,
    newDetection: undefined,
    newRpn: undefined,
    searchTags: ["rugas", "enrugamento", "ondulação", "flange", "drawbeads", "nitrogênio"],
    lastRevisionDate: "2026-08-15",
    revisionVersion: 1,
  },
  {
    id: "PFMEA-004",
    process: "Estampagem Automotiva",
    processStep: "Op. 10 - Estampagem",
    workElements4M: "Máquina: Prensa de Estampagem / Ferramenta: Matriz de Calibração / Material: Aço Alta Resistência (AHSS)",
    processFunction: "Assegurar estabilidade dimensional geométrica do perfil estampado",
    processStepFunction: "Op. 10 - Conformar e calibrar as dimensões finais compensando o retorno elástico",
    productCharacteristic: "Perfil geométrico de contorno dentro da tolerância de ± 0.5 mm no dispositivo de controle",
    workElementFunction: "Executar cunhagem e calibração no Ponto Morto Inferior (PMI) com curso preciso",
    processCharacteristic: "Altura de fechamento da prensa: 450.00 mm ± 0.02 mm / Tempo de permanência no PMI: 0.3s",
    failureEffect: "Desalinhamento na montagem de carroceria/chassi, frestas fora do padrão e retrabalho de ajuste",
    severity: 7,
    failureMode: "Dimensões fora do especificado / Abertura de abas por retorno elástico (Springback)",
    potentialCause: "Variação de limite de escoamento da bobina de aço ou ajuste incorreto da altura de fechamento da prensa",
    currentPrevention: "Validação de certificado de usina para propriedades mecânicas do aço e compensação de springback na matriz",
    occurrence: 3,
    currentDetection: "Checagem em dispositivo de controle com relógios comparadores (Checking Fixture) 1 peça a cada 2 horas",
    detection: 3,
    rpn: 63,
    actionPriority: "Baixa",
    specialCharacteristic: "*",
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
    classification: "*",
    recommendedAction: "",
    responsible: "",
    takenAction: "",
    newSeverity: undefined,
    newOccurrence: undefined,
    newDetection: undefined,
    newRpn: undefined,
    searchTags: ["retorno elástico", "springback", "dimensional", "empenamento", "calibração", "tolerância"],
    lastRevisionDate: "2026-07-28",
    revisionVersion: 1,
  },
  {
    id: "PFMEA-005",
    process: "Estampagem Automotiva",
    processStep: "Op. 10 - Estampagem",
    workElements4M: "Máquina: Prensa / Ferramenta: Matriz Polida / Meio: Dispositivo de Limpeza de Chapas",
    processFunction: "Garantir superfície classe de acabamento sem danos mecânicos ou riscos",
    processStepFunction: "Op. 10 - Transferir a forma sem aderência de partículas ou riscos na superfície da chapa",
    productCharacteristic: "Superfície livre de riscos profundos, marcas de matriz e partículas incrustadas",
    workElementFunction: "Manter superfícies de contato polidas espelhadas (Ra < 0.1) e lubrificação limpa",
    processCharacteristic: "Limpeza dos rolos lavadores de chapa / Rugosidade da matriz Ra < 0.1 µm",
    failureEffect: "Defeito visual após pintura na montadora e perda de proteção contra corrosão",
    severity: 5,
    failureMode: "Riscos lineares, marcas de arraste e afundamentos por sujeira na face da peça",
    potentialCause: "Aderência de partículas metálicas na superfície da matriz (galling) ou rolos lavadores de chapas sujos",
    currentPrevention: "Limpeza programada das matrizes no setup e polimento regular com pasta diamantada",
    occurrence: 3,
    currentDetection: "Inspeção visual 100% na saída da linha com iluminação fluorescente angular de alta intensidade",
    detection: 2,
    rpn: 30,
    actionPriority: "Baixa",
    specialCharacteristic: "N/A",
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
    classification: "N/A",
    recommendedAction: "",
    responsible: "",
    takenAction: "",
    newSeverity: undefined,
    newOccurrence: undefined,
    newDetection: undefined,
    newRpn: undefined,
    searchTags: ["risco", "arranhão", "galling", "marcas", "superfície", "sujeira", "acabamento"],
    lastRevisionDate: "2026-08-05",
    revisionVersion: 1,
  },
  {
    id: "PFMEA-006",
    process: "Estampagem Automotiva",
    processStep: "Op. 10 - Estampagem",
    workElements4M: "Máquina: Alimentador Eletrônico / Ferramenta: Pinos Guias e Sensores de Presença / Operador",
    processFunction: "Centralizar perfeitamente o blank metálico sobre a matriz antes do golpe",
    processStepFunction: "Op. 10 - Alimentar e travar o blank nas guias de referência garantindo simetria de conformação",
    productCharacteristic: "Simetria dimensional e presença completa de todos os detalhes geométricos",
    workElementFunction: "Sensores ópticos e indutivos detectando o correto assentamento contra os batentes",
    processCharacteristic: "Tolerância de posicionamento do alimentador ± 0.2 mm / Sinal de intertravamento ativo",
    failureEffect: "Peça incompleta com corte deslocado, furos fora de centro e colisão/dano na ferramenta de estampagem",
    severity: 7,
    failureMode: "Blank estampado fora de centro / Geometria assimétrica com falta de material",
    potentialCause: "Desgaste ou soltura dos pinos guias/batentes mecânicos ou falha de leitura do sensor de posição",
    currentPrevention: "Sensores indutivos de assentamento de chapa integrados ao CLP da prensa com bloqueio automático (Poka-Yoke)",
    occurrence: 1,
    currentDetection: "Intertravamento eletrônico do ciclo da prensa por sensores de presença 100% das peças",
    detection: 1,
    rpn: 7,
    actionPriority: "Baixa",
    specialCharacteristic: "*",
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
    classification: "*",
    recommendedAction: "",
    responsible: "",
    takenAction: "",
    newSeverity: undefined,
    newOccurrence: undefined,
    newDetection: undefined,
    newRpn: undefined,
    searchTags: ["posicionamento", "batente", "deslocado", "assimetria", "poka-yoke", "alimentador", "sensor"],
    lastRevisionDate: "2026-08-12",
    revisionVersion: 1,
  },
];

export const initialComplaints: FastResponseComplaint[] = [
  {
    id: "REC-2024-085",
    date: "2024-08-14",
    client: "Montadora Alpha Brasil",
    partNumber: "EIX-8842-TX",
    partName: "Conjunto Eixo Traseiro com Rolamento",
    rawDescription: "Cliente relata ruído excessivo em rodagem a 60km/h e vibração perceptível no volante durante o teste de pista 0km. Lote de 120 eixos recebidos nesta semana.",
    processStep: "Montagem do Rolamento",
    realFailureMode: "Rolamento com folga excessiva / Assentamento incompleto",
    impactDescription: "Vibração e ruído perceptível no veículo 0km; cliente ameaça emitir notificação de não-conformidade grave.",
    reportedSeverity: 8,
    rootCause: "Desgaste acentuado da ponteira da prensa após 15.000 ciclos sem recalibração, gerando prensagem com força inferior a 3.2 bar.",
    origin: "Montadora (Linha 0km)",
    status: "Pendente de Análise",
  },
  {
    id: "REC-2024-086",
    date: "2024-08-18",
    client: "Montadora Beta Motors",
    partNumber: "BR-SUSP-304",
    partName: "Braço Oscilante Dianteiro Direito",
    rawDescription: "Inspetor de recebimento da montadora identificou trinca superficial no cordão de solda da bucha inferior durante teste amostral de penetração.",
    processStep: "Soldagem Robotizada do Braço Oscilante",
    realFailureMode: "Trinca no cordão de solda / Falta de fusão",
    impactDescription: "Interrupção momentânea na linha de montagem da montadora para triagem de 450 peças.",
    reportedSeverity: 9,
    rootCause: "Bico de contato da tocha de solda com acúmulo de respingos (spatter), desviando o arco elétrico e causando baixa energia de soldagem.",
    origin: "Montadora (Linha 0km)",
    status: "Pendente de Análise",
  },
  {
    id: "REC-2024-087",
    date: "2024-08-20",
    client: "AgroTech Máquinas Agrícolas",
    partNumber: "VLV-HYD-09",
    partName: "Válvula de Controle Hidráulico",
    rawDescription: "Concessionária identificou vazamento de óleo no bloco hidráulico de 3 tratores entregues no campo. O-ring apresentava corte transversal.",
    processStep: "Aplicação do Anel de Vedação O-ring",
    realFailureMode: "Anel O-ring cortado / mordido durante montagem",
    impactDescription: "Vazamento em campo com reclamação direta do agricultor e substituição em garantia.",
    reportedSeverity: 7,
    rootCause: "Operador utilizou chave de fenda metálica para empurrar o anel de vedação após quebra da espátula de nylon regulamentar.",
    origin: "Cliente Externo (Campo)",
    status: "Pendente de Análise",
  },
  {
    id: "REC-2024-088",
    date: "2024-08-22",
    client: "Montadora Gamma Auto",
    partNumber: "CHIC-EL-55",
    partName: "Chicote Principal do Painel",
    rawDescription: "Falha de comunicação intermitente no barramento CAN. Terminal do pino 14 estava frouxo e saiu do conector ao puxar levemente.",
    processStep: "Crimpagem de Terminais do Chicote Elétrico",
    realFailureMode: "Crimpagem insuficiente / Terminal solto",
    impactDescription: "Luz de injeção acesa no final de linha da montadora; gerou 1 hora de retrabalho na linha de teste.",
    reportedSeverity: 8,
    rootCause: "Operador trocou bobina de terminais sem realizar o teste destrutivo de tração (Pull Test) exigido na instrução de trabalho IT-044.",
    origin: "Montadora (Linha 0km)",
    status: "Pendente de Análise",
  },
  {
    id: "REC-2024-089",
    date: "2024-08-25",
    client: "Delta Caminhões",
    partNumber: "BAR-EST-01",
    partName: "Barra Estabilizadora Dianteira",
    rawDescription: "Auditoria de qualidade no pátio identificou que 2 parafusos de fixação estavam com torque residual de apenas 35 Nm (especificado: 75 Nm).",
    processStep: "Aperto de Parafusos da Barra Estabilizadora",
    realFailureMode: "Torque insuficiente / Parafuso com aperto parcial",
    impactDescription: "Risco de desprendimento do componente sob carga pesada na rodovia.",
    reportedSeverity: 9,
    rootCause: "Queda na pressão de ar da linha pneumática principal durante o pico de produção das 14h30.",
    origin: "Auditoria",
    status: "Pendente de Análise",
  },
  {
    id: "REC-2024-090",
    date: "2024-08-27",
    client: "Montadora Epsilon",
    partNumber: "SUP-MT-202",
    partName: "Suporte do Motor em Alumínio Injetado",
    rawDescription: "Presença de rebarba afiada de fundição no canal de encaixe impedindo o assentamento no coxim de borracha. Peça travou na linha do cliente.",
    processStep: "Acabamento / Rebarbação de Fundição",
    realFailureMode: "Rebarba excessiva / Aresta cortante no canal de encaixe",
    impactDescription: "Parada de posto de trabalho na montadora por 25 minutos.",
    reportedSeverity: 8,
    rootCause: "Desgaste da matriz de corte de rebarbação na fundição e ausência de dispositivo poka-yoke de gabarito.",
    origin: "Montadora (Linha 0km)",
    status: "Pendente de Análise",
  },
];

export const initialFeedbackLogs: FeedbackLog[] = [
  {
    id: "LOG-2024-001",
    timestamp: "2024-08-10 14:32",
    complaintId: "REC-2024-079",
    client: "Montadora Alpha Brasil",
    partNumber: "EIX-8842-TX",
    pfmeaId: "PFMEA-001",
    processStep: "Montagem do Rolamento",
    failureMode: "Rolamento com folga / Assentamento incompleto",
    oldS: 7,
    newS: 8,
    oldO: 2,
    newO: 4,
    oldD: 3,
    newD: 6,
    oldRpn: 42,
    newRpn: 192,
    decision: "Aprovado",
    actionPlan: "Instalação de célula de carga piezoelétrica na prensa com controle de curva Força x Deslocamento e bloqueio automático (Poka-Yoke).",
    responsible: "Eng. Lucas Silva (Processos)",
    targetDate: "2024-09-30",
    justification: "Reincidência de folga detectada na montadora. Controles manuais atuais insuficientes.",
    engineerName: "Eng. Carlos Mendes - Especialista Qualidade",
  },
];

export const SEVERITY_TABLE_GUIDE = [
  { score: 10, level: "Perigo Muito Alto (Sem Aviso)", description: "Afeta a segurança do veículo ou envolve não-conformidade com regulamentação governamental sem aviso prévio." },
  { score: 9, level: "Perigo Alto (Com Aviso)", description: "Afeta a segurança do veículo ou envolve não-conformidade governamental, porém com sinal sonoro/luminoso de aviso." },
  { score: 8, level: "Perda da Função Primária", description: "Veículo/produto inoperável (perda de função principal). Parada de linha no cliente/montadora." },
  { score: 7, level: "Degradação da Função Primária", description: "Veículo/produto opera com nível reduzido de desempenho. Cliente muito insatisfeito (reclamação formal imediata)." },
  { score: 6, level: "Perda de Função Secundária", description: "Perda de função de conveniência ou conforto (ex: ar condicionado, ruído moderado). Cliente insatisfeito." },
  { score: 5, level: "Degradação de Função Secundária", description: "Função secundária opera com desempenho reduzido. Cliente percebe incômodo." },
  { score: 4, level: "Incômodo Moderado", description: "Aparência, ruído ou acabamento imperfeito notado por > 75% dos clientes." },
  { score: 3, level: "Incômodo Leve", description: "Defeito de acabamento notado por 50% dos clientes." },
  { score: 2, level: "Incômodo Muito Leve", description: "Defeito de acabamento perceptível apenas por operadores treinados (< 25% dos clientes)." },
  { score: 1, level: "Sem Efeito Perceptível", description: "Nenhum impacto perceptível no cliente ou na operação do processo." },
];

export const OCCURRENCE_TABLE_GUIDE = [
  { score: 10, level: "Muito Alta (≥ 100 por mil / > 10%)", description: "Falha quase inevitável sem controles robustos." },
  { score: 9, level: "Alta (50 por mil / 5%)", description: "Ocorrência frequente em processos similares." },
  { score: 8, level: "Alta (20 por mil / 2%)", description: "Ocorrência repetitiva no mesmo semestre." },
  { score: 7, level: "Moderadamente Alta (10 por mil / 1%)", description: "Ocorrências ocasionais recorrentes." },
  { score: 6, level: "Moderada (5 por mil / 0.5%)", description: "Processo com capacidade marginal (Cpk < 1.00)." },
  { score: 5, level: "Moderadamente Baixa (2 por mil / 0.2%)", description: "Falha documentada 2 a 3 vezes no histórico recente." },
  { score: 4, level: "Baixa (1 por mil / 0.1%)", description: "Ocorrência isolada em processos controlados (Cpk ≈ 1.33)." },
  { score: 3, level: "Baixa Remota (0.5 por mil / 0.05%)", description: "Processo sob controle estatístico estável." },
  { score: 2, level: "Muito Baixa (0.1 por mil / 0.01%)", description: "Ocorrência rara, protegida por controles de processo." },
  { score: 1, level: "Extremamente Remota (< 0.01 por mil)", description: "Falha prevenida por desenho à prova de erros (Poka-Yoke físico)." },
];

export const DETECTION_TABLE_GUIDE = [
  { score: 10, level: "Absolutamente Incerta", description: "Não existe controle atual ou o controle não tem capacidade de detectar a falha." },
  { score: 9, level: "Muito Remota", description: "Controles baseados apenas em auditorias esporádicas ou inspeção visual indireta." },
  { score: 8, level: "Remota", description: "Inspeção visual amostral por amostragem simples pós-processo (falha escapa para o cliente)." },
  { score: 7, level: "Muito Baixa", description: "Inspeção dimensional manual amostral pós-processo com instrumentos convencionais." },
  { score: 6, level: "Baixa", description: "Controle por variáveis com cartas de controle estatístico (CEP) pós-operação." },
  { score: 5, level: "Moderada", description: "Controle 100% manual por operador em estação dedicada antes da expedição." },
  { score: 4, level: "Moderadamente Alta", description: "Detecção na própria estação por medidores passa/não-passa ou sensores simples." },
  { score: 3, level: "Alta", description: "Detecção automatizada na estação subsequente com travamento de esteira." },
  { score: 2, level: "Muito Alta", description: "Dispositivo à prova de erro (Poka-Yoke) na própria estação que impede passagem da peça defeituosa." },
  { score: 1, level: "Detecção Quase Certa", description: "Dispositivo Poka-Yoke que impossibilita a geração do erro ou sistema de visão 100% integrado." },
];

export const INITIAL_PFMEA_MASTER = initialPfmeaMaster;
export const INITIAL_COMPLAINTS = initialComplaints;
export const INITIAL_LOGS = initialFeedbackLogs;

export const SEVERITY_TABLE = SEVERITY_TABLE_GUIDE;
export const OCCURRENCE_TABLE = OCCURRENCE_TABLE_GUIDE;
export const DETECTION_TABLE = DETECTION_TABLE_GUIDE;

