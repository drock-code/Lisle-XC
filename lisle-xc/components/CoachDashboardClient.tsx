"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { UserPlus, Layout, Globe, Users, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { Select } from "@/components/Select";
import { TabGroup, Tab } from "@/components/Tabs";
import RunnerAvatar from "@/components/RunnerAvatar";

type TabType = 'pages' | 'runners' | 'website';

interface DashboardProps {
  userName: string;
}

export default function CoachDashboardClient({ userName }: DashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('runners');
  
  // --- Image & Form State ---
  const [runnerName, setRunnerName] = useState("");
  const [grade, setGrade] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const numGrade = parseInt(grade);
    
    if (!isNaN(numGrade) && numGrade > 0 && numGrade <= 12) {
      const currentDate = new Date();
      const currentSeasonYear = currentDate.getFullYear();
      const calculatedYear = (currentSeasonYear + 1) + (12 - numGrade);
      
      setGraduationYear(calculatedYear.toString());
    }
  }, [grade]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection and preview
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary URL for the RunnerAvatar preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      // Create the Runner profile
      const runnerResponse = await fetch("/api/admin/add-runner", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          gender: formData.get("gender"),
          grade: formData.get("grade"),
          graduationYear: formData.get("graduationYear"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!runnerResponse.ok) throw new Error("Failed to create runner");
      
      const { id } = await runnerResponse.json();

      // If an image was selected, upload it using the new ID
      if (selectedFile && id) {
        const imageFormData = new FormData();
        imageFormData.append("file", selectedFile);
        imageFormData.append("runnerId", id.toString());
        imageFormData.append("runnerName", runnerName);

        const uploadResponse = await fetch("/api/admin/upload-avatar", {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadResponse.ok) throw new Error("Image upload failed");
      }

      // Success logic: Reset or Refresh
      router.refresh();
      setPreviewUrl(null);
      setSelectedFile(null);
      setRunnerName("");
      (e.target as HTMLFormElement).reset();
      alert("Runner created successfully!");

    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-8">
      <header className="mb-8 text-center md:text-left">
        <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)] mb-2">
          Coach Dashboard
        </h1>
        <p className="font-body text-light-blue drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Welcome back, {userName || "Coach"}.
        </p>
      </header>

      <div className="mb-10 w-full md:w-auto inline-block">
        <TabGroup>
          <Tab label="Pages" isActive={activeTab === 'pages'} onClick={() => setActiveTab('pages')} />
          <Tab label="Runners" isActive={activeTab === 'runners'} onClick={() => setActiveTab('runners')} />
          <Tab label="Website" isActive={activeTab === 'website'} onClick={() => setActiveTab('website')} />
        </TabGroup>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="bg-background border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-3 text-foreground mb-4">
              {activeTab === 'runners' && <Users size={20} />}
              {activeTab === 'pages' && <Layout size={20} />}
              {activeTab === 'website' && <Globe size={20} />}
              <h2 className="font-bold uppercase tracking-wider text-sm">
                {activeTab === 'runners' ? 'Roster' : activeTab === 'pages' ? 'Content' : 'Settings'}
              </h2>
            </div>
            <p className="text-sm text-light-gray leading-relaxed">
              {activeTab === 'runners' && "Add athletes here. Names should match official race registrations."}
              {activeTab === 'pages' && "Edit home page content and race recaps."}
              {activeTab === 'website' && "Update global links and season dates."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeTab === 'runners' && (
            <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-light-blue-gray/50 p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <UserPlus size={24} />
                  New Runner Profile
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center justify-center gap-4 pb-4 border-b border-border/50">
                  <RunnerAvatar 
                    src={previewUrl} 
                    name={runnerName || "New Runner"} 
                    size="lg" 
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    isActive={false}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-light-blue-gray text-lisle-blue border border-lisle-blue/10 shadow-none hover:bg-blue-50"
                  >
                    <Upload size={14} className="mr-2" />
                    {previewUrl ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Full Name</label>
                    <input 
                      name="name" 
                      type="text" 
                      required 
                      value={runnerName}
                      onChange={(e) => setRunnerName(e.target.value)}
                      placeholder="Jane Doe" 
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Email</label>
                    <input name="email" type="email" placeholder="jane.doe@example.com" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Gender</label>
                    <Select name="gender" className="w-full p-3 bg-background border border-border rounded-xl">
                      <option value="M" className="bg-white text-black dark:bg-lisle-blue dark:text-white">Male</option>
                      <option value="F" className="bg-white text-black dark:bg-lisle-blue dark:text-white">Female</option>
                    </Select>
                  </div>
                    <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Grade</label>
                    <input 
                        name="grade" 
                        type="number" 
                        min="1" 
                        max="12" 
                        placeholder="9" 
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" 
                    />
                    </div>
                    <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Graduation Year</label>
                    <input 
                        name="graduationYear" 
                        type="number" 
                        min="1967" 
                        max="2050" 
                        placeholder="e.g. 2030" 
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" 
                    />
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" isActive={!isSubmitting} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Profile"}
                  </Button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'pages' && (
            <div className="p-12 border-2 border-dashed border-border rounded-2xl text-center text-foreground">
              <Layout size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs text-light-gray">Page Editor Coming Soon</p>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="p-12 border-2 border-dashed border-border rounded-2xl text-center text-foreground">
              <Globe size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs text-light-gray">Site Settings Coming Soon</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}