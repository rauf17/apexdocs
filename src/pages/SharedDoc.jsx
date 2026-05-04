import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocumentBySlug } from '../lib/firestore';
import { Zap, Loader2, FileText, ArrowRight } from 'lucide-react';
import { marked } from 'marked';

export default function SharedDoc() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoc() {
      try {
        const data = await getDocumentBySlug(slug);
        setDoc(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center page-enter">
        <span className="text-[64px] mb-6">📄</span>
        <h1 className="font-serif text-[32px] text-white mb-2">Document not found</h1>
        <p className="font-sans text-[#888] mb-8 max-w-md">This link may have expired or the document was deleted by the owner.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors">
          Go to ApexDocs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col font-sans page-enter">
      
      {/* MINIMAL TOP BAR */}
      <header className="h-16 fixed top-0 left-0 right-0 bg-[#080808]/80 backdrop-blur-md border-b border-[#222] z-50 flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-serif text-lg tracking-tight text-white">ApexDocs</span>
        </Link>
        <Link to="/register" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium rounded-lg transition-colors">
          Open in ApexDocs
        </Link>
      </header>

      {/* DOCUMENT CONTENT */}
      <main className="flex-1 pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-[760px] mx-auto bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-10 md:p-[60px] md:px-[60px] px-8 animate-slide-up">
          <h1 className="font-serif text-[36px] text-[#111] mb-6 leading-tight">
            {doc.name || 'Untitled Document'}
          </h1>
          <hr className="border-t-2 border-[#eee] mb-10" />
          
          <div 
            className="prose max-w-none preview-markdown"
            style={{ '--theme-heading': '#111', '--theme-link': '#6366f1' }}
            dangerouslySetInnerHTML={{ __html: marked.parse(doc.content || '') }}
          />
        </div>
      </main>

      {/* FOOTER STRIP */}
      <footer className="py-8 text-center border-t border-[#222] bg-[#111111] shrink-0">
        <p className="text-[13px] text-[#888]">
          Made with ApexDocs &middot; <Link to="/register" className="text-accent hover:underline">Create your free account &rarr;</Link>
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        /* Modal Markdown (Light theme) */
        .preview-markdown h1 { font-family: 'Instrument Serif', serif; font-size: 32px; color: var(--theme-heading); margin-bottom: 0.5em; line-height: 1.2; font-weight: normal; }
        .preview-markdown h2 { font-family: 'Instrument Serif', serif; font-size: 24px; color: var(--theme-heading); margin-top: 1.5em; margin-bottom: 0.5em; font-weight: normal; }
        .preview-markdown h3 { font-family: 'Geist', sans-serif; font-size: 18px; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; color: #111; }
        .preview-markdown p { font-family: 'Geist', sans-serif; font-size: 16px; line-height: 1.8; margin-bottom: 1em; color: #333; }
        .preview-markdown code { font-family: 'DM Mono', monospace; font-size: 13px; color: #22c55e; background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
        .preview-markdown pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; border: 1px solid #eee; }
        .preview-markdown pre code { background: transparent; padding: 0; color: #111; }
        .preview-markdown blockquote { border-left: 3px solid #6366f1; padding-left: 1em; margin: 1em 0; font-style: italic; color: #666; }
        .preview-markdown table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        .preview-markdown th, .preview-markdown td { border: 1px solid #ddd; padding: 8px; text-align: left; color: #111; }
        .preview-markdown th { background-color: rgba(0,0,0,0.05); }
        .preview-markdown a { color: var(--theme-link); text-decoration: none; }
        .preview-markdown a:hover { text-decoration: underline; }
        .preview-markdown hr { border: 0; border-top: 1px solid #ddd; margin: 2em 0; }
        .preview-markdown ul, .preview-markdown ol { padding-left: 1.5em; margin-bottom: 1em; color: #333; }
        .preview-markdown li { margin-bottom: 0.5em; line-height: 1.8; }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
