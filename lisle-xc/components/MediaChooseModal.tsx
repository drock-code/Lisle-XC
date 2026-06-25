"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toTitleCase } from "@/lib/utils";

interface MediaChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  type: "file" | "image";
  targetPath?: string;
}

export default function MediaChooserModal({ isOpen, onClose, onSelect, type, targetPath }: MediaChooserModalProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'existing' | 'upload'>('url');
  const [customUrl, setCustomUrl] = useState("");
  const [existingItems, setExistingItems] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const apiFetchUrl = type === "file" ? "/api/admin/files" : "/api/admin/images";
  const apiUploadUrl = type === "file" ? "/api/admin/upload-file" : "/api/admin/upload-image";
  const publicFolderPrefix = type === "file" ? "/files/" : "/images/";

  // Fetch media items when existing tab opens
  useEffect(() => {
    if (isOpen && activeTab === 'existing') {
      fetch(apiFetchUrl)
        .then(res => res.json())
        .then(data => setExistingItems(data.files || []))
        .catch(err => console.error("Failed to fetch media assets:", err));
    }
  }, [isOpen, activeTab, apiFetchUrl]);

  if (!isOpen) return null;

  const handleConfirm = (url: string) => {
    if (url) onSelect(url);
    setCustomUrl("");
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (targetPath) {
      formData.append("targetPath", targetPath);
    }

    try {
      const res = await fetch(apiUploadUrl, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      handleConfirm(data.url);
    } catch (error) {
      console.error(error);
      alert(`Failed to upload ${type}.`);
    } finally {
      setIsUploading(false);
    }
  };

  // --- NEW: Filter items to only show the target year's folder if provided ---
  const displayItems = targetPath 
    ? existingItems.filter(item => item.startsWith(targetPath))
    : existingItems;

  // Grouping & Sorting logic
  const rootFiles = displayItems.filter(f => !f.includes('/')).sort();
  const nestedFiles = displayItems.filter(f => f.includes('/'));
  const groupedDirs = nestedFiles.reduce((acc, filePath) => {
    const lastSlashIdx = filePath.lastIndexOf('/');
    const dirName = filePath.substring(0, lastSlashIdx);
    const fileName = filePath.substring(lastSlashIdx + 1);
    if (!acc[dirName]) acc[dirName] = [];
    acc[dirName].push({ fullPath: filePath, fileName });
    return acc;
  }, {} as Record<string, { fullPath: string; fileName: string }[]>);
  const sortedDirNames = Object.keys(groupedDirs).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl p-4 w-full max-w-sm shadow-xl flex flex-col gap-4">
        
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-foreground capitalize">Insert {type}</h3>
          <button type="button" onClick={onClose} className="text-light-gray hover:text-foreground cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-border pb-2">
          <button type="button" onClick={() => setActiveTab('url')} className={`px-2 py-1 text-xs font-bold rounded cursor-pointer ${activeTab === 'url' ? 'bg-lisle-blue text-white' : 'hover:bg-light-blue-gray/20 text-foreground'}`}>
            Web URL
          </button>
          <button type="button" onClick={() => setActiveTab('existing')} className={`px-2 py-1 text-xs font-bold rounded cursor-pointer ${activeTab === 'existing' ? 'bg-lisle-blue text-white' : 'hover:bg-light-blue-gray/20 text-foreground'}`}>
            {type === "file" ? "Choose File" : "Choose Image"}
          </button>
          <button type="button" onClick={() => setActiveTab('upload')} className={`px-2 py-1 text-xs font-bold rounded cursor-pointer ${activeTab === 'upload' ? 'bg-lisle-blue text-white' : 'hover:bg-light-blue-gray/20 text-foreground'}`}>
            {type === "file" ? "Upload New File" : "Upload New Image"}
          </button>
        </div>

        {/* TAB 1: URL */}
        {activeTab === 'url' && (
          <div className="flex flex-col gap-2">
            <input
              type="url"
              placeholder="https://..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="p-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lisle-blue"
            />
            <button type="button" onClick={() => handleConfirm(customUrl)} className="bg-lisle-blue cursor-pointer text-white p-2 rounded-md hover:opacity-90 font-bold text-sm">
              Link {toTitleCase(type)}
            </button>
          </div>
        )}

        {/* TAB 2: Asset Grid / List */}
        {activeTab === 'existing' && (
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto border border-border rounded-md p-2">
            {displayItems.length === 0 ? (
              <span className="text-sm text-light-gray italic text-center p-2">
                {targetPath ? `No files found in ${targetPath}.` : "No files found."}
              </span>
            ) : (
              <>
                {rootFiles.map(file => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => handleConfirm(`${publicFolderPrefix}${file}`)}
                    className="w-full shrink-0 text-left text-sm p-2 rounded hover:bg-light-blue-gray/20 cursor-pointer text-foreground truncate"
                  >
                    {type === "image" ? "🖼️" : "📄"} {file}
                  </button>
                ))}

                {sortedDirNames.map(dir => (
                  <div key={dir} className="flex flex-col mt-2 shrink-0">
                    <span className="text-xs font-bold text-foreground opacity-70 uppercase tracking-wider px-2 py-1 flex items-center gap-2">
                      📁 {dir}
                    </span>
                    <div className="flex flex-col pl-4 border-l-2 border-border ml-3 mt-1 gap-1">
                      {groupedDirs[dir]
                        .sort((a, b) => a.fileName.localeCompare(b.fileName))
                        .map(fileObj => (
                          <button
                            key={fileObj.fullPath}
                            type="button"
                            onClick={() => handleConfirm(`${publicFolderPrefix}${fileObj.fullPath}`)}
                            className="w-full shrink-0 text-left text-sm p-2 rounded hover:bg-light-blue-gray/20 cursor-pointer text-foreground truncate"
                          >
                            {type === "image" ? "🖼️" : "📄"} {fileObj.fileName}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* TAB 3: Upload */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-2">
             <input
               type="file"
               accept={type === "image" ? "image/*" : "*"}
               onChange={handleFileUpload}
               disabled={isUploading}
               className="p-2 border border-border rounded-md bg-background text-foreground text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-lisle-blue file:text-white file:font-bold file:cursor-pointer"
             />
             {isUploading && <span className="text-sm font-bold text-lisle-blue animate-pulse text-center">Uploading...</span>}
          </div>
        )}
      </div>
    </div>
  );
}