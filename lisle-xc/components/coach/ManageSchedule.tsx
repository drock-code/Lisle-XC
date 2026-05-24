"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Clock, Plus, Loader2, Edit3, 
  ChevronLeft, Trash2, FileText, X, Paperclip, Check } from "lucide-react";

import Button from "@/components/Button";
import { YearSelector } from "@/components/YearSelector";
import RichTextEditor from "@/components/RichTextEditor";
import MediaChooserModal from "@/components/MediaChooseModal";

import { formatTime } from '@/lib/time';

interface Meet {
  ID: number;
  Meet: string;
  Date: string;
  Time: string | null;
  Location: string | null;
  Level: string | null;
  Info: string | null;
}

export interface RaceFile {
  ID: number;
  RaceID: number;
  Title: string;
  File: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export default function ManageSchedule() {
  const searchParams = useSearchParams();

  const [editingResultId, setEditingResultId] = useState<number | null>(null);
  const [editingResultTitle, setEditingResultTitle] = useState("");

  const [raceFiles, setRaceFiles] = useState<RaceFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const urlYear = searchParams.get("year");
  const [activeYear, setActiveYear] = useState<number>(() =>
    urlYear ? parseInt(urlYear) : new Date().getFullYear()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  const [meets, setMeets] = useState<Meet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const targetYear = selectedMeet?.Date ? new Date(selectedMeet.Date).getFullYear() : null;
  const folderPath = targetYear ? `results/${targetYear}` : "results";

  const [infoHtml, setInfoHtml] = useState("");
  const [editInfoHtml, setEditInfoHtml] = useState("");

  // Sync the edit rich text editor when a meet is selected
  useEffect(() => {
    if (selectedMeet) {
      setEditInfoHtml(selectedMeet.Info || "");
      
      setIsLoadingFiles(true);
      fetch(`/api/admin/meets/${selectedMeet.ID}/results`)
        .then(res => res.json())
        .then(data => setRaceFiles(Array.isArray(data) ? data : []))
        .catch(err => console.error(err))
        .finally(() => setIsLoadingFiles(false));
    }
  }, [selectedMeet]);

const handleSaveResultTitle = async (fileId: number) => {
    try {
      const res = await fetch(`/api/admin/results/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingResultTitle })
      });
      if (res.ok) {
        setRaceFiles(prev => prev.map(f => f.ID === fileId ? { ...f, Title: editingResultTitle } : f));
        setEditingResultId(null);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update title.");
    }
  };

  const handleSaveMeet = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !selectedMeet) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/admin/edit-meet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMeet.ID,
          meet: formData.get("meet"),
          date: formData.get("date"),
          time: formData.get("time"),
          location: formData.get("location"),
          level: formData.get("level"),
          info: formData.get("info"), // This will pull from the hidden input attached to the rich text editor
        }),
      });

      if (!res.ok) throw new Error("Failed to update meet");
      
      alert("Meet updated successfully!");
      setSelectedMeet(null);
      await loadScheduleData(); 
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeet = async () => {
    if (!selectedMeet) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedMeet.Meet}? This cannot be undone.`
    );
    
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/delete-meet?id=${selectedMeet.ID}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete meet");

      alert("Meet deleted successfully!");
      setSelectedMeet(null);
      await loadScheduleData(); 
    } catch (error) {
      console.error(error);
      alert("Failed to delete meet.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAttachResult = async (url: string) => {
    if (!selectedMeet) return;
    
    // Automatically use the raw filename as the default title
    const defaultTitle = url.split('/').pop() || "Full Results";

    try {
      const res = await fetch(`/api/admin/meets/${selectedMeet.ID}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: defaultTitle, file: url })
      });
      if (res.ok) {
        const updatedFiles = await fetch(`/api/admin/meets/${selectedMeet.ID}/results`).then(r => r.json());
        setRaceFiles(updatedFiles);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to attach result.");
    }
  };

  const handleRemoveResult = async (fileId: number) => {
    if (!confirm("Remove this result from the meet?")) return;
    try {
      const res = await fetch(`/api/admin/results/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setRaceFiles(prev => prev.filter(f => f.ID !== fileId));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to remove result.");
    }
  };

  const loadScheduleData = useCallback(async () => {
    try {
      const targetUrl = urlYear ? `/api/admin/schedule?year=${urlYear}` : "/api/admin/schedule";
      const res = await fetch(targetUrl);
      if (res.ok) {
        const data = await res.json();
        setAvailableYears(data.availableYears || []);
        setActiveYear(data.activeYear);
        setMeets(data.meets || []);
      }
    } catch (error) {
      console.error("Failed to load schedule data", error);
    }
  }, [urlYear]);

  useEffect(() => {
    setIsLoading(true);
    loadScheduleData().finally(() => setIsLoading(false));
  }, [loadScheduleData]);

  const handleAddMeet = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetForm = e.currentTarget;
    const formData = new FormData(targetForm);

    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meet: formData.get("meet"),
          date: formData.get("date"),
          time: formData.get("time") || null,
          location: formData.get("location") || null,
          level: formData.get("level") || null,
          info: formData.get("info") || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to add meet");
      
      targetForm.reset();
      setInfoHtml("");
      await loadScheduleData();
      
      alert("Meet added successfully!"); 
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER EDIT FORM IF A MEET IS SELECTED ---
  if (selectedMeet) {
    const formattedDate = selectedMeet.Date 
      ? new Date(selectedMeet.Date).toISOString().split('T')[0] 
      : "";

    return (
      <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-light-blue-gray/50 p-6 border-b border-border flex items-center gap-4">
          <Button 
            type="button" 
            size="sm"
            onClick={() => setSelectedMeet(null)} 
            className="px-3! py-2! bg-transparent! text-foreground! hover:bg-black/5! shadow-none!"
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Edit3 size={24} />
            Editing: {selectedMeet.Meet}
          </h2>
        </div>
        
        <form onSubmit={handleSaveMeet} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Meet Name *</label>
              <input name="meet" type="text" defaultValue={selectedMeet.Meet} required className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Date *</label>
              <input name="date" type="date" defaultValue={formattedDate} required className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all [color-scheme:light_dark] dark:[color-scheme:dark]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Time</label>
              <input name="time" type="time" defaultValue={selectedMeet.Time || ""} className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all [color-scheme:light_dark] dark:[color-scheme:dark]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Location</label>
              <input name="location" type="text" defaultValue={selectedMeet.Location || ""} className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Level</label>
              <input name="level" type="text" defaultValue={selectedMeet.Level || ""} placeholder="e.g., Varsity" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Additional Info</label>
              <RichTextEditor value={editInfoHtml} onChange={setEditInfoHtml} />
              <input type="hidden" name="info" value={editInfoHtml} />
            </div>

            {/* --- RESULTS ATTACHMENT SECTION --- */}
            <div className="md:col-span-2 pt-6 border-t border-border mt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground ml-1">Race Results</h3>
                  <p className="text-xs text-light-gray ml-1 mt-1">Attach text results to this meet.</p>
                </div>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => setIsResultModalOpen(true)}
                  className="bg-light-blue! text-foreground! shadow-none! hover:bg-lisle-blue! hover:text-white!"
                >
                  <Paperclip size={14} className="mr-2" /> Attach File
                </Button>
              </div>

              {isLoadingFiles ? (
                 <div className="text-sm text-light-gray flex items-center gap-2 p-2"><Loader2 className="animate-spin" size={14}/> Loading results...</div>
              ) : raceFiles.length === 0 ? (
                <div className="p-4 border border-dashed border-border rounded-xl text-center text-sm text-light-gray">
                  No results attached yet.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {raceFiles.map(file => (
                    <div key={file.ID} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl hover:border-lisle-blue transition-colors">
                      
                      {/* IF THIS FILE IS BEING EDITED */}
                      {editingResultId === file.ID ? (
                        <div className="flex items-center gap-2 w-full">
                          <input 
                            type="text" 
                            value={editingResultTitle} 
                            onChange={(e) => setEditingResultTitle(e.target.value)}
                            className="w-full p-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-lisle-blue bg-background text-foreground"
                            autoFocus
                          />
                          <button type="button" onClick={() => handleSaveResultTitle(file.ID)} className="p-2 bg-lisle-blue text-white cursor-pointer rounded-md hover:opacity-90 transition-opacity" title="Save">
                            <Check size={16} />
                          </button>
                          <button type="button" onClick={() => setEditingResultId(null)} className="p-2 bg-light-blue-gray cursor-pointer text-foreground rounded-md hover:bg-black/10 transition-colors" title="Cancel">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        /* STANDARD DISPLAY MODE */
                        <>
                          <a href={file.File} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-foreground hover:underline truncate">
                            <FileText size={16} className="shrink-0" /> 
                            <span className="truncate">{file.Title}</span>
                          </a>
                          <div className="flex items-center gap-1 shrink-0">
                            <button 
                              type="button" 
                              onClick={() => { setEditingResultId(file.ID); setEditingResultTitle(file.Title); }} 
                              className="p-2 text-light-gray hover:text-light-blue-gray transition-colors rounded cursor-pointer hover:bg-lisle-blue/10" 
                              title="Rename Result"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveResult(file.ID)} 
                              className="p-2 text-light-gray hover:text-red-500 transition-colors rounded cursor-pointer hover:bg-red-50" 
                              title="Remove Result"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border mt-8">
            <div className="w-full md:w-auto">
              <Button
                type="button"
                onClick={handleDeleteMeet}
                disabled={isDeleting}
                className="w-full md:w-auto shadow-none! rounded-xl! flex items-center justify-center gap-2 bg-red-50! text-red-600! hover:bg-red-100! border border-red-200 hover:scale-105!"
              >
                <Trash2 size={18} />
                {isDeleting ? "Deleting..." : "Delete Meet"}
              </Button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Button className="w-full md:w-auto cursor-pointer" type="button" size="lg" isActive={false} onClick={() => setSelectedMeet(null)}>Cancel</Button>
              <Button className="w-full md:w-auto" type="submit" size="lg" isActive={!isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>

        <MediaChooserModal
          isOpen={isResultModalOpen}
          type="file"
          targetPath={`results/${new Date(selectedMeet.Date).getFullYear()}`}
          onClose={() => setIsResultModalOpen(false)}
          onSelect={handleAttachResult}
        />
      </section>
    );
  }

  // --- RENDER MAIN VIEW ---
  return (
    <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="bg-light-blue-gray/50 p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays size={24} className="text-lisle-blue" /> 
          Manage Season Schedule
        </h2>
        <div className="bg-background border border-border rounded-xl px-4 py-2">
          <YearSelector years={availableYears} selectedYear={activeYear} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-light-gray">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading Schedule...</p>
        </div>
      ) : (
        <div className="p-6 md:p-8 space-y-12">
          
          {/* --- ADD MEET FORM --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
              Add New Meet
            </h3>
            
            <form onSubmit={handleAddMeet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Meet Name *</label>
                <input name="meet" type="text" required placeholder="e.g., Lisle Mane Event" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Date *</label>
                <input 
                  name="date" 
                  type="date" 
                  required 
                  className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none [color-scheme:light_dark] dark:[color-scheme:dark]" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Time</label>
                <input name="time" type="time" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none [color-scheme:light_dark] dark:[color-scheme:dark]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Location</label>
                <input name="location" type="text" placeholder="e.g., Community Park" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Level</label>
                <input name="level" type="text" placeholder="e.g., Varsity" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none" />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Additional Info</label>
                <RichTextEditor value={infoHtml} onChange={setInfoHtml} />
                <input type="hidden" name="info" value={infoHtml} />
              </div>

              <div className="md:col-span-2 flex justify-end mt-2">
                <Button type="submit" disabled={isSubmitting} className="rounded-xl!">
                  <Plus size={18} className="mr-1" /> Add to Schedule
                </Button>
              </div>
            </form>
          </div>

          {/* --- SCHEDULE LIST --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
              {activeYear} Schedule
            </h3>
            
            <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
              {meets.length === 0 && <p className="text-sm text-light-gray">No meets scheduled for {activeYear} yet.</p>}
              
              {meets.map(meet => (
                <div 
                  key={meet.ID} 
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMeet(meet)}
                  className="w-full text-left p-4 border border-border rounded-xl hover:bg-light-blue hover:shadow-sm transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 bg-background group cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-foreground text-lg group-hover:text-lisle-blue transition-colors">
                      {meet.Meet}
                    </h4>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-foreground mt-1">
                      <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(meet.Date).toLocaleDateString()}</span>
                      {meet.Time && <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(meet.Time)}</span>}
                      {meet.Location && <span className="flex items-center gap-1"><MapPin size={14} /> {meet.Location}</span>}
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                    <span className="text-sm text-foreground flex items-center gap-1 font-medium">
                      Edit Meet <Edit3 size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* THE RESULTS ATTACHMENT MODAL */}
      <MediaChooserModal
        isOpen={isResultModalOpen}
        type="file"
        targetPath={folderPath}
        onClose={() => setIsResultModalOpen(false)}
        onSelect={handleAttachResult}
      />
    </section>
  );
}