"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Clock, Plus, Loader2 } from "lucide-react";

import Button from "@/components/Button";
import { YearSelector } from "@/components/YearSelector";
import RichTextEditor from "@/components/RichTextEditor";

interface Meet {
  ID: number;
  Meet: string;
  Date: string;
  Time: string | null;
  Location: string | null;
  Level: string | null;
  Info: string | null;
}

export default function ManageSchedule() {
  const searchParams = useSearchParams();
  const urlYear = searchParams.get("year");

  const [activeYear, setActiveYear] = useState<number>(() =>
    urlYear ? parseInt(urlYear) : new Date().getFullYear()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  const [meets, setMeets] = useState<Meet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [infoHtml, setInfoHtml] = useState("");

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
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p>Loading schedule...</p>
        </div>
      ) : (
        <div className="p-6 md:p-8 space-y-12">
          
          {/* --- ADD MEET FORM --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
              Add New Meet
            </h3>
            
            <form onSubmit={handleAddMeet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
  {/* Meet Name - Now spans full width */}
  <div className="space-y-1 md:col-span-2">
    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Meet Name *</label>
    <input name="meet" type="text" required placeholder="e.g., Lisle Mane Event" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none" />
  </div>
  
  {/* Date - Now gets a full 50% column */}
  <div className="space-y-1">
    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Date *</label>
    <input 
      name="date" 
      type="date" 
      required 
      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none [color-scheme:light_dark] dark:[color-scheme:dark]" 
    />
  </div>

  {/* Time - Now gets a full 50% column */}
  <div className="space-y-1">
    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Time</label>
    <input name="time" type="time" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none [color-scheme:light_dark] dark:[color-scheme:dark]" />
  </div>

  {/* Location */}
  <div className="space-y-1">
    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Location</label>
    <input name="location" type="text" placeholder="e.g., Community Park" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none" />
  </div>

  {/* Level */}
  <div className="space-y-1">
    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Level</label>
    <input name="level" type="text" placeholder="e.g., Varsity" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none" />
  </div>

  {/* Additional Info */}
  <div className="md:col-span-2 space-y-1">
  <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Additional Info</label>
  <RichTextEditor value={infoHtml} onChange={setInfoHtml} />
  {/* Hidden input bridges the React state to your native FormData submission */}
  <input type="hidden" name="info" value={infoHtml} />
</div>

  {/* Submit Button */}
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
            
            <div className="space-y-3">
              {meets.length === 0 && <p className="text-sm text-light-gray">No meets scheduled for {activeYear} yet.</p>}
              {meets.map(meet => (
                <div key={meet.ID} className="p-4 border border-border rounded-xl flex flex-col md:flex-row justify-between gap-4 bg-white/50">
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{meet.Meet}</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-light-gray mt-1">
                      <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(meet.Date).toLocaleDateString()}</span>
                      {meet.Time && <span className="flex items-center gap-1"><Clock size={14} /> {meet.Time}</span>}
                      {meet.Location && <span className="flex items-center gap-1"><MapPin size={14} /> {meet.Location}</span>}
                    </div>
                    {meet.Info && <p className="text-sm text-foreground mt-2 italic">{meet.Info}</p>}
                  </div>
                  {meet.Level && (
                    <div className="shrink-0">
                      <span className="bg-lisle-blue/10 text-lisle-blue font-bold text-xs px-3 py-1 rounded-full">
                        {meet.Level}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}