import { FastResponseComplaint, FeedbackSuggestion, PfmeaRow } from "../types";
import { calculateAp } from "../data/initialData";

// Normalized text cleaner
export function cleanText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein distance for string similarity
function levenshteinSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  const d: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return Math.max(0, 1 - d[len1][len2] / maxLen);
}

// Token intersection score (Jaccard similarity)
function tokenSimilarity(s1: string, s2: string): number {
  const tokens1 = new Set(cleanText(s1).split(" ").filter(t => t.length > 2));
  const tokens2 = new Set(cleanText(s2).split(" ").filter(t => t.length > 2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }
  const union = new Set([...tokens1, ...tokens2]).size;
  return union === 0 ? 0 : intersection / union;
}

// Full Hybrid Matcher between a complaint and a PFMEA row
export function calculateMatchScore(complaint: FastResponseComplaint, row: PfmeaRow): number {
  const compTokens = cleanText(
    `${complaint.processStep} ${complaint.realFailureMode} ${complaint.rawDescription} ${complaint.partName} ${complaint.rootCause}`
  );
  const rowTokens = cleanText(
    `${row.processStep} ${row.failureMode} ${row.failureEffect} ${row.potentialCause} ${(row.searchTags || []).join(" ")}`
  );

  // 1. Process Step Exact/Partial Match (weight 35%)
  const stepLev = levenshteinSimilarity(cleanText(complaint.processStep), cleanText(row.processStep));
  const stepTok = tokenSimilarity(complaint.processStep, row.processStep);
  const stepScore = Math.max(stepLev, stepTok);

  // 2. Failure Mode Match (weight 40%)
  const modeLev = levenshteinSimilarity(cleanText(complaint.realFailureMode), cleanText(row.failureMode));
  const modeTok = tokenSimilarity(complaint.realFailureMode, row.failureMode);
  const modeScore = Math.max(modeLev, modeTok);

  // 3. Search tags matching (weight 15%)
  let tagMatches = 0;
  if (row.searchTags && row.searchTags.length > 0) {
    for (const tag of row.searchTags) {
      if (compTokens.includes(cleanText(tag))) {
        tagMatches++;
      }
    }
  }
  const tagScore = row.searchTags?.length ? Math.min(1, tagMatches / Math.min(3, row.searchTags.length)) : 0;

  // 4. Description/Effect Token Overlap (weight 10%)
  const descScore = tokenSimilarity(complaint.rawDescription, row.failureEffect);

  // Total weighted score in 0..100
  const finalScore = (stepScore * 0.35 + modeScore * 0.40 + tagScore * 0.15 + descScore * 0.10) * 100;
  return Math.round(finalScore);
}

// Find best matching PFMEA row
export function findBestPfmeaMatch(
  complaint: FastResponseComplaint,
  pfmeaList: PfmeaRow[]
): { bestRow: PfmeaRow | null; score: number; candidateList: { row: PfmeaRow; score: number }[] } {
  const scored = pfmeaList
    .map(row => ({ row, score: calculateMatchScore(complaint, row) }))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { bestRow: null, score: 0, candidateList: [] };
  }

  const best = scored[0];
  return {
    bestRow: best.score >= 40 ? best.row : null,
    score: best.score,
    candidateList: scored.slice(0, 4),
  };
}

