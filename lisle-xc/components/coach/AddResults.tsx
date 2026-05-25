"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Link as LinkIcon, ClipboardPaste, Save, Trash2, 
    CheckCircle2, AlertCircle, UserCheck, X } from "lucide-react";

import { Select } from "@/components/Select";
import Button from "@/components/Button"; 
import { YearSelector } from "@/components/YearSelector";

interface RouteOption {
  RouteKey: number;
  Name: string;
  Distance: number;
  DistanceUnit: string;
}

interface MeetOption {
  MeetKey: number;
  Meet: string;
  Date: string;
  Season: number;
}

interface Runner {
  Key: number;
  Name: string;
  Grade: number | null;
  GraduationYear: number | null;
}

interface ParsedResult {
  id: string;
  rawName: string;
  time: string;
  runnerKey: number | string;
  grade: string | number;
  originalTime?: string;
}

interface ScrapedApiResult {
  id: string;
  rawName: string;
  time: string;
  runnerKey: null;
  grade: string;
}

export default function AddResults({ initialMeetKey }: { initialMeetKey?: number }) {
  const searchParams = useSearchParams();
  
  const currentYear = Number(searchParams.get("year")) || new Date().getFullYear();
  
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [meets, setMeets] = useState<MeetOption[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  
  const [selectedMeet, setSelectedMeet] = useState<string>(initialMeetKey?.toString() || "");
  const [resultDate, setResultDate] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [isJh, setIsJh] = useState<0 | 1>(0);
  
  const [scrapeUrl, setScrapeUrl] = useState<string>("");
  const [pasteText, setPasteText] = useState<string>("");
  
  const [parsedResults, setParsedResults] = useState<ParsedResult[]>([]);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal States
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [newMeet, setNewMeet] = useState({ name: "", date: "" });
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({ name: "", distance: "", unit: "Miles" });
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  // Fetch base metadata (years, routes, and runners) once on mount
  useEffect(() => {
    fetch("/api/admin/roster-years")
      .then(r => r.json())
      .then((data: number[]) => {
        if (Array.isArray(data)) setAvailableYears(data);
      })
      .catch(err => console.error("Failed to load roster years", err));

    fetch("/api/admin/routes")
      .then(r => r.json())
      .then((data: RouteOption[]) => setRoutes(data))
      .catch(err => console.error("Failed to load routes", err));

    fetch("/api/admin/runners")
      .then(r => r.json())
      .then((data: Runner[]) => setRunners(data))
      .catch(err => console.error("Failed to load runners", err));
  }, []);

  // Re-fetch meets whenever the season year changes via YearSelector
  useEffect(() => {
    setParsedResults([]);
    fetch(`/api/admin/meets?year=${currentYear}`)
      .then(r => r.json())
      .then((data: MeetOption[]) => {
        setMeets(data);
        setSelectedMeet("");
      })
      .catch(err => console.error("Failed to load meets for this season", err));
  }, [currentYear]);


  useEffect(() => {
    const meet = meets.find(m => m.MeetKey.toString() === selectedMeet);
    if (meet) {
      setResultDate(meet.Date.substring(0, 10));
    }
  }, [selectedMeet, meets]);

  // --- AUTO MATCHER ---
  const autoMatchRunner = (rawName: string): { key: number | string; grade: number | string } => {
    const cleanName = rawName.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    const match = runners.find(r => r.Name.toLowerCase() === cleanName);
    return match ? { key: match.Key, grade: match.Grade || "" } : { key: "", grade: "" };
  };

  // --- URL SCRAPE HANDLER ---
  const handleScrapeUrl = async () => {
    if (!scrapeUrl) return;
    setIsScraping(true);
    try {
      const res = await fetch("/api/admin/scrape-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch data from URL.");

      const mapped = (data.results as ScrapedApiResult[]).map(r => {
        const match = autoMatchRunner(r.rawName);
        return { ...r, runnerKey: match.key, grade: match.grade };
      });
      setParsedResults(mapped);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Scraping failed: ${err.message}. You can load the roster manually instead.`);
      } else {
        alert("Scraping failed due to an unknown error.");
      }
      handleLoadRosterManually();
    } finally {
      setIsScraping(false);
    }
  };

  // --- SMART PASTE FALLBACK ---
  const handleSmartPaste = () => {
    if (!pasteText) return;
    const lines = pasteText.split("\n");
    const newResults: ParsedResult[] = [];
    const timeRegex = /\b\d{1,2}:\d{2}(\.\d{1,2})?\b/;

    lines.forEach(line => {
      const timeMatch = line.match(timeRegex);
      if (timeMatch) {
        const lineWithoutTime = line.replace(timeMatch[0], "").trim();
        const possibleName = lineWithoutTime.split(/\t|  +/).sort((a, b) => b.length - a.length)[0] || "Unknown";
        
        const match = autoMatchRunner(possibleName);
        newResults.push({
          id: Math.random().toString(36).substring(7),
          rawName: possibleName.trim(),
          time: timeMatch[0],
          runnerKey: match.key,
          grade: match.grade
        });
      }
    });
    setParsedResults(newResults);
    setPasteText("");
  };

  const handleCreateMeet = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsCreatingMeet(true);
    
    try {
      const res = await fetch("/api/admin/meets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newMeet.name, 
          date: newMeet.date, 
          season: currentYear 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMeets(prev => [...prev, data]);
      setSelectedMeet(data.MeetKey.toString());
      setIsMeetModalOpen(false);
      setNewMeet({ name: "", date: "" }); 
      
    } catch (err) {
      alert("Failed to create meet.");
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingRoute(true);
    
    try {
      const res = await fetch("/api/admin/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newRoute.name, 
          distance: Number(newRoute.distance), 
          distanceUnit: newRoute.unit 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setRoutes(prev => [...prev, data]);
      setSelectedRoute(data.RouteKey.toString());
      setIsRouteModalOpen(false);
      setNewRoute({ name: "", distance: "", unit: "Miles" }); 
      
    } catch (err) {
      alert("Failed to create route.");
    } finally {
      setIsCreatingRoute(false);
    }
  };

  // --- MANUAL ROSTER ENTRY FALLBACK ---
  const handleLoadRosterManually = async () => {
    setIsScraping(true);
    try {
      // Fetch Roster
      const res = await fetch(`/api/admin/team-roster?year=${currentYear}&isJh=${isJh}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to communicate with roster API.");
      
      interface RosterRunner {
        Key: number;
        Name: string;
        Grade: number;
      }
      
      const rosterData = data as RosterRunner[];

      if (rosterData.length === 0) {
        const levelText = isJh === 0 ? "High School (HS)" : "Junior High (JH)";
        return alert(`No runners found in the Team Roster for ${levelText} during the ${currentYear} season.`);
      }

      // Fetch Existing Results if a meet is selected
      let existingResults: any[] = [];
      if (selectedMeet && selectedMeet !== "NEW") {
        try {
          const existingRes = await fetch(`/api/results/existing?meetKey=${selectedMeet}`);
          if (existingRes.ok) {
            existingResults = await existingRes.json();
          }
        } catch (e) {
          console.error("Failed to load existing results", e);
        }
      }

      // Merge Roster with Existing Results
      const manualRows: ParsedResult[] = rosterData.map(r => {
        const existing = existingResults.find((er: any) => er.RunnerID === r.Key);
        let prefilledTime = "";
        
        if (existing && existing.Time) {
           prefilledTime = existing.Time;
           // Remove "00:" hours prefix if database returns 00:18:30 format
           if (prefilledTime.startsWith("00:")) {
              prefilledTime = prefilledTime.substring(3);
           }
        }

        return {
          id: Math.random().toString(36).substring(7),
          rawName: r.Name,
          time: prefilledTime, 
          runnerKey: r.Key, 
          grade: r.Grade,
          originalTime: prefilledTime
        };
      });

      setParsedResults(manualRows);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        alert(`Error loading data: ${err.message}`);
      } else {
        alert("An unexpected error occurred while loading the roster grid.");
      }
    } finally {
      setIsScraping(false);
    }
  };

  // --- ROW EDITING ---
  const updateResult = (id: string, field: keyof ParsedResult, value: string | number) => {
    setParsedResults(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeResult = (id: string) => {
    setParsedResults(prev => prev.filter(r => r.id !== id));
  };

  // --- SAVING ---
  const handleSave = async () => {
    if (!selectedMeet || !selectedRoute || !resultDate) {
      return alert("Please verify Meet, Route, and Result Date are all selected!");
    }
    
    // Check for valid runner, non-empty time, AND ensure the time actually changed or is new
    const validResults = parsedResults.filter(r => 
      r.runnerKey !== "" && 
      r.time.trim() !== "" && 
      r.time.trim() !== r.originalTime 
    );

    if (validResults.length === 0) return alert("No new or updated runners with completed times to save.");

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/save-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetKey: parseInt(selectedMeet),
          routeKey: parseInt(selectedRoute),
          date: resultDate,
          isJh,
          results: validResults
        })
      });
      if (res.ok) {
        alert("Results saved successfully!");
        setParsedResults([]); 
      } else {
        throw new Error("Failed to save data context.");
      }
    } catch (err: unknown) {
      console.error(err);
      alert("Error saving results.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background border border-border rounded-xl p-6 space-y-6 relative">

      {/* QUICK ADD MEET MODAL */}
      {isMeetModalOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
          <form onSubmit={handleCreateMeet} className="bg-background border border-border p-6 rounded-xl w-96 shadow-lg space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Add New Meet ({currentYear})</h3>
              <button type="button" onClick={() => setIsMeetModalOpen(false)} className="text-light-gray cursor-pointer hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-1 block">Meet Name</label>
              <input required type="text" value={newMeet.name} onChange={e => setNewMeet({...newMeet, name: e.target.value})} className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-light-blue" placeholder="e.g. State Championship" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-1 block">Date</label>
              <input required type="date" value={newMeet.date} onChange={e => setNewMeet({...newMeet, date: e.target.value})} className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-light-blue" />
            </div>
            <Button size="sm" className="w-full" disabled={isCreatingMeet}>
              {isCreatingMeet ? "Saving..." : "Save Meet"}
            </Button>
          </form>
        </div>
      )}

      {/* QUICK ADD ROUTE MODAL */}
      {isRouteModalOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
          <form onSubmit={handleCreateRoute} className="bg-background border border-border p-6 rounded-xl w-96 shadow-lg space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Add New Route</h3>
              <button type="button" onClick={() => setIsRouteModalOpen(false)} className="text-light-gray cursor-pointer hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-1 block">Route Name/Location</label>
              <input required type="text" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-light-blue" placeholder="e.g. Detweiller Park" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold uppercase mb-1 block">Distance</label>
                <input required type="number" step="0.1" value={newRoute.distance} onChange={e => setNewRoute({...newRoute, distance: e.target.value})} className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-light-blue" placeholder="3.0" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold uppercase mb-1 block">Unit</label>
                <Select 
                  value={newRoute.unit} 
                  onChange={e => setNewRoute({...newRoute, unit: e.target.value})} 
                  className="p-2 text-sm"
                >
                  <option value="Miles">Miles</option>
                  <option value="Kilometers">Kilometers</option>
                  <option value="Meters">Meters</option>
                </Select>
              </div>
            </div>
            <Button size="sm" className="w-full" disabled={isCreatingRoute}>
              {isCreatingRoute ? "Saving..." : "Save Route"}
            </Button>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
        <h2 className="text-xl font-bold">Edit Race Results</h2>
        {availableYears.length > 0 ? (
          <YearSelector years={availableYears} selectedYear={currentYear} />
        ) : (
          <div className="text-xs text-light-gray animate-pulse font-bold pr-8">Loading seasons...</div>
        )}
      </div>

      {/* Meet and Race Configuration Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Choose Meet</label>
          <Select 
            value={selectedMeet} 
            onChange={(e) => {
              if (e.target.value === "NEW") setIsMeetModalOpen(true);
              else setSelectedMeet(e.target.value);
            }} 
            className="p-2 text-sm"
          >
            <option value="">-- Select Meet --</option>
            {meets.map(m => <option key={m.MeetKey} value={m.MeetKey}>{m.Meet}</option>)}
            <option disabled>──────────</option>
            <option value="NEW" className="font-bold text-light-blue">+ Add New Meet...</option>
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Result Date</label>
          <input 
            type="date" 
            value={resultDate} 
            onChange={(e) => setResultDate(e.target.value)} 
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-light-blue"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Route</label>
          <Select 
            value={selectedRoute} 
            onChange={(e) => {
              if (e.target.value === "NEW") setIsRouteModalOpen(true);
              else setSelectedRoute(e.target.value);
            }} 
            className="p-2 text-sm"
          >
            <option value="">-- Select Route --</option>
            {routes.map(r => <option key={r.RouteKey} value={r.RouteKey}>{r.Name} ({r.Distance} {r.DistanceUnit})</option>)}
            <option disabled>──────────</option>
            <option value="NEW" className="font-bold text-light-blue">+ Add New Route...</option>
          </Select>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs font-bold uppercase mb-1 block">Competition Level</label>
          <Select 
            value={isJh} 
            onChange={(e) => setIsJh(parseInt(e.target.value) as 0 | 1)} 
            className="p-2 text-sm"
          >
            <option value={0}>High School (HS)</option>
            <option value={1}>Junior High (JH)</option>
          </Select>
        </div>
      </div>

      {/* Import / Input Selection Toggles */}
      {parsedResults.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2"><LinkIcon size={16}/> Web Scraper</label>
            <input type="url" value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="https://athletic.net/..." className="w-full p-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-light-blue" />
            <Button size="sm" onClick={handleScrapeUrl} disabled={isScraping || !scrapeUrl} className="w-full">
              {isScraping ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {isScraping ? "Scraping..." : "Scrape URL"}
            </Button>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2"><ClipboardPaste size={16}/> Smart Paste</label>
            <textarea 
              value={pasteText} 
              onChange={e => setPasteText(e.target.value)} 
              placeholder="Highlight results, copy, and paste here..." 
              className="w-full p-2 border border-border rounded-lg text-xs h-24 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-light-blue"
            />
            <Button size="sm" isActive onClick={handleSmartPaste} disabled={!pasteText} className="w-full">
              Parse Pasted Text
            </Button>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-sm font-bold flex items-center gap-2"><UserCheck size={16}/> Manual Entry</label>
              <p className="text-xs text-light-gray leading-relaxed">Skip scraping entirely and populate the empty spreadsheet grid with your seasonal roster to type entries line-by-line.</p>
            </div>
            <Button size="sm" isActive onClick={handleLoadRosterManually} className="w-full mt-auto">
              Load Roster Grid
            </Button>
          </div>
        </div>
      )}

      {/* Grid Spreadsheet Review & Edit Workspace */}
      {parsedResults.length > 0 && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-sm text-light-blue uppercase tracking-wider">Review & Edit Times</h3>
            <span className="text-xs bg-light-blue-gray/10 text-foreground font-bold px-3 py-1 rounded-full">{parsedResults.length} Runners Loaded</span>
          </div>
          
          <div className="max-h-96 overflow-y-auto border rounded-xl divide-y border-border">
            <div className="grid grid-cols-12 gap-2 p-3 bg-light-blue-gray/10 text-xs font-bold uppercase text-foreground">
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-3">Name Handle</div>
              <div className="col-span-4">Matched DB Runner profile</div>
              <div className="col-span-2">Time (MM:SS.hh)</div>
              <div className="col-span-1">Grade</div>
              <div className="col-span-1 text-right">Drop</div>
            </div>

            {parsedResults.map((result, index) => (
              <div key={result.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-light-blue-gray/5">
                <div className="col-span-1 flex justify-center">
                  {result.runnerKey ? <CheckCircle2 className="text-green-500" size={18}/> : <AlertCircle className="text-red-500" size={18}/>}
                </div>
                
                <div className="col-span-3 text-sm truncate text-light-gray" title={result.rawName}>
                  {result.rawName}
                </div>
                
                <div className="col-span-4">
                  <Select 
                    value={result.runnerKey} 
                    onChange={e => updateResult(result.id, 'runnerKey', e.target.value)}
                    className={`p-1 text-sm ${!result.runnerKey ? '!border-red-500 !bg-red-500/10' : ''}`}
                  >
                    <option value="">-- Manual Match Required --</option>
                    {runners.map(r => <option key={r.Key} value={r.Key}>{r.Name}</option>)}
                  </Select>
                </div>
                
                <div className="col-span-2">
                    <input 
                        id={`time-input-${index}`}
                        type="text" 
                        placeholder="00:00"
                        value={result.time} 
                        onChange={e => updateResult(result.id, 'time', e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextInput = document.getElementById(`time-input-${index + 1}`);
                            if (nextInput) {
                            nextInput.focus();
                            }
                        }
                        }}
                        className="w-full p-1 border border-border rounded-lg text-sm font-mono bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-light-blue"
                    />
                </div>
                
                <div className="col-span-1">
                  <input 
                    type="text" 
                    value={result.grade} 
                    onChange={e => updateResult(result.id, 'grade', e.target.value)}
                    className="w-full p-1 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-light-blue"
                  />
                </div>
                
                <div className="col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeResult(result.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button size="sm" isActive onClick={() => setParsedResults([])}>
              Clear Workspace
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving || !selectedRoute || !selectedMeet}>
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16}/>}
              {isSaving ? "Saving..." : "Commit Results"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}