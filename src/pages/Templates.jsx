import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createDocument } from '../lib/firestore';
import { templates } from '../data/templates';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { LayoutTemplate, ChevronRight } from 'lucide-react';

export default function Templates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(null);

  const handleUseTemplate = async (template) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingTemplate(template.id);
    try {
      const docId = await createDocument(user.uid, template.content, template.name);
      navigate(`/editor/${docId}`);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create document from template' });
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 mb-6">
            <LayoutTemplate className="w-6 h-6 text-accent" />
          </div>
          <h1 className="font-serif text-5xl text-text-primary mb-4">Start from something beautiful.</h1>
          <p className="text-text-secondary text-lg">Choose from our collection of professionally designed templates to get your project off the ground instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {templates.map(template => (
            <div key={template.id} className="group flex flex-col bg-bg-card border border-border rounded-xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              {/* Template Preview Mockup */}
              <div className="h-48 bg-bg-secondary border-b border-border p-6 flex justify-center items-start overflow-hidden relative">
                <div className="w-full bg-[#f8f9fa] rounded shadow-sm p-4 overflow-hidden transform group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-500 origin-top h-64 border border-[#e5e7eb]">
                  <div className="h-3 w-3/4 bg-[#e5e7eb] rounded mb-4"></div>
                  <div className="h-2 w-full bg-[#f3f4f6] rounded mb-2"></div>
                  <div className="h-2 w-5/6 bg-[#f3f4f6] rounded mb-2"></div>
                  <div className="h-2 w-4/6 bg-[#f3f4f6] rounded mb-6"></div>
                  
                  <div className="h-2 w-full bg-[#f3f4f6] rounded mb-2"></div>
                  <div className="h-2 w-full bg-[#f3f4f6] rounded mb-2"></div>
                  <div className="h-2 w-2/3 bg-[#f3f4f6] rounded mb-2"></div>
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={() => handleUseTemplate(template)}
                    disabled={loadingTemplate === template.id}
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
                  >
                    {loadingTemplate === template.id ? 'Creating...' : 'Use Template'} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-serif text-xl font-medium text-text-primary mb-2">{template.name}</h3>
                <p className="text-sm text-text-secondary line-clamp-2">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
