"use client";

import { useEffect, useState } from "react";
import { Tags, Plus, Trash2, ShieldCheck } from "lucide-react";
import AppShell from "@/components/UI/AppShell";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface CertType {
  id: number;
  name: string;
  description: string | null;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [certTypes, setCertTypes] = useState<CertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParent, setNewCategoryParent] = useState("");
  const [newCertName, setNewCertName] = useState("");
  const [newCertDesc, setNewCertDesc] = useState("");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:8000/admin/categories/").then((r) => r.json()),
      fetch("http://localhost:8000/admin/certification-types/").then((r) => r.json()),
    ]).then(([cats, certs]) => {
      setCategories(cats);
      setCertTypes(certs);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    setErrorMsg("");
    const res = await fetch("http://localhost:8000/admin/categories/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategoryName,
        parent_id: newCategoryParent ? Number(newCategoryParent) : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErrorMsg(data?.detail || "Failed to add category.");
      return;
    }
    setNewCategoryName("");
    setNewCategoryParent("");
    fetchAll();
  };

  const deleteCategory = async (id: number) => {
    await fetch(`http://localhost:8000/admin/categories/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const addCertType = async () => {
    if (!newCertName.trim()) return;
    setErrorMsg("");
    const res = await fetch("http://localhost:8000/admin/certification-types/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCertName, description: newCertDesc || null }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErrorMsg(data?.detail || "Failed to add certification type.");
      return;
    }
    setNewCertName("");
    setNewCertDesc("");
    fetchAll();
  };

  const deleteCertType = async (id: number) => {
    await fetch(`http://localhost:8000/admin/certification-types/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getChildren = (parentId: number) => categories.filter((c) => c.parent_id === parentId);

  return (
    <AppShell activeHref="/admin/categories">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage product categories, hierarchy, and certification types (Admin — Module 18 Part 3)
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CATEGORIES */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Product Categories</h3>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <select
                value={newCategoryParent}
                onChange={(e) => setNewCategoryParent(e.target.value)}
                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">No parent (top-level category)</option>
                {parentCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addCategory}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg px-3 py-2 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {parentCategories.map((parent) => (
                <div key={parent.id} className="border border-slate-100 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{parent.name}</span>
                    <button onClick={() => deleteCategory(parent.id)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {getChildren(parent.id).length > 0 && (
                    <div className="ml-4 mt-1.5 space-y-1">
                      {getChildren(parent.id).map((child) => (
                        <div key={child.id} className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">↳ {child.name}</span>
                          <button onClick={() => deleteCategory(child.id)} className="text-rose-400 hover:text-rose-600">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CERTIFICATION TYPES */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Certification Types</h3>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="text"
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="Certification name (e.g. ISO 9001)"
                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <input
                type="text"
                value={newCertDesc}
                onChange={(e) => setNewCertDesc(e.target.value)}
                placeholder="Short description (optional)"
                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                onClick={addCertType}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg px-3 py-2 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Certification Type
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {certTypes.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between border border-slate-100 rounded-lg p-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{cert.name}</p>
                    {cert.description && <p className="text-[11px] text-slate-500">{cert.description}</p>}
                  </div>
                  <button onClick={() => deleteCertType(cert.id)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
