"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Medal, Users, Star, Plus, Trash2, Loader2 } from "lucide-react";

import Button from "@/components/Button";
import { Select } from "@/components/Select";
import { YearSelector } from "@/components/YearSelector";

interface RosterRunner {
  Key: number;
  Name: string;
  Level: string;
}

interface Captain {
  Key: number;
  Name: string;
  RunnerKey: number;
}

interface RunnerAward {
  Key: number;
  Name: string;
  Award: string;
  IsJH: boolean;
  RunnerKey: number;
}

interface TeamAward {
  ID: number;
  TeamName: string;
  Award: string;
}

export default function ManageAwards() {
  const searchParams = useSearchParams();
  const urlYear = searchParams.get("year");

  // Track the actual active year returned by the database fallback logic
  const [activeYear, setActiveYear] = useState<number>(() =>
    urlYear ? parseInt(urlYear) : new Date().getFullYear()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [roster, setRoster] = useState<RosterRunner[]>([]);
  const [awardSuggestions, setAwardSuggestions] = useState<{ Award: string }[]>([]);

  const [captains, setCaptains] = useState<Captain[]>([]);
  const [runnerAwards, setRunnerAwards] = useState<RunnerAward[]>([]);
  const [teamAwards, setTeamAwards] = useState<TeamAward[]>([]);

  // Reusable data loader
  const loadAwardsData = useCallback(async () => {
    try {
      const targetUrl = urlYear ? `/api/admin/awards/data?year=${urlYear}` : "/api/admin/awards/data";
      const res = await fetch(targetUrl);
      if (res.ok) {
        const data = await res.json();
        setAvailableYears(data.availableYears || []);
        setActiveYear(data.activeYear); // Sync frontend select option with backend fallback target
        setRoster(data.roster || []);
        setAwardSuggestions(data.awardSuggestions || []);
        setCaptains(data.captains || []);
        setRunnerAwards(data.runnerAwards || []);
        setTeamAwards(data.teamAwards || []);
      }
    } catch (error) {
      console.error("Failed to load awards data", error);
    }
  }, [urlYear]);

  useEffect(() => {
    setIsLoading(true);
    loadAwardsData().finally(() => setIsLoading(false));
  }, [loadAwardsData]);

  // --- Handlers ---
  const handleAddCaptain = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetForm = e.currentTarget;
    const formData = new FormData(targetForm);
    const runnerKey = formData.get("runnerKey");
    
    const runner = roster.find(r => r.Key.toString() === runnerKey);

    try {
      const res = await fetch("/api/admin/awards/captain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          year: activeYear, 
          runnerKey: runner?.Key, 
          name: runner?.Name 
        }),
      });

      if (!res.ok) throw new Error("Failed to add captain");
      
      targetForm.reset();
      await loadAwardsData();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRunnerAward = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetForm = e.currentTarget;
    const formData = new FormData(targetForm);
    const runnerKey = formData.get("runnerKey");
    const award = formData.get("award");
    const isJH = formData.get("isJH") === "on";

    const runner = roster.find(r => r.Key.toString() === runnerKey);

    try {
      const res = await fetch("/api/admin/awards/runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          year: activeYear, 
          runnerKey: runner?.Key, 
          name: runner?.Name,
          award,
          isJH
        }),
      });

      if (!res.ok) throw new Error("Failed to add award");
      
      targetForm.reset();
      await loadAwardsData();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeamAward = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetForm = e.currentTarget;
    const formData = new FormData(targetForm);

    try {
      const res = await fetch("/api/admin/awards/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          year: activeYear, 
          teamName: formData.get("teamName"),
          award: formData.get("award")
        }),
      });

      if (!res.ok) throw new Error("Failed to add team award");
      
      targetForm.reset();
      await loadAwardsData();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (type: "captain" | "runner" | "team", id: number) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(`/api/admin/awards/${type}?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      await loadAwardsData();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  return (
    <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="bg-light-blue-gray/50 p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy size={24} className="text-lisle-blue" /> 
          Manage Season Awards
        </h2>
        <div className="bg-background border border-border rounded-xl px-4 py-2">
          <YearSelector years={availableYears} selectedYear={activeYear} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-light-gray">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading season data...</p>
        </div>
      ) : (
        <div className="p-6 md:p-8 space-y-12">

          {/* Datalist for Auto-complete */}
          <datalist id="award-suggestions">
            {awardSuggestions.map((a, i) => (
              <option key={i} value={a.Award} />
            ))}
          </datalist>

          {/* --- CAPTAINS SECTION --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <Star size={20} className="text-yellow-500" /> Team Captains
            </h3>
            
            <form onSubmit={handleAddCaptain} className="flex flex-col sm:flex-row gap-3">
              <Select name="runnerKey" required className="flex-1 p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all">
                <option value="">Select a runner from the {activeYear} roster...</option>
                {roster.map(r => (
                  <option key={r.Key} value={r.Key}>{r.Name} ({r.Level})</option>
                ))}
              </Select>
              <Button type="submit" disabled={isSubmitting} className="whitespace-nowrap rounded-xl!">
                <Plus size={18} className="mr-1" /> Add Captain
              </Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {captains.length === 0 && <p className="text-sm text-light-gray">No captains assigned yet.</p>}
              {captains.map(captain => (
                <div key={captain.Key} className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900">
                  <span className="font-semibold">{captain.Name}</span>
                  <button onClick={() => handleDelete("captain", captain.Key)} className="text-yellow-700 hover:text-red-600 cursor-pointer transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* --- INDIVIDUAL AWARDS SECTION --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <Medal size={20} className="text-blue-500" /> Individual Awards
            </h3>
            
            <form onSubmit={handleAddRunnerAward} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Athlete</label>
                <Select name="runnerKey" required className="w-full p-3 bg-background border border-border rounded-xl">
                  <option value="">Select athlete...</option>
                  {roster.map(r => (
                    <option key={r.Key} value={r.Key}>{r.Name}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Award Name</label>
                <input 
                  name="award" 
                  type="text" 
                  list="award-suggestions"
                  required 
                  placeholder="e.g., MVP" 
                  className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" 
                />
              </div>
              <div className="sm:col-span-1 pb-3 flex justify-center">
                <label className="flex flex-col items-center gap-1 cursor-pointer group">
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground">JH?</span>
                  <input type="checkbox" name="isJH" className="w-5 h-5 rounded border-border text-foreground focus:ring-lisle-blue cursor-pointer" />
                </label>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl! justify-center">
                  <Plus size={18} /> Add
                </Button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {runnerAwards.length === 0 && <p className="text-sm text-light-gray">No individual awards assigned yet.</p>}
              {runnerAwards.map(award => (
                <div key={award.Key} className="flex justify-between items-center p-3 border border-border rounded-xl">
                  <div>
                    <span className="font-semibold text-foreground block">{award.Name}</span>
                    <span className="text-sm text-light-gray flex items-center gap-2">
                      {award.Award} {award.IsJH ? <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold">JH</span> : null}
                    </span>
                  </div>
                  <button onClick={() => handleDelete("runner", award.Key)} className="text-gray-400 hover:text-red-600 p-2 cursor-pointer transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* --- TEAM AWARDS SECTION --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <Users size={20} className="text-green-600" /> Team Awards
            </h3>
            
            <form onSubmit={handleAddTeamAward} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Team Name</label>
                <input 
                  name="teamName" 
                  type="text" 
                  required 
                  placeholder="e.g., Varsity Boys" 
                  className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" 
                />
              </div>
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Award</label>
                <input 
                  name="award" 
                  type="text" 
                  list="award-suggestions"
                  required 
                  placeholder="e.g., Conference Champions" 
                  className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" 
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl! justify-center bg-green-600! hover:bg-green-700!">
                  <Plus size={18} /> Add
                </Button>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-3 mt-4">
              {teamAwards.length === 0 && <p className="text-sm text-light-gray">No team awards assigned yet.</p>}
              {teamAwards.map(teamAward => (
                <div key={teamAward.ID} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-xl text-green-900">
                  <div className="flex flex-col sm:flex-row sm:gap-2 sm:items-center">
                    <span className="font-bold">{teamAward.TeamName}:</span>
                    <span>{teamAward.Award}</span>
                  </div>
                  <button onClick={() => handleDelete("team", teamAward.ID)} className="text-green-700 hover:text-red-600 p-2 cursor-pointer transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}