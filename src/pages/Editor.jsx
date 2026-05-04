import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDocument, updateDocument } from '../lib/firestore';
import { ArrowLeft, Save, Download, Share2 } from 'lucide-react';
import Toast from '../components/Toast';
import LoadingBar from '../components/LoadingBar';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';

// CodeMirror imports
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';

export default function Editor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const previewRef = useRef(null);

  // Fetch doc
  useEffect(() => {
    async function fetchDoc() {
      try {
        const data = await getDocument(id);
        if (!data || data.userId !== user.uid) {
          navigate('/dashboard');
          return;
        }
        setDoc(data);
        setContent(data.content || '');
        setName(data.name || 'Untitled Document');
        setLoading(false);
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load document' });
        navigate('/dashboard');
      }
    }
    fetchDoc();
  }, [id, user, navigate]);

  // Init CodeMirror
  useEffect(() => {
    if (loading || !editorRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        oneDark,
        EditorView.theme({
          "&": { height: "100%", fontSize: "14px", fontFamily: "var(--font-mono, 'DM Mono')" },
          ".cm-scroller": { overflow: "auto" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setContent(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });
    
    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [loading]); // Only re-init when loading finishes

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDocument(id, { name, content });
      setToast({ type: 'success', message: 'Document saved' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save document' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!previewRef.current) return;
    setExporting(true);
    
    // Create a wrapper for PDF export to apply styles independently
    const element = document.createElement('div');
    element.innerHTML = previewRef.current.innerHTML;
    // Basic styling for the PDF
    element.style.padding = '40px';
    element.style.color = '#000';
    element.style.backgroundColor = '#fff';
    element.style.fontFamily = 'Geist, sans-serif';
    
    // Inject some base CSS for standard markdown elements
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
      img { max-width: 100%; height: auto; border-radius: 5px; }
      hr { border: 0; border-top: 1px solid #eee; margin: 2em 0; }
    `;
    element.prepend(style);

    const opt = {
      margin:       10,
      filename:     `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'document'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setExporting(false);
      setToast({ type: 'success', message: 'PDF Exported' });
    }).catch(() => {
      setExporting(false);
      setToast({ type: 'error', message: 'Export failed' });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingBar message="Loading document..." />
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-primary flex flex-col overflow-hidden">
      {/* Editor Top Bar */}
      <div className="h-16 border-b border-border bg-bg-card flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-text-primary font-serif text-xl w-64 placeholder-text-muted"
            placeholder="Document Name"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-text-muted hidden sm:inline-block">
            {saving ? 'Saving...' : 'Saved locally'}
          </span>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-border border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Editor Workarea */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* CodeMirror Pane */}
        <div className="flex-1 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-border flex flex-col">
          <div className="h-10 bg-[#282c34] border-b border-[#181a1f] flex items-center px-4 shrink-0">
            <span className="text-xs font-mono text-[#abb2bf]">markdown</span>
          </div>
          <div ref={editorRef} className="flex-1 overflow-hidden bg-[#282c34]"></div>
        </div>
        
        {/* Preview Pane */}
        <div className="flex-1 h-1/2 md:h-full bg-bg-primary overflow-y-auto custom-scrollbar">
          <div className="h-10 bg-bg-card border-b border-border flex items-center px-4 shrink-0 sticky top-0 z-10">
            <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">Preview</span>
          </div>
          <div className="p-8 md:p-12 flex justify-center">
            {/* A4 Paper mockup */}
            <div className="bg-white text-black p-10 md:p-16 rounded-sm shadow-2xl w-full max-w-[800px] min-h-[1130px]">
              <div 
                ref={previewRef}
                className="prose prose-sm md:prose-base max-w-none prose-h1:font-serif prose-h2:font-serif prose-h3:font-serif prose-headings:text-black prose-p:text-gray-800 prose-a:text-indigo-600 prose-code:font-mono prose-code:bg-gray-100 prose-code:text-gray-800 prose-pre:bg-gray-50 prose-pre:text-gray-800 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-600"
                dangerouslySetInnerHTML={{ __html: marked.parse(content || '') }}
              />
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