// Generate Rule-Based Suggestion for Quality Feedback
export function generateFeedbackSuggestion(
  complaint: FastResponseComplaint,
  matchedRow: PfmeaRow | null,
  allComplaints: FastResponseComplaint[]
): FeedbackSuggestion {
  // Count reoccurrences of this failure in complaint history
  const cleanCompFailure = cleanText(complaint.realFailureMode);
  const similarComplaints = allComplaints.filter(c => {
    return tokenSimilarity(c.realFailureMode, complaint.realFailureMode) > 0.4 ||
      cleanText(c.processStep) === cleanText(complaint.processStep);
  });
  const occurrenceCount = Math.max(1, similarComplaints.length);

  // 1. Case: New Failure Mode (no match in PFMEA)
  if (!matchedRow) {
    const s = Math.max(1, Math.min(10, complaint.reportedSeverity || 8));
    const o = occurrenceCount >= 4 ? 7 : occurrenceCount >= 2 ? 5 : 3;
    const d = 8; // Since it slipped through unmapped
    const rpn = s * o * d;

    return {
      complaintId: complaint.id,
      targetPfmeaId: null,
      matchScore: 0,
      matchConfidence: "Não Encontrado",
      isNewFailureMode: true,
      isNewCause: true,
      matchReason: "Nenhum Modo de Falha correspondente foi encontrado no catálogo do PFMEA. Recomendada a criação de uma nova linha no PFMEA Master.",
      currentS: 0,
      currentO: 0,
      currentD: 0,
      currentRpn: 0,
      currentAp: "Baixa",
      suggestedS: s,
      suggestedO: o,
      suggestedD: d,
      suggestedRpn: rpn,
      suggestedAp: calculateAp(s, o, d),
      sRationale: `Severidade avaliada em ${s} com base no relato de impacto no cliente/linha de montagem.`,
      oRationale: `Ocorrência definida em ${o} considerando ${occurrenceCount} caso(s) registrado(s) no Fast Response.`,
      dRationale: `Detecção sugerida em ${d} porque o modo de falha não possuía barreiras de contenção mapeadas.`,
      suggestedPrevention: "Definir padrão operacional e parâmetros de controle para a nova etapa.",
      suggestedDetection: "Implementar dispositivo de controle 100% (gabarito passa/não-passa ou visão).",
      suggestedActionPlan: `Cadastrar nova linha no PFMEA para a etapa "${complaint.processStep}" e validar barreiras de contenção.`,
      technicalAnalysis: `Falha inédita não contemplada no planejamento inicial: "${complaint.realFailureMode}". Causa raiz apontada: "${complaint.rootCause}".`,
      auditNote: "Requisito IATF 16949 (Cláusula 8.5.1.1): Lições aprendidas de novos modos de falha devem ser retroalimentadas no FMEA de processo.",
    };
  }

  // 2. Case: Existing PFMEA Match -> Calculate Delta & Suggestions
  const currentS = matchedRow.severity;
  const currentO = matchedRow.occurrence;
  const currentD = matchedRow.detection;
  const currentRpn = currentS * currentO * currentD;
  const currentAp = matchedRow.actionPriority || calculateAp(currentS, currentO, currentD);

  // Suggest Severity (S)
  let suggestedS = currentS;
  let sRationale = "Severidade mantida de acordo com o impacto de catálogo.";
  const rawTextClean = cleanText(complaint.rawDescription + " " + complaint.impactDescription);
  const isSafetyCritical =
    rawTextClean.includes("seguranca") ||
    rawTextClean.includes("acidente") ||
    rawTextClean.includes("risco") ||
    rawTextClean.includes("ruptura") ||
    complaint.reportedSeverity >= 9;
  const isLineStoppage =
    rawTextClean.includes("parada de linha") ||
    rawTextClean.includes("interrupcao") ||
    rawTextClean.includes("bloqueio") ||
    complaint.reportedSeverity >= 8;

  if (isSafetyCritical && currentS < 9) {
    suggestedS = Math.max(9, complaint.reportedSeverity || 9);
    sRationale = "Aumento para S=" + suggestedS + " devido a relato de risco à segurança / parada crítica de montagem.";
  } else if (isLineStoppage && currentS < 8) {
    suggestedS = 8;
    sRationale = "Aumento para S=8 devido à interrupção na linha de produção da montadora.";
  } else if (complaint.reportedSeverity > currentS) {
    suggestedS = complaint.reportedSeverity;
    sRationale = `Ajuste para S=${suggestedS} baseado no impacto real reportado pelo cliente (${complaint.reportedSeverity}/10).`;
  }

  // Suggest Occurrence (O)
  let suggestedO = currentO;
  let oRationale = "Ocorrência mantida (evento isolado até o momento).";
  if (occurrenceCount >= 4) {
    suggestedO = Math.max(currentO + 3, 7);
    oRationale = `Reincidência severa (${occurrenceCount} ocorrências registradas no período). Aumento de O=${currentO} para O=${suggestedO}.`;
  } else if (occurrenceCount >= 2) {
    suggestedO = Math.max(currentO + 2, 5);
    oRationale = `Reincidência detectada (${occurrenceCount} casos similares no Fast Response). Sugestão de O=${currentO} -> O=${suggestedO}.`;
  } else if (currentO < 3) {
    suggestedO = currentO + 1;
    oRationale = `Falha registrada no campo evidencia que a frequência real é superior à estimativa teórica inicial (O=${currentO} -> O=${suggestedO}).`;
  }

  // Suggest Detection (D)
  let suggestedD = currentD;
  let dRationale = "Detecção mantida nos padrões atuais.";
  const isCustomerEscape =
    complaint.origin === "Cliente Externo (Campo)" ||
    complaint.origin === "Montadora (Linha 0km)";

  if (isCustomerEscape) {
    if (currentD <= 4) {
      suggestedD = 7;
      dRationale = `A peça escapou para o cliente externo! O controle atual ("${matchedRow.currentDetection}") é ineficaz para barrar o defeito antes do envio (D=${currentD} -> D=${suggestedD}).`;
    } else {
      suggestedD = Math.min(10, currentD + 2);
      dRationale = `Falha de contenção externa confirmada. Revisão do índice de Detecção para D=${suggestedD} até implantação de barreira à prova de falhas.`;
    }
  }

  const suggestedRpn = suggestedS * suggestedO * suggestedD;
  const suggestedAp = calculateAp(suggestedS, suggestedO, suggestedD);

  const matchScore = calculateMatchScore(complaint, matchedRow);

  return {
    complaintId: complaint.id,
    targetPfmeaId: matchedRow.id,
    matchScore,
    matchConfidence: matchScore >= 75 ? "Alta" : matchScore >= 50 ? "Média" : "Baixa",
    isNewFailureMode: false,
    isNewCause: !cleanText(matchedRow.potentialCause).includes(cleanText(complaint.rootCause).slice(0, 15)),
    matchReason: `Correspondência de ${matchScore}% localizada na etapa "${matchedRow.processStep}" para o modo de falha "${matchedRow.failureMode}".`,
    currentS,
    currentO,
    currentD,
    currentRpn,
    currentAp,
    suggestedS,
    suggestedO,
    suggestedD,
    suggestedRpn,
    suggestedAp,
    sRationale,
    oRationale,
    dRationale,
    suggestedPrevention: `Revisar controle de processo: ${complaint.rootCause ? `Investigar "${complaint.rootCause}"` : "Auditar parâmetros de ajuste na máquina"}.`,
    suggestedDetection: `Substituir amostragem visual por controle 100% integrado ou sensor Poka-yoke de posicionamento.`,
    suggestedActionPlan: `Revisar PFMEA (${matchedRow.id}) e Plano de Controle: implementar dispositivo de bloqueio automático para "${complaint.realFailureMode}" decorrente da RNC ${complaint.id}.`,
    technicalAnalysis: `Cruzamento com a linha ${matchedRow.id}. A causa investigada na RNC ("${complaint.rootCause}") requer atualização das ações preventivas.`,
    auditNote: "Requisito IATF 16949 (10.2.3): A organização deve conduzir a resolução de problemas incluindo lições aprendidas e atualização de FMEA e Planos de Controle.",
  };
}
