"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef } from "react";
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, Heading3, Heading4, List, ListOrdered, Link2, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight 
} from "lucide-react";

// Create a custom extension that adds Tailwind float classes
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      float: {
        default: 'none',
        renderHTML: attributes => {
          if (attributes.float === 'left') {
            return { class: 'float-left mr-6 mb-4 max-w-[50%] rounded-lg border border-border shadow-sm' };
          }
          if (attributes.float === 'right') {
            return { class: 'float-right ml-6 mb-4 max-w-[50%] rounded-lg border border-border shadow-sm' };
          }
          // Default center/inline
          return { class: 'block mx-auto rounded-lg my-4 max-w-full border border-border shadow-sm' };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    // THE FIX: We brought the extensions back!
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-lisle-blue underline" } }),
      CustomImage,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert focus:outline-none min-h-[150px] p-4 bg-background max-w-none text-foreground",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // THE FIX: Brought back the addLink function
  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send the file to our new API route
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      
      // Insert the returned public URL into the editor
      editor?.chain().focus().setImage({ src: data.url }).run();
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      // Clear the input so the exact same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="bg-background rounded-xl overflow-hidden border border-border focus-within:ring-2 focus-within:ring-lisle-blue flex flex-col">
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 bg-light-blue-gray/20 p-2 border-b border-border text-foreground">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("bold") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("italic") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("underline") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>

        <div className="w-[1px] h-6 bg-border mx-1" />

{/* ALIGN LEFT */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive({ textAlign: 'left' }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>

        {/* ALIGN CENTER */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive({ textAlign: 'center' }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>

        {/* ALIGN RIGHT */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive({ textAlign: 'right' }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-[1px] h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("heading", { level: 1 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("heading", { level: 2 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        {/* Heading 3 - NEW */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("heading", { level: 3 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        {/* Heading 4 - NEW */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("heading", { level: 4 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 4"
        >
          <Heading4 size={16} />
        </button>

        <div className="w-[1px] h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("bulletList") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("orderedList") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-[1px] h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-light-blue-gray/40 ${editor.isActive("link") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Add Link"
        >
          <Link2 size={16} />
        </button>

        {/* HIDDEN FILE INPUT */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        {/* UPLOAD IMAGE BUTTON */}
        <button
          type="button"
          onClick={triggerFileUpload}
          className="p-2 rounded hover:bg-light-blue-gray/40"
          title="Upload Image"
        >
          <ImageIcon size={16} />
        </button>

        {/* IMAGE FLOAT CONTROLS (Only visible when an image is selected!) */}
        {editor.isActive('image') && (
          <>
            <div className="w-[1px] h-6 bg-border mx-1" />
            <span className="text-xs uppercase tracking-widest text-light-gray ml-1 mr-2">Image:</span>
            
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { float: 'left' }).run()}
              className={`px-2 py-1 text-xs rounded hover:bg-light-blue-gray/40 ${editor.isActive('image', { float: 'left' }) ? "bg-light-blue-gray/50 text-lisle-blue font-bold" : ""}`}
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { float: 'none' }).run()}
              className={`px-2 py-1 text-xs rounded hover:bg-light-blue-gray/40 ${editor.isActive('image', { float: 'none' }) ? "bg-light-blue-gray/50 text-lisle-blue font-bold" : ""}`}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { float: 'right' }).run()}
              className={`px-2 py-1 text-xs rounded hover:bg-light-blue-gray/40 ${editor.isActive('image', { float: 'right' }) ? "bg-light-blue-gray/50 text-lisle-blue font-bold" : ""}`}
            >
              Right
            </button>
          </>
        )}
      </div>

      {/* EDITABLE TEXT AREA */}
      <EditorContent editor={editor} />
    </div>
  );
}