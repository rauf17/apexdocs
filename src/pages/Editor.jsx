import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDocument, updateDocument, createShareSlug, createDocument } from '../lib/firestore';
import { templates } from '../data/templates';
import { useToast } from '../components/Toast';
import { marked } from 'marked';
import GuestEditorBanner from '../components/GuestEditorBanner';
import AuthGate from '../components/AuthGate';
import Logo from '../components/Logo';

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
  { tag: t.heading, color: '#d4a843', fontWeight: 'bold' },
  { tag: t.strong, color: '#f5f0e8', fontWeight: 'bold' },
  { tag: t.emphasis, color: '#c4b48a', fontStyle: 'italic' },
  { tag: t.monospace, color: '#4ade80' },
  { tag: t.link, color: '#93c5fd', textDecoration: 'underline' },
  { tag: t.url, color: '#93c5fd' }
]);

const apexTheme = EditorView.theme({
  "&": { backgroundColor: "#0f0d0a", color: "#e8e0d0", height: "100%" },
  ".cm-content": { fontFamily: "DM Mono, monospace", fontSize: "14px", lineHeight: "1.8", padding: "32px" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#d4a843" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgba(212,168,67,0.15)" },
  ".cm-gutters": { backgroundColor: "#0c0a08", color: "#3a3328", border: "none" },
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
  const [fontFamily, setFontFamily] = useState('sans');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  
  const [saveStatus, setSaveStatus] = useState('Saved ✓'); // 'Saved ✓', 'Saving...', 'Unsaved changes'
  const [exporting, setExporting] = useState(false); // kept for button disabled state during popup open
  const { showToast } = useToast();
  const [versions, setVersions] = useState([]);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  
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
      if (!user) {
        // Guest mode
        const guestContent = localStorage.getItem('apexdocs_guest_content') || '';
        const guestTitle = localStorage.getItem('apexdocs_guest_title') || 'Untitled Document';
        setTitle(guestTitle);
        setContent(guestContent);
        setPreviewContent(guestContent);
        setLoading(false);
        return;
      }

      if (user && localStorage.getItem('apexdocs_guest_content')) {
        const guestContent = localStorage.getItem('apexdocs_guest_content');
        const guestTitle = localStorage.getItem('apexdocs_guest_title') || 'Untitled Document';
        showToast('Import your guest document?', 'info', {
          label: 'Yes',
          onClick: async () => {
            try {
              const newId = await createDocument(user.uid, guestContent, guestTitle);
              localStorage.removeItem('apexdocs_guest_content');
              localStorage.removeItem('apexdocs_guest_title');
              navigate(`/editor/${newId}`);
            } catch (err) {
              showToast('Failed to import guest document', 'error');
            }
          }
        });
      }

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
        setFontFamily(data.fontFamily || 'sans');
        setVersions(data.versions || []);
      } catch (err) {
        showToast('Failed to load document', 'error');
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
    if (!user) {
      localStorage.setItem('apexdocs_guest_content', currentContent);
      localStorage.setItem('apexdocs_guest_title', currentTitle);
      setSaveStatus('Saved locally');
      return;
    }

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
        fontFamily: fontFamily,
        versions: newVersions
      });
      setVersions(newVersions);
      setSaveStatus('Saved ✓');
    } catch (err) {
      setSaveStatus('Unsaved changes');
      showToast('Autosave failed', 'error');
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
    if (!user) {
      setAuthGateOpen(true);
      return;
    }
    if (!id) return;
    try {
      let slug = doc?.shareSlug;
      if (!slug) {
        slug = await createShareSlug(id);
      }
      const url = `${window.location.origin}/share/${slug}`;
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to create share link', 'error');
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(content);
    showToast('Markdown copied to clipboard!', 'success');
  };

  const handleExportPDF = () => {
    if (!user) {
      setAuthGateOpen(true);
      return;
    }

    const docTitle = title || 'document';
    const htmlContent = marked.parse(previewContent || '');

    // Map font selection to web-safe equivalents for print
    const fontMap = {
      serif:   "'Georgia', 'Times New Roman', serif",
      mono:    "'Courier New', Courier, monospace",
      sans:    "Arial, Helvetica, sans-serif",
      classic: "Georgia, serif",
      modern:  "Arial, Helvetica, sans-serif",
      elegant: "Georgia, 'Times New Roman', serif",
    };
    const bodyFont = fontMap[fontFamily] || "Georgia, serif";

    const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #1a1a1a;
      font-family: ${bodyFont};
      font-size: 13pt;
      line-height: 1.75;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1 {
      font-size: 24pt;
      font-weight: normal;
      color: #111111;
      margin: 0 0 6pt 0;
      padding-bottom: 8pt;
      border-bottom: 1.5pt solid #cccccc;
      line-height: 1.2;
      page-break-after: avoid;
    }
    h2 {
      font-size: 17pt;
      font-weight: normal;
      color: #111111;
      margin: 20pt 0 6pt 0;
      padding-bottom: 4pt;
      border-bottom: 0.75pt solid #e0e0e0;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h3 {
      font-size: 13pt;
      font-weight: bold;
      color: #111111;
      margin: 16pt 0 4pt 0;
      page-break-after: avoid;
    }
    h4, h5, h6 {
      font-size: 12pt;
      font-weight: bold;
      color: #111111;
      margin: 12pt 0 3pt 0;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 9pt 0;
      color: #1a1a1a;
      orphans: 3;
      widows: 3;
    }
    ul, ol {
      margin: 0 0 9pt 0;
      padding-left: 20pt;
      color: #1a1a1a;
    }
    li {
      margin-bottom: 3pt;
      line-height: 1.65;
    }
    strong, b { font-weight: bold; }
    em, i     { font-style: italic; }
    a         { color: #3730a3; text-decoration: underline; }
    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      background: #f3f4f6;
      color: #15803d;
      padding: 1pt 4pt;
      border-radius: 2pt;
      border: 0.5pt solid #d1d5db;
    }
    pre {
      background: #f8f9fa;
      border: 0.75pt solid #d1d5db;
      border-left: 3pt solid #6366f1;
      border-radius: 3pt;
      padding: 10pt 12pt;
      margin: 0 0 10pt 0;
      page-break-inside: avoid;
      overflow: hidden;
    }
    pre code {
      background: transparent;
      border: none;
      padding: 0;
      color: #1e293b;
      font-size: 10pt;
      display: block;
      white-space: pre-wrap;
      word-break: break-all;
    }
    blockquote {
      margin: 10pt 0;
      padding: 6pt 0 6pt 14pt;
      border-left: 3pt solid #6366f1;
      background: #f5f5ff;
      page-break-inside: avoid;
    }
    blockquote p {
      margin: 0;
      color: #374151;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 10pt 0;
      font-size: 11pt;
      page-break-inside: avoid;
    }
    th {
      background: #e8edf2;
      color: #111111;
      font-weight: bold;
      border: 0.75pt solid #9ca3af;
      padding: 6pt 10pt;
      text-align: left;
    }
    td {
      border: 0.75pt solid #9ca3af;
      padding: 5pt 10pt;
      color: #1a1a1a;
    }
    tr:nth-child(even) td { background: #f9fafb; }
    hr {
      border: none;
      border-top: 0.75pt solid #d1d5db;
      margin: 16pt 0;
    }
    img { max-width: 100%; height: auto; }

    /* Print-only: hide nothing, show everything cleanly */
    @media print {
      body { background: white !important; }
      a { color: #3730a3 !important; }
    }
  </style>
</head>
<body>
  ${htmlContent}
  <script>
    // Auto-trigger print dialog once content is loaded
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 1000);
      }, 250);
    };
  <\/script>
