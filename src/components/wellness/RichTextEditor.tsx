'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Image as TipTapImage } from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'
import { useRef, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, ImagePlus, X, Loader2,
} from 'lucide-react'

// Inline FontSize extension — avoids subpath import issues
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

const FONT_SIZES = [
  { label: 'XS', px: '11px' },
  { label: 'S',  px: '13px' },
  { label: 'M',  px: '15px' },
  { label: 'L',  px: '18px' },
  { label: 'XL', px: '22px' },
  { label: 'XXL', px: '28px' },
]

// Custom Image extension that preserves style + class attributes
const CustomImage = TipTapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: el => el.getAttribute('style'),
        renderHTML: attrs => attrs.style ? { style: attrs.style } : {},
      },
      class: {
        default: null,
        parseHTML: el => el.getAttribute('class'),
        renderHTML: attrs => attrs.class ? { class: attrs.class } : {},
      },
    }
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

const ToolbarButton = ({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-md transition-colors text-sm ${
      active
        ? 'bg-navy-100 dark:bg-navy-600 text-navy-700 dark:text-white'
        : 'text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-700 hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    {children}
  </button>
)

const Divider = () => (
  <div className="w-px h-5 bg-gray-200 dark:bg-navy-600 mx-0.5 self-center" />
)

type ImageSize = 'small' | 'medium' | 'large' | 'full'
type ImageShape = 'square' | 'rounded' | 'circle'

const SIZE_OPTIONS: { key: ImageSize; label: string; width: string }[] = [
  { key: 'small',  label: '小 S',  width: '33%' },
  { key: 'medium', label: '中 M',  width: '50%' },
  { key: 'large',  label: '大 L',  width: '75%' },
  { key: 'full',   label: '全幅',  width: '100%' },
]

const SHAPE_OPTIONS: { key: ImageShape; label: string; radius: string }[] = [
  { key: 'square',  label: '□ 角なし', radius: '0px' },
  { key: 'rounded', label: '⬜ 角丸',  radius: '12px' },
  { key: 'circle',  label: '○ 円形',  radius: '9999px' },
]

function buildStyle(size: ImageSize, shape: ImageShape): string {
  const width = SIZE_OPTIONS.find(s => s.key === size)?.width ?? '100%'
  const radius = SHAPE_OPTIONS.find(s => s.key === shape)?.radius ?? '0px'
  const marginX = size === 'full' ? '0' : 'auto'
  return `width:${width};border-radius:${radius};display:block;margin-left:${marginX};margin-right:${marginX};`
}

interface ImagePickerProps {
  onInsert: (url: string, size: ImageSize, shape: ImageShape) => void
  onClose: () => void
}

function ImagePicker({ onInsert, onClose }: ImagePickerProps) {
  const [size, setSize] = useState<ImageSize>('medium')
  const [shape, setShape] = useState<ImageShape>('rounded')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/wellness/upload-image', { method: 'POST', body: fd })
      const { url } = await res.json()
      setUploadedUrl(url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="absolute left-0 top-full mt-1 z-50 w-80 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-2xl shadow-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800 dark:text-white">画像を挿入 / Insert Image</p>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="mb-3 flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-navy-600 cursor-pointer hover:border-sage-400 transition-colors bg-gray-50 dark:bg-navy-750 relative overflow-hidden"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-contain" />
        ) : (
          <>
            <ImagePlus className="h-7 w-7 text-gray-400" />
            <span className="text-xs text-gray-400">クリックして画像を選択</span>
          </>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-navy-800/70 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-sage-500 animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />

      {/* Size */}
      <p className="text-xs font-semibold text-gray-500 dark:text-navy-300 mb-1.5">サイズ / Size</p>
      <div className="flex gap-1.5 mb-3">
        {SIZE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSize(opt.key)}
            className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${
              size === opt.key
                ? 'bg-sage-500 border-sage-500 text-white font-semibold'
                : 'border-gray-200 dark:border-navy-600 text-gray-600 dark:text-navy-300 hover:border-sage-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Shape */}
      <p className="text-xs font-semibold text-gray-500 dark:text-navy-300 mb-1.5">形 / Shape</p>
      <div className="flex gap-1.5 mb-4">
        {SHAPE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setShape(opt.key)}
            className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${
              shape === opt.key
                ? 'bg-sage-500 border-sage-500 text-white font-semibold'
                : 'border-gray-200 dark:border-navy-600 text-gray-600 dark:text-navy-300 hover:border-sage-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Insert button */}
      <button
        type="button"
        disabled={!uploadedUrl || uploading}
        onClick={() => { if (uploadedUrl) { onInsert(uploadedUrl, size, shape); onClose() } }}
        className="w-full py-2 rounded-xl bg-sage-500 hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        {uploading ? '送信中...' : '挿入する / Insert'}
      </button>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 280 }: RichTextEditorProps) {
  const [showPicker, setShowPicker] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      FontSizeExt,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CustomImage.configure({ inline: false, allowBase64: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'px-4 py-3 focus:outline-none prose prose-sm dark:prose-invert max-w-none',
        style: `min-height:${minHeight}px`,
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const insertImage = (url: string, size: ImageSize, shape: ImageShape) => {
    const style = buildStyle(size, shape)
    editor.chain().focus().setImage({ src: url, style } as any).run()
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-navy-600 overflow-hidden bg-white dark:bg-navy-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-750">

        {/* Font size */}
        <select
          value={editor.getAttributes('textStyle').fontSize ?? '15px'}
          onMouseDown={e => e.stopPropagation()}
          onChange={e => (editor.chain().focus() as any).setFontSize(e.target.value).run()}
          className="text-xs bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded px-1.5 py-0.5 text-gray-700 dark:text-navy-200 focus:outline-none cursor-pointer"
        >
          {FONT_SIZES.map(s => <option key={s.px} value={s.px}>{s.label}</option>)}
        </select>

        <Divider />

        {/* Text style */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="太字 / Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体 / Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下線 / Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="取り消し線 / Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="見出し1 / Heading 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="見出し2 / Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="見出し3 / Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="箇条書き / Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="番号付きリスト / Ordered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Horizontal rule */}
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="区切り線 / Horizontal rule">
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="左揃え / Align left">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="中央揃え / Align center">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="右揃え / Align right">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Image insert */}
        <div className="relative">
          <ToolbarButton onClick={() => setShowPicker(p => !p)} active={showPicker} title="画像を挿入 / Insert image">
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>
          {showPicker && (
            <ImagePicker
              onInsert={insertImage}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="元に戻す / Undo">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="やり直す / Redo">
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="relative">
        {!value && (
          <p className="absolute top-3 left-4 text-gray-400 dark:text-navy-400 text-sm pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* Character count */}
      <div className="px-4 py-1.5 border-t border-gray-100 dark:border-navy-700 text-xs text-gray-400 dark:text-navy-400">
        {editor.storage.characterCount?.characters?.() ?? editor.getText().length} 文字 / characters
      </div>
    </div>
  )
}
