import React, { useState } from "react";
import { FeedbackLog } from "../types";
import { 
  History, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Printer, 
  FileText,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface ChangeLogViewProps {
  logs: FeedbackLog[];
  onExportLogs: () => void;
}

export const ChangeLogView: React.FC<ChangeLogViewProps> = ({
  logs,
  onExportLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = logs.filter(l =>
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.pfmeaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.processStep.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.failureMode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.actionPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.justification.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.engineerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 border border-[#141414] shadow-[4px_4px_0px_#141414] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#141414]">
              Trilha de Auditoria & Retroalimentação do PFMEA (IATF 16949)
            </h2>
          </div>
          <p className="text-xs text-[#141414]/70 mt-1 font-sans">
            Evidências de lições aprendidas e revisões de risco nos termos das cláusulas 8.5.1.1 e 10.2.3.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-[#F8F9FA] text-[#141414] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={onExportLogs}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#141414] hover:bg-[#333] text-[#E4E3E0] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 border border-[#141414] shadow-[4px_4px_0px_#141414]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por ID do Log, Reclamação, Linha PFMEA, Responsável, Justificativa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* Logs Table / Cards */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#141414] text-[#E4E3E0] text-[10px] font-mono font-bold uppercase tracking-wider border-b border-[#141414]">
                <th className="p-3">Data / ID</th>
                <th className="p-3">Reclamação & Cliente</th>
                <th className="p-3">Linha PFMEA</th>
                <th className="p-3">Modo de Falha</th>
                <th className="p-3 text-center">Sev.</th>
                <th className="p-3 text-center">Ocorr.</th>
                <th className="p-3 text-center">Detec.</th>
                <th className="p-3 text-center">NPR (Antes ➔ Depois)</th>
                <th className="p-3">Decisão</th>
                <th className="p-3 min-w-[200px]">Plano de Ação & Justificativa</th>
                <th className="p-3">Validador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center font-mono text-[#141414]/50">
                    Nenhum registro de alteração gravado até o momento.
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => {
                  const isApproved = log.decision === "Aprovado";
                  const isPending = log.decision === "Pendente";

                  return (
                    <tr key={`log-row-${log.id}-${idx}`} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="p-3 whitespace-nowrap font-mono text-[#141414]/70 text-[11px]">
                        {log.timestamp}
                        <div className="text-[9px] text-purple-700 font-bold">{log.id}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-700 block">{log.complaintId}</span>
                        <span className="text-[11px] font-bold text-[#141414]">{log.client}</span>
                        <div className="text-[10px] text-[#141414]/50 font-mono">PN: {log.partNumber}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono font-bold text-[#141414]">
                        {log.pfmeaId || "Nova Linha"}
                        <div className="text-[10px] font-sans font-normal text-[#141414]/60">{log.processStep}</div>
                      </td>
                      <td className="p-3 font-medium text-[#141414] max-w-[160px]">
                        {log.failureMode}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap font-mono">
                        <span className="text-[#141414]/50">{log.oldS}</span>
                        <span className="text-[#141414]/40 mx-1">➔</span>
                        <span className="font-bold text-[#141414]">{log.newS}</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap font-mono">
                        <span className="text-[#141414]/50">{log.oldO}</span>
                        <span className="text-[#141414]/40 mx-1">➔</span>
                        <span className="font-bold text-amber-700">{log.newO}</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap font-mono">
                        <span className="text-[#141414]/50">{log.oldD}</span>
                        <span className="text-[#141414]/40 mx-1">➔</span>
                        <span className="font-bold text-purple-700">{log.newD}</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 border border-[#141414] bg-[#E4E3E0] font-mono font-black text-xs">
                          {log.oldRpn} ➔ {log.newRpn}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center space-x-1 border ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-900 border-emerald-500"
                            : isPending
                            ? "bg-amber-100 text-amber-900 border-amber-500"
                            : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Aprovado</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Pendente</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500" />
                              <span>Isolado</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-xs max-w-sm">
                        <div className="font-medium text-[#141414] leading-tight">
                          {log.actionPlan}
                        </div>
                        <div className="text-[11px] text-[#141414]/60 mt-1 italic">
                          Justificativa: {log.justification}
                        </div>
                        {log.responsible && (
                          <div className="text-[10px] font-mono text-blue-700 font-medium mt-0.5">
                            Resp: {log.responsible} | Prazo: {log.targetDate}
                          </div>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap text-[11px] font-mono text-[#141414] font-medium">
                        {log.engineerName}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
