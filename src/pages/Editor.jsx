import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDocument, updateDocument, createShareSlug } from '../lib/firestore';
import { templates } from '../data/templates';
import Toast from '../components/Toast';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';

// Icons
import { 
  ChevronLeft, ChevronRight, ChevronDown, Download, Copy, Link as LinkIcon, 
  Bold, Italic, Strikethrough, Image as ImageIcon, Code, Quote, 
  Minus, Table, List, ListOrdered, Keyboard, Eye, EyeOff, Loader2 
} from 'lucide-react';

// CodeMirror
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLineGutter, drawSelection, dropCursor, keymap, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Custom Syntax Highlighting to match request
const customHighlighting = HighlightStyle.define([
  { tag: t.heading, color: '#6366f1', fontWeight: 'bold' },
  { tag: t.strong, color: '#ffffff', fontWeight: 'bold' },
  { tag: t.emphasis, color: '#a5b4fc', fontStyle: 'italic' },
  { tag: t.monospace, color: '#22c55e' },
  { tag: t.link, color: '#60a5fa', textDecoration: 'underline' },
  { tag: t.url, color: '#60a5fa' }
]);

const apexTheme = EditorView.theme({
  "&": { backgroundColor: "#0d0d0d", color: "#f0f0f0", height: "100%" },
  ".cm-content": { fontFamily: "DM Mono, monospace", fontSize: "14px", lineHeight: "1.7", padding: "24px" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#6366f1" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgba(99,102,241,0.2)" },
  ".cm-gutters": { backgroundColor: "#0d0d0d", color: "#333", border: "none" },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#666" }
}, { dark: true });

export default function Editor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);
  
  // State
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [theme, setTheme] = useState('dark');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  
  const [saveStatus, setSaveStatus] = useState('Saved ✓'); // 'Saved ✓', 'Saving...', 'Unsaved changes'
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [versions, setVersions] = useState([]);
  
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  
  // Refs
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const previewRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  // Stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Load Document
  useEffect(() => {
    async function loadDoc() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getDocument(id);
        if (!data || data.userId !== user.uid) {
          navigate('/dashboard');
          return;
        }
        setDoc(data);
        setTitle(data.name || 'Untitled Document');
        setContent(data.content || '');
        setPreviewContent(data.content || '');
        setSelectedTemplate(data.templateId || 'blank');
        setVersions(data.versions || []);
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load document' });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [id, user, navigate]);

  // CodeMirror Initialization
  useEffect(() => {
    if (loading || !editorRef.current) return;

    // To handle updates from CodeMirror safely without recreating view
    const onUpdate = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        setContent(newContent);
        setSaveStatus('Unsaved changes');
        
        // Debounce preview update
        if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
        previewTimeoutRef.current = setTimeout(() => {
          setPreviewContent(newContent);
        }, 100);

        // Debounce autosave
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          triggerSave(newContent, title);
        }, 2500);
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        dropCursor(),
        highlightActiveLine(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab
        ]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        oneDark,
        apexTheme,
        syntaxHighlighting(customHighlighting),
        onUpdate
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });
    viewRef.current = view;

    view.focus(); // Auto-focus

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Only run once when loading completes

  // Save Logic
  const triggerSave = async (currentContent, currentTitle, isManual = false) => {
    if (!id) return;
    setSaveStatus('Saving...');
    
    // Manage versions (max 5)
    let newVersions = [...versions];
    if (isManual || saveTimeoutRef.current) {
      newVersions.unshift({
        content: currentContent,
        savedAt: new Date().toISOString()
      });
      if (newVersions.length > 5) newVersions = newVersions.slice(0, 5);
    }

    try {
      await updateDocument(id, { 
        content: currentContent, 
        name: currentTitle, 
        templateId: selectedTemplate,
        versions: newVersions
      });
      setVersions(newVersions);
      setSaveStatus('Saved ✓');
    } catch (err) {
      setSaveStatus('Unsaved changes');
      setToast({ type: 'error', message: 'Autosave failed' });
    }
  };

  const handleTitleBlur = () => {
    if (doc?.name !== title) {
      triggerSave(content, title, true);
    }
  };

  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    triggerSave(content, title, true);
  }, [content, title]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPreviewOpen(p => !p);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportPDF();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**', 'bold text');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*', 'italic text');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  // Editor Actions
  const insertMarkdown = (before, after, placeholder = '') => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    
    const textToInsert = selectedText || placeholder;
    const insert = `${before}${textToInsert}${after}`;
    
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert },
      selection: { anchor: selection.from + before.length, head: selection.from + before.length + textToInsert.length }
    });
    view.focus();
  };

  const insertLineStart = (prefix) => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    const selection = view.state.selection.main;
    const line = view.state.doc.lineAt(selection.from);
    
    view.dispatch({
      changes: { from: line.from, insert: prefix },
      selection: { anchor: selection.from + prefix.length }
    });
    view.focus();
  };

  // Actions
  const handleTemplateSelect = (templateId) => {
    if (window.confirm("Replace current content? This cannot be undone.")) {
      const template = templates.find(t => t.id === templateId);
      if (template && viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: template.content }
        });
        setSelectedTemplate(templateId);
        setTemplateDropdownOpen(false);
      }
    }
  };

  const handleRestoreVersion = (versionContent) => {
    if (window.confirm("Restore this version? Current content will be overwritten.")) {
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: versionContent }
        });
      }
    }
  };

  const handleShare = async () => {
    if (!id) return;
    try {
      let slug = doc?.shareSlug;
      if (!slug) {
        slug = await createShareSlug(id);
      }
      const url = `${window.location.origin}/share/${slug}`;
      await navigator.clipboard.writeText(url);
      setToast({ type: 'success', message: 'Link copied to clipboard!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to create share link' });
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(content);
    setToast({ type: 'success', message: 'Markdown copied to clipboard!' });
  };

  const handleExportPDF = () => {
    if (!previewRef.current) return;
    setExporting(true);
    
    const clone = previewRef.current.cloneNode(true);
    // Apply print-friendly styling
    clone.style.padding = '40px';
    clone.style.color = '#000';
    clone.style.backgroundColor = '#fff';
    clone.style.fontFamily = 'Geist, sans-serif';
    clone.style.boxShadow = 'none';
    
    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
      h1, h2, h3, h4, h5, h6 { font-family: 'Instrument Serif', serif; margin-top: 1.5em; margin-bottom: 0.5em; color: #111; }
      h1 { font-size: 2.5em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
      p { margin-bottom: 1em; line-height: 1.6; }
      ul, ol { margin-bottom: 1em; padding-left: 2em; }
      li { margin-bottom: 0.5em; }
      code { font-family: 'DM Mono', monospace; background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
      pre { background: #f5f5f5; padding: 1em; border-radius: 5px; overflow-x: auto; margin-bottom: 1em; }
      pre code { background: none; padding: 0; }
      blockquote { border-left: 4px solid #ddd; padding-left: 1em; color: #666; margin: 1em 0; font-style: italic; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f9f9f9; }
      hr { border: 0; border-top: 1px solid #eee; margin: 2em 0; }
    `;
    clone.prepend(style);

    const opt = {
      margin: [15, 15, 15, 15],
      filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
      setExporting(false);
      setToast({ type: 'success', message: 'PDF Exported Successfully' });
    }).catch(() => {
      setExporting(false);
      setToast({ type: 'error', message: 'Export failed' });
    });
  };

  // Preview Theme Styles
  const previewStyles = {
    dark: { bg: '#111111', text: '#f0f0f0', wrapperBg: '#080808' },
    light: { bg: '#ffffff', text: '#111111', wrapperBg: '#f5f5f5' },
    sepia: { bg: '#f5f0e8', text: '#3d2b1f', wrapperBg: '#e6dfd3' },
    minimal: { bg: '#fafafa', text: '#111111', wrapperBg: '#ffffff', shadow: 'none', border: '1px solid #eee' }
  };
  const activePreviewStyle = previewStyles[theme];

  // Get active line/col
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  useEffect(() => {
    if (!viewRef.current) return;
    const updateCursor = EditorView.updateListener.of((update) => {
      if (update.selectionSet) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        setCursorPos({ line: line.number, col: pos - line.from + 1 });
      }
    });
    // Dynamically adding extensions is tricky, so we'll just use a generic interval or bind to onKeyDown
    // Actually we can just add an event listener to the editor dom element
    const handleKeyUp = () => {
      const pos = viewRef.current.state.selection.main.head;
      const line = viewRef.current.state.doc.lineAt(pos);
      setCursorPos({ line: line.number, col: pos - line.from + 1 });
    };
    const handleMouseUp = handleKeyUp;
    
    const editorDom = viewRef.current.dom;
    editorDom.addEventListener('keyup', handleKeyUp);
    editorDom.addEventListener('mouseup', handleMouseUp);
    return () => {
      editorDom.removeEventListener('keyup', handleKeyUp);
      editorDom.removeEventListener('mouseup', handleMouseUp);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#080808] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#080808] text-white font-sans overflow-hidden">
      
      {/* PANEL 1: SIDEBAR */}
      <div 
        className="shrink-0 bg-[#111111] border-r border-[#222] transition-all duration-250 ease-in-out relative flex flex-col z-20 animate-sidebar-in"
        style={{ width: sidebarOpen ? '240px' : '0px', animationDelay: '0ms' }}
      >
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-12 bg-[#222] border border-[#333] rounded-r-lg flex items-center justify-center text-[#888] hover:text-white transition-colors z-30 ${!sidebarOpen && 'shadow-lg'}`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar w-[240px]">
          <div className="p-6 flex flex-col gap-8">
            
            {/* Title */}
            <div>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full bg-transparent border-none font-serif text-[16px] text-white focus:outline-none focus:ring-2 focus:ring-accent/50 rounded px-1 -ml-1"
                placeholder="Untitled Document"
              />
            </div>

            {/* Template */}
            <div className="relative">
              <label className="block font-mono text-[10px] text-[#888] uppercase tracking-wider mb-2">Template</label>
              <button 
                onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#161616] border border-[#222] rounded py-2 px-3 text-[13px] hover:border-[#333] transition-colors"
              >
                <span className="truncate">{templates.find(t => t.id === selectedTemplate)?.name || 'Select Template'}</span>
                <ChevronDown className="w-4 h-4 text-[#888]" />
              </button>
              
              {templateDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-[#161616] border border-[#222] rounded shadow-xl max-h-48 overflow-y-auto z-10 custom-scrollbar">
                  {templates.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => handleTemplateSelect(t.id)}
                      className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#222] transition-colors truncate"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme */}
            <div>
              <label className="block font-mono text-[10px] text-[#888] uppercase tracking-wider mb-2">Theme</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setTheme('dark')} className={`w-6 h-6 rounded-full bg-[#080808] border ${theme === 'dark' ? 'border-accent ring-2 ring-accent/30' : 'border-[#333]'}`} title="Dark"></button>
                <button onClick={() => setTheme('light')} className={`w-6 h-6 rounded-full bg-[#ffffff] border ${theme === 'light' ? 'border-accent ring-2 ring-accent/30' : 'border-[#ccc]'}`} title="Light"></button>
                <button onClick={() => setTheme('sepia')} className={`w-6 h-6 rounded-full bg-[#f5f0e8] border ${theme === 'sepia' ? 'border-accent ring-2 ring-accent/30' : 'border-[#d0c6b6]'}`} title="Sepia"></button>
                <button onClick={() => setTheme('minimal')} className={`w-6 h-6 rounded-full bg-[#fafafa] border ${theme === 'minimal' ? 'border-accent ring-2 ring-accent/30' : 'border-[#eee]'}`} title="Minimal"></button>
              </div>
            </div>

            {/* Export & Actions */}
            <div className="flex flex-col gap-2">
              <button onClick={handleExportPDF} disabled={exporting} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white rounded text-[13px] font-medium hover:shadow-[0_0_15px_var(--accent-glow)] transition-all disabled:opacity-70">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button onClick={handleCopyMarkdown} className="w-full flex items-center justify-center gap-2 py-2 bg-[#161616] hover:bg-[#222] border border-[#222] text-white rounded text-[13px] transition-colors">
                <Copy className="w-3.5 h-3.5 text-[#888]" /> Copy Markdown
              </button>
              <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-2 bg-[#161616] hover:bg-[#222] border border-[#222] text-white rounded text-[13px] transition-colors">
                <LinkIcon className="w-3.5 h-3.5 text-[#888]" /> Share Link
              </button>
            </div>

            {/* Stats */}
            <div>
              <label className="block font-mono text-[10px] text-[#888] uppercase tracking-wider mb-2">Stats</label>
              <div className="flex flex-col gap-1 text-[12px] font-mono text-[#888]">
                <div className="flex justify-between"><span>Words:</span><span className="text-white">{wordCount}</span></div>
                <div className="flex justify-between"><span>Characters:</span><span className="text-white">{charCount}</span></div>
                <div className="flex justify-between"><span>Reading time:</span><span className="text-white">~{readTime} min read</span></div>
                <div className="flex justify-between mt-1"><span>Created:</span><span className="text-white truncate max-w-[100px] text-right">{doc?.createdAt ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString() : 'Today'}</span></div>
              </div>
            </div>

            {/* Versions */}
            <div>
              <label className="block font-mono text-[10px] text-[#888] uppercase tracking-wider mb-2">Versions</label>
              {versions.length === 0 ? (
                <p className="text-[11px] font-mono text-[#666]">No versions saved yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {versions.map((v, i) => {
                    const date = new Date(v.savedAt);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const label = isToday ? `Today at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : date.toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'});
                    return (
                      <div key={i} className="group flex items-center justify-between font-mono text-[11px] text-[#888] hover:bg-[#161616] px-2 py-1 rounded -mx-2 transition-colors cursor-pointer" onClick={() => handleRestoreVersion(v.content)}>
                        <span>{label}</span>
                        <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">Restore</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* PANEL 2: EDITOR */}
      <div className="flex-1 flex flex-col min-w-[400px] border-r border-[#222] bg-[#0d0d0d] z-10 animate-sidebar-in" style={{ animationDelay: '100ms' }}>
        
        {/* Toolbar */}
        <div className="h-12 bg-[#111111] border-b border-[#222] flex items-center px-4 gap-4 shrink-0 overflow-x-auto scrollbar-none sticky top-0 z-10">
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => insertLineStart('# ')} label="H1" font="font-mono text-xs font-bold" />
            <ToolbarButton onClick={() => insertLineStart('## ')} label="H2" font="font-mono text-xs font-bold" />
            <ToolbarButton onClick={() => insertLineStart('### ')} label="H3" font="font-mono text-xs font-bold" />
          </div>
          <div className="w-px h-6 bg-[#333]"></div>
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => insertMarkdown('**', '**', 'bold')} icon={<Bold className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('*', '*', 'italic')} icon={<Italic className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('~~', '~~', 'strikethrough')} icon={<Strikethrough className="w-4 h-4" />} />
          </div>
          <div className="w-px h-6 bg-[#333]"></div>
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => insertMarkdown('[', '](url)', 'link')} icon={<LinkIcon className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('![', '](image-url)', 'image')} icon={<ImageIcon className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('`', '`', 'code')} icon={<Code className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('\n```\n', '\n```\n', 'code block')} label="```" font="font-mono text-[10px]" />
            <ToolbarButton onClick={() => insertLineStart('> ')} icon={<Quote className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('\n---\n', '')} icon={<Minus className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('\n| Column | Column |\n| --- | --- |\n| Data | Data |\n', '')} icon={<Table className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertLineStart('- ')} icon={<List className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertLineStart('1. ')} icon={<ListOrdered className="w-4 h-4" />} />
          </div>
          <div className="w-px h-6 bg-[#333]"></div>
          <div className="group relative">
            <div className="flex items-center justify-center w-[28px] h-[28px] bg-transparent text-[#888] cursor-help">
              <Keyboard className="w-4 h-4" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#161616] border border-[#222] rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[11px] font-mono text-[#888] flex flex-col gap-1.5 z-50">
              <div className="flex justify-between"><span>Save</span><span className="text-white">Ctrl+S</span></div>
              <div className="flex justify-between"><span>Toggle Preview</span><span className="text-white">Ctrl+Shift+P</span></div>
              <div className="flex justify-between"><span>Export PDF</span><span className="text-white">Ctrl+Shift+E</span></div>
              <div className="flex justify-between"><span>Bold</span><span className="text-white">Ctrl+B</span></div>
              <div className="flex justify-between"><span>Italic</span><span className="text-white">Ctrl+I</span></div>
            </div>
          </div>
        </div>

        {/* CodeMirror Container */}
        <div ref={editorRef} className="flex-1 overflow-auto outline-none focus-within:ring-1 focus-within:ring-accent/10 transition-shadow"></div>

        {/* Bottom Status Bar */}
        <div className="h-8 bg-[#111111] border-t border-[#222] flex items-center justify-between px-4 shrink-0 fixed bottom-0 left-[240px] right-0 md:static z-20">
          <span className="font-mono text-[11px] text-[#666]">Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="font-mono text-[11px] text-[#888] hidden sm:block">{wordCount} words &middot; {charCount} chars &middot; ~{readTime} min</span>
          <div className="font-mono text-[11px] flex items-center gap-1.5 min-w-[80px] justify-end">
            {saveStatus === 'Saving...' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
            {saveStatus === 'Saved ✓' && <span className="w-1.5 h-1.5 rounded-full bg-success animate-fade-in"></span>}
            <span className={saveStatus === 'Unsaved changes' ? 'text-[#666]' : saveStatus === 'Saving...' ? 'text-amber-500' : 'text-success animate-fade-in'}>
              {saveStatus}
            </span>
          </div>
        </div>
      </div>

      {/* PANEL 3: PREVIEW */}
      <div 
        className="shrink-0 flex flex-col bg-[#080808] transition-all duration-250 ease-in-out relative z-0 animate-sidebar-in"
        style={{ width: previewOpen ? '50%' : '0px', animationDelay: '200ms', backgroundColor: activePreviewStyle.wrapperBg }}
      >
        <button 
          onClick={() => setPreviewOpen(!previewOpen)}
          className={`absolute top-2 -left-10 md:static md:w-auto h-8 mx-4 mt-2 px-3 bg-[#111111] border border-[#222] rounded-md flex items-center justify-center gap-2 text-[12px] font-mono text-[#888] hover:text-white transition-colors z-30 self-end md:self-start ${!previewOpen && 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'}`}
        >
          {previewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{previewOpen ? 'Hide Preview' : 'Show Preview'}</span>
        </button>

        {previewOpen && (
          <>
            <div className="h-12 border-b border-[#222]/50 flex items-center justify-between px-4 shrink-0 bg-transparent">
              <span className="font-mono text-[12px] text-[#888]">Preview</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#888] uppercase tracking-wider">{theme}</span>
                <button onClick={handleExportPDF} className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded text-[12px] font-medium transition-colors">
                  Export PDF
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
              <div 
                ref={previewRef}
                className="mx-auto rounded-lg transition-colors duration-150 ease-in-out"
                style={{ 
                  maxWidth: '720px', 
                  minHeight: '800px',
                  padding: '48px', 
                  backgroundColor: activePreviewStyle.bg, 
                  color: activePreviewStyle.text,
                  boxShadow: activePreviewStyle.shadow || '0 4px 40px rgba(0,0,0,0.4)',
                  border: activePreviewStyle.border || 'none'
                }}
              >
                <div 
                  className="prose max-w-none preview-markdown"
                  style={{ '--theme-heading': theme === 'dark' ? '#fff' : '#111', '--theme-link': '#6366f1' }}
                  dangerouslySetInnerHTML={{ __html: marked.parse(previewContent || '') }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <style dangerouslySetInnerHTML={{__html: `
        .transition-250 { transition-duration: 250ms; }
        
        /* Markdown Preview Custom Styles */
        .preview-markdown h1 { font-family: 'Instrument Serif', serif; font-size: 32px; color: var(--theme-heading); margin-bottom: 0.5em; line-height: 1.2; font-weight: normal; }
        .preview-markdown h2 { font-family: 'Instrument Serif', serif; font-size: 24px; color: var(--theme-heading); margin-top: 1.5em; margin-bottom: 0.5em; font-weight: normal; }
        .preview-markdown h3 { font-family: 'Geist', sans-serif; font-size: 18px; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
        .preview-markdown p { font-family: 'Geist', sans-serif; font-size: 16px; line-height: 1.8; margin-bottom: 1em; }
        .preview-markdown code { font-family: 'DM Mono', monospace; font-size: 13px; color: #22c55e; background: #111; padding: 0.2em 0.4em; border-radius: 3px; }
        .preview-markdown pre { background: #0d0d0d; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; }
        .preview-markdown pre code { background: transparent; padding: 0; color: #f0f0f0; }
        .preview-markdown blockquote { border-left: 3px solid #6366f1; padding-left: 1em; margin: 1em 0; font-style: italic; color: #888; }
        .preview-markdown table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        .preview-markdown th, .preview-markdown td { border: 1px solid #333; padding: 8px; text-align: left; }
        .preview-markdown th { background-color: rgba(0,0,0,0.05); }
        .preview-markdown a { color: var(--theme-link); text-decoration: none; }
        .preview-markdown a:hover { text-decoration: underline; }
        .preview-markdown hr { border: 0; border-top: 1px solid #333; margin: 2em 0; }
        .preview-markdown ul, .preview-markdown ol { padding-left: 1.5em; margin-bottom: 1em; }
        .preview-markdown li { margin-bottom: 0.5em; line-height: 1.8; }
        
        /* Animations */
        @keyframes sidebar-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-sidebar-in {
          animation: sidebar-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes pulse-opacity {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}} />
    </div>
  );
}

function ToolbarButton({ onClick, icon, label, font }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center w-[28px] h-[28px] bg-[#161616] border border-[#222] rounded hover:bg-[#222] hover:border-[#333] active:scale-95 transition-all text-[#ccc]"
    >
      {icon}
      {label && <span className={font}>{label}</span>}
    </button>
  );
}
