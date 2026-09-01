import React from "react";
import { IshikawaDiagram, IshikawaItem, IshikawaItemStatus } from "../types";
import { Plus, Trash2, Check, X } from "lucide-react";

interface IshikawaFishboneProps {
  data: IshikawaDiagram;
  onChange: (data: IshikawaDiagram) => void;
  problemTitle: string;
}

interface ParsedItem {
  text: string;
  status: IshikawaItemStatus;
}

const parseItem = (item: string | IshikawaItem | undefined): ParsedItem => {
  if (!item) {
    return { text: "", status: null };
  }
  if (typeof item === "string") {
    return { text: item, status: null };
  }
  return {
    text: item.text || "",
    status: item.status || null,
  };
};

export const IshikawaFishbone: React.FC<IshikawaFishboneProps> = ({
  data,
  onChange,
  problemTitle,
}) => {
  const updateCategoryItemText = (
    category: keyof Omit<IshikawaDiagram, "problemHead">,
    index: number,
    text: string
  ) => {
    const currentList = data[category] || [];
    const currentItem = parseItem(currentList[index]);
    const updated = [...currentList];
    updated[index] = {
      text,
      status: currentItem.status,
    };
    onChange({
      ...data,
      [category]: updated,
    });
  };

  const toggleCategoryItemStatus = (
    category: keyof Omit<IshikawaDiagram, "problemHead">,
    index: number,
    targetStatus: "considered" | "discarded"
  ) => {
    const currentList = data[category] || [];
    const currentItem = parseItem(currentList[index]);
    const newStatus: IshikawaItemStatus = currentItem.status === targetStatus ? null : targetStatus;
    const updated = [...currentList];
    updated[index] = {
      text: currentItem.text,
      status: newStatus,
    };
    onChange({
      ...data,
      [category]: updated,
    });
  };

  const addCategoryItem = (category: keyof Omit<IshikawaDiagram, "problemHead">) => {
    const current = data[category] || [];
    if (current.length >= 6) return;
    onChange({
      ...data,
      [category]: [...current, { text: "", status: null }],
    });
  };

  const removeCategoryItem = (
    category: keyof Omit<IshikawaDiagram, "problemHead">,
    index: number
  ) => {
    const updated = (data[category] || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      [category]: updated.length > 0 ? updated : [{ text: "", status: null }],
    });
  };

  const categories: {
    key: keyof Omit<IshikawaDiagram, "problemHead">;
    title: string;
    description: string;
    color: string;
    position: "top" | "bottom";
  }[] = [
    { key: "manpower", title: "Mão de Obra", description: "Treinamento, fadiga, distração, capacitação", color: "border-blue-600 bg-blue-50/50", position: "top" },
    { key: "method", title: "Método", description: "Procedimentos, instruções de trabalho, sequenciamento", color: "border-indigo-600 bg-indigo-50/50", position: "top" },
    { key: "material", title: "Material", description: "Matéria-prima, lote, fornecedor, variação dimensional", color: "border-amber-600 bg-amber-50/50", position: "top" },
    { key: "machine", title: "Máquina", description: "Desgaste, calibração, manutenção, folgas", color: "border-purple-600 bg-purple-50/50", position: "bottom" },
    { key: "measurement", title: "Medição", description: "Instrumento, resolução, erro de leitura, MSA", color: "border-emerald-600 bg-emerald-50/50", position: "bottom" },
    { key: "environment", title: "Meio Ambiente", description: "Temperatura, iluminação, umidade, vibração", color: "border-teal-600 bg-teal-50/50", position: "bottom" },
  ];

  return (
    <div className="border-2 border-[#141414] bg-white p-4 shadow-[3px_3px_0px_#141414]">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#141414] mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 border border-[#141414]" />
          <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
            4.3 Diagrama de Ishikawa (Espinha de Peixe 6M)
          </h4>
        </div>
        
        {/* Legenda das Caixas de Seleção */}
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-[#141414]/70 font-bold hidden sm:inline">Avaliação da Causa:</span>
          <span className="flex items-center space-x-1 text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 border border-emerald-500">
            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
            <span>Considerado (Faz Sentido)</span>
          </span>
          <span className="flex items-center space-x-1 text-red-800 font-bold bg-red-100/80 px-2 py-0.5 border border-red-500">
            <X className="w-3 h-3 text-red-700 stroke-[3]" />
            <span>Desconsiderado</span>
          </span>
        </div>
      </div>

      {/* Main Fishbone Layout */}
      <div className="space-y-4">
        {/* Top 3 M's */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categories.filter(c => c.position === "top").map((cat) => (
            <div 
              key={cat.key} 
              className={`p-2.5 border border-[#141414] ${cat.color} flex flex-col justify-between shadow-[2px_2px_0px_#141414]`}
            >
              <div>
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#141414]/20">
                  <span className="font-mono font-black text-xs text-[#141414] uppercase tracking-wide">
                    {cat.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => addCategoryItem(cat.key)}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-[#141414] flex items-center space-x-0.5 cursor-pointer shadow-[1px_1px_0px_#141414] active:translate-y-0.5"
                    title="Adicionar linha de causa"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Item</span>
                  </button>
                </div>
                <p className="text-[9px] text-[#141414]/60 font-mono mb-2 italic">
                  {cat.description}
                </p>

                <div className="space-y-1.5">
                  {(data[cat.key] && data[cat.key].length > 0 ? data[cat.key] : [{ text: "", status: null }]).map((rawItem, idx) => {
                    const parsed = parseItem(rawItem);
                    return (
                      <div key={`${cat.key}-${idx}`} className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-bold text-[#141414]/50 w-3 shrink-0">
                          {idx + 1}.
                        </span>
                        
                        {/* Campo de Texto do Possível Problema */}
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={parsed.text}
                            placeholder={`Causa em ${cat.title}...`}
                            onChange={(e) => updateCategoryItemText(cat.key, idx, e.target.value)}
                            className={`w-full text-xs p-1 font-mono focus:outline-none focus:ring-1 border transition-colors ${
                              parsed.status === "considered"
                                ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold focus:ring-emerald-600"
                                : parsed.status === "discarded"
                                ? "bg-red-50/60 border-red-400 text-red-900/60 line-through focus:ring-red-400"
                                : "bg-white border-[#141414] text-[#141414] focus:ring-blue-600"
                            }`}
                          />
                        </div>

                        {/* Caixinha 1: [X] Desconsiderado */}
                        <button
                          type="button"
                          onClick={() => toggleCategoryItemStatus(cat.key, idx, "discarded")}
                          className={`w-6 h-6 shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                            parsed.status === "discarded"
                              ? "bg-red-600 border-red-800 text-white font-black shadow-[1px_1px_0px_#141414] scale-105"
                              : "bg-white hover:bg-red-50 border-[#141414]/40 hover:border-red-500 text-gray-400 hover:text-red-600"
                          }`}
                          title={
                            parsed.status === "discarded"
                              ? "Problema Desconsiderado (clique para limpar seleção)"
                              : "Marcar como Problema Desconsiderado (X)"
                          }
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* Caixinha 2: [✓] Considerado e Faz Sentido */}
                        <button
                          type="button"
                          onClick={() => toggleCategoryItemStatus(cat.key, idx, "considered")}
                          className={`w-6 h-6 shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                            parsed.status === "considered"
                              ? "bg-emerald-600 border-emerald-800 text-white font-black shadow-[1px_1px_0px_#141414] scale-105"
                              : "bg-white hover:bg-emerald-50 border-[#141414]/40 hover:border-emerald-500 text-gray-400 hover:text-emerald-600"
                          }`}
                          title={
                            parsed.status === "considered"
                              ? "Problema Considerado / Faz Sentido (clique para limpar seleção)"
                              : "Marcar como Problema Considerado e Faz Sentido (✓)"
                          }
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* Botão de Exclusão de Linha */}
                        {(data[cat.key] || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategoryItem(cat.key, idx)}
                            className="p-1 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Remover linha"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Central Spine Vector & Fish Head */}
        <div className="flex items-center space-x-2 my-2 bg-slate-100 p-2 border border-[#141414]">
          <div className="flex-1 flex items-center">
            <div className="h-1.5 bg-[#141414] flex-1 relative">
              <div className="absolute left-1/4 -top-2 w-0.5 h-5 bg-[#141414] rotate-45" />
              <div className="absolute left-2/4 -top-2 w-0.5 h-5 bg-[#141414] rotate-45" />
              <div className="absolute left-3/4 -top-2 w-0.5 h-5 bg-[#141414] rotate-45" />
              <div className="absolute left-1/4 -bottom-2 w-0.5 h-5 bg-[#141414] -rotate-45" />
              <div className="absolute left-2/4 -bottom-2 w-0.5 h-5 bg-[#141414] -rotate-45" />
              <div className="absolute left-3/4 -bottom-2 w-0.5 h-5 bg-[#141414] -rotate-45" />
            </div>
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[#141414]" />
          </div>

          {/* Fish Head / Problem Effect */}
          <div className="w-72 bg-red-600 text-white p-2.5 border-2 border-[#141414] shadow-[3px_3px_0px_#141414] shrink-0">
            <div className="text-[10px] font-mono uppercase font-black tracking-wider text-red-100 mb-0.5">
              Cabeça da Espinha (Efeito / Problema)
            </div>
            <input
              type="text"
              value={data.problemHead || problemTitle || ""}
              onChange={(e) => onChange({ ...data, problemHead: e.target.value })}
              placeholder="Defeito / Não Conformidade..."
              className="w-full text-xs font-mono font-black p-1 bg-white text-[#141414] border border-[#141414] focus:outline-none"
            />
          </div>
        </div>

        {/* Bottom 3 M's */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categories.filter(c => c.position === "bottom").map((cat) => (
            <div 
              key={cat.key} 
              className={`p-2.5 border border-[#141414] ${cat.color} flex flex-col justify-between shadow-[2px_2px_0px_#141414]`}
            >
              <div>
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#141414]/20">
                  <span className="font-mono font-black text-xs text-[#141414] uppercase tracking-wide">
                    {cat.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => addCategoryItem(cat.key)}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-[#141414] flex items-center space-x-0.5 cursor-pointer shadow-[1px_1px_0px_#141414] active:translate-y-0.5"
                    title="Adicionar linha de causa"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Item</span>
                  </button>
                </div>
                <p className="text-[9px] text-[#141414]/60 font-mono mb-2 italic">
                  {cat.description}
                </p>

                <div className="space-y-1.5">
                  {(data[cat.key] && data[cat.key].length > 0 ? data[cat.key] : [{ text: "", status: null }]).map((rawItem, idx) => {
                    const parsed = parseItem(rawItem);
                    return (
                      <div key={`${cat.key}-${idx}`} className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-bold text-[#141414]/50 w-3 shrink-0">
                          {idx + 1}.
                        </span>
                        
                        {/* Campo de Texto do Possível Problema */}
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={parsed.text}
                            placeholder={`Causa em ${cat.title}...`}
                            onChange={(e) => updateCategoryItemText(cat.key, idx, e.target.value)}
                            className={`w-full text-xs p-1 font-mono focus:outline-none focus:ring-1 border transition-colors ${
                              parsed.status === "considered"
                                ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold focus:ring-emerald-600"
                                : parsed.status === "discarded"
                                ? "bg-red-50/60 border-red-400 text-red-900/60 line-through focus:ring-red-400"
                                : "bg-white border-[#141414] text-[#141414] focus:ring-blue-600"
                            }`}
                          />
                        </div>

                        {/* Caixinha 1: [X] Desconsiderado */}
                        <button
                          type="button"
                          onClick={() => toggleCategoryItemStatus(cat.key, idx, "discarded")}
                          className={`w-6 h-6 shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                            parsed.status === "discarded"
                              ? "bg-red-600 border-red-800 text-white font-black shadow-[1px_1px_0px_#141414] scale-105"
                              : "bg-white hover:bg-red-50 border-[#141414]/40 hover:border-red-500 text-gray-400 hover:text-red-600"
                          }`}
                          title={
                            parsed.status === "discarded"
                              ? "Problema Desconsiderado (clique para limpar seleção)"
                              : "Marcar como Problema Desconsiderado (X)"
                          }
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* Caixinha 2: [✓] Considerado e Faz Sentido */}
                        <button
                          type="button"
                          onClick={() => toggleCategoryItemStatus(cat.key, idx, "considered")}
                          className={`w-6 h-6 shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                            parsed.status === "considered"
                              ? "bg-emerald-600 border-emerald-800 text-white font-black shadow-[1px_1px_0px_#141414] scale-105"
                              : "bg-white hover:bg-emerald-50 border-[#141414]/40 hover:border-emerald-500 text-gray-400 hover:text-emerald-600"
                          }`}
                          title={
                            parsed.status === "considered"
                              ? "Problema Considerado / Faz Sentido (clique para limpar seleção)"
                              : "Marcar como Problema Considerado e Faz Sentido (✓)"
                          }
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* Botão de Exclusão de Linha */}
                        {(data[cat.key] || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategoryItem(cat.key, idx)}
                            className="p-1 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Remover linha"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
