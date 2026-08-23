"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Loader2, Edit3, ChevronLeft, Trash2, Layout } from "lucide-react";

import Button from "@/components/Button";
import RichTextEditor from "@/components/RichTextEditor";

interface HomeNote {
  Key: number;
  Date: string;
  Title: string;
  Note: string;
}

export default function ManageHomeNotes() {
  const [notes, setNotes] = useState<HomeNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedNote, setSelectedNote] = useState<HomeNote | null>(null);

  // Rich Text Editor states
  const [noteHtml, setNoteHtml] = useState("");
  const [editNoteHtml, setEditNoteHtml] = useState("");

  // Sync the edit rich text editor when a note is selected
  useEffect(() => {
    if (selectedNote) {
      setEditNoteHtml(selectedNote.Note || "");
    }
  }, [selectedNote]);

  const loadNotesData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data || []);
      }
    } catch (error) {
      console.error("Failed to load notes data", error);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadNotesData().finally(() => setIsLoading(false));
  }, [loadNotesData]);

  // --- ADD NOTE ---
  const handleAddNote = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetForm = e.currentTarget;
    const formData = new FormData(targetForm);

    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.get("date"),
          title: formData.get("title"),
          note: formData.get("note"), 
        }),
      });

      if (!res.ok) throw new Error("Failed to add note");
      
      targetForm.reset();
      setNoteHtml(""); // Clear rich text editor
      await loadNotesData();
      
      alert("Note added successfully!"); 
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EDIT NOTE ---
  const handleSaveNote = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !selectedNote) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/admin/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: selectedNote.Key,
          date: formData.get("date"),
          title: formData.get("title"),
          note: formData.get("note"), 
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");
      
      alert("Note updated successfully!");
      setSelectedNote(null);
      await loadNotesData(); 
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE NOTE ---
  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedNote.Title}"? This cannot be undone.`
    );
    
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/notes?key=${selectedNote.Key}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete note");

      alert("Note deleted successfully!");
      setSelectedNote(null);
      await loadNotesData(); 
    } catch (error) {
      console.error(error);
      alert("Failed to delete note.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // RENDER: EDIT FORM (When a note is selected)
  // ==========================================
  if (selectedNote) {
    const formattedDate = selectedNote.Date 
      ? new Date(selectedNote.Date).toISOString().split('T')[0] 
      : "";

    return (
      <section className="bg-background border border-border rounded-2xl shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-light-blue-gray/50 p-6 border-b border-border flex items-center gap-4">
          <Button 
            type="button" 
            size="sm"
            onClick={() => setSelectedNote(null)} 
            className="px-3! py-2! bg-transparent! text-foreground! hover:bg-black/5! shadow-none!"
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Edit3 size={24} />
            Editing Note
          </h2>
        </div>
        
        <form onSubmit={handleSaveNote} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Title *</label>
              <input name="title" type="text" maxLength={50} defaultValue={selectedNote.Title} required className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Display Date *</label>
              <input name="date" type="date" defaultValue={formattedDate} required className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all [color-scheme:light_dark] dark:[color-scheme:dark]" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Note Content *</label>
              <RichTextEditor value={editNoteHtml} onChange={setEditNoteHtml} />
              <input type="hidden" name="note" value={editNoteHtml} />
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border mt-8">
            <div className="w-full md:w-auto">
              <Button
                type="button"
                onClick={handleDeleteNote}
                disabled={isDeleting}
                className="w-full md:w-auto shadow-none! rounded-xl! flex items-center justify-center gap-2 bg-red-50! text-red-600! hover:bg-red-100! border border-red-200 hover:scale-105!"
              >
                <Trash2 size={18} />
                {isDeleting ? "Deleting..." : "Delete Note"}
              </Button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Button className="w-full md:w-auto cursor-pointer" type="button" size="lg" isActive={false} onClick={() => setSelectedNote(null)}>Cancel</Button>
              <Button className="w-full md:w-auto cursor-pointer" type="submit" size="lg" isActive={!isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    );
  }

  // ==========================================
  // RENDER: MAIN LIST VIEW
  // ==========================================
  return (
    <section className="bg-background border border-border rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="bg-light-blue-gray/50 p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layout size={24} className="text-lisle-blue" /> 
          Manage Home Page Notes
        </h2>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-light-gray">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading Notes...</p>
        </div>
      ) : (
        <div className="p-6 md:p-8 space-y-12">
          
          {/* --- ADD NOTE FORM --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
              Add New Note
            </h3>
            
            <form onSubmit={handleAddNote} className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Title *</label>
                <input name="title" type="text" maxLength={50} required placeholder="e.g., State Meet Details" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Date *</label>
                <input 
                  name="date" 
                  type="date" 
                  required 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none [color-scheme:light_dark] dark:[color-scheme:dark]" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Content *</label>
                <RichTextEditor value={noteHtml} onChange={setNoteHtml} />
                <input type="hidden" name="note" value={noteHtml} required />
              </div>

              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={isSubmitting} className="rounded-xl! cursor-pointer">
                  <Plus size={18} className="mr-1" /> Post Note
                </Button>
              </div>
            </form>
          </div>

          {/* --- NOTES LIST --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
              Active Notes
            </h3>
            
            <div className="space-y-3 max-h-125 overflow-y-auto pr-2">
              {notes.length === 0 && <p className="text-sm text-light-gray">No notes currently posted.</p>}
              
              {notes.map(note => (
                <div 
                  key={note.Key} 
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedNote(note)}
                  className="w-full text-left p-4 border border-border rounded-xl hover:bg-light-blue hover:shadow-sm transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 bg-background group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex bg-light-blue/20 p-3 rounded-lg text-lisle-blue group-hover:bg-lisle-blue group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{note.Title}</h4>
                      <p className="text-sm text-light-gray">
                        {new Date(note.Date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-lisle-blue flex items-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit Note <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ChevronRight(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
}