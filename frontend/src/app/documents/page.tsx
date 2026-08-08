"use client";

import React, { useEffect, useState } from "react";
import { 
  FileText, Upload, Search, Trash2, Download, Eye, RefreshCw, 
  Sparkles, FileSearch, CheckCircle2 
} from "lucide-react";
import DocumentModal from "../../components/Documents/DocumentModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

const CATEGORIES = ["ALL", "Contracts", "Purchase Orders", "Invoices", "Shipping", "Certifications"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Contracts");
  const [isUploading, setIsUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: string | null }>({});

  const fetchDocuments = () => {
    fetch(`${API_BASE_URL}/documents?category=${category}&search=${search}`)
      .then((res) => res.json())
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Fetch documents error:", err));
  };

  useEffect(() => {
    fetchDocuments();
  }, [category, search]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadCategory);
    formData.append("uploaded_by", "usr_zainab");

    try {
      const res = await fetch(`${API_BASE_URL}/documents/upload`, { 
        method: "POST", 
        body: formData 
      });

      if (!res.ok) {
        const errorDetail = await res.text();
        console.error("Server Error Detail:", errorDetail);
        alert(`Server Error (${res.status}): Upload failed! Check console or backend logs.`);
        return;
      }

      setFile(null);
      (e.target as HTMLFormElement).reset(); 
      alert("File uploaded successfully!");
      fetchDocuments(); 
    } catch (err: any) {
      console.error("Upload network error:", err);
      alert(`Network Error: Backend unreachable at ${API_BASE_URL}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`${API_BASE_URL}/documents/${docId}`, { method: "DELETE" });
      if (selectedDoc?.id === docId) setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSummarize = async (docId: string) => {
    setActionLoading((prev) => ({ ...prev, [docId]: "summarize" }));
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${docId}/summarize`, {
        method: "POST",
      });
      const data = await res.json();
      
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, ai_summary: data.ai_summary } : doc))
      );
      
      setSelectedDoc((prev: any) => 
        prev && prev.id === docId ? { ...prev, ai_summary: data.ai_summary } : prev
      );
    } catch (err) {
      console.error("Summarize error:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [docId]: null }));
    }
  };

  const handleOCR = async (docId: string) => {
    setActionLoading((prev) => ({ ...prev, [docId]: "ocr" }));
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${docId}/ocr`, {
        method: "POST",
      });
      const data = await res.json();
      
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, ocr_text: data.ocr_text } : doc))
      );

      setSelectedDoc((prev: any) => 
        prev && prev.id === docId ? { ...prev, ocr_text: data.ocr_text } : prev
      );
    } catch (err) {
      console.error("OCR error:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [docId]: null }));
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Documents Management</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Centralized hub for AI Summarization & OCR Processing</p>
      </div>

      {/* SECTION 1: Full-Width Spread Upload Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4">
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-3">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-6">
            <label className="text-[11px] font-bold text-slate-600 uppercase">File Attachment</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full mt-1 text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
            />
          </div>

          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all whitespace-nowrap"
            >
              {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isUploading ? "Uploading..." : "Upload File"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Horizontal Search and Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-96 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search title or OCR content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs outline-none w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                category === cat 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: Full Width Documents List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider">
              <th className="p-3.5 pl-5">Document Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Size</th>
              <th className="p-3.5 text-center">AI Actions</th>
              <th className="p-3.5 text-center pr-5">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                  No documents found in this category.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-slate-900 flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="truncate max-w-[280px]" title={doc.title}>{doc.title}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {doc.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{doc.file_size_kb} KB</td>
                  
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => doc.ai_summary ? setSelectedDoc(doc) : handleSummarize(doc.id)}
                        disabled={actionLoading[doc.id] === "summarize"}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                          doc.ai_summary 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100" 
                            : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {actionLoading[doc.id] === "summarize" ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : doc.ai_summary ? (
                          <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span>{doc.ai_summary ? "View Summary" : "Summarize"}</span>
                      </button>

                      <button
                        onClick={() => doc.ocr_text ? setSelectedDoc(doc) : handleOCR(doc.id)}
                        disabled={actionLoading[doc.id] === "ocr"}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                          doc.ocr_text 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
                            : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                      >
                        {actionLoading[doc.id] === "ocr" ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : doc.ocr_text ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <FileSearch className="h-3 w-3" />
                        )}
                        <span>{doc.ocr_text ? "View OCR" : "OCR"}</span>
                      </button>
                    </div>
                  </td>

                  <td className="p-3.5 pr-5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => setSelectedDoc(doc)} 
                        title="Preview Document"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <a 
                        href={`${API_BASE_URL}/documents/${doc.id}/download`} 
                        target="_blank" 
                        rel="noreferrer" 
                        title="Download File"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 inline-block transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(doc.id)} 
                        title="Delete Document"
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <DocumentModal
        selectedDoc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onSummarize={handleSummarize}
        onOCR={handleOCR}
      />
    </div>
  );
}