import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Server-side Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI analysis endpoint for Quality Complaint to PFMEA feedback
app.post("/api/ai/analyze-complaint", async (req, res) => {
  try {
    const { complaint, pfmeaCatalog, historyOccurrences } = req.body;

    if (!complaint) {
      return res.status(400).json({ error: "Dados da reclamação são obrigatórios." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA não configurado no servidor (GEMINI_API_KEY ausente).",
        useFallback: true,
      });
    }

    const prompt = `Você é um Engenheiro Sênior Especialista em Qualidade Assegurada, IATF 16949 e FMEA (AIAG-VDA).
Sua tarefa é analisar uma Reclamação da Qualidade (Fast Response / SAC / 8D) e gerar uma proposta técnica de retroalimentação no PFMEA (Process Failure Mode and Effects Analysis).

DADOS DA RECLAMAÇÃO RECEBIDA:
- ID / RNC: ${complaint.id || "N/A"}
- Cliente: ${complaint.client || "N/A"}
- Peça / Código / Aplicação: ${complaint.partNumber || complaint.partName || "N/A"}
- Etapa do Processo Relatada: ${complaint.processStep || "N/A"}
- Descrição da Reclamação (Texto do Cliente / E-mail): "${complaint.rawDescription || complaint.description || ""}"
- Modo de Falha Real Encontrado: "${complaint.realFailureMode || ""}"
- Efeito no Cliente / Impacto: "${complaint.impactDescription || complaint.effect || ""}"
- Causa Raiz Investigada (Ishikawa / 5 Porquês): "${complaint.rootCause || ""}"
- Severidade Relatada pelo Cliente (1 a 10): ${complaint.reportedSeverity || "Não informado"}
- Ocorrências semelhantes nos últimos 12 meses: ${historyOccurrences || 1}

CATÁLOGO ATUAL DO PFMEA DA EMPRESA (Linhas existentes):
${JSON.stringify(pfmeaCatalog || [], null, 2)}

INSTRUÇÕES DE ANÁLISE:
1. Identifique a linha do PFMEA mais compatível (ou determine se é um Novo Modo de Falha / Nova Causa).
2. Avalie a Severidade (S - 1 a 10): Se causa parada de linha na montadora ou risco à segurança/conformidade legal, S deve ser 9 ou 10. Se perda de função principal, S=7 ou 8.
3. Avalie a Ocorrência (O - 1 a 10): Baseie-se na frequência de reclamações e no histórico de reincidência (${historyOccurrences || 1}x no período).
4. Avalie a Detecção (D - 1 a 10): Se a falha escapou da fábrica e chegou ao cliente final/montadora, os controles atuais falharam na detecção, logo D sugerido deve ser aumentado (ex: 7 a 9), até que uma nova barreira à prova de erros (Poka-Yoke / Visão Artificial) seja validada.
5. Calcule o NPR Atual e o Novo NPR Sugerido (S * O * D), bem como a Prioridade de Ação (AP - Alta / Média / Baixa).
6. Formule recomendações de Ações de Prevenção e Detecção (ex: Poka-yoke, sensor de fim de curso, revisão de parâmetros de processo, plano de controle).

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "matchedPfmeaId": "string com ID da linha encontrada ou null se novo",
  "matchConfidenceScore": 85,
  "matchReason": "Justificativa da correspondência encontrada no PFMEA",
  "isNewFailureMode": false,
  "isNewCause": false,
  "technicalAnalysis": "Resumo técnico da análise de engenharia da falha",
  "suggestedValues": {
    "processStep": "Nome da Etapa",
    "failureMode": "Modo de Falha Padronizado",
    "failureEffect": "Efeito da Falha no Cliente/Montadora",
    "severity": 8,
    "severityRationale": "Justificativa da nota de Severidade",
    "occurrence": 5,
    "occurrenceRationale": "Justificativa da nota de Ocorrência com base no histórico",
    "detection": 7,
    "detectionRationale": "Justificativa da nota de Detecção (falha de contenção)",
    "npr": 280,
    "actionPriority": "Alta"
  },
  "recommendedControls": {
    "prevention": "Ações recomendadas de prevenção na causa raiz",
    "detection": "Ações recomendadas de melhoria de detecção antes do envio",
    "actionPlanText": "Texto padronizado pronto para preencher o plano de ação no cabeçalho do PFMEA"
  },
  "auditComplianceNote": "Observação de conformidade IATF 16949 / Lições aprendidas"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Erro na análise de IA:", error);
    return res.status(500).json({
      error: "Falha ao processar análise via IA.",
      details: error?.message || String(error),
      useFallback: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PFMEA App] Servidor operacional na porta ${PORT}`);
  });
}

startServer();
