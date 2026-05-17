"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserPlus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { Select } from "@/components/Select";
import RunnerAvatar from "@/components/RunnerAvatar";

export default function AddRunner() {
  const router = useRouter();
  
  const [runnerName, setRunnerName] = useState("");
  const [grade, setGrade] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const numGrade = parseInt(grade);
    if (!isNaN(numGrade) && numGrade > 0 && numGrade <= 12) {
      const currentDate = new Date();
      const currentSeasonYear = currentDate.getFullYear();
      const calculatedYear = (currentSeasonYear + 1) + (12 - numGrade);
      setGraduationYear(calculatedYear.toString());
    }
  }, [grade]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const runnerResponse = await fetch("/api/admin/add-runner", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email") || null,
          gender: formData.get("gender"),
          grade: parseInt(formData.get("grade") as string),
          graduationYear: parseInt(formData.get("graduationYear") as string),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!runnerResponse.ok) {
        const errorText = await runnerResponse.text();
        throw new Error(`Server Error 400: ${errorText}`);
      }
      
      const { id } = await runnerResponse.json();

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

      router.refresh();
      setPreviewUrl(null);
      setSelectedFile(null);
      setRunnerName("");
      form.reset();
      alert("Runner created successfully!");

    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message || "An error occurred. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-light-blue-gray/50 p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <UserPlus size={24} />
          New Runner Profile
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="flex flex-col items-center justify-center gap-4 pb-4 border-b border-border/50">
          <RunnerAvatar src={previewUrl} name={runnerName || "New Runner"} size="lg" />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button 
            type="button" 
            size="sm" 
            isActive={false} 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-light-blue-gray! text-lisle-blue! border border-border shadow-none! hover:bg-light-blue!"
          >
            <Upload size={14} className="mr-2" />
            {previewUrl ? "Change Photo" : "Upload Photo"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Full Name</label>
            <input name="name" type="text" required value={runnerName} onChange={(e) => setRunnerName(e.target.value)} placeholder="Jane Doe" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Email</label>
            <input name="email" type="email" placeholder="jane.doe@example.com" className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Gender</label>
            <Select name="gender" className="w-full p-3 bg-background border border-border rounded-xl">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Grade</label>
            <input name="grade" type="number" min="1" max="12" required placeholder="9" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Graduation Year</label>
            <input name="graduationYear" type="number" min="1967" max="2050" required placeholder="e.g. 2030" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all" />
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <Button type="submit" size="lg" isActive={!isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Profile"}
          </Button>
        </div>
      </form>
    </section>
  );
}