import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocumentBySlug } from '../lib/firestore';
import { Zap, Download } from 'lucide-react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import LoadingBar from '../components/LoadingBar';

export default function SharedDoc() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const data = await getDocumentBySlug(slug);
        if (data) {
          setDoc(data);
        } else {
          setError('Document not found or link is invalid.');
        }
      } catch (err) {
        setError('Failed to load document.');
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [slug]);

  const handleExport = () => {
    if (!doc) return;
    setExporting(true);
    
    const element = document.createElement('div');
    element.innerHTML = marked.parse(doc.content || '');
    element.style.padding = '40px';
    element.style.color = '#000';
    element.style.backgroundColor = '#fff';
    element.style.fontFamily = 'Geist, sans-serif';
    
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
      filename:     `${(doc.name || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setExporting(false);
    }).catch(() => {
      setExporting(false);
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-primary"><LoadingBar /></div>;
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-4xl text-text-primary mb-4">Oops!</h1>
        <p className="text-text-secondary mb-8">{error}</p>
        <Link to="/" className="text-accent hover:text-accent-hover font-medium">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="h-20 border-b border-border bg-bg-primary/90 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <span className="font-serif text-xl tracking-tight text-text-primary">ApexDocs</span>
        </Link>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </nav>

      <main className="flex-1 p-6 md:p-12 flex justify-center bg-bg-secondary">
        <div className="bg-white text-black p-10 md:p-16 rounded shadow-2xl w-full max-w-[800px] min-h-[1130px]">
          <div 
            className="prose prose-sm md:prose-base max-w-none prose-h1:font-serif prose-h2:font-serif prose-h3:font-serif prose-headings:text-black prose-p:text-gray-800 prose-a:text-indigo-600 prose-code:font-mono prose-code:bg-gray-100 prose-code:text-gray-800 prose-pre:bg-gray-50 prose-pre:text-gray-800 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-600"
            dangerouslySetInnerHTML={{ __html: marked.parse(doc.content || '') }}
          />
        </div>
      </main>
    </div>
  );
}
