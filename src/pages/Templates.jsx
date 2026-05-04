import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templates } from '../data/templates';
import { useAuth } from '../hooks/useAuth';
import { createDocument } from '../lib/firestore';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import Navbar from '../components/Navbar';

export default function Templates() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['All', 'Professional', 'Academic', 'Developer', 'Business', 'Personal'];

  const filteredTemplates = activeFilter === 'All' 
    ? templates 
    : templates.filter(t => t.category === activeFilter);

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPreviewTemplate(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUseTemplate = async (templateId) => {
    if (!user) {
      navigate('/register');
      return;
    }
    setCreating(true);
    try {
      const template = templates.find(t => t.id === templateId);
      const docId = await createDocument(user.uid, template.content, template.name);
      navigate(`/editor/${docId}`);
    } catch (error) {
      console.error(error);
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-white font-sans flex flex-col page-enter">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* HEADER */}
          <div className="mb-12 animate-slide-up">
            <h1 className="font-serif text-[48px] text-text-primary mb-2 leading-tight">Templates</h1>
            <p className="font-sans text-[20px] text-text-muted mb-2">Start from something beautiful</p>
            <p className="font-sans text-[15px] text-[#666]">10 professionally designed templates to get you started instantly.</p>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none animate-slide-up" style={{ animationDelay: '100ms' }}>
            {categories.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                  activeFilter === filter 
                  ? 'bg-accent text-white shadow-[0_0_15px_var(--accent-glow)]' 
                  : 'bg-[#161616] border border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* TEMPLATE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template, idx) => (
              <div 
                key={template.id} 
                className="group bg-[#161616] border border-[#222] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_10px_40px_var(--accent-glow)] flex flex-col animate-slide-up"
                style={{ animationDelay: `${(idx * 50) + 150}ms` }}
              >
                {/* Preview Area */}
                <div className="relative h-[200px] bg-[#0d0d0d] overflow-hidden border-b border-[#222]">
                  <div className="absolute inset-0 flex justify-center pt-6 px-4">
                    <div className="w-[400px] h-[600px] bg-white rounded shadow-lg p-8 origin-top transform scale-[0.35] transition-transform duration-500 group-hover:scale-[0.38]">
                      <div className="prose max-w-none preview-markdown-mini" dangerouslySetInnerHTML={{ __html: marked.parse(template.content) }} />
                    </div>
                  </div>
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#161616] to-transparent z-10"></div>
                  
                  {/* Hover Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setPreviewTemplate(template)}
                      className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white text-sm font-medium rounded-lg transition-colors border border-[#444]"
                    >
                      Preview
                    </button>
                    <button 
                      onClick={() => handleUseTemplate(template.id)}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-accent/20"
                    >
                      Use Template
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[20px]">{template.icon}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${template.badgeColor}`}>
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-[15px] text-white">{template.name}</h3>
                  <p className="font-sans text-[13px] text-[#888] line-clamp-2 leading-relaxed">{template.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity" onClick={() => setPreviewTemplate(null)}></div>
          
          <div className="relative w-full max-w-[900px] max-h-[85vh] bg-[#111111] border border-[#222] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-modal-in z-10">
            
            {/* Left: Document Preview */}
            <div className="hidden md:block w-[60%] bg-[#f5f5f5] overflow-y-auto custom-scrollbar border-r border-[#222] p-8">
              <div className="bg-white max-w-[720px] mx-auto p-10 rounded-lg shadow-sm border border-[#eee] min-h-full">
                <div 
                  className="prose max-w-none preview-markdown"
                  style={{ '--theme-heading': '#111', '--theme-link': '#6366f1' }}
                  dangerouslySetInnerHTML={{ __html: marked.parse(previewTemplate.content) }}
                />
              </div>
            </div>

            {/* Right: Template Details */}
            <div className="w-full md:w-[40%] bg-[#161616] flex flex-col relative">
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="absolute top-4 right-4 p-2 text-[#888] hover:text-white bg-[#222] hover:bg-[#333] rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                <span className="text-[48px] block mb-4">{previewTemplate.icon}</span>
                <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-mono border mb-4 ${previewTemplate.badgeColor}`}>
                  {previewTemplate.category}
                </span>
                <h2 className="font-serif text-[28px] text-white mb-4 leading-tight">{previewTemplate.name}</h2>
                <p className="font-sans text-[15px] text-[#888] leading-[1.7] mb-8">
                  {previewTemplate.description}
                </p>

                <div className="mb-8">
                  <h4 className="font-sans font-bold text-[13px] text-white mb-3">Best used for:</h4>
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-[14px] text-[#888]">
                      <span className="text-accent mt-0.5">•</span> Starting quickly without formatting hassle
                    </li>
                    <li className="flex items-start gap-2 text-[14px] text-[#888]">
                      <span className="text-accent mt-0.5">•</span> Creating professional, print-ready PDFs
                    </li>
                    <li className="flex items-start gap-2 text-[14px] text-[#888]">
                      <span className="text-accent mt-0.5">•</span> Maintaining consistent document structure
                    </li>
                  </ul>
                </div>

                <div className="h-px bg-[#222] mb-8"></div>

                <button 
                  onClick={() => handleUseTemplate(previewTemplate.id)}
                  disabled={creating}
                  className="w-full py-3.5 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Use This Template'}
                  {!creating && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in {
          animation: modal-in 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        /* Preview Markdown Tiny */
        .preview-markdown-mini h1 { font-family: 'Instrument Serif', serif; font-size: 3em; margin-bottom: 0.5em; color: #111; }
        .preview-markdown-mini h2 { font-family: 'Instrument Serif', serif; font-size: 2.5em; margin-top: 1em; margin-bottom: 0.5em; color: #111; }
        .preview-markdown-mini h3 { font-family: 'Geist', sans-serif; font-size: 2em; margin-top: 1em; margin-bottom: 0.5em; }
        .preview-markdown-mini p { font-family: 'Geist', sans-serif; font-size: 1.5em; line-height: 1.6; color: #444; margin-bottom: 1em; }
        .preview-markdown-mini hr { margin: 2em 0; border: 0; border-top: 2px solid #eee; }
        .preview-markdown-mini table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-size: 1.2em; }
        .preview-markdown-mini th, .preview-markdown-mini td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        
        /* Modal Markdown (Light theme) */
        .preview-markdown h1 { font-family: 'Instrument Serif', serif; font-size: 32px; color: var(--theme-heading); margin-bottom: 0.5em; line-height: 1.2; font-weight: normal; }
        .preview-markdown h2 { font-family: 'Instrument Serif', serif; font-size: 24px; color: var(--theme-heading); margin-top: 1.5em; margin-bottom: 0.5em; font-weight: normal; }
        .preview-markdown h3 { font-family: 'Geist', sans-serif; font-size: 18px; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
        .preview-markdown p { font-family: 'Geist', sans-serif; font-size: 16px; line-height: 1.8; margin-bottom: 1em; color: #333; }
        .preview-markdown code { font-family: 'DM Mono', monospace; font-size: 13px; color: #22c55e; background: #111; padding: 0.2em 0.4em; border-radius: 3px; }
        .preview-markdown pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; }
        .preview-markdown pre code { background: transparent; padding: 0; color: #111; }
        .preview-markdown blockquote { border-left: 3px solid #6366f1; padding-left: 1em; margin: 1em 0; font-style: italic; color: #666; }
        .preview-markdown table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        .preview-markdown th, .preview-markdown td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .preview-markdown th { background-color: rgba(0,0,0,0.05); }
        .preview-markdown a { color: var(--theme-link); text-decoration: none; }
        .preview-markdown a:hover { text-decoration: underline; }
        .preview-markdown hr { border: 0; border-top: 1px solid #ddd; margin: 2em 0; }
        .preview-markdown ul, .preview-markdown ol { padding-left: 1.5em; margin-bottom: 1em; color: #333; }
        .preview-markdown li { margin-bottom: 0.5em; line-height: 1.8; }
      `}} />
    </div>
  );
}
