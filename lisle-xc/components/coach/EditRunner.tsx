"use client";

import React, { useState, useEffect } from "react";
import { Edit3, Search, ChevronLeft, Loader2, Lock, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import { Select } from "@/components/Select";

interface Runner {
  Key: number;
  Name: string;
  Email: string | null;
  Gender: string;
  Grade: number;
  GraduationYear: number;
  AvatarURL: string | null;
}

export default function EditRunner() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 

  const [activeGrades, setActiveGrades] = useState<number[]>([]);
  const [lockedGrades, setLockedGrades] = useState<number[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  useEffect(() => {
    async function fetchRunners() {
      try {
        const res = await fetch("/api/admin/runners");
        if (res.ok) {
          const data = await res.json();
          setRunners(data);
        }
      } catch (error) {
        console.error("Failed to load runners", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRunners();
  }, []);

  useEffect(() => {
    if (!selectedRunner) return;
    
    async function fetchRosterHistory() {
      setIsLoadingRoster(true);
      try {
        const res = await fetch(`/api/admin/runners/${selectedRunner?.Key}/roster`);
        if (res.ok) {
          const data = await res.json();
          setActiveGrades(data.activeGrades);
          setLockedGrades(data.lockedGrades);
        }
      } catch (error) {
        console.error("Failed to load roster history", error);
      } finally {
        setIsLoadingRoster(false);
      }
    }
    fetchRosterHistory();
  }, [selectedRunner]);

  const filteredRunners = runners.filter(r => 
    r.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleGrade = (grade: number) => {
    if (lockedGrades.includes(grade)) return;
    setActiveGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !selectedRunner) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/admin/edit-runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRunner.Key,
          name: formData.get("name"),
          email: formData.get("email"),
          gender: formData.get("gender"),
          grade: parseInt(formData.get("grade") as string),
          graduationYear: parseInt(formData.get("graduationYear") as string),
          activeGrades: activeGrades
        }),
      });

      if (!res.ok) throw new Error("Failed to update runner");
      
      alert("Runner updated successfully!");
      setSelectedRunner(null);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRunner) return;
    
    const confirmDelete = window.confirm(
      `Are you absolutely sure you want to delete ${selectedRunner.Name}? This cannot be undone.`
    );
    
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/delete-runner?id=${selectedRunner.Key}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to delete runner");
      }

      alert("Runner deleted successfully!");
      setSelectedRunner(null);
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedRunner) {
    const hasResults = lockedGrades.length > 0;

    return (
      <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-light-blue-gray/50 p-6 border-b border-border flex items-center gap-4">
          
          {/* Back Button: Custom Button overriding styles for an icon */}
          <Button 
            type="button" 
            size="sm"
            onClick={() => setSelectedRunner(null)} 
            className="px-3! py-2! bg-transparent! text-foreground! hover:bg-black/5! shadow-none!"
          >
            <ChevronLeft size={20} />
          </Button>

          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Edit3 size={24} />
            Editing: {selectedRunner.Name}
          </h2>
        </div>
        
        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Full Name</label>
              <input name="name" type="text" defaultValue={selectedRunner.Name} required className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Email</label>
              <input name="email" type="email" defaultValue={selectedRunner.Email || ""} className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Gender</label>
              <Select name="gender" defaultValue={selectedRunner.Gender} className="w-full p-3 bg-background border border-border rounded-xl">
                <option value="M">Male</option>
                <option value="F">Female</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Current Grade</label>
              <input name="grade" type="number" min="1" max="12" defaultValue={selectedRunner.Grade} required className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Graduation Year</label>
              <input name="graduationYear" type="number" min="1967" max="2050" defaultValue={selectedRunner.GraduationYear} required className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground ml-1">Active Roster History</h3>
              <p className="text-xs text-light-gray ml-1 mt-1">Select the grades this athlete competed in. Grades with race results are locked.</p>
            </div>
            
            {isLoadingRoster ? (
              <div className="flex items-center gap-2 text-light-gray text-sm"><Loader2 className="animate-spin" size={16} /> Loading history...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[6, 7, 8, 9, 10, 11, 12].map(grade => {
                  const isLocked = lockedGrades.includes(grade);
                  const isActive = activeGrades.includes(grade);
                  return (
                    <label 
                      key={grade} 
                      className={`flex items-center text-foreground gap-3 p-3 border rounded-xl cursor-pointer transition-all ${isLocked ? 'bg-gray-50 border-gray-200 opacity-80 cursor-not-allowed' : isActive ? 'border-border bg-background' : 'border-border hover:bg-light-blue'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isActive} 
                        disabled={isLocked}
                        onChange={() => toggleGrade(grade)}
                        className="w-4 h-4 text-foreground rounded border-gray-300 focus:ring-lisle-blue disabled:opacity-50"
                      />
                      <span className="text-sm font-semibold flex-1">Grade {grade}</span>
                      {isLocked && <Lock size={14} className="text-gray-400" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="w-full md:w-auto">
              {/* Delete Button: Custom Button with red overrides */}
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || hasResults || isLoadingRoster}
                className={`w-full md:w-auto shadow-none! rounded-xl! flex items-center justify-center gap-2 ${
                  hasResults 
                    ? 'bg-gray-100! text-gray-400! cursor-not-allowed! hover:bg-gray-100! hover:scale-100!' 
                    : 'bg-red-50! text-red-600! hover:bg-red-100! border border-red-200 hover:scale-105!'
                }`}
                title={hasResults ? "Cannot delete: Runner has official race results" : "Delete this runner"}
              >
                <Trash2 size={18} />
                {isDeleting ? "Deleting..." : "Delete Runner"}
              </Button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Button className="w-full md:w-auto cursor-pointer" type="button" size="lg" isActive={false} onClick={() => setSelectedRunner(null)}>Cancel</Button>
              <Button className="w-full md:w-auto" type="submit" size="lg" isActive={!isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-light-blue-gray/50 p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Search size={24} /> Find Runner to Edit
        </h2>
      </div>
      
      <div className="p-8">
        <input 
          type="text" 
          placeholder="Search by name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 mb-6 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" 
        />

        <div className="space-y-2 max-h-100 overflow-y-auto pr-2">
          {isLoading ? (
             <div className="text-center py-8 text-light-gray flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : filteredRunners.map(runner => (
            
            <div
              key={runner.Key}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRunner(runner)}
              className="w-full text-left p-4 border border-border rounded-xl hover:bg-light-blue hover:shadow-sm transition-all flex justify-between items-center bg-background group cursor-pointer"
            >
              <span className="font-semibold text-foreground">{runner.Name}</span>
              <span className="text-sm text-foreground flex items-center gap-1">Edit Profile <Edit3 size={14} /></span>
            </div>

          ))}
          {!isLoading && filteredRunners.length === 0 && (
            <p className="text-center text-light-gray py-4">No runners found matching "{searchQuery}"</p>
          )}
        </div>
      </div>
    </section>
  );
}