</body>
</html>`;

    // Open a clean new window — completely isolated from the app's dark CSS
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      showToast('Please allow popups for PDF export', 'error');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();

    showToast('Print dialog opened — save as PDF', 'success');
  };

  // Preview Theme Styles
  const previewStyles = {
    dark: { bg: '#1a1710', text: '#f5f0e8', wrapperBg: '#111009', shadow: '0 4px 60px rgba(0,0,0,0.5)', border: 'none' },
    light: { bg: '#ffffff', text: '#0c0a08', wrapperBg: '#111009', shadow: '0 4px 60px rgba(0,0,0,0.1)', border: 'none' },
    sepia: { bg: '#f8f2e6', text: '#3d2b1f', wrapperBg: '#111009', shadow: '0 4px 60px rgba(0,0,0,0.2)', border: 'none' },
    minimal: { bg: '#fafafa', text: '#111111', wrapperBg: '#111009', shadow: 'none', border: '1px solid #e0e0e0' }
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
        className="shrink-0 bg-bg-secondary border-r border-border transition-all duration-250 ease-in-out relative flex flex-col z-20 animate-sidebar-in"
        style={{ width: sidebarOpen ? '250px' : '0px', animationDelay: '0ms' }}
      >
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-12 bg-bg-card border border-border rounded-r-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors z-30 ${!sidebarOpen && 'shadow-lg'}`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar w-[250px]">
          <div className="p-6 flex flex-col gap-6">
            
            {/* Logo */}
            <div className="mb-2">
              <Logo theme="dark" className="scale-90 origin-left mb-1" />
              <p className="text-[12px] font-sans text-text-muted italic ml-1">Write beautifully.</p>
            </div>
            <hr className="border-border" />

            {/* Title */}
            <div>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full bg-transparent border-b border-transparent font-serif text-[18px] text-text-primary focus:outline-none focus:border-accent pb-1 transition-colors"
                placeholder="Untitled Document"
              />
            </div>
            <hr className="border-border" />

            {/* Template */}
            <div className="relative">
              <label className="block font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2">Template</label>
              <button 
                onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                className="w-full flex items-center justify-between glass rounded py-2 px-3 text-[13px] text-text-primary hover:border-text-secondary transition-colors"
              >
                <span className="truncate">{templates.find(t => t.id === selectedTemplate)?.name || 'Select Template'}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>
              
              {templateDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-bg-card border border-border rounded shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-48 overflow-y-auto z-10 custom-scrollbar">
                  {templates.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => handleTemplateSelect(t.id)}
                      className={`w-full text-left px-3 py-2 text-[13px] transition-colors truncate border-l-2 ${selectedTemplate === t.id ? 'border-accent text-accent bg-bg-secondary' : 'border-transparent text-text-primary hover:border-accent hover:bg-bg-secondary'}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <hr className="border-border" />

            {/* Theme */}
            <div>
              <label className="block font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2">Theme</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setTheme('dark')} className={`w-6 h-6 rounded-full bg-[#0c0a08] border ${theme === 'dark' ? 'border-accent ring-2 ring-accent/30' : 'border-border'}`} title="Dark"></button>
                <button onClick={() => setTheme('light')} className={`w-6 h-6 rounded-full bg-[#fafafa] border ${theme === 'light' ? 'border-accent ring-2 ring-accent/30' : 'border-[#ccc]'}`} title="Light"></button>
                <button onClick={() => setTheme('sepia')} className={`w-6 h-6 rounded-full bg-[#f5f0e8] border ${theme === 'sepia' ? 'border-accent ring-2 ring-accent/30' : 'border-[#d0c6b6]'}`} title="Sepia"></button>
                <button onClick={() => setTheme('minimal')} className={`w-6 h-6 rounded-full bg-[#ffffff] border ${theme === 'minimal' ? 'border-accent ring-2 ring-accent/30' : 'border-[#eee]'}`} title="Minimal"></button>
              </div>
            </div>
            <hr className="border-border" />

            {/* Font Selector */}
            <div>
              <label className="block font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2">Font</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'serif',   label: 'Serif',   font: "'Instrument Serif', serif" },
                  { id: 'mono',    label: 'Mono',    font: "'DM Mono', monospace" },
                  { id: 'sans',    label: 'Sans',    font: "'Inter', sans-serif" },
                  { id: 'classic', label: 'Classic', font: "Georgia, serif" },
                  { id: 'modern',  label: 'Modern',  font: "'Plus Jakarta Sans', sans-serif" },
                  { id: 'elegant', label: 'Elegant', font: "'Cormorant Garamond', serif" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id)}
                    style={{ fontFamily: f.font }}
                    className={`px-3 py-1.5 text-[13px] rounded text-left transition-all border ${fontFamily === f.id ? 'border-accent text-accent bg-accent/[0.05]' : 'border-border text-text-muted bg-bg-card hover:bg-bg-secondary hover:text-text-primary'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <hr className="border-border" />

            {/* Export & Actions */}
            <div className="flex flex-col gap-2">
              <button onClick={handleExportPDF} disabled={exporting} className="w-full flex items-center justify-center gap-2 py-2.5 primary-gold-btn rounded text-[13px] font-bold shadow-[0_0_15px_var(--accent-glow)] transition-all disabled:opacity-70">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button onClick={handleCopyMarkdown} className="w-full flex items-center justify-center gap-2 py-2 bg-transparent hover:bg-bg-card border border-border hover:border-text-secondary text-text-primary rounded text-[13px] transition-colors">
                <Copy className="w-3.5 h-3.5 text-text-muted" /> Copy Markdown
              </button>
              <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-2 bg-transparent hover:bg-bg-card border border-border hover:border-text-secondary text-text-primary rounded text-[13px] transition-colors">
                <LinkIcon className="w-3.5 h-3.5 text-text-muted" /> Share Link
              </button>
            </div>
            <hr className="border-border" />

            {/* Stats */}
            <div>
              <label className="block font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2">Stats</label>
              <div className="flex flex-col gap-1 text-[12px] font-mono text-text-muted">
                <div className="flex justify-between"><span>Words:</span><span className="text-text-primary">{wordCount}</span></div>
                <div className="flex justify-between"><span>Characters:</span><span className="text-text-primary">{charCount}</span></div>
                <div className="flex justify-between"><span>Reading time:</span><span className="text-text-primary">~{readTime} min read</span></div>
                <div className="flex justify-between mt-1"><span>Created:</span><span className="text-text-primary truncate max-w-[100px] text-right">{doc?.createdAt ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString() : 'Today'}</span></div>
              </div>
            </div>
            <hr className="border-border" />

            {/* Versions */}
            <div>
              <label className="block font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2">Versions</label>
              {versions.length === 0 ? (
                <p className="text-[11px] font-mono text-text-muted">No versions saved yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {versions.map((v, i) => {
                    const date = new Date(v.savedAt);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const label = isToday ? `Today at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : date.toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'});
                    return (
                      <div key={i} className="group flex items-center justify-between font-mono text-[11px] text-text-muted hover:bg-bg-card px-2 py-1 rounded -mx-2 transition-colors cursor-pointer" onClick={() => handleRestoreVersion(v.content)}>
                        <span>{label}</span>
                        <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">Restore</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Bottom */}
            <div className="mt-auto pt-4 flex flex-col gap-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[13px]">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-text-primary leading-tight">{user.displayName || 'User'}</span>
                      <span className="text-[10px] font-mono text-text-muted leading-tight truncate max-w-[100px]">{user.email}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/dashboard')} className="text-[11px] font-mono text-text-muted hover:text-accent transition-colors">
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-bg-card border border-border rounded-lg text-center">
                  <Link to="/login" className="text-[13px] font-bold text-accent hover:text-accent-hover transition-colors">
                    Sign in to sync &rarr;
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* PANEL 2: EDITOR */}
      <div className="flex-1 flex flex-col min-w-[400px] border-r border-border bg-[#0f0d0a] z-10 animate-sidebar-in" style={{ animationDelay: '100ms' }}>
        
        <GuestEditorBanner user={user} />

        {/* Toolbar */}
        <div className="h-12 bg-bg-secondary border-b border-border flex items-center px-4 gap-4 shrink-0 overflow-x-auto scrollbar-none sticky top-0 z-10">
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => insertLineStart('# ')} label="H1" font="font-mono text-xs font-bold" />
            <ToolbarButton onClick={() => insertLineStart('## ')} label="H2" font="font-mono text-xs font-bold" />
            <ToolbarButton onClick={() => insertLineStart('### ')} label="H3" font="font-mono text-xs font-bold" />
          </div>
          <div className="w-px h-6 bg-border"></div>
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => insertMarkdown('**', '**', 'bold')} icon={<Bold className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('*', '*', 'italic')} icon={<Italic className="w-4 h-4" />} />
            <ToolbarButton onClick={() => insertMarkdown('~~', '~~', 'strikethrough')} icon={<Strikethrough className="w-4 h-4" />} />
          </div>
          <div className="w-px h-6 bg-border"></div>
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
          <div className="w-px h-6 bg-border"></div>
          <div className="group relative">
            <div className="flex items-center justify-center w-[28px] h-[28px] bg-transparent text-text-muted hover:text-text-primary transition-colors cursor-help">
              <Keyboard className="w-4 h-4" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[11px] font-mono text-text-muted flex flex-col gap-1.5 z-50">
              <div className="flex justify-between"><span>Save</span><span className="text-text-primary">Ctrl+S</span></div>
              <div className="flex justify-between"><span>Toggle Preview</span><span className="text-text-primary">Ctrl+Shift+P</span></div>
              <div className="flex justify-between"><span>Export PDF</span><span className="text-text-primary">Ctrl+Shift+E</span></div>
              <div className="flex justify-between"><span>Bold</span><span className="text-text-primary">Ctrl+B</span></div>
              <div className="flex justify-between"><span>Italic</span><span className="text-text-primary">Ctrl+I</span></div>
            </div>
          </div>
        </div>

        {/* CodeMirror Container */}
        <div ref={editorRef} className="flex-1 overflow-auto outline-none focus-within:ring-1 focus-within:ring-accent/10 transition-shadow"></div>

        {/* Bottom Status Bar */}
        <div className="h-8 bg-[#0c0a08] border-t border-border flex items-center justify-between px-4 shrink-0 fixed bottom-0 left-[250px] right-0 md:static z-20">
          <span className="font-mono text-[11px] text-text-muted">Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="font-mono text-[11px] text-text-secondary hidden sm:block">{wordCount} words &middot; {charCount} chars &middot; ~{readTime} min</span>
          <div className="font-mono text-[11px] flex items-center gap-1.5 min-w-[80px] justify-end">
            {saveStatus === 'Saving...' && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>}
            {saveStatus === 'Saved ✓' && <span className="w-1.5 h-1.5 rounded-full bg-success animate-fade-in"></span>}
            <span className={saveStatus === 'Unsaved changes' ? 'text-text-muted' : saveStatus === 'Saving...' ? 'text-accent' : 'text-success animate-fade-in'}>
              {saveStatus}
            </span>
          </div>
        </div>
      </div>

      {/* PANEL 3: PREVIEW */}
      <div 
        className="shrink-0 flex flex-col bg-bg-primary transition-all duration-250 ease-in-out relative z-0 animate-sidebar-in"
        style={{ width: previewOpen ? '50%' : '0px', animationDelay: '200ms', backgroundColor: activePreviewStyle.wrapperBg }}
      >
        <button 
          onClick={() => setPreviewOpen(!previewOpen)}
          className={`absolute top-2 -left-10 md:static md:w-auto h-8 mx-4 mt-2 px-3 bg-bg-card border border-border rounded-md flex items-center justify-center gap-2 text-[12px] font-mono text-text-muted hover:text-text-primary transition-colors z-30 self-end md:self-start ${!previewOpen && 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'}`}
        >
          {previewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{previewOpen ? 'Hide Preview' : 'Show Preview'}</span>
        </button>

        {previewOpen && (
          <>
            <div className="h-12 border-b border-border/50 flex items-center justify-between px-4 shrink-0 bg-transparent">
              <span className="font-mono text-[12px] text-text-muted">Preview</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{theme}</span>
                <button onClick={handleExportPDF} className="px-4 py-1.5 primary-gold-btn rounded text-[12px] transition-all hover:shadow-[0_0_15px_var(--accent-glow)] shadow-md">
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
                  className={`prose max-w-none preview-markdown font-${fontFamily}`}
                  style={{ '--theme-heading': theme === 'dark' ? '#fff' : '#111', '--theme-link': '#6366f1' }}
                  dangerouslySetInnerHTML={{ __html: marked.parse(previewContent || '') }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <AuthGate isOpen={authGateOpen} onClose={() => setAuthGateOpen(false)} />

      <style dangerouslySetInnerHTML={{__html: `
        .transition-250 { transition-duration: 250ms; }
        
        /* Markdown Preview Custom Styles */
        .preview-markdown h1 { font-family: 'Instrument Serif', serif; font-size: 32px; color: var(--theme-heading); margin-bottom: 0.5em; line-height: 1.2; font-weight: normal; }
        .preview-markdown h2 { font-family: 'Instrument Serif', serif; font-size: 24px; color: var(--theme-heading); margin-top: 1.5em; margin-bottom: 0.5em; font-weight: normal; }
        .preview-markdown h3 { font-family: 'Geist', sans-serif; font-size: 18px; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; color: var(--theme-heading); }
        .preview-markdown p { font-family: 'Geist', sans-serif; font-size: 16px; line-height: 1.8; margin-bottom: 1em; }
        .preview-markdown code { font-family: 'DM Mono', monospace; font-size: 13px; color: #4ade80; background: rgba(0,0,0,0.05); padding: 0.2em 0.4em; border-radius: 3px; }
        .preview-markdown pre { background: rgba(0,0,0,0.03); padding: 24px; border-radius: 8px; overflow-x: auto; margin-bottom: 1.5em; border: 1px solid rgba(0,0,0,0.05); }
        .preview-markdown pre code { background: transparent; padding: 0; color: inherit; }
        .preview-markdown blockquote { border-left: 3px solid var(--accent); padding-left: 1.2em; margin: 1.5em 0; font-style: italic; opacity: 0.8; }
        .preview-markdown table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; }
        .preview-markdown th, .preview-markdown td { border: 1px solid rgba(0,0,0,0.1); padding: 12px; text-align: left; }
        .preview-markdown th { background-color: rgba(0,0,0,0.03); font-weight: bold; }
        .preview-markdown a { color: var(--theme-link); text-decoration: none; }
        .preview-markdown a:hover { text-decoration: underline; }
        .preview-markdown hr { border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin: 2.5em 0; }
        .preview-markdown ul, .preview-markdown ol { padding-left: 1.5em; margin-bottom: 1.5em; }
        .preview-markdown li { margin-bottom: 0.5em; line-height: 1.8; }
        
        /* Font classes */
        .font-serif { font-family: 'Instrument Serif', serif !important; }
        .font-mono  { font-family: 'DM Mono', monospace !important; }
        .font-sans  { font-family: 'Inter', sans-serif !important; }
        .font-classic { font-family: Georgia, serif !important; }
        .font-modern { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .font-elegant { font-family: 'Cormorant Garamond', serif !important; }
        .font-serif p, .font-serif li, .font-serif h3 { font-family: 'Instrument Serif', serif !important; }
        .font-mono p, .font-mono li, .font-mono h3 { font-family: 'DM Mono', monospace !important; }
        .font-sans p, .font-sans li, .font-sans h3 { font-family: 'Inter', sans-serif !important; }
        .font-classic p, .font-classic li, .font-classic h3 { font-family: Georgia, serif !important; }
        .font-modern p, .font-modern li, .font-modern h3 { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .font-elegant p, .font-elegant li, .font-elegant h3 { font-family: 'Cormorant Garamond', serif !important; }

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