"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, Heading3, Heading4, List, ListOrdered, Link2, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, X 
} from "lucide-react";

import MediaChooserModal from "@/components/MediaChooseModal";

// Custom extension that adds Tailwind float classes
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

// Custom extension to handle the Tab key
const TabHandler = Extension.create({
  name: "tabHandler",
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // 1. If in a list, indent the list item
        if (this.editor.commands.sinkListItem("listItem")) {
          return true;
        }
        // 2. Otherwise, insert 4 actual non-breaking space characters
        return this.editor.commands.insertContent("\u00A0\u00A0\u00A0\u00A0");
      },
      "Shift-Tab": () => {
        // Outdent list item if applicable
        return this.editor.commands.liftListItem("listItem");
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {

  // Unified simple modal configuration state
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: "file" | "image" }>({
    isOpen: false,
    type: "file",
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      CustomImage,
      TabHandler,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert focus:outline-none min-h-[150px] prose-a:!text-foreground p-4 bg-background max-w-none text-foreground rounded-b-xl",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="bg-background rounded-xl border border-border focus-within:ring-2 focus-within:ring-lisle-blue flex flex-col relative">
      
      {/* TOOLBAR */}
      <div className="sticky top-20 z-10 flex flex-wrap items-center gap-1 bg-background p-2 border-b border-border text-foreground rounded-t-xl shadow-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("bold") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("italic") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("underline") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* ALIGN LEFT */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive({ textAlign: 'left' }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>

        {/* ALIGN CENTER */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive({ textAlign: 'center' }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>

        {/* ALIGN RIGHT */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive({ textAlign: 'right' }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("heading", { level: 1 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("heading", { level: 2 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("heading", { level: 3 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("heading", { level: 4 }) ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Heading 4"
        >
          <Heading4 size={16} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("bulletList") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("orderedList") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* LINK BUTTON */}
        <button
          type="button"
          onClick={() => setModalConfig({ isOpen: true, type: "file" })}
          className={`p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive("link") ? "bg-light-blue-gray/50 text-lisle-blue" : ""}`}
          title="Add Link or File"
        >
          <Link2 size={16} />
        </button>

        {/* IMAGE BUTTON */}
        <button
          type="button"
          onClick={() => setModalConfig({ isOpen: true, type: "image" })}
          className="p-2 rounded hover:bg-light-blue-gray/40 cursor-pointer"
          title="Insert Image"
        >
          <ImageIcon size={16} />
        </button>

        {/* IMAGE FLOAT CONTROLS (Only visible when an image is selected!) */}
        {editor.isActive('image') && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <span className="text-xs uppercase tracking-widest text-light-gray ml-1 mr-2">Image:</span>
            
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { float: 'left' }).run()}
              className={`px-2 py-1 text-xs rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive('image', { float: 'left' }) ? "bg-light-blue-gray/50 text-lisle-blue font-bold" : ""}`}
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { float: 'none' }).run()}
              className={`px-2 py-1 text-xs rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive('image', { float: 'none' }) ? "bg-light-blue-gray/50 text-lisle-blue font-bold" : ""}`}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { float: 'right' }).run()}
              className={`px-2 py-1 text-xs rounded hover:bg-light-blue-gray/40 cursor-pointer ${editor.isActive('image', { float: 'right' }) ? "bg-light-blue-gray/50 text-lisle-blue font-bold" : ""}`}
            >
              Right
            </button>
          </>
        )}
      </div>

      {/* EDITABLE TEXT AREA */}
      <EditorContent editor={editor} />

      <MediaChooserModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onSelect={(url) => {
          if (modalConfig.type === "file") {
            editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          } else {
            editor?.chain().focus().setImage({ src: url }).run();
          }
        }}
      />
    </div>
  );
}