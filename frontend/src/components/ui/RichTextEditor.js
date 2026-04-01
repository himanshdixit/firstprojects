'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { ensureRichTextHtml } from '@/lib/richText';
import { cn, uiErrorClass, uiFieldWrapperClass, uiHelpClass, uiLabelClass } from './styles';

function ToolbarButton({ active = false, disabled = false, label, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-sm transition disabled:cursor-not-allowed disabled:opacity-45',
        active
          ? 'border-amber-300 bg-amber-100 text-amber-800 shadow-sm dark:border-amber-300/30 dark:bg-amber-400/12 dark:text-amber-200'
          : 'border-slate-200/80 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900'
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  label,
  value = '',
  onChange,
  error,
  helperText,
  placeholder = 'Start writing...',
  minHeightClass = 'min-h-[260px]',
  disabled = false,
  className,
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
      }),
      Underline,
    ],
    content: ensureRichTextHtml(value) || '<p></p>',
    editorProps: {
      attributes: {
        class: cn(
          'rich-editor__content px-4 py-4 text-[15px] leading-7 text-slate-800 focus:outline-none dark:text-slate-100',
          minHeightClass
        ),
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      const nextValue = activeEditor.isEmpty ? '' : activeEditor.getHTML();
      onChange?.(nextValue);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = editor.isEmpty ? '' : editor.getHTML();
    const nextValue = ensureRichTextHtml(value) || '';
    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue || '<p></p>', false);
    }
  }, [editor, value]);

  function promptForLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes('link').href || '';
    const nextUrl = window.prompt('Enter link URL', previousUrl);

    if (nextUrl === null) {
      return;
    }

    const trimmedUrl = nextUrl.trim();
    if (!trimmedUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const normalizedUrl = /^(https?:|mailto:|tel:)/i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: normalizedUrl,
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      })
      .run();
  }

  return (
    <div className={cn(uiFieldWrapperClass, className)}>
      {label ? <span className={uiLabelClass}>{label}</span> : null}
      <div
        className={cn(
          'overflow-hidden rounded-[26px] border bg-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] transition dark:bg-slate-950/60',
          error
            ? 'border-rose-300 focus-within:ring-2 focus-within:ring-rose-300/60 dark:border-rose-500/50'
            : 'border-slate-200/80 focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-400/60 dark:border-slate-700/80'
        )}
      >
        <div className="flex flex-wrap gap-2 border-b border-slate-200/80 bg-slate-50/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/60">
          <ToolbarButton
            label="Paragraph"
            active={editor?.isActive('paragraph')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor?.isActive('heading', { level: 2 })}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor?.isActive('heading', { level: 3 })}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-9 w-px bg-slate-200 dark:bg-slate-800" />
          <ToolbarButton
            label="Bold"
            active={editor?.isActive('bold')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive('italic')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor?.isActive('underline')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={editor?.isActive('strike')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-9 w-px bg-slate-200 dark:bg-slate-800" />
          <ToolbarButton
            label="Bullet list"
            active={editor?.isActive('bulletList')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            active={editor?.isActive('orderedList')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            active={editor?.isActive('blockquote')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            active={editor?.isActive('codeBlock')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label={editor?.isActive('link') ? 'Edit link' : 'Add link'}
            active={editor?.isActive('link')}
            disabled={!editor || disabled}
            onClick={promptForLink}
          >
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-9 w-px bg-slate-200 dark:bg-slate-800" />
          <ToolbarButton
            label="Undo"
            disabled={!editor || disabled || !editor.can().chain().focus().undo().run()}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={!editor || disabled || !editor.can().chain().focus().redo().run()}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="rich-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
      {helperText ? <p className={uiHelpClass}>{helperText}</p> : null}
      {error ? <p className={uiErrorClass}>{error}</p> : null}
    </div>
  );
}
