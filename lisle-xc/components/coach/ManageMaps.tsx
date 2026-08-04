"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit3, Trash2, MapPin, FileJson, FolderOpen } from "lucide-react";
import MediaChooserModal from "@/components/MediaChooseModal";

interface CourseMap {
  Id: number;
  Name: string;
  Location: string;
  FileName: string;
  Description: string | null;
}

export default function ManageMaps() {
  const [maps, setMaps] = useState<CourseMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");

  // Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    fetchMaps();
  }, []);

  const fetchMaps = async () => {
    try {
      const res = await fetch("/api/admin/maps");
      if (res.ok) {
        const data = await res.json();
        setMaps(data);
      }
    } catch (error) {
      console.error("Failed to fetch maps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setLocation("");
    setFileName("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const method = editingId ? "PUT" : "POST";
      const payload = { id: editingId, name, location, fileName, description };

      const res = await fetch("/api/admin/maps", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save map");

      setMessage({ text: `Map successfully ${editingId ? "updated" : "added"}!`, type: "success" });
      resetForm();
      fetchMaps();
    } catch (error) {
      setMessage({ text: "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleEdit = (map: CourseMap) => {
    setEditingId(map.Id);
    setName(map.Name);
    setLocation(map.Location || "");
    setFileName(map.FileName || "");
    setDescription(map.Description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this map? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/maps?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete map");
      
      setMessage({ text: "Map deleted successfully.", type: "success" });
      fetchMaps();
    } catch (error) {
      setMessage({ text: "Failed to delete map.", type: "error" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <section className="bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-lisle-blue/10 flex items-center justify-center text-lisle-blue">
            {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? "Edit Course Map" : "Add New Course Map"}
            </h2>
            <p className="text-sm text-light-gray">
              Upload your GeoJSON file or paste a direct web URL below.
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${message.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Map Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lisle Mane Event"
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Community Park"
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">File Path (GeoJSON) *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g., /files/maps/lisle-course.geojson"
                className="flex-1 p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="cursor-pointer px-4 py-3 bg-light-blue-gray/10 border border-border rounded-xl text-foreground font-bold hover:bg-light-blue-gray/20 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <FolderOpen size={18} /> 
                <span className="hidden sm:inline">Browse</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add parking details, terrain notes, etc."
              className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex-1 bg-lisle-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : editingId ? "Update Map" : "Add Map"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer px-6 py-3 rounded-xl border border-border font-bold text-foreground hover:bg-light-blue-gray/10 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* List Section */}
      <section className="bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Existing Course Maps</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-lisle-blue" size={32} />
          </div>
        ) : maps.length === 0 ? (
          <p className="text-center text-light-gray py-8 italic border-2 border-dashed border-border rounded-xl">
            No course maps found. Add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {maps.map((map) => (
              <div key={map.Id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-xl hover:border-lisle-blue/50 transition bg-light-blue-gray/5 group">
                <div className="mb-4 sm:mb-0">
                  <h4 className="font-bold text-foreground text-lg">{map.Name}</h4>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1 text-sm text-light-gray">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {map.Location}</span>
                    <span className="flex items-center gap-1"><FileJson size={14} /> {map.FileName}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleEdit(map)}
                    className="cursor-pointer flex-1 sm:flex-none p-2 bg-white text-lisle-blue border border-border rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm font-bold"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(map.Id)}
                    className="cursor-pointer flex-1 sm:flex-none p-2 bg-white text-red-600 border border-border rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2 text-sm font-bold"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Media Chooser Modal */}
      <MediaChooserModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => setFileName(url)}
        type="file"
        targetPath="maps"
      />
    </div>
  );
}