"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit3, Trash2, MapPin, Bus, Navigation } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { TravelInfoRow } from "@/lib/queries";

interface CourseMapOption {
  Id: number;
  Name: string;
}

export default function ManageTravelInfo() {
  const [travelList, setTravelList] = useState<TravelInfoRow[]>([]);
  const [courseMaps, setCourseMaps] = useState<CourseMapOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [meetName, setMeetName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [gmapsLink, setGmapsLink] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [results, setResults] = useState("");
  const [courseMapId, setCourseMapId] = useState<string>("");

  // Rich Text State
  const [parking, setParking] = useState("");
  const [concessions, setConcessions] = useState("");
  const [awards, setAwards] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [travelRes, mapsRes] = await Promise.all([
        fetch("/api/admin/travel-info"),
        fetch("/api/admin/maps"),
      ]);

      if (travelRes.ok) setTravelList(await travelRes.json());
      if (mapsRes.ok) setCourseMaps(await mapsRes.json());
    } catch (error) {
      console.error("Failed to load travel info data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setMeetName("");
    setLocationName("");
    setAddress("");
    setGmapsLink("");
    setReturnTime("");
    setResults("");
    setCourseMapId("");
    setParking("");
    setConcessions("");
    setAwards("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const method = editingId ? "PUT" : "POST";
      const payload = {
        id: editingId,
        meetName,
        locationName,
        address,
        gmapsLink: gmapsLink || null,
        returnTime: returnTime || null,
        results: results || null,
        courseMapId: courseMapId ? Number(courseMapId) : null,
        parking: parking || null,
        concessions: concessions || null,
        awards: awards || null,
      };

      const res = await fetch("/api/admin/travel-info", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save travel info");

      setMessage({ text: `Travel info successfully ${editingId ? "updated" : "added"}!`, type: "success" });
      resetForm();
      fetchData();
    } catch (error) {
      setMessage({ text: "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleEdit = (info: TravelInfoRow) => {
    setEditingId(info.Id);
    setMeetName(info.MeetName);
    setLocationName(info.LocationName);
    setAddress(info.Address || "");
    setGmapsLink(info.GmapsLink || "");
    setReturnTime(info.ReturnTime || "");
    setResults(info.Results || "");
    setCourseMapId(info.CourseMapId ? String(info.CourseMapId) : "");
    setParking(info.Parking || "");
    setConcessions(info.Concessions || "");
    setAwards(info.Awards || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this travel info?")) return;

    try {
      const res = await fetch(`/api/admin/travel-info?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");

      setMessage({ text: "Entry deleted successfully.", type: "success" });
      fetchData();
    } catch (error) {
      setMessage({ text: "Failed to delete entry.", type: "error" });
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
              {editingId ? "Edit Travel Info" : "Add New Travel Info"}
            </h2>
            <p className="text-sm text-light-gray">Manage logistics, maps, parking, and return times for away meets.</p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${message.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Meet Name *</label>
              <input
                type="text"
                required
                value={meetName}
                onChange={(e) => setMeetName(e.target.value)}
                placeholder="e.g., Lisle Mane Event"
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Location Name *</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Community Park"
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 1825 Short St, Lisle, IL"
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Google Maps Link</label>
              <input
                type="url"
                value={gmapsLink}
                onChange={(e) => setGmapsLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Estimated Return Time</label>
              <input
                type="text"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                placeholder="e.g., 1:30 PM (Varsity), 2:15 PM (JV)"
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Live Results Link</label>
              <input
                type="url"
                value={results}
                onChange={(e) => setResults(e.target.value)}
                placeholder="https://athletic.net/..."
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Associated Course Map</label>
              <select
                value={courseMapId}
                onChange={(e) => setCourseMapId(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-lisle-blue outline-none text-foreground"
              >
                <option value="">-- No Map Attached --</option>
                {courseMaps.map((map) => (
                  <option key={map.Id} value={map.Id}>
                    {map.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rich Text Areas */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Parking & Arrival Info</label>
            <RichTextEditor value={parking} onChange={setParking} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Facilities & Concessions Info</label>
            <RichTextEditor value={concessions} onChange={setConcessions} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Awards Info</label>
            <RichTextEditor value={awards} onChange={setAwards} />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex-1 bg-lisle-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : editingId ? "Update Travel Info" : "Add Travel Info"}
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
        <h3 className="text-lg font-bold text-foreground mb-4">Existing Travel Info Entries</h3>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-lisle-blue" size={32} />
          </div>
        ) : travelList.length === 0 ? (
          <p className="text-center text-light-gray py-8 italic border-2 border-dashed border-border rounded-xl">
            No travel info records found. Add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {travelList.map((info) => (
              <div key={info.Id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-xl hover:border-lisle-blue/50 transition bg-light-blue-gray/5 group">
                <div className="mb-4 sm:mb-0">
                  <h4 className="font-bold text-foreground text-lg">{info.MeetName}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-light-gray">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {info.LocationName}</span>
                    {info.Address && <span className="flex items-center gap-1"><Navigation size={14} /> {info.Address}</span>}
                    {info.CourseMapFileName && <span className="flex items-center gap-1 text-foreground font-semibold"><Bus size={14} /> Map: {info.CourseMapFileName}</span>}
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleEdit(info)}
                    className="cursor-pointer flex-1 sm:flex-none p-2 bg-white text-lisle-blue border border-border rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm font-bold"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(info.Id)}
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
    </div>
  );
}