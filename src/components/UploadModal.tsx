import React, { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertCircle,
  FileCheck,
  Download
} from "lucide-react";
import { parseUploadedExcel, mapRowsToPfmea, mapRowsToComplaints } from "../utils/excelHandler";
import { PfmeaRow, FastResponseComplaint } from "../types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPfmea: (rows: PfmeaRow[]) => void;
  onImportComplaints: (complaints: FastResponseComplaint[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImportPfmea,
  onImportComplaints,
}) => {
  const [uploadType, setUploadType] = useState<"pfmea" | "fast_response">("pfmea");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      const sheets = await parseUploadedExcel(file);
      if (!sheets || sheets.length === 0) {
        throw new Error("O arquivo Excel está vazio ou não possui abas legíveis.");
      }

      // Pick the first sheet with data
      const targetSheet = sheets.find(s => s.rows.length > 0) || sheets[0];
      if (!targetSheet.rows || targetSheet.rows.length === 0) {
        throw new Error(`A aba "${targetSheet.sheetName}" não contém linhas de dados.`);
      }

      if (uploadType === "pfmea") {
        const pfmeaRows = mapRowsToPfmea(targetSheet.rows);
        onImportPfmea(pfmeaRows);
        setSuccessInfo(`Sucesso! ${pfmeaRows.length} linhas do PFMEA importadas da aba "${targetSheet.sheetName}".`);
      } else {
        const complaints = mapRowsToComplaints(targetSheet.rows);
        onImportComplaints(complaints);
        setSuccessInfo(`Sucesso! ${complaints.length} reclamações importadas da aba "${targetSheet.sheetName}".`);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao ler o arquivo Excel.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/70 backdrop-blur-xs p-4">
      <div className="bg-white border border-[#141414] shadow-[6px_6px_0px_#141414] max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#141414] text-[#E4E3E0] px-6 py-4 flex items-center justify-between border-b border-[#141414]">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest">
              Importar Planilha Excel (.xlsx / .csv)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#E4E3E0]/70 hover:text-white p-1 hover:bg-[#333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Destination Selector */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#141414] block mb-2">
              Selecione o tipo de planilha para importar:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUploadType("pfmea")}
                className={`p-3 border text-left transition-all cursor-pointer ${
                  uploadType === "pfmea"
                    ? "border-[#141414] bg-blue-50/80 shadow-[3px_3px_0px_#141414] text-blue-900 font-bold"
                    : "border-[#141414]/30 hover:border-[#141414] text-[#141414] bg-[#F8F9FA]"
                }`}
              >
                <div className="font-mono text-xs uppercase tracking-wider">📋 PFMEA Master</div>
                <div className="text-[11px] text-[#141414]/70 mt-1 font-sans font-normal">
                  Tabela oficial com modos de falha, S, O, D e controles.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUploadType("fast_response")}
                className={`p-3 border text-left transition-all cursor-pointer ${
                  uploadType === "fast_response"
                    ? "border-[#141414] bg-blue-50/80 shadow-[3px_3px_0px_#141414] text-blue-900 font-bold"
                    : "border-[#141414]/30 hover:border-[#141414] text-[#141414] bg-[#F8F9FA]"
                }`}
              >
                <div className="font-mono text-xs uppercase tracking-wider">⚡ Reclamações Fast Response</div>
                <div className="text-[11px] text-[#141414]/70 mt-1 font-sans font-normal">
                  Planilha de RNCs, clientes, 5 porquês e relatos.
                </div>
              </button>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-600 bg-blue-50/60 scale-[0.99]"
                : "border-[#141414]/40 hover:border-[#141414] bg-[#F8F9FA] hover:bg-blue-50/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.value && e.target.files?.[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 border border-[#141414] bg-[#E4E3E0] flex items-center justify-center text-[#141414] shadow-[2px_2px_0px_#141414]">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#141414]">
                Arraste a planilha aqui ou clique para selecionar
              </div>
              <p className="text-[11px] text-[#141414]/60 font-mono">
                Formatos aceitos: .xlsx, .xls, .csv
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {isProcessing && (
            <div className="p-3 bg-blue-50 text-blue-900 border border-blue-600 text-xs font-mono flex items-center space-x-2">
              <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Lendo e mapeando colunas da planilha...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-900 text-xs font-medium flex items-center space-x-2 border border-red-600">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-mono font-bold flex items-center space-x-2 border border-emerald-600">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#E4E3E0] px-6 py-3 border-t border-[#141414] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#141414]/70 font-mono">
            Mapeamento inteligente com suporte a sinônimos AIAG-VDA.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141414] hover:bg-[#333] text-[#E4E3E0] font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] shadow-[2px_2px_0px_#141414] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
