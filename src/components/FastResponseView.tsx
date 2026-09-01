import React, { useState } from "react";
import { FastResponseComplaint } from "../types";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  FileSpreadsheet, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download,
  Calendar,
  Building,
  Flame,
  Trash2
} from "lucide-react";

interface FastResponseViewProps {
  complaints: FastResponseComplaint[];
  onSelectAndAnalyze: (complaintId: string) => void;
  onOpenNewComplaint: () => void;
  onExportComplaints: () => void;
  onDeleteComplaint: (complaintId: string) => void;
}

export const FastResponseView: React.FC<FastResponseViewProps> = ({
  complaints,
  onSelectAndAnalyze,
  onOpenNewComplaint,
  onExportComplaints,
  onDeleteComplaint,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const clients = Array.from(new Set(complaints.map(c => c.client)));

  const filtered = complaints.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.realFailureMode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rawDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.processStep.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClient = selectedClient === "all" || c.client === selectedClient;
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;

    return matchesSearch && matchesClient && matchesStatus;
  });

  // Calculate reoccurrence count for each process step / failure mode
  const getStepFrequency = (step: string) => {
    return complaints.filter(c => c.processStep.toLowerCase() === step.toLowerCase()).length;
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-4 border border-[#141414] shadow-[4px_4px_0px_#141414] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#141414]">
              Quadro de Ocorrências — Fast Response & Reclamações
            </h2>
          </div>
          <p className="text-xs text-[#141414]/70 mt-1 font-sans">
            Registro sistemático de reclamações de montadoras e devoluções para retroalimentação do ciclo IATF 16949.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenNewComplaint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Nova Reclamação</span>
          </button>

          <button
            onClick={onExportComplaints}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#141414] hover:bg-[#333] text-[#E4E3E0] text-xs font-mono font-bold uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 border border-[#141414] shadow-[4px_4px_0px_#141414] grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por ID, Peça, Modo de Falha, Cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-medium"
          />
        </div>

        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="text-xs p-1.5 bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-mono"
        >
          <option value="all">Todos os Clientes / Montadoras ({clients.length})</option>
          {clients.map((cl, idx) => (
            <option key={`client-opt-${cl}-${idx}`} value={cl}>{cl}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs p-1.5 bg-[#F8F9FA] border border-[#141414] focus:bg-white focus:outline-none font-mono"
        >
          <option value="all">Todos os Status</option>
          <option value="Pendente de Análise">Pendente de Análise</option>
          <option value="Retroalimentado no PFMEA">Retroalimentado no PFMEA</option>
          <option value="Em Ação Corretiva">Em Ação Corretiva</option>
          <option value="Arquivado / Isolado">Arquivado / Isolado</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#141414] text-[#E4E3E0] text-[10px] font-mono font-bold uppercase tracking-wider border-b border-[#141414]">
                <th className="p-3">ID / RNC</th>
                <th className="p-3">Data</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Peça / PN</th>
                <th className="p-3">Etapa Relacionada</th>
                <th className="p-3">Modo de Falha Real</th>
                <th className="p-3 text-center">Sev.</th>
                <th className="p-3 text-center">Reincidência</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/20 font-normal text-[#141414]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center font-mono text-[#141414]/50">
                    Nenhuma reclamação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const freq = getStepFrequency(c.processStep);
                  const isHighSev = c.reportedSeverity >= 8;
                  const isFeedbacked = c.status === "Retroalimentado no PFMEA";

                  return (
                    <tr key={`comp-row-${c.id}-${idx}`} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {c.id}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[#141414]/70">
                        {c.date}
                      </td>
                      <td className="p-3 font-bold text-[#141414] whitespace-nowrap">
                        {c.client}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[#141414]/80">
                        {c.partNumber}
                        <div className="text-[10px] text-[#141414]/50 font-sans">{c.partName}</div>
                      </td>
                      <td className="p-3 font-medium text-[#141414]">
                        {c.processStep}
                      </td>
                      <td className="p-3 font-medium text-[#141414] max-w-xs">
                        <div className="font-bold text-[#141414] truncate" title={c.realFailureMode}>
                          {c.realFailureMode}
                        </div>
                        <div className="text-[10px] text-[#141414]/60 truncate italic" title={c.rawDescription}>
                          "{c.rawDescription}"
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 font-mono font-bold text-xs border ${
                          isHighSev ? "bg-red-600 text-white border-red-800" : "bg-[#E4E3E0] text-[#141414] border-[#141414]"
                        }`}>
                          {c.reportedSeverity}/10
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {freq > 1 ? (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-400 text-[#141414] border border-[#141414] inline-flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-[#141414]" />
                            <span>{freq}x no período</span>
                          </span>
                        ) : (
                          <span className="text-[#141414]/40 font-mono text-[10px]">1ª vez</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center space-x-1 border ${
                          isFeedbacked
                            ? "bg-emerald-100 text-emerald-900 border-emerald-500"
                            : "bg-amber-100 text-amber-900 border-amber-500"
                        }`}>
                          {isFeedbacked ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Retroalimentado</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Pendente</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onSelectAndAnalyze(c.id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] shadow-[1px_1px_0px_#141414] transition-all cursor-pointer"
                            title="Analisar e Retroalimentar no PFMEA"
                          >
                            <span>Analisar</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteComplaint(c.id)}
                            className="p-1 text-[#141414]/60 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-600 transition-colors cursor-pointer"
                            title={`Excluir ${c.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
