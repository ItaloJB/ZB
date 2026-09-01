import * as XLSX from "xlsx";
import { FastResponseComplaint, FeedbackLog, PfmeaRow } from "../types";
import { calculateAp } from "../data/initialData";

// Helper to trigger file download in browser
function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Export PFMEA Master to Excel (AIAG-VDA 30 Columns Standard)
export function exportPfmeaToExcel(pfmeaList: PfmeaRow[], filename = "PFMEA_Master_AIAG_VDA.xlsx") {
  const data = pfmeaList.map(row => {
    const s = row.severity || 5;
    const o = row.occurrence || 2;
    const d = row.detection || 3;
    const ap = row.actionPriority || calculateAp(s, o, d);
    const revS = row.revisedSeverity ?? row.newSeverity ?? s;
    const revO = row.revisedOccurrence ?? row.newOccurrence ?? 1;
    const revD = row.revisedDetection ?? row.newDetection ?? 1;
    const revAp = row.revisedActionPriority ?? (row.revisedSeverity ? calculateAp(revS, revO, revD) : ap);

    return {
      "Processo": row.process || "Processo Geral",
      "Etapa do Processo": row.processStep || "",
      "Elementos de Trabalho (4M)": row.workElements4M || "",
      "Função do Processo": row.processFunction || "",
      "Função da Etapa do Processo": row.processStepFunction || "",
      "Característica do Produto": row.productCharacteristic || "",
      "Função do Elemento de Trabalho": row.workElementFunction || "",
      "Característica do Processo": row.processCharacteristic || "",
      "Efeito de Falha": row.failureEffect || "",
      "Severidade (S)": s,
      "Modo de Falha": row.failureMode || "",
      "Causa da Falha": row.potentialCause || "",
      "Controle de Prevenção": row.currentPrevention || "",
      "Ocorrência (O)": o,
      "Controle de Detecção": row.currentDetection || "",
      "Detecção (D)": d,
      "PA (Prioridade de Ação)": ap,
      "Característica Especial": row.specialCharacteristic || row.classification || "N/A",
      "Ação Preventiva": row.preventiveAction || row.recommendedAction || "",
      "Ação de Detecção": row.detectionAction || "",
      "Pessoa Responsável": row.responsiblePerson || row.responsible || "",
      "Data Planejada para Conclusão": row.targetDate || "",
      "Ação Tomada": row.actionTaken || row.takenAction || "",
      "Data de Conclusão": row.completionDate || "",
      "Severidade (S) [Revisada]": row.revisedSeverity ?? row.newSeverity ?? "",
      "Ocorrência (O) [Revisada]": row.revisedOccurrence ?? row.newOccurrence ?? "",
      "Detecção (D) [Revisada]": row.revisedDetection ?? row.newDetection ?? "",
      "Característica Especial [Revisada]": row.revisedSpecialCharacteristic || "N/A",
      "PA (Prioridade de Ação) [Revisada]": row.revisedActionPriority || "",
      "Observações": row.observations || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PFMEA_AIAG_VDA");
  downloadWorkbook(workbook, filename);
}

// 2. Export Fast Response Complaints to Excel
export function exportComplaintsToExcel(complaints: FastResponseComplaint[], filename = "Fast_Response_Reclamacoes.xlsx") {
  const data = complaints.map(c => ({
    "ID Reclamação / RNC": c.id,
    "Data Ocorrência": c.date,
    "Cliente / Montadora": c.client,
    "Código da Peça": c.partNumber,
    "Nome da Peça": c.partName,
    "Descrição do Cliente / E-mail": c.rawDescription,
    "Etapa Relacionada": c.processStep,
    "Modo de Falha Real": c.realFailureMode,
    "Impacto no Cliente": c.impactDescription,
    "Severidade Reportada (1-10)": c.reportedSeverity,
    "Causa Raiz (5 Porquês)": c.rootCause,
    "Origem": c.origin,
    "Status": c.status,
    "PFMEA Vinculado": c.associatedPfmeaId || "",
    "Data Retroalimentação": c.feedbackDate || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Fast_Response");
  downloadWorkbook(workbook, filename);
}

// 3. Export Feedback Audit Log to Excel / CSV
export function exportFeedbackLogsToExcel(logs: FeedbackLog[], filename = "Registro_Retroalimentacao_PFMEA.xlsx") {
  const data = logs.map(l => ({
    "ID do Log": l.id,
    "Data/Hora": l.timestamp,
    "ID Reclamação": l.complaintId,
    "Cliente": l.client,
    "Código Peça": l.partNumber,
    "ID PFMEA": l.pfmeaId,
    "Etapa do Processo": l.processStep,
    "Modo de Falha": l.failureMode,
    "S Anterior": l.oldS,
    "S Novo": l.newS,
    "O Anterior": l.oldO,
    "O Novo": l.newO,
    "D Anterior": l.oldD,
    "D Novo": l.newD,
    "NPR Anterior": l.oldRpn,
    "NPR Novo": l.newRpn,
    "Decisão do Engenheiro": l.decision,
    "Plano de Ação": l.actionPlan,
    "Responsável": l.responsible,
    "Prazo": l.targetDate,
    "Justificativa Técnica": l.justification,
    "Engenheiro Validador": l.engineerName,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Log_Auditoria_IATF");
  downloadWorkbook(workbook, filename);
}

// 4. Download Pre-formatted Templates
export function downloadSampleTemplate(type: "pfmea" | "fast_response") {
  if (type === "pfmea") {
    const templateData = [
      {
        "Processo": "Linha de Montagem de Eixos Traseiros",
        "Etapa do Processo": "OP 30 - Montagem do Rolamento",
        "Elementos de Trabalho (4M)": "Máquina: Prensa Eletromecânica / Mão de Obra: Operador / Material: Rolamento 6204",
        "Função do Processo": "Garantir transmissão de rotação suave e suporte de carga radial do conjunto eixo traseiro",
        "Função da Etapa do Processo": "Pressionar e assentar o rolamento de esferas com interferência nominal de 0.03mm no alojamento",
        "Característica do Produto": "Interferência dimensional 0.030mm ± 0.005mm e assentamento face a face sem folga",
        "Função do Elemento de Trabalho": "Aplicar força axial controlada de 12 kN com monitoramento de curva de deslocamento",
        "Característica do Processo": "Pressão de prensagem: 4.5 a 5.2 bar / Curso de avanço: 45mm",
        "Efeito de Falha": "Ruído excessivo em rodagem, vibração perceptível e desgaste prematuro no veículo do cliente",
        "Severidade (S)": 7,
        "Modo de Falha": "Rolamento com folga / Assentamento incompleto no alojamento",
        "Causa da Falha": "Desgaste da bucha guia da prensa pneumática ou pressão hidráulica abaixo de 4.5 bar",
        "Controle de Prevenção": "Manutenção preventiva mensal do ferramental de prensagem e calibração de células de carga",
        "Ocorrência (O)": 2,
        "Controle de Detecção": "Inspeção visual amostral por atributos (1 peça a cada 50 peças) e checagem de batente",
        "Detecção (D)": 3,
        "PA (Prioridade de Ação)": "Baixa",
        "Característica Especial": "SC",
        "Ação Preventiva": "Implementar sensor de pressão digital e sistema de monitoramento de curva força x deslocamento",
        "Ação de Detecção": "Bloqueio automático Poka-yoke de saída se a curva de prensagem estiver fora da janela",
        "Pessoa Responsável": "Carlos Silva (Eng. Processos)",
        "Data Planejada para Conclusão": "2026-09-30",
        "Ação Tomada": "Transdutor piezoelétrico instalado na prensa com alarme acústico e trava de porta",
        "Data de Conclusão": "2026-09-15",
        "Severidade (S) [Revisada]": 7,
        "Ocorrência (O) [Revisada]": 1,
        "Detecção (D) [Revisada]": 1,
        "Característica Especial [Revisada]": "SC",
        "PA (Prioridade de Ação) [Revisada]": "Baixa",
        "Observações": "Homologado pelo SGQ e auditoria de processo IATF 16949.",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo_PFMEA_AIAG_VDA");
    downloadWorkbook(wb, "Modelo_PFMEA_AIAG_VDA.xlsx");
  } else {
    const templateData = [
      {
        "ID Reclamação / RNC": "REC-2024-001",
        "Data Ocorrência": "2024-08-01",
        "Cliente / Montadora": "Montadora Exemplo",
        "Código da Peça": "XYZ-1234",
        "Nome da Peça": "Eixo Traseiro",
        "Descrição do Cliente / E-mail": "Cliente identificou ruído durante teste de rodagem 0km",
        "Etapa Relacionada": "Montagem do Rolamento",
        "Modo de Falha Real": "Rolamento com folga",
        "Impacto no Cliente": "Vibração no veículo",
        "Severidade Reportada (1-10)": 8,
        "Causa Raiz (5 Porquês)": "Desgaste da matriz de prensagem",
        "Origem": "Montadora (Linha 0km)",
        "Status": "Pendente de Análise",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo_Fast_Response");
    downloadWorkbook(wb, "Modelo_Fast_Response.xlsx");
  }
}

// 4.1 Download single complaint sample template (e.g. PDCA 000-26.xlsx) with ZB 8D standard
export function downloadSingleComplaintTemplate() {
  const currentYear = new Date().getFullYear().toString().slice(2);
  const pdcaNum = `PDCA 000/${currentYear}`;

  // Sheet 1: Identificação e 8D Geral
  const headerData = [
    {
      "Ícone / Padrão": "ZB - PDCA Análise e Soluções de Problemas",
      "PDCA Nº": pdcaNum,
      "Cliente": "Volkswagen do Brasil",
      "Conjunto / Peça Nº": "5U0-820-045-A",
      "Nome Conjunto / Peça": "Suporte de Fixação do Alternador",
      "Departamento Causador": "Usinagem / Qualidade",
      "Problema Identificado": "Parafusos girando em falso na fixação do suporte devido a rosca M8 com filete danificado.",
      "Data da Ocorrência": new Date().toISOString().slice(0, 10),
      "Tipo Reclamação": "Externo - Reclamação de Clientes",
      "Reincidência (Sim/Não)": "Não",
      "Descrição da Não Conformidade": "Parafusos girando em falso na fixação do suporte devido a rosca M8 com filete danificado.",
      "Característica Especial (Sim/Não)": "Sim (Segurança / Crítica)",
      "Nº Documento Cliente": "RNC-VW-2026-8819",
      "Origem": "Montadora (Linha 0km)",
      "Severidade": 8,
    }
  ];

  // Sheet 2: D1 - Formação de Equipe
  const teamData = [
    { "Papel": "Líder 8D", "Nome": "Carlos Eduardo Silva", "Departamento": "Garantia da Qualidade", "Função": "Especialista em Confiabilidade", "E-mail": "carlos.silva@zb-auto.com" },
    { "Papel": "Membro", "Nome": "Mariana Santos", "Departamento": "Engenharia de Processos", "Função": "Engenheira de Processo Usinagem", "E-mail": "mariana.santos@zb-auto.com" },
    { "Papel": "Membro", "Nome": "Roberto Rocha", "Departamento": "Manutenção Industrial", "Função": "Supervisor de Manutenção", "E-mail": "roberto.rocha@zb-auto.com" },
    { "Papel": "Membro", "Nome": "Juliana Lima", "Departamento": "Produção", "Função": "Líder de Célula CNC", "E-mail": "juliana.lima@zb-auto.com" },
  ];

  // Sheet 3: D2 - 5W2H
  const fiveWData = [
    { "Item": "What (O que aconteceu?)", "Resposta": "Rosca M8 espanada no furo roscado de fixação da carcaça" },
    { "Item": "Why (Por que é problema?)", "Resposta": "Impossibilita torque nominal de 25 Nm na montadora e gera risco de soltura" },
    { "Item": "Where (Onde ocorreu?)", "Resposta": "Linha de montagem do motor 1.0 TSI (Montadora)" },
    { "Item": "When (Quando ocorreu?)", "Resposta": "Lote 26-B, turno 2" },
    { "Item": "Who (Quem detectou?)", "Resposta": "Operador do posto de fixação do alternador na montadora" },
    { "Item": "How (Como ocorreu?)", "Resposta": "Macho de roscar sofreu microrruptura no 3º dente sem alarme de esforço" },
    { "Item": "How much (Quanto / Impacto?)", "Resposta": "42 peças retidas / 2 horas de contenção na linha" },
  ];

  // Sheet 4: D3 - Ações de Contenção
  const containmentData = [
    { "Descrição da Ação": "Bloqueio de 100% do estoque de peças acabadas e inspeção com calibrador passa/não-passa", "Local": "Estoque Interno ZB", "Responsável": "Qualidade Interna", "Início": "2026-08-20", "Conclusão": "2026-08-21", "NF Ponto de Corte": "NF-44910", "Status": "Concluído" },
    { "Descrição da Ação": "Envio de equipe residente para triagem 100% de peças no cliente", "Local": "Fábrica do Cliente (Montadora)", "Responsável": "Residente Qualidade", "Início": "2026-08-20", "Conclusão": "2026-08-22", "NF Ponto de Corte": "NF-44912", "Status": "Concluído" },
  ];

  // Sheet 5: D4 - Ishikawa & 5 Porquês
  const ishikawaData = [
    { "Eixo 6M": "Mão de Obra", "Causa Potencial": "Operador não realizou checagem periódica do macho no início do turno" },
    { "Eixo 6M": "Método", "Causa Potencial": "Falta de instrução clara para descarte de machos por número de furos usinados" },
    { "Eixo 6M": "Material", "Causa Potencial": "Lote de ferro fundido com dureza ligeiramente acima do nominal (+15 HB)" },
    { "Eixo 6M": "Máquina", "Causa Potencial": "Fuso com folga axial mínima na reversão de rosqueamento" },
    { "Eixo 6M": "Medição", "Causa Potencial": "Calibrador tampão de rosca com desgaste na haste de fixação" },
    { "Eixo 6M": "Meio Ambiente", "Causa Potencial": "Temperatura elevada no cabeçote sem refrigeração direta" },
  ];

  // Sheet 6: D5 & D6 - Ações Corretivas (G/Y/R)
  const actionsData = [
    { "Pilar": "Ocorrência (Ação 1)", "Descrição": "Instalar monitor de corrente/torque no fuso com alarme sonoro e parada automática de quebra de ferramenta", "Responsável": "Engenharia de Automação", "Prazo": "2026-09-15", "Status": "G (Concluído)", "Evidência": "Sensor instalado no CNC-04 e validado" },
    { "Pilar": "Detecção (Ação 1)", "Descrição": "Implementar controle automático com pino pneumático sensorizado no fim de curso da célula", "Responsável": "Qualidade Assegurada", "Prazo": "2026-09-20", "Status": "G (Concluído)", "Evidência": "Poka-yoke de rosca 100% em operação" },
    { "Pilar": "Sistêmica (Ação 1)", "Descrição": "Revisar procedimento PQP-042 estabelecendo vida útil máxima de 800 ciclos para machos de roscar", "Responsável": "Garantia da Qualidade", "Prazo": "2026-09-30", "Status": "G (Concluído)", "Evidência": "IT-USIN-088 aprovada no sistema" },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(headerData), "00_Identificacao_ZB");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamData), "D1_Equipe");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fiveWData), "D2_5W2H");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(containmentData), "D3_Contencao");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ishikawaData), "D4_Ishikawa_6M");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(actionsData), "D5_D6_Acoes_Corretivas");

  downloadWorkbook(wb, `PDCA 000-${currentYear}.xlsx`);
}

// 5. Parse imported Excel / CSV file with automatic header row detection
export async function parseUploadedExcel(file: File): Promise<{ sheetName: string; rows: Record<string, any>[] }[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  
  const results: { sheetName: string; rows: Record<string, any>[] }[] = [];
  
  // Known keywords to identify true header rows
  const headerKeywords = [
    "processo", "etapa", "operacao", "operação", "4m", "elemento", "funcao", "função",
    "caracteristica", "característica", "efeito", "falha", "severidade", "modo", "causa",
    "prevencao", "prevenção", "ocorrencia", "ocorrência", "deteccao", "detecção", "pa",
    "rpn", "especial", "responsavel", "responsável", "planejada", "tomada", "conclusao",
    "conclusão", "observacoes", "observações", "cliente", "reclamacao", "reclamação", "defeito"
  ];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    // Get 2D grid of raw cell values
    const rawGrid: any[][] = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" });
    if (!rawGrid || rawGrid.length === 0) continue;

    // Detect the best header row in the first 15 rows
    let bestHeaderIdx = 0;
    let maxMatchCount = 0;

    const maxScanRows = Math.min(15, rawGrid.length);
    for (let r = 0; r < maxScanRows; r++) {
      const row = rawGrid[r];
      if (!Array.isArray(row)) continue;

      let matches = 0;
      for (const cell of row) {
        if (cell === undefined || cell === null) continue;
        const str = String(cell).toLowerCase().trim();
        if (!str) continue;

        // Check if string matches known keywords or numbered columns like "1. Processo"
        if (/^\d+[\.\-\s]/.test(str)) {
          matches += 2;
        }
        if (headerKeywords.some(kw => str.includes(kw))) {
          matches += 1;
        }
      }

      if (matches > maxMatchCount) {
        maxMatchCount = matches;
        bestHeaderIdx = r;
      }
    }

    // Extract headers from the best header row
    const headerRow = rawGrid[bestHeaderIdx] || [];
    const headers: string[] = headerRow.map((cell, colIdx) => {
      const cleaned = String(cell || "").trim();
      return cleaned || `Coluna_${colIdx + 1}`;
    });

    // Map each data row (rows after the header row)
    const rows: Record<string, any>[] = [];
    for (let r = bestHeaderIdx + 1; r < rawGrid.length; r++) {
      const rowData = rawGrid[r];
      if (!Array.isArray(rowData)) continue;

      // Skip completely empty rows
      const hasContent = rowData.some(c => c !== undefined && c !== null && String(c).trim() !== "");
      if (!hasContent) continue;

      const rowObj: Record<string, any> = { _rawArray: rowData };
      headers.forEach((h, colIdx) => {
        rowObj[h] = rowData[colIdx] !== undefined ? rowData[colIdx] : "";
      });

      rows.push(rowObj);
    }

    // If rows were parsed, push to results; otherwise fallback to default sheet_to_json
    if (rows.length > 0) {
      results.push({ sheetName, rows });
    } else {
      const fallbackJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
      results.push({ sheetName, rows: fallbackJson });
    }
  }

  return results;
}

// Normalize text for flexible fuzzy matching (strips accents, leading numbers, punctuation)
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/^\d+[\.\-\s_:]*/, "") // remove leading column numbers like "1. ", "10 - ", "01."
    .replace(/[^a-z0-9]/g, " ") // replace special chars with spaces
    .replace(/\s+/g, " ")
    .trim();
}

// Flexible header normalizer for PFMEA (AIAG-VDA 30 Columns Standard)
export function mapRowsToPfmea(rows: Record<string, any>[]): PfmeaRow[] {
  return rows.map((r, index) => {
    const rawArray: any[] = Array.isArray(r._rawArray) ? r._rawArray : [];

    // Helper to find value from row object matching one of the keys or positional index
    const findVal = (keywords: string[], positionalIndex?: number): any => {
      // 1. Try finding in object keys
      const objectKeys = Object.keys(r).filter(k => k !== "_rawArray");
      
      for (const kw of keywords) {
        const normKw = normalizeKey(kw);
        
        // Exact normalized match
        for (const col of objectKeys) {
          const normCol = normalizeKey(col);
          if (normCol === normKw) {
            const val = r[col];
            if (val !== undefined && val !== null && String(val).trim() !== "") {
              return val;
            }
          }
        }

        // Substring / includes match
        for (const col of objectKeys) {
          const normCol = normalizeKey(col);
          if (normCol.includes(normKw) || normKw.includes(normCol)) {
            const val = r[col];
            if (val !== undefined && val !== null && String(val).trim() !== "") {
              return val;
            }
          }
        }
      }

      // 2. Fallback to positional index in raw row array if available
      if (positionalIndex !== undefined && rawArray[positionalIndex] !== undefined) {
        const posVal = rawArray[positionalIndex];
        if (posVal !== undefined && posVal !== null && String(posVal).trim() !== "") {
          return posVal;
        }
      }

      return "";
    };

    // 1-8: Estrutura e Função
    const processVal = String(findVal(["processo", "process item", "sistema", "linha", "item do processo", "linha de producao"], 0) || "Processo Geral").trim();
    const processStepVal = String(findVal(["etapa do processo", "etapa", "operacao", "operação", "step", "posto", "estacao"], 1) || `Etapa ${index + 1}`).trim();
    const workElementsVal = String(findVal(["elementos de trabalho 4m", "elementos de trabalho", "4m", "elemento de trabalho", "meio de trabalho", "recurso"], 2) || "Máquina / Mão de Obra").trim();
    const processFuncVal = String(findVal(["funcao do processo", "função do processo", "funcao processo", "função processo", "funcao"], 3) || "Garantir requisitos do processo").trim();
    const processStepFuncVal = String(findVal(["funcao da etapa do processo", "função da etapa do processo", "funcao da etapa", "função da etapa", "funcao etapa"], 4) || "Executar operação conforme especificação").trim();
    const productCharVal = String(findVal(["caracteristica do produto", "característica do produto", "especificacao produto", "especificação produto", "requisito produto"], 5) || "").trim();
    const workElemFuncVal = String(findVal(["funcao do elemento de trabalho", "função do elemento de trabalho", "funcao do elemento", "função do elemento", "funcao elemento"], 6) || "").trim();
    const processCharVal = String(findVal(["caracteristica do processo", "característica do processo", "parametro de processo", "parâmetro de processo", "variavel de processo"], 7) || "").trim();

    // 9-12: Análise de Falhas
    const failureEffectVal = String(findVal(["efeito de falha", "efeito da falha", "efeito potencial", "efeito", "impacto", "consequencia", "consequência"], 8) || "Impacto no cliente / produto").trim();
    const rawS = findVal(["severidade s", "severidade", "sev", "s", "grau de severidade"], 9);
    const s = Number(rawS) || 5;

    const failureModeVal = String(findVal(["modo de falha", "falha potencial", "modo falha", "defeito", "nao conformidade", "não conformidade"], 10) || "Modo de falha não especificado").trim();
    const potentialCauseVal = String(findVal(["causa da falha", "causa potencial", "causa", "mecanismo", "origem", "mecanismo de falha"], 11) || "Causa a investigar").trim();

    // 13-18: Análise de Risco Atual
    const prevControlVal = String(findVal(["controle de prevencao", "controle de prevenção", "controles de prevencao", "prevencao", "prevenção", "controle prev", "pc"], 12) || "Instrução de trabalho padrão").trim();
    const rawO = findVal(["ocorrencia o", "ocorrência o", "ocorrencia", "ocorrência", "oco", "o", "frequencia"], 13);
    const o = Number(rawO) || 2;

    const detControlVal = String(findVal(["controle de deteccao", "controle de detecção", "controles de deteccao", "deteccao", "detecção", "controle det", "dc"], 14) || "Inspeção visual amostral").trim();
    const rawD = findVal(["deteccao d", "detecção d", "deteccao", "detecção", "det", "d"], 15);
    const d = Number(rawD) || 3;

    const rpn = s * o * d;

    const rawAp = String(findVal(["pa prioridade de acao", "pa prioridade de ação", "pa pfmea", "prioridade de acao", "prioridade de ação", "pa", "ap", "action priority"], 16) || "").trim();
    const actionPriority = (rawAp === "Alta" || rawAp === "Média" || rawAp === "Baixa" || rawAp === "High" || rawAp === "Medium" || rawAp === "Low") 
      ? (rawAp === "High" ? "Alta" : rawAp === "Medium" ? "Média" : rawAp === "Low" ? "Baixa" : rawAp) as any 
      : calculateAp(s, o, d);

    const rawSpecial = String(findVal(["caracteristica especial", "característica especial", "classificacao", "classificação", "carac especial", "especial", "critica"], 17) || "").trim();
    let specialCharVal = "";
    if (rawSpecial === "*" || rawSpecial.toLowerCase().includes("crítico") || rawSpecial.toLowerCase().includes("critico")) {
      specialCharVal = "*";
    } else if (rawSpecial === "Y" || rawSpecial.toLowerCase().includes("importante")) {
      specialCharVal = "Y";
    } else if (rawSpecial === "D" || rawSpecial.toLowerCase().includes("segurança") || rawSpecial.toLowerCase().includes("seguranca") || rawSpecial.toUpperCase().includes("CC")) {
      specialCharVal = "D";
    } else if (rawSpecial === "R" || rawSpecial.toLowerCase().includes("regulamentar")) {
      specialCharVal = "R";
    } else if (rawSpecial === "S" || rawSpecial.toLowerCase().includes("significativa") || rawSpecial.toUpperCase().includes("SC")) {
      specialCharVal = "S";
    } else if (rawSpecial === "N/A" || rawSpecial.toLowerCase().includes("nenhuma") || rawSpecial === "-" || rawSpecial.toLowerCase() === "standard") {
      specialCharVal = "N/A";
    } else {
      specialCharVal = rawSpecial || "";
    }

    // 19-24: Otimização
    const prevActionVal = String(findVal(["acao preventiva", "ação preventiva", "acoes recomendadas", "ações recomendadas", "acao recomendada", "ação recomendada"], 18) || "").trim();
    const detActionVal = String(findVal(["acao de deteccao", "ação de detecção", "acao deteccao", "ação detecção"], 19) || "").trim();
    const respVal = String(findVal(["pessoa responsavel", "pessoa responsável", "responsavel", "responsável", "resp", "responsavel pela acao"], 20) || "").trim();
    const targetDateVal = String(findVal(["data planejada para conclusao", "data planejada para conclusão", "data planejada", "prazo", "data limite", "target date"], 21) || "").trim();
    const actionTakenVal = String(findVal(["acao tomada evidenciar", "ação tomada evidenciar", "acao tomada", "ação tomada", "evidencia", "evidência", "acoes tomadas", "ações tomadas"], 22) || "").trim();
    const compDateVal = String(findVal(["data de conclusao", "data de conclusão", "data conclusao", "data conclusão", "concluido em", "concluído em", "completion date"], 23) || "").trim();

    // 25-30: Reavaliação de Risco (Revisada)
    const revSVal = findVal(["severidade s revisada", "severidade revisada", "novo s", "novo severidade", "s rev", "s revisada"], 24);
    const revOVal = findVal(["ocorrencia o revisada", "ocorrência o revisada", "ocorrencia revisada", "ocorrência revisada", "novo o", "novo ocorrencia", "o rev", "o revisada"], 25);
    const revDVal = findVal(["deteccao d revisada", "detecção d revisada", "deteccao revisada", "detecção revisada", "novo d", "novo deteccao", "d rev", "d revisada"], 26);
    const rawRevSpecial = String(findVal(["caracteristica especial revisada", "característica especial revisada", "nova classificacao", "nova classificação", "carac especial rev"], 27) || "").trim();
    let revSpecialVal = "";
    if (rawRevSpecial === "*" || rawRevSpecial.toLowerCase().includes("crítico") || rawRevSpecial.toLowerCase().includes("critico")) {
      revSpecialVal = "*";
    } else if (rawRevSpecial === "Y" || rawRevSpecial.toLowerCase().includes("importante")) {
      revSpecialVal = "Y";
    } else if (rawRevSpecial === "D" || rawRevSpecial.toLowerCase().includes("segurança") || rawRevSpecial.toLowerCase().includes("seguranca") || rawRevSpecial.toUpperCase().includes("CC")) {
      revSpecialVal = "D";
    } else if (rawRevSpecial === "R" || rawRevSpecial.toLowerCase().includes("regulamentar")) {
      revSpecialVal = "R";
    } else if (rawRevSpecial === "S" || rawRevSpecial.toLowerCase().includes("significativa") || rawRevSpecial.toUpperCase().includes("SC")) {
      revSpecialVal = "S";
    } else if (rawRevSpecial === "N/A" || rawRevSpecial.toLowerCase().includes("nenhuma") || rawRevSpecial === "-" || rawRevSpecial.toLowerCase() === "standard") {
      revSpecialVal = "N/A";
    } else {
      revSpecialVal = rawRevSpecial;
    }
    const revApVal = String(findVal(["pa prioridade de acao revisada", "pa prioridade de ação revisada", "pa revisada", "novo ap", "nova pa", "pa rev"], 28) || "").trim();
    const obsVal = String(findVal(["observacoes", "observações", "notas", "comentarios", "comentários", "remarks", "notes"], 29) || "").trim();

    const revS = revSVal ? Number(revSVal) : undefined;
    const revO = revOVal ? Number(revOVal) : undefined;
    const revD = revDVal ? Number(revDVal) : undefined;

    const rawTags = String(findVal(["tag", "tags", "chave", "palavras chave", "sinonimo", "sinonimos"]) || "");
    const searchTags = rawTags
      ? rawTags.split(/[,;\/]/).map(t => t.trim()).filter(Boolean)
      : [];

    const rawId = String(findVal(["id", "codigo", "código", "item", "linha", "numero", "número"]) || "").trim();
    const generatedId = rawId || `PFMEA-${String(index + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;

    return {
      id: generatedId,
      process: processVal,
      processStep: processStepVal,
      workElements4M: workElementsVal,
      processFunction: processFuncVal,
      processStepFunction: processStepFuncVal,
      productCharacteristic: productCharVal,
      workElementFunction: workElemFuncVal,
      processCharacteristic: processCharVal,
      failureEffect: failureEffectVal,
      severity: Math.min(10, Math.max(1, s)),
      failureMode: failureModeVal,
      potentialCause: potentialCauseVal,
      currentPrevention: prevControlVal,
      occurrence: Math.min(10, Math.max(1, o)),
      currentDetection: detControlVal,
      detection: Math.min(10, Math.max(1, d)),
      rpn,
      actionPriority,
      specialCharacteristic: specialCharVal,
      classification: specialCharVal,
      preventiveAction: prevActionVal,
      detectionAction: detActionVal,
      responsiblePerson: respVal,
      targetDate: targetDateVal,
      actionTaken: actionTakenVal,
      completionDate: compDateVal,
      revisedSeverity: revS,
      revisedOccurrence: revO,
      revisedDetection: revD,
      revisedSpecialCharacteristic: revSpecialVal || undefined,
      revisedActionPriority: (revApVal === "Alta" || revApVal === "Média" || revApVal === "Baixa") ? revApVal as any : (revS && revO && revD ? calculateAp(revS, revO, revD) : undefined),
      observations: obsVal,
      searchTags: searchTags.length > 0 ? searchTags : [processStepVal, failureModeVal, potentialCauseVal],
      recommendedAction: prevActionVal || detActionVal,
      responsible: respVal,
      takenAction: actionTakenVal,
      newSeverity: revS,
      newOccurrence: revO,
      newDetection: revD,
      newRpn: revS && revO && revD ? revS * revO * revD : undefined,
      lastRevisionDate: compDateVal || new Date().toISOString().slice(0, 10),
      revisionVersion: 1,
    };
  });
}

// Flexible header normalizer for Fast Response
export function mapRowsToComplaints(rows: Record<string, any>[]): FastResponseComplaint[] {
  return rows.map((r, index) => {
    const findVal = (...keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(r).find(col => col.toLowerCase().includes(k.toLowerCase()));
        if (found && r[found] !== undefined && r[found] !== "") return r[found];
      }
      return "";
    };

    const s = Number(findVal("severidade", "impacto", "gravidade", "sev")) || 7;
    const rawId = String(findVal("id", "rnc", "reclamação", "reclamacao", "número", "numero") || "").trim();
    const generatedId = rawId || `REC-${new Date().getFullYear()}-${String(index + 101).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;

    return {
      id: generatedId,
      date: String(findVal("data", "abertura", "ocorrência", "ocorrencia") || new Date().toISOString().slice(0, 10)),
      client: String(findVal("cliente", "montadora", "empresa", "customer") || "Cliente Geral"),
      partNumber: String(findVal("código", "codigo", "part number", "peça", "peca", "pn") || `P-${1000 + index}`),
      partName: String(findVal("nome", "descrição peça", "produto", "componente") || "Componente"),
      rawDescription: String(findVal("descrição", "descricao", "texto", "e-mail", "email", "relato") || "Descrição da reclamação do cliente"),
      processStep: String(findVal("etapa", "processo", "posto", "linha") || "Processo Geral"),
      realFailureMode: String(findVal("modo de falha", "falha real", "problema", "defeito") || "Problema de qualidade relatado"),
      impactDescription: String(findVal("impacto", "efeito", "consequência", "consequencia") || "Impacto na aplicação"),
      reportedSeverity: Math.min(10, Math.max(1, s)),
      rootCause: String(findVal("causa raiz", "causa", "5 porquês", "5 porques", "ishikawa", "root cause") || "Causa sob investigação"),
      origin: "Montadora (Linha 0km)",
      status: "Pendente de Análise",
    };
  });
}

// 6. Extract Não Conformidade / PDCA number from file name or raw text
export function extractNcNumberFromFileName(fileName: string): string {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "").trim();

  // Pattern: "PDCA 080/26", "PDCA 080-26", "PDCA_080_26", "PDCA-080-26", "PDCA 080 26", "PDCA080/26", "PDCA 080.26"
  const pdcaMatch = nameWithoutExt.match(/(?:PDCA|RNC|NC|REC|RAC|RN)[\s_\-\.]*(\d+)[\s_\-\.\/]+(\d{2,4})/i);
  if (pdcaMatch) {
    const rawPrefix = nameWithoutExt.match(/(?:PDCA|RNC|NC|REC|RAC|RN)/i)?.[0]?.toUpperCase() || "PDCA";
    const prefix = rawPrefix === "NC" || rawPrefix === "RN" || rawPrefix === "RAC" ? "PDCA" : rawPrefix;
    const num = pdcaMatch[1].padStart(3, "0");
    let year = pdcaMatch[2];
    if (year.length === 4) year = year.slice(2);
    return `${prefix} ${num}/${year}`;
  }

  // Pattern: "080-26", "080/26", "080_26", "080 26", "80-26" (e.g. 080-26.xlsm)
  const pureNumMatch = nameWithoutExt.match(/^(\d{1,4})[\s_\-\.\/]+(\d{2,4})$/);
  if (pureNumMatch) {
    const num = pureNumMatch[1].padStart(3, "0");
    let year = pureNumMatch[2];
    if (year.length === 4) year = year.slice(2);
    return `PDCA ${num}/${year}`;
  }

  // Pattern if string has "080/26" anywhere inside
  const embeddedMatch = nameWithoutExt.match(/(\d{2,4})[\/](\d{2})/);
  if (embeddedMatch) {
    return `PDCA ${embeddedMatch[1].padStart(3, "0")}/${embeddedMatch[2]}`;
  }

  // If filename already looks like a formatted code, keep clean
  if (nameWithoutExt.length > 0) {
    return nameWithoutExt.replace(/[_]+/g, " ").trim();
  }

  return `PDCA 001/${new Date().getFullYear().toString().slice(2)}`;
}

export interface ParsedSingleComplaint {
  id: string;
  date?: string;
  client?: string;
  partNumber?: string;
  partName?: string;
  departmentCausing?: string;
  rawDescription?: string;
  processStep?: string;
  realFailureMode?: string;
  impactDescription?: string;
  reportedSeverity?: number;
  rootCause?: string;
  origin?: FastResponseComplaint["origin"];
  detectedFields: string[];
  eightD?: import("../types").EightDReport;
}

// 7. Parse Single Complaint Excel file with deep cell and multi-sheet scanning for ZB 8D PDCA
export async function parseSingleComplaintExcel(file: File): Promise<ParsedSingleComplaint> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });

  // 1. Determine the Não Conformidade Number (priority: File Name as explicitly requested)
  const ncNumber = extractNcNumberFromFileName(file.name);

  const detectedFields: string[] = [];
  const result: ParsedSingleComplaint = {
    id: ncNumber,
    detectedFields,
  };

  // Helper to test if a string contains any of the target keywords
  const matchesKeywords = (text: string, ...keywords: string[]): boolean => {
    if (!text || typeof text !== "string") return false;
    const lower = text.toLowerCase().trim();
    return keywords.some(k => lower.includes(k.toLowerCase()));
  };

  // Helper to clean extracted text
  const cleanVal = (val: any): string => {
    if (val === undefined || val === null) return "";
    return String(val).replace(/^[:\s\-]+/, "").trim();
  };

  // Helper to format date from string or excel serial number
  const parseExcelDate = (val: any): string => {
    if (!val) return "";
    if (typeof val === "number" && val > 30000 && val < 60000) {
      const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
      return jsDate.toISOString().slice(0, 10);
    }
    const str = String(val).trim();
    const brMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (brMatch) {
      const day = brMatch[1].padStart(2, "0");
      const month = brMatch[2].padStart(2, "0");
      let year = brMatch[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.slice(0, 10);
    }
    return str;
  };

  // Initialize standard 8D structure with defaults
  const eightD: import("../types").EightDReport = {
    client: "",
    partNumber: "",
    partName: "",
    departmentCausing: "",
    pdcaNumber: ncNumber,
    identifiedProblem: "",
    d1Leader: {
      id: "leader-1",
      name: "",
      department: "",
      role: "Líder da Equipe",
      email: "",
    },
    d1Members: [],
    d2Type: "Externo - Reclamação de Clientes",
    d2Recurrence: false,
    d2NonConformityDescription: "",
    d2SpecialCharacteristic: false,
    d2SpecialCharacteristicDetails: "Não",
    d2ClientDocNumber: "",
    d2ImageOkUrl: "",
    d2ImageNotOkUrl: "",
    d2FiveWTwoH: {
      what: "",
      why: "",
      where: "",
      when: "",
      who: "",
      how: "",
      howMuch: "",
    },
    d3ContainmentActions: [],
    d4Henkaten: {
      hasHenkaten: false,
      comments: "",
      items: [
        { dimension: "Mão de Obra", changed: false, comment: "" },
        { dimension: "Método", changed: false, comment: "" },
        { dimension: "Material", changed: false, comment: "" },
        { dimension: "Máquina", changed: false, comment: "" },
        { dimension: "Medição", changed: false, comment: "" },
        { dimension: "Meio Ambiente", changed: false, comment: "" },
      ],
    },
    d4RecurrenceInvestigation: "",
    d4RecurrenceChecklist: {
      plannedActionsImplemented: false,
      containmentPerformed: false,
      ongoingActions: false,
      previousActionsEffective: false,
      allFailurePotentialsConsidered: false,
      observations: "",
    },
    d4Ishikawa: {
      manpower: [],
      machine: [],
      measurement: [],
      method: [],
      material: [],
      environment: [],
      problemHead: "",
    },
    d4IshikawaStructured: {
      manpower: [],
      machine: [],
      measurement: [],
      method: [],
      material: [],
      environment: [],
      problemHead: "",
      canReproduce: false,
      reproductionResult: "",
      processFlowEvaluated: false,
      subsequentProcessesAnalyzed: false,
      occurrenceLocation: "",
      detectionFailureLocation: "",
    },
    d4FiveWhys: {
      occurrence: ["", "", "", "", ""],
      detection: ["", "", "", "", ""],
      systemic: ["", "", "", "", ""],
    },
    d5OccurrenceActions: [
      { id: 1, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 2, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 3, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 4, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 5, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 6, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
    ],
    d5DetectionActions: [
      { id: 1, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 2, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 3, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 4, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 5, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 6, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
    ],
    d5SystemicActions: [
      { id: 1, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 2, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 3, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 4, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 5, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
      { id: 6, description: "", responsible: "", targetDate: "", status: "Y", evidence: "" },
    ],
    d6SideEffectsRisk: false,
    d6PredictedInFmea: false,
    d6EfficacyRobust: true,
    d6EfficacyProof: "",
    d7Standardization: "Revisão e atualização do PFMEA, Plano de Controle e Instrução de Trabalho.",
    d7Yokoten: {
      applicableToOtherProcesses: false,
      scopeItems: "",
    },
    d7LessonsLearned: {
      lessonsLearnedNumber: "",
      releaseDate: "",
      fmeaNumber: "",
      fmeaFeedbackDate: "",
    },
    d8ClosingDate: "",
    d8QualityApproval: "",
    d8ManagementApproval: "",
    d8ClosingStatus: "Aberto",
    d8Approvals: {
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
        d8: "APROVADO",
      },
    },
  };

  // Helper to safely get cell in 2D array
  const getCell = (grid: any[][], r: number, c: number): string => {
    if (r >= 0 && r < grid.length && c >= 0 && c < (grid[r]?.length || 0)) {
      const v = grid[r][c];
      return v !== undefined && v !== null ? String(v).trim() : "";
    }
    return "";
  };

  // Helper to find the next non-empty cell in the row
  const getNextInRow = (grid: any[][], r: number, startC: number): string => {
    if (r >= grid.length) return "";
    const row = grid[r];
    for (let c = startC + 1; c < (row?.length || 0); c++) {
      const v = cleanVal(row[c]);
      if (v) return v;
    }
    return "";
  };

  // Helper to check for checkbox / marks [X], (X), X, Sim
  const isMarked = (val: string): boolean => {
    const s = val.trim().toLowerCase();
    return s === "x" || s === "[x]" || s === "(x)" || s === "sim" || s === "yes" || s === "true" || s === "1" || s === "ok";
  };

  // Scan through all worksheets in the workbook
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rawGrid: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    // Grid Scan for single-sheet or multi-sheet format
    for (let r = 0; r < rawGrid.length; r++) {
      const row = rawGrid[r];
      if (!row) continue;

      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || "").trim();
        if (!cell) continue;

        const cellLower = cell.toLowerCase();

        // 1. Header Row Fields:
        // Cliente
        if (cellLower === "cliente" || cellLower === "cliente:") {
          const val = getNextInRow(rawGrid, r, c);
          if (val && !matchesKeywords(val, "conjunto", "peça", "departamento", "pdca")) {
            result.client = val;
            eightD.client = val;
            detectedFields.push("Cliente");
          }
        }

        // Conjunto / Peça Nº
        if (matchesKeywords(cell, "conjunto / peça nº", "conjunto / peca nº", "conjunto/peça nº", "conjunto / peça:", "conjunto / peca:")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && !matchesKeywords(val, "nome conjunto", "departamento")) {
            result.partNumber = val;
            eightD.partNumber = val;
            detectedFields.push("Conjunto / Peça Nº");
          }
        }

        // Nome Conjunto / Peça
        if (matchesKeywords(cell, "nome conjunto / peça", "nome conjunto / peca", "nome conjunto:", "nome da peça:", "nome peça:")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && !matchesKeywords(val, "departamento", "pdca")) {
            result.partName = val;
            eightD.partName = val;
            detectedFields.push("Nome Conjunto / Peça");
          }
        }

        // Departamento Causador
        if (matchesKeywords(cell, "departamento causador", "depto causador", "depto causador:")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && !matchesKeywords(val, "pdca nº", "pdca")) {
            eightD.departmentCausing = val;
            detectedFields.push("Departamento Causador");
          }
        }

        // Problema Identificado
        if (matchesKeywords(cell, "problema identificado", "problema identificado:", "defeito identificado", "falha identificada")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && !matchesKeywords(val, "cliente", "departamento", "conjunto", "peça")) {
            eightD.identifiedProblem = val;
            result.realFailureMode = val;
            detectedFields.push("Problema Identificado");
          }
        }

        // PDCA Nº in cell (if present inside worksheet, update if valid)
        if (cellLower === "pdca nº" || cellLower === "pdca nº:" || cellLower === "pdca:" || cellLower === "pdca no") {
          const val = getNextInRow(rawGrid, r, c);
          if (val) {
            const formatted = extractNcNumberFromFileName(val);
            result.id = formatted;
            eightD.pdcaNumber = formatted;
            detectedFields.push("PDCA Nº");
          }
        }

        // 2. D1 - Formação de Equipe
        // Líder da equipe
        if (matchesKeywords(cell, "líder da equipe", "lider da equipe", "líder do time", "lider:")) {
          const leaderName = getNextInRow(rawGrid, r, c);
          let dept = "";
          let role = "Supervisor";
          let email = "";

          // Look across row for "Departamento:", "Função:", "Email:"
          for (let colIdx = c + 1; colIdx < row.length; colIdx++) {
            const label = String(row[colIdx] || "").toLowerCase().trim();
            if (label.includes("departamento")) {
              dept = getNextInRow(rawGrid, r, colIdx);
            } else if (label.includes("função") || label.includes("funcao")) {
              role = getNextInRow(rawGrid, r, colIdx);
            } else if (label.includes("email") || label.includes("e-mail")) {
              email = getNextInRow(rawGrid, r, colIdx);
            }
          }

          if (leaderName && !matchesKeywords(leaderName, "departamento", "função", "email")) {
            eightD.d1Leader = {
              id: "leader-1",
              name: leaderName,
              department: dept || eightD.departmentCausing || "Soldas",
              role: role || "Líder 8D",
              email: email || "",
            };
            detectedFields.push("D1 - Líder");
          }
        }

        // Membros da Equipe Table header detection
        if (matchesKeywords(cell, "nome dos membros da equipe", "membros da equipe", "membros:")) {
          // The rows underneath contain the team members
          const members: import("../types").TeamMember[] = [];
          for (let mRow = r + 1; mRow < Math.min(r + 12, rawGrid.length); mRow++) {
            const rowData = rawGrid[mRow];
            if (!rowData) continue;
            const firstCell = String(rowData[c] || rowData[0] || "").trim();
            if (!firstCell || matchesKeywords(firstCell, "d2", "descrição do problema", "tipo:", "reincidência")) {
              break;
            }
            // Member columns: Nome, Departamento, Função, Email
            const mName = String(rowData[0] || rowData[c] || "").trim();
            const mDept = String(rowData[1] || rowData[c + 1] || "").trim();
            const mRole = String(rowData[2] || rowData[c + 2] || "").trim();
            const mEmail = String(rowData[3] || rowData[c + 3] || "").trim();

            if (mName && !matchesKeywords(mName, "nome", "membro", "departamento", "função", "email")) {
              members.push({
                id: `member-${members.length + 1}`,
                name: mName,
                department: mDept,
                role: mRole,
                email: mEmail,
              });
            }
          }
          if (members.length > 0) {
            eightD.d1Members = members;
            detectedFields.push("D1 - Membros");
          }
        }

        // 3. D2 - Descrição do Problema
        // Tipo: Interno - Processos ZB / Refugo / Externo
        if (matchesKeywords(cell, "tipo:", "tipo de reclamação")) {
          // Check following columns/rows for checkboxes
          for (let checkR = r; checkR <= r + 2 && checkR < rawGrid.length; checkR++) {
            for (let checkC = 0; checkC < rawGrid[checkR].length; checkC++) {
              const str = String(rawGrid[checkR][checkC] || "").trim();
              if (matchesKeywords(str, "processos zb") && (str.includes("[X]") || str.includes("X") || isMarked(getCell(rawGrid, checkR, checkC - 1)) || isMarked(getCell(rawGrid, checkR, checkC + 1)))) {
                eightD.d2Type = "Interno - Processos ZB";
              } else if (matchesKeywords(str, "refugo", "suplementar") && (str.includes("[X]") || str.includes("X") || isMarked(getCell(rawGrid, checkR, checkC - 1)) || isMarked(getCell(rawGrid, checkR, checkC + 1)))) {
                eightD.d2Type = "Interno - Refugos e Operação Suplementar";
              } else if (matchesKeywords(str, "externo", "cliente") && (str.includes("[X]") || str.includes("X") || isMarked(getCell(rawGrid, checkR, checkC - 1)) || isMarked(getCell(rawGrid, checkR, checkC + 1)))) {
                eightD.d2Type = "Externo - Reclamação de Clientes";
              }
            }
          }
        }

        // Reincidência?
        if (cellLower.includes("reincidência?") || cellLower.includes("reincidencia?")) {
          const nextVal = getNextInRow(rawGrid, r, c);
          if (nextVal.toLowerCase().includes("sim") || isMarked(nextVal)) {
            eightD.d2Recurrence = true;
          } else {
            eightD.d2Recurrence = false;
          }
          detectedFields.push("Reincidência");
        }

        // Não Conformidade
        if (cellLower === "não conformidade:" || cellLower === "nao conformidade:" || cellLower === "não conformidade" || cellLower === "descrição da não conformidade:") {
          const val = getNextInRow(rawGrid, r, c) || getCell(rawGrid, r + 1, c);
          if (val && val.length > 3) {
            eightD.d2NonConformityDescription = val;
            result.rawDescription = val;
            result.realFailureMode = val;
            detectedFields.push("Não Conformidade");
          }
        }

        // Modo de Falha Relacionado a Características Especiais?
        if (matchesKeywords(cell, "características especiais?", "caracteristicas especiais?", "característica especial")) {
          const val = getNextInRow(rawGrid, r, c);
          eightD.d2SpecialCharacteristic = val.toLowerCase().includes("sim") || isMarked(val);
          eightD.d2SpecialCharacteristicDetails = val || (eightD.d2SpecialCharacteristic ? "Sim" : "Não");
          detectedFields.push("Características Especiais");
        }

        // Nº DOC. DO CLIENTE
        if (matchesKeywords(cell, "nº doc. do cliente:", "nº doc do cliente", "nº documento do cliente", "doc. cliente")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) {
            eightD.d2ClientDocNumber = val;
            detectedFields.push("Nº Doc. Cliente");
          }
        }

        // 5W2H Table
        if (matchesKeywords(cell, "o que aconteceu?", "what (o que", "o que aconteceu")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) { eightD.d2FiveWTwoH.what = val; detectedFields.push("5W2H What"); }
        }
        if (matchesKeywords(cell, "por que é um problema?", "por que é problema?", "why (por que")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) { eightD.d2FiveWTwoH.why = val; detectedFields.push("5W2H Why"); }
        }
        if (matchesKeywords(cell, "onde detectou?", "onde ocorreu?", "where (onde")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) { eightD.d2FiveWTwoH.where = val; detectedFields.push("5W2H Where"); }
        }
        if (matchesKeywords(cell, "quando detectou?", "quando ocorreu?", "when (quando")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) { eightD.d2FiveWTwoH.when = parseExcelDate(val); detectedFields.push("5W2H When"); }
        }
        if (matchesKeywords(cell, "quem detectou?", "who (quem")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) { eightD.d2FiveWTwoH.who = val; detectedFields.push("5W2H Who"); }
        }
        if (matchesKeywords(cell, "como detectou?", "como ocorreu?", "how (como")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) { eightD.d2FiveWTwoH.how = val; detectedFields.push("5W2H How"); }
        }
        if (matchesKeywords(cell, "quanto detectou?", "quanto / impacto", "how much")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val) { eightD.d2FiveWTwoH.howMuch = val; detectedFields.push("5W2H How Much"); }
        }

        // 4. D3 - Ações de Contenção Table
        if (matchesKeywords(cell, "descrição da ação:", "descrição da ação", "ações de contenção")) {
          const contList: import("../types").ContainmentAction[] = [];
          for (let contR = r + 1; contR < Math.min(r + 8, rawGrid.length); contR++) {
            const rowData = rawGrid[contR];
            if (!rowData) continue;
            const desc = String(rowData[0] || rowData[c] || "").trim();
            if (!desc || matchesKeywords(desc, "d4", "4.1", "henkaten", "análise de causa raiz")) break;

            const loc = String(rowData[1] || rowData[c + 1] || "Planta ZB").trim();
            const resp = String(rowData[2] || rowData[c + 2] || "Qualidade").trim();
            const startD = parseExcelDate(rowData[3] || rowData[c + 3] || "");
            const endD = parseExcelDate(rowData[4] || rowData[c + 4] || "");
            const nf = String(rowData[5] || rowData[c + 5] || "").trim();
            const status = String(rowData[6] || rowData[c + 6] || "Concluído").trim();

            contList.push({
              id: `cont-${contList.length + 1}`,
              description: desc,
              location: loc,
              responsible: resp,
              startDate: startD || new Date().toISOString().slice(0, 10),
              endDate: endD,
              cutoffInvoice: nf,
              status: status.toLowerCase().includes("ok") || status.toLowerCase().includes("conc") ? "Concluído" : "Em Andamento",
            });
          }
          if (contList.length > 0) {
            eightD.d3ContainmentActions = contList;
            detectedFields.push("D3 - Contenção");
          }
        }

        // 5. D4 - Henkaten (4.1)
        if (matchesKeywords(cell, "4.1 - processo de investigação - mudanças (henkaten)", "henkaten")) {
          // Scan for 6M dimensions
          for (let hR = r; hR < Math.min(r + 6, rawGrid.length); hR++) {
            const hRow = rawGrid[hR];
            if (!hRow) continue;
            for (let hC = 0; hC < hRow.length; hC++) {
              const text = String(hRow[hC] || "").trim();
              const dims: ("Mão de Obra" | "Método" | "Material" | "Máquina" | "Medição" | "Meio Ambiente")[] = [
                "Mão de Obra", "Método", "Material", "Máquina", "Medição", "Meio Ambiente"
              ];
              for (const dim of dims) {
                if (matchesKeywords(text, dim)) {
                  const hasChange = isMarked(getCell(rawGrid, hR, hC + 1)) || getCell(rawGrid, hR, hC + 1).toLowerCase().includes("sim");
                  const comment = getCell(rawGrid, hR, hC + 2) || getCell(rawGrid, hR + 1, hC);
                  const item = eightD.d4Henkaten.items?.find(i => i.dimension === dim);
                  if (item) {
                    item.changed = hasChange;
                    item.comment = comment;
                    if (hasChange) eightD.d4Henkaten.hasHenkaten = true;
                  }
                }
              }
            }
          }
          detectedFields.push("D4 - Henkaten");
        }

        // 6. D4 - 4.3 Diagrama de Ishikawa
        if (matchesKeywords(cell, "diagrama de ishikawa", "espinha de peixe", "4.3 - diagrama de ishikawa")) {
          // Look for 6M branches and bottom questions
          // Bottom questions:
          for (let ishiR = r; ishiR < Math.min(r + 25, rawGrid.length); ishiR++) {
            const ishiRow = rawGrid[ishiR];
            if (!ishiRow) continue;
            for (let ishiC = 0; ishiC < ishiRow.length; ishiC++) {
              const val = String(ishiRow[ishiC] || "").trim();
              if (matchesKeywords(val, "é possível a reprodução do problema", "reprodução do problema")) {
                const repVal = getNextInRow(rawGrid, ishiR, ishiC);
                const isSim = repVal.toLowerCase().includes("sim") || isMarked(repVal);
                if (eightD.d4IshikawaStructured) {
                  eightD.d4IshikawaStructured.canReproduce = isSim;
                  eightD.d4IshikawaStructured.reproductionResult = getCell(rawGrid, ishiR, ishiC + 2) || getNextInRow(rawGrid, ishiR, ishiC + 1);
                }
              }
              if (matchesKeywords(val, "fluxo de processo foi avaliado")) {
                const evalVal = getNextInRow(rawGrid, ishiR, ishiC);
                if (eightD.d4IshikawaStructured) {
                  eightD.d4IshikawaStructured.processFlowEvaluated = evalVal.toLowerCase().includes("sim") || isMarked(evalVal);
                }
              }
              if (matchesKeywords(val, "processos posterior", "processos posteriores")) {
                const postVal = getNextInRow(rawGrid, ishiR, ishiC);
                if (eightD.d4IshikawaStructured) {
                  eightD.d4IshikawaStructured.subsequentProcessesAnalyzed = postVal.toLowerCase().includes("sim") || isMarked(postVal);
                }
              }
              if (matchesKeywords(val, "possível local da ocorrência", "local da ocorrencia")) {
                const locVal = getNextInRow(rawGrid, ishiR, ishiC);
                if (eightD.d4IshikawaStructured) eightD.d4IshikawaStructured.occurrenceLocation = locVal;
              }
              if (matchesKeywords(val, "possível local de falha na detecção", "local de falha na deteccao")) {
                const locVal = getNextInRow(rawGrid, ishiR, ishiC);
                if (eightD.d4IshikawaStructured) eightD.d4IshikawaStructured.detectionFailureLocation = locVal;
              }
            }
          }
          detectedFields.push("D4 - Ishikawa");
        }

        // 7. 5 Porquês (4.4 Ocorrência, 4.5 Detecção, 4.6 Sistêmico)
        if (matchesKeywords(cell, "5 porquês para ocorrência", "5 porques para ocorrencia", "4.4 -")) {
          // Read 1 to 5 rows
          for (let wR = r + 1; wR <= r + 5 && wR < rawGrid.length; wR++) {
            const whyText = cleanVal(rawGrid[wR][c] || rawGrid[wR][c + 1] || rawGrid[wR][0]);
            if (whyText && !matchesKeywords(whyText, "causa raiz", "4.5", "detecção")) {
              eightD.d4FiveWhys.occurrence[wR - (r + 1)] = whyText;
            }
          }
          detectedFields.push("5 Porquês - Ocorrência");
        }

        if (matchesKeywords(cell, "5 porquês para detecção", "5 porques para deteccao", "4.5 -")) {
          for (let wR = r + 1; wR <= r + 5 && wR < rawGrid.length; wR++) {
            const whyText = cleanVal(rawGrid[wR][c] || rawGrid[wR][c + 1] || rawGrid[wR][0]);
            if (whyText && !matchesKeywords(whyText, "causa raiz", "4.6", "sistêmico")) {
              eightD.d4FiveWhys.detection[wR - (r + 1)] = whyText;
            }
          }
          detectedFields.push("5 Porquês - Detecção");
        }

        if (matchesKeywords(cell, "5 porquês sistêmico", "5 porques sistemico", "4.6 -")) {
          for (let wR = r + 1; wR <= r + 5 && wR < rawGrid.length; wR++) {
            const whyText = cleanVal(rawGrid[wR][c] || rawGrid[wR][c + 1] || rawGrid[wR][0]);
            if (whyText && !matchesKeywords(whyText, "causa raiz", "d5", "ações corretivas")) {
              eightD.d4FiveWhys.systemic[wR - (r + 1)] = whyText;
            }
          }
          detectedFields.push("5 Porquês - Sistêmico");
        }

        // 8. D5 & D6 - Ações Corretivas e Implantação
        if (matchesKeywords(cell, "descrição das ações corretivas para a ocorrência", "ações para ocorrência")) {
          // Find actions in rows below
          for (let aR = r + 1; aR < Math.min(r + 10, rawGrid.length); aR++) {
            const aRow = rawGrid[aR];
            if (!aRow) continue;
            const desc = cleanVal(aRow[c] || aRow[0]);
            if (!desc || matchesKeywords(desc, "detecção", "sistêmica", "d6", "6.1")) break;
            const idx = (aR - (r + 1)) % 6;
            if (eightD.d5OccurrenceActions[idx]) {
              eightD.d5OccurrenceActions[idx].description = desc;
              // Look across row for Responsável, Prazo, Status
              eightD.d5OccurrenceActions[idx].responsible = cleanVal(aRow[c + 1] || "");
              eightD.d5OccurrenceActions[idx].targetDate = parseExcelDate(aRow[c + 2] || "");
              const st = cleanVal(aRow[c + 3] || "G");
              eightD.d5OccurrenceActions[idx].status = st.startsWith("R") ? "R" : (st.startsWith("G") || st.includes("OK") ? "G" : "Y");
            }
          }
          detectedFields.push("D5/D6 - Ações Ocorrência");
        }

        if (matchesKeywords(cell, "descrição das ações corretivas para a detecção", "ações para detecção")) {
          for (let aR = r + 1; aR < Math.min(r + 10, rawGrid.length); aR++) {
            const aRow = rawGrid[aR];
            if (!aRow) continue;
            const desc = cleanVal(aRow[c] || aRow[0]);
            if (!desc || matchesKeywords(desc, "sistêmica", "d6", "6.1")) break;
            const idx = (aR - (r + 1)) % 6;
            if (eightD.d5DetectionActions[idx]) {
              eightD.d5DetectionActions[idx].description = desc;
              eightD.d5DetectionActions[idx].responsible = cleanVal(aRow[c + 1] || "");
              eightD.d5DetectionActions[idx].targetDate = parseExcelDate(aRow[c + 2] || "");
              const st = cleanVal(aRow[c + 3] || "G");
              eightD.d5DetectionActions[idx].status = st.startsWith("R") ? "R" : (st.startsWith("G") || st.includes("OK") ? "G" : "Y");
            }
          }
          detectedFields.push("D5/D6 - Ações Detecção");
        }

        if (matchesKeywords(cell, "descrição das ações sistêmica", "ações sistêmicas", "ações sistêmica")) {
          for (let aR = r + 1; aR < Math.min(r + 10, rawGrid.length); aR++) {
            const aRow = rawGrid[aR];
            if (!aRow) continue;
            const desc = cleanVal(aRow[c] || aRow[0]);
            if (!desc || matchesKeywords(desc, "6.1", "comprovação", "d7")) break;
            const idx = (aR - (r + 1)) % 6;
            if (eightD.d5SystemicActions[idx]) {
              eightD.d5SystemicActions[idx].description = desc;
              eightD.d5SystemicActions[idx].responsible = cleanVal(aRow[c + 1] || "");
              eightD.d5SystemicActions[idx].targetDate = parseExcelDate(aRow[c + 2] || "");
              const st = cleanVal(aRow[c + 3] || "G");
              eightD.d5SystemicActions[idx].status = st.startsWith("R") ? "R" : (st.startsWith("G") || st.includes("OK") ? "G" : "Y");
            }
          }
          detectedFields.push("D5/D6 - Ações Sistêmicas");
        }

        // D6 Eficácia & Efeitos Colaterais
        if (matchesKeywords(cell, "modos de falha não previstos no pfmea", "efeitos colaterais")) {
          const val = getNextInRow(rawGrid, r, c);
          eightD.d6SideEffectsRisk = val.toLowerCase().includes("sim") || isMarked(val);
        }

        if (matchesKeywords(cell, "está previsto no fmea", "previsto no fmea")) {
          const val = getNextInRow(rawGrid, r, c);
          eightD.d6PredictedInFmea = val.toLowerCase().includes("sim") || isMarked(val);
        }

        if (matchesKeywords(cell, "eficácia das ações implementadas foram robustas?", "eficacia das acoes")) {
          const val = getNextInRow(rawGrid, r, c);
          eightD.d6EfficacyRobust = val.toLowerCase().includes("sim") || isMarked(val);
          const proof = getCell(rawGrid, r + 1, c) || getNextInRow(rawGrid, r + 1, c);
          if (proof) eightD.d6EfficacyProof = proof;
          detectedFields.push("D6 - Eficácia");
        }

        // 9. D7 - Yokoten & Lições Aprendidas
        if (matchesKeywords(cell, "7.1 - abrangência / yokoten", "yokoten")) {
          const val = getNextInRow(rawGrid, r, c);
          if (eightD.d7Yokoten) {
            eightD.d7Yokoten.applicableToOtherProcesses = val.toLowerCase().includes("sim") || isMarked(val);
            eightD.d7Yokoten.scopeItems = getNextInRow(rawGrid, r + 1, c) || "-";
          }
          detectedFields.push("D7 - Yokoten");
        }

        if (matchesKeywords(cell, "lições aprendidas nº:", "licoes aprendidas nº", "lessons learned")) {
          const num = getNextInRow(rawGrid, r, c);
          if (eightD.d7LessonsLearned) {
            eightD.d7LessonsLearned.lessonsLearnedNumber = num;
            // Scan nearby row for Data de Lançamento, FMEA Nº, Data Retroalimentação
            for (let colIdx = c + 1; colIdx < row.length; colIdx++) {
              const label = String(row[colIdx] || "").toLowerCase().trim();
              if (label.includes("lançamento") || label.includes("lancamento")) {
                eightD.d7LessonsLearned.releaseDate = parseExcelDate(getNextInRow(rawGrid, r, colIdx));
              } else if (label.includes("fmea nº") || label.includes("fmea no")) {
                eightD.d7LessonsLearned.fmeaNumber = getNextInRow(rawGrid, r, colIdx);
              } else if (label.includes("retroalimentação") || label.includes("retroalimentacao")) {
                eightD.d7LessonsLearned.fmeaFeedbackDate = parseExcelDate(getNextInRow(rawGrid, r, colIdx));
              }
            }
          }
          detectedFields.push("D7 - Lições Aprendidas");
        }

        // 10. D8 - Fechamento & Assinaturas
        if (matchesKeywords(cell, "auditor:", "auditor")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && eightD.d8Approvals) eightD.d8Approvals.auditor = val;
        }
        if (matchesKeywords(cell, "líder do time:", "lider do time")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && eightD.d8Approvals) eightD.d8Approvals.teamLeader = val;
        }
        if (matchesKeywords(cell, "superior:", "superior")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && eightD.d8Approvals) eightD.d8Approvals.superior = val;
        }
        if (matchesKeywords(cell, "gerente:", "gerente")) {
          const val = getNextInRow(rawGrid, r, c);
          if (val && eightD.d8Approvals) eightD.d8Approvals.manager = val;
          detectedFields.push("D8 - Assinaturas");
        }
      }
    }
  }

  // Ensure head of fish & default sync
  eightD.d4Ishikawa.problemHead = eightD.identifiedProblem || eightD.d2NonConformityDescription || result.realFailureMode || result.rawDescription || "";
  if (eightD.d4IshikawaStructured) {
    eightD.d4IshikawaStructured.problemHead = eightD.d4Ishikawa.problemHead;
  }
  eightD.client = result.client || eightD.client || "";
  eightD.partNumber = result.partNumber || eightD.partNumber || "";
  eightD.partName = result.partName || eightD.partName || "";
  eightD.pdcaNumber = result.id || eightD.pdcaNumber || "";
  if (eightD.identifiedProblem && !eightD.d2NonConformityDescription) {
    eightD.d2NonConformityDescription = eightD.identifiedProblem;
  }

  // If no containment was found, add a clean default row for UI editing
  if (eightD.d3ContainmentActions.length === 0) {
    eightD.d3ContainmentActions.push({
      id: "cont-1",
      description: "Seleção e triagem 100% de peças em estoque e bloqueio preventivo",
      location: "Planta ZB",
      responsible: eightD.d1Leader.name || "Qualidade",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      cutoffInvoice: "",
      status: "Em Andamento",
    });
  }

  result.eightD = eightD;
  return result;
}

