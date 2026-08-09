import React, { useState } from "react";
import { Sparkles, FileSearch, Loader2 } from "lucide-react";

interface ModalProps {
  selectedDoc: any;
  onClose: () => void;
  onSummarize: (id: string) => Promise<void> | void;
  onOCR: (id: string) => Promise<void> | void;
}

export default function DocumentModal({ selectedDoc, onClose, onSummarize, onOCR }: ModalProps) {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingOCR, setLoadingOCR] = useState(false);

  if (!selectedDoc) return null;

  const handleSummarizeClick = async () => {
    setLoadingSummary(true);
    try {
      await onSummarize(selectedDoc.id);
    } catch (err) {
      console.error("Summary error:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleOCRClick = async () => {
    setLoadingOCR(true);
    try {
      await onOCR(selectedDoc.id);
    } catch (err) {
      console.error("OCR error:", err);
    } finally {
      setLoadingOCR(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-slate-900">{selectedDoc.title}</h3>
            <p className="text-xs text-slate-400">ID: {selectedDoc.id} | Category: {selectedDoc.category}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold transition-colors">
            ✕
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSummarizeClick}
            disabled={loadingSummary}
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
          >
            {loadingSummary ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{loadingSummary ? "Generating..." : "Generate AI Summary"}</span>
          </button>

          <button
            onClick={handleOCRClick}
            disabled={loadingOCR}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
          >
            {loadingOCR ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSearch className="h-3.5 w-3.5" />
            )}
            <span>{loadingOCR ? "Extracting..." : "Extract OCR Text"}</span>
          </button>
        </div>

        {selectedDoc.ai_summary && (
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">AI Summary</span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
              {selectedDoc.ai_summary}
            </p>
          </div>
        )}

        {selectedDoc.ocr_text && (
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1 max-h-60 overflow-y-auto">
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">OCR Extracted Text</span>
            <p className="text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
              {selectedDoc.ocr_text}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}