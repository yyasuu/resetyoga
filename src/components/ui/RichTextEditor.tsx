'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Image as TiptapImage } from '@tiptap/extension-image'
import { Extension } from '@tiptap/core'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, ImageIcon, Heading2, Heading3, Minus,
} from 'lucide-react'

// ── FontSize extension (inline — avoids subpath import issues) ─────────────
const FontSizeExt = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => (el as HTMLElement).style.fontSize || null,
          renderHTML: attrs => attrs.fontSize ? { style: `font-size:${attrs.fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any
  },
})

// ── Extensions — module-level constant so references never change ──────────
const EXTENSIONS = [
  StarterKit,
  Underline,
  TextStyle,
  FontSizeExt,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TiptapImage.configure({ inline: false, allowBase64: false }),
]

// ── Sizes ─────────────────────────────────────────────────────────────────
const SIZES = [
  { label: 'XS', px: '11px' },
  { label: 'S',  px: '13px' },
  { label: 'M',  px: '15px' },
  { label: 'L',  px: '18px' },
  { label: 'XL', px: '22px' },
  { label: 'XXL', px: '28px' },
]

// ── Toolbar button ─────────────────────────────────────────────────────────
function Btn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title?: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
        active
          ? 'bg-navy-600 text-white'
          : 'text-gray-600 dark:text-navy-200 hover:bg-gray-200 dark:hover:bg-navy-600'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-navy-600 mx-0.5 self-center flex-shrink-0" />
}

// ── Toolbar ────────────────────────────────────────────────────────────────
function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const curSize = editor.getAttributes('textStyle').fontSize ?? '15px'

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 dark:bg-navy-800 border-b border-gray-200 dark:border-navy-600">
      {/* Headings */}
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="見出し2">
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="見出し3">
        <Heading3 className="h-4 w-4" />
      </Btn>

      <Sep />

      {/* Font size */}
      <select
        value={curSize}
        onMouseDown={e => e.stopPropagation()}
        onChange={e => (editor.chain().focus() as any).setFontSize(e.target.value).run()}
        className="text-xs bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded px-1.5 py-0.5 text-gray-700 dark:text-navy-200 focus:outline-none cursor-pointer"
      >
        {SIZES.map(s => <option key={s.px} value={s.px}>{s.label}</option>)}
      </select>

      <Sep />

      {/* Format */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="太字 Bold"><Bold className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体 Italic"><Italic className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下線 Underline"><UnderlineIcon className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="取り消し線 Strikethrough"><Strikethrough className="h-4 w-4" /></Btn>

      <Sep />

      {/* Align */}
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="左揃え"><AlignLeft className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="中央揃え"><AlignCenter className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="右揃え"><AlignRight className="h-4 w-4" /></Btn>

      <Sep />

      {/* Lists */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="箇条書き"><List className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="番号リスト"><ListOrdered className="h-4 w-4" /></Btn>

      <Sep />

      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="区切り線"><Minus className="h-4 w-4" /></Btn>
      <Btn onClick={onImage} title="画像を挿入 Insert image"><ImageIcon className="h-4 w-4" /></Btn>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '本文を入力...',
  minHeight = 220,
}: RichTextEditorProps) {
  // Client-only mount guard — prevents SSR/hydration mismatch entirely
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const fileRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)
  const skipNextSync = useRef(false)

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: value || '',
    onUpdate: ({ editor }) => {
      skipNextSync.current = true
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'rte-body focus:outline-none',
        style: `min-height:${minHeight}px; padding:12px 16px;`,
      },
    },
  }, [])  // empty deps → editor created once, never recreated

  // Sync external value changes (e.g. when form is reset for a different video)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    const incoming = value || ''
    if (editor.getHTML() !== incoming) {
      editor.commands.setContent(incoming)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const insertImage = useCallback(async (file: File) => {
    if (uploadingRef.current || !editor) return
    uploadingRef.current = true
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/wellness/upload-image', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok && json.url) editor.chain().focus().setImage({ src: json.url }).run()
    } finally {
      uploadingRef.current = false
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [editor])

  // Show a placeholder box until client mounts
  if (!mounted) {
    return (
      <div
        className="border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-800"
        style={{ minHeight: minHeight + 48 }}
      />
    )
  }

  if (!editor) return null

  return (
    <div className="border border-gray-200 dark:border-navy-600 rounded-lg overflow-hidden bg-white dark:bg-navy-800">
      <Toolbar editor={editor} onImage={() => fileRef.current?.click()} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) insertImage(f) }}
      />
      <div className="relative">
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <p className="absolute top-3 left-4 text-sm text-gray-400 dark:text-navy-500 pointer-events-none select-none">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  )
}
