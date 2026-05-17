import { Download } from "lucide-react";

export function ExportButtons({ onCsv, onJson, onPdf }: { onCsv: () => void; onJson: () => void; onPdf: () => void }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <button onClick={onJson} className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
        <Download size={14} /> JSON
      </button>
      <button onClick={onCsv} className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
        <Download size={14} /> CSV
      </button>
      <button onClick={onPdf} className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
        <Download size={14} /> PDF
      </button>
    </div>
  );
}
