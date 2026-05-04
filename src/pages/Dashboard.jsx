import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { createDocument, toggleStar, deleteDocument, createShareSlug } from '../lib/firestore';
import Navbar from '../components/Navbar';
import DocumentCard from '../components/DocumentCard';
import SkeletonCard from '../components/SkeletonCard';
import Toast from '../components/Toast';
import { Plus, Search, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { documents, loading, refetch } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleCreateNew = async () => {
    try {
      const docId = await createDocument(user.uid, "# Untitled Document\n\nStart writing here...", "Untitled Document");
      navigate(`/editor/${docId}`);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create document' });
    }
  };

  const handleStar = async (docId, currentValue) => {
    try {
      await toggleStar(docId, currentValue);
      refetch();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update document' });
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(docId);
        refetch();
        setToast({ type: 'success', message: 'Document deleted' });
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to delete document' });
      }
    }
  };

  const handleShare = async (doc) => {
    try {
      let slug = doc.shareSlug;
      if (!slug) {
        slug = await createShareSlug(doc.id);
        refetch();
      }
      const url = `${window.location.origin}/share/${slug}`;
      await navigator.clipboard.writeText(url);
      setToast({ type: 'success', message: 'Link copied to clipboard!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create share link' });
    }
  };

  const filteredDocs = documents.filter(doc => 
    (doc.name || 'Untitled Document').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starredDocs = filteredDocs.filter(doc => doc.isStarred);
  const recentDocs = filteredDocs.filter(doc => !doc.isStarred);

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-4xl text-text-primary mb-2">Dashboard</h1>
            <p className="text-text-secondary font-mono text-sm">Welcome back, {user?.displayName || 'Writer'}. Let's create something.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent w-full md:w-64 transition-colors"
              />
            </div>
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg font-medium shadow-[0_0_20px_var(--accent-glow)] transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> New Document
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {starredDocs.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-4 h-4 text-warning" />
                  <h2 className="text-sm font-mono text-text-secondary tracking-wider uppercase">Starred</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {starredDocs.map(doc => (
                    <DocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      onStar={handleStar}
                      onDelete={handleDelete}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-sm font-mono text-text-secondary tracking-wider uppercase">Recent Documents</h2>
              </div>
              
              {recentDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentDocs.map(doc => (
                    <DocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      onStar={handleStar}
                      onDelete={handleDelete}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-bg-card border border-border border-dashed rounded-xl p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-text-muted" />
                  </div>
                  <h3 className="text-text-primary font-medium mb-1">No documents found</h3>
                  <p className="text-text-secondary text-sm mb-6 max-w-sm">
                    {searchQuery ? "We couldn't find any documents matching your search." : "You haven't created any documents yet. Start from scratch or use a template."}
                  </p>
                  {!searchQuery && (
                    <button 
                      onClick={() => navigate('/templates')}
                      className="text-accent hover:text-accent-hover font-medium text-sm transition-colors"
                    >
                      Browse Templates &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
