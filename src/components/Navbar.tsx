import React from "react";
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  ShieldCheck, 
  Flame, 
  Layers, 
  History, 
  BookOpen, 
  PlusCircle,
  FileDown,
  Table
} from "lucide-react";

interface NavbarProps {
  activeTab: "feedback" | "fast-response" | "pfmea" | "audit" | "criteria" | "pa-table";
  setActiveTab: (tab: "feedback" | "fast-response" | "pfmea" | "audit" | "criteria" | "pa-table") => void;
  onOpenUpload: () => void;
  onExportPfmea: () => void;
  onExportLogs: () => void;
  onOpenNewComplaint: () => void;
  onDownloadTemplate: (type: "pfmea" | "fast_response") => void;
  pendingCount: number;
  pfmeaCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onExportPfmea,
  onOpenNewComplaint,
  onDownloadTemplate,
  pendingCount,
  pfmeaCount,
}) => {
  return (
    <header className="bg-[#141414] border-b border-[#141414] text-[#E4E3E0] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#222] border border-[#333] flex items-center justify-center text-[#E4E3E0] font-bold">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-widest text-[#E4E3E0]/40 leading-none mb-0.5">
                IATF 16949 / AIAG-VDA
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-[#E4E3E0]">
                  PFMEA <span className="text-blue-400">Sync</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider bg-[#222] border border-[#333] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  v1.2.0-PROD
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#1a1a1a] p-1 border border-[#333]">
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "feedback"
                  ? "bg-[#E4E3E0] text-[#141414] shadow-[2px_2px_0px_#3b82f6]"
                  : "text-[#E4E3E0]/70 hover:text-[#E4E3E0] hover:bg-[#262626]"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Análise & Sugestão</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-[#141414] text-[10px] font-black font-mono">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("fast-response")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "fast-response"
                  ? "bg-[#E4E3E0] text-[#141414] shadow-[2px_2px_0px_#3b82f6]"
                  : "text-[#E4E3E0]/70 hover:text-[#E4E3E0] hover:bg-[#262626]"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>Fast Response</span>
            </button>

            <button
              onClick={() => setActiveTab("pfmea")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "pfmea"
                  ? "bg-[#E4E3E0] text-[#141414] shadow-[2px_2px_0px_#3b82f6]"
                  : "text-[#E4E3E0]/70 hover:text-[#E4E3E0] hover:bg-[#262626]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>PFMEA Master</span>
              <span className="text-[10px] font-mono text-[#E4E3E0]/50 font-normal">({pfmeaCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-[#E4E3E0] text-[#141414] shadow-[2px_2px_0px_#3b82f6]"
                  : "text-[#E4E3E0]/70 hover:text-[#E4E3E0] hover:bg-[#262626]"
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Auditoria & Logs</span>
            </button>

            <button
              onClick={() => setActiveTab("criteria")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "criteria"
                  ? "bg-[#E4E3E0] text-[#141414] shadow-[2px_2px_0px_#3b82f6]"
                  : "text-[#E4E3E0]/70 hover:text-[#E4E3E0] hover:bg-[#262626]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tabelas S/O/D</span>
            </button>

            <button
              onClick={() => setActiveTab("pa-table")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "pa-table"
                  ? "bg-[#E4E3E0] text-[#141414] shadow-[2px_2px_0px_#f59e0b]"
                  : "text-[#E4E3E0]/70 hover:text-[#E4E3E0] hover:bg-[#262626]"
              }`}
            >
              <Table className="w-3.5 h-3.5 text-amber-400" />
              <span>Tabela PA</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewComplaint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] text-[#E4E3E0] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Cadastrar nova reclamação manualmente ou colar texto de e-mail"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Nova Reclamação</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] text-[#E4E3E0] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Importar planilhas Excel do Fast Response ou PFMEA"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Importar Excel</span>
            </button>

            <button
              onClick={onExportPfmea}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
              title="Exportar PFMEA Master atualizado em formato Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Exportar PFMEA</span>
            </button>

            {/* Template Download Dropdown */}
            <div className="relative group">
              <button
                className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] text-[#E4E3E0] transition-colors cursor-pointer"
                title="Baixar modelos Excel padronizados"
              >
                <FileDown className="w-4 h-4 text-[#E4E3E0]" />
              </button>
              <div className="absolute right-0 mt-1 w-52 bg-[#141414] border border-[#333] shadow-[4px_4px_0px_#141414] py-1 text-xs hidden group-hover:block z-50">
                <div className="px-3 py-1 text-[9px] uppercase font-bold tracking-widest text-[#E4E3E0]/40 border-b border-[#333]">
                  Modelos de Planilha
                </div>
                <button
                  onClick={() => onDownloadTemplate("pfmea")}
                  className="w-full text-left px-3 py-2 text-[#E4E3E0] hover:bg-[#222] flex items-center space-x-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Modelo PFMEA Master</span>
                </button>
                <button
                  onClick={() => onDownloadTemplate("fast_response")}
                  className="w-full text-left px-3 py-2 text-[#E4E3E0] hover:bg-[#222] flex items-center space-x-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  <span>Modelo Fast Response</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden overflow-x-auto space-x-1 py-2 border-t border-[#333] scrollbar-none">
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              activeTab === "feedback" ? "bg-[#E4E3E0] text-[#141414]" : "text-[#E4E3E0]/70"
            }`}
          >
            Análise ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("fast-response")}
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              activeTab === "fast-response" ? "bg-[#E4E3E0] text-[#141414]" : "text-[#E4E3E0]/70"
            }`}
          >
            Fast Response
          </button>
          <button
            onClick={() => setActiveTab("pfmea")}
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              activeTab === "pfmea" ? "bg-[#E4E3E0] text-[#141414]" : "text-[#E4E3E0]/70"
            }`}
          >
            PFMEA ({pfmeaCount})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              activeTab === "audit" ? "bg-[#E4E3E0] text-[#141414]" : "text-[#E4E3E0]/70"
            }`}
          >
            Auditoria
          </button>
          <button
            onClick={() => setActiveTab("criteria")}
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              activeTab === "criteria" ? "bg-[#E4E3E0] text-[#141414]" : "text-[#E4E3E0]/70"
            }`}
          >
            Tabelas S/O/D
          </button>
          <button
            onClick={() => setActiveTab("pa-table")}
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              activeTab === "pa-table" ? "bg-[#E4E3E0] text-[#141414]" : "text-[#E4E3E0]/70"
            }`}
          >
            Tabela PA
          </button>
        </div>
      </div>
    </header>
  );
};

