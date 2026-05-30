"use client";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit3, Trash2, HelpCircle, Plus, Check } from "lucide-react";

import RichTextEditor from "@/components/RichTextEditor";
import Button from "@/components/Button"; // Using your custom Button component

// --- TYPES ---
interface FAQ {
  Key: number;
  Order: number;
  Title: string;
  Content: string;
}

// --- SORTABLE LIST ITEM COMPONENT ---
const SortableFAQItem = ({ 
  faq, 
  onEdit, 
  onDelete 
}: { 
  faq: FAQ; 
  onEdit: (f: FAQ) => void; 
  onDelete: (key: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.Key.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`w-full text-left p-4 border rounded-xl transition-all flex items-center gap-4 bg-background group ${
        isDragging ? 'border-lisle-blue shadow-md opacity-90' : 'border-border hover:bg-light-blue hover:shadow-sm'
      }`}
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-light-gray hover:text-foreground p-2 -ml-2 rounded-lg transition-colors">
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-foreground text-lg group-hover:text-lisle-blue transition-colors truncate">
          {faq.Title}
        </h4>
        <p className="text-sm text-light-gray truncate max-w-2xl mt-1">
          {faq.Content.replace(/<[^>]+>/g, '')}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <button 
          onClick={() => onEdit(faq)} 
          className="p-2 text-light-gray hover:text-light-blue-gray transition-colors rounded cursor-pointer hover:bg-lisle-blue/10" 
          title="Edit FAQ"
        >
          <Edit3 size={18} />
        </button>
        <button 
          onClick={() => onDelete(faq.Key)} 
          className="p-2 text-light-gray hover:text-red-500 transition-colors rounded cursor-pointer hover:bg-red-50" 
          title="Delete FAQ"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN MANAGER COMPONENT ---
export default function ManageFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  const fetchFAQs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // Configure DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle Drag End (Reordering)
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setFaqs((items) => {
        const oldIndex = items.findIndex((item) => item.Key.toString() === active.id);
        const newIndex = items.findIndex((item) => item.Key.toString() === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Immediately persist the new order to the database
        const updates = newOrder.map((faq, index) => ({ Key: faq.Key, Order: index }));
        fetch("/api/admin/faqs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        }).catch(err => console.error("Failed to update order:", err));

        return newOrder.map((faq, index) => ({ ...faq, Order: index }));
      });
    }
  };

  // Form Submission (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Please fill out both Title and Content.");
    setIsLoading(true);

    try {
      if (editingId) {
    
        await fetch("/api/admin/faqs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: editingId, title, content }),
        });
      } else {
        await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, order: faqs.length }),
        });
      }
      
      resetForm();
      await fetchFAQs();
    } catch (err) {
      console.error("Failed to save FAQ", err);
      alert("Failed to save FAQ.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete FAQ
  const handleDelete = async (key: number) => {
    if (!confirm("Are you sure you want to delete this FAQ? This cannot be undone.")) return;
    
    try {
      await fetch(`/api/admin/faqs?key=${key}`, { method: "DELETE" });
      
      // Auto-repair ordering via map to keep DB clean
      const filtered = faqs.filter(f => f.Key !== key);
      const updates = filtered.map((f, i) => ({ Key: f.Key, Order: i }));
      await fetch("/api/admin/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      fetchFAQs();
      if (editingId === key) resetForm();
    } catch (error) {
      console.error("Failed to delete FAQ", error);
      alert("Failed to delete FAQ.");
    }
  };

  const editFAQ = (faq: FAQ) => {
    setEditingId(faq.Key);
    setTitle(faq.Title);
    setContent(faq.Content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  return (
    <section className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* --- HEADER --- */}
      <div className="bg-light-blue-gray/50 p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle size={24} className="text-lisle-blue" /> 
          Manage FAQs
        </h2>
      </div>

      <div className="p-6 md:p-8 space-y-12">
        
        {/* --- ADD/EDIT FORM --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2 flex items-center gap-2">
            {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
            {editingId ? "Edit FAQ" : "Add New FAQ"}
          </h3>
          
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Question Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-lisle-blue outline-none transition-all text-foreground"
                placeholder="e.g. What time does practice start?"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">Answer Content *</label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              {editingId && (
                <Button 
                  type="button" 
                  onClick={resetForm}
                  isActive={false}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : editingId ? (
                  <><Check size={18} className="mr-1" /> Save Changes</>
                ) : (
                  <><Plus size={18} className="mr-1" /> Add FAQ</>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* --- FAQ LIST --- */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
              Existing FAQs
            </h3>
            <p className="text-sm text-light-gray mt-2">
              Drag and drop the handles (<GripVertical size={14} className="inline text-slate-400" />) to reorder how they appear on the site.
            </p>
          </div>
          
          <div className="space-y-3 pt-2">
            {faqs.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-xl text-center text-sm text-light-gray">
                No FAQs created yet. Fill out the form above to get started.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={faqs.map(f => f.Key.toString())} strategy={verticalListSortingStrategy}>
                  {faqs.map((faq) => (
                    <SortableFAQItem 
                      key={faq.Key} 
                      faq={faq} 
                      onEdit={editFAQ}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}