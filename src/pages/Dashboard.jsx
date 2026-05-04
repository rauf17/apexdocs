import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDocuments, createDocument, toggleStar, deleteDocument } from '../lib/firestore';
import { 
  Zap, Plus, FileText, Star, Clock, LayoutTemplate, 
  Settings, LogOut, Search, LayoutGrid, List, AlertCircle 
} from 'lucide-react';
import DocumentCard from '../components/DocumentCard';
import SkeletonCard from '../components/SkeletonCard';
import { useToast } from '../components/Toast';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('All Documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('All');
  const [docToDelete, setDocToDelete] = useState(null);

  // Fetch Documents
  useEffect(() => {
    async function fetchDocs() {
      if (!user) return;
      try {
        const docs = await getDocuments(user.uid);
        setDocuments(docs);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, [user]);

  // Actions
  const handleCreateNew = async () => {
    try {
      const docId = await createDocument(user.uid, '', 'blank');
      navigate(`/editor/${docId}`);
    } catch (err) {
      showToast('Failed to create document', 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleStar = async (docId, isStarred) => {
    setDocuments(docs => docs.map(d => d.id === docId ? { ...d, isStarred: !isStarred } : d));
    try {
      await toggleStar(docId, isStarred);
    } catch (err) {
      setDocuments(docs => docs.map(d => d.id === docId ? { ...d, isStarred } : d)); // Revert
      showToast('Failed to update star', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    const id = docToDelete;
    const docToRestore = documents.find(d => d.id === id);
    setDocuments(docs => docs.filter(d => d.id !== id));
    setDocToDelete(null);
    try {
      await deleteDocument(id);
      showToast('Document deleted', 'success');
    } catch (err) {
      setDocuments(docs => [docToRestore, ...docs]); // Revert
      showToast('Failed to delete document', 'error');
    }
  };

  const handleDuplicate = async (doc) => {
    const newName = `${doc.name || 'Untitled'} (Copy)`;
    const tempDoc = {
      id: 'temp-' + Date.now(),
      name: newName,
      content: doc.content,
      userId: user.uid,
      templateId: doc.templateId,
      isStarred: false,
      updatedAt: { toDate: () => new Date() }
    };
    setDocuments(docs => [tempDoc, ...docs]);
    try {
      const newId = await createDocument(user.uid, doc.content, newName);
      setDocuments(docs => docs.map(d => d.id === tempDoc.id ? { ...d, id: newId } : d));
      showToast('Document duplicated', 'success');
    } catch (err) {
      setDocuments(docs => docs.filter(d => d.id !== tempDoc.id)); // Revert
      showToast('Failed to duplicate document', 'error');
    }
  };

  const handleExport = (doc) => {
    // Navigate to shared link or open editor to export?
    // User requested "export" action on dashboard. Realistically, we should navigate to editor or trigger export.
    navigate(`/editor/${doc.id}`);
  };

  // Filtering Logic
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Sidebar Tab filter
    if (activeTab === 'Starred') {
      result = result.filter(d => d.isStarred);
    } else if (activeTab === 'Recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter(d => d.updatedAt?.toDate() >= sevenDaysAgo);
    }

    // Top Filter Pill
    if (activeFilter !== 'All') {
      result = result.filter(d => {
        const t = d.templateId || 'blank';
        if (activeFilter === 'Resumes') return t.includes('resume');
        if (activeFilter === 'Invoices') return t.includes('invoice');
        if (activeFilter === 'Reports') return t.includes('report') || t.includes('proposal') || t.includes('case-study');
        if (activeFilter === 'Cover Letters') return t.includes('cover-letter');
        if (activeFilter === 'README') return t.includes('readme') || t.includes('api');
        if (activeFilter === 'Other') return !t.includes('resume') && !t.includes('invoice') && !t.includes('report') && !t.includes('proposal') && !t.includes('readme') && !t.includes('api');
        return true;
      });
    }

    // Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(d => (d.name || 'Untitled Document').toLowerCase().includes(lowerQ));
    }

    return result;
  }, [documents, activeTab, activeFilter, searchQuery]);

  const starredCount = documents.filter(d => d.isStarred).length;

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden text-white font-sans selection:bg-accent selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#111111] border-r border-[#222] flex flex-col shrink-0 animate-sidebar z-20">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition-colors">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <span className="font-serif text-xl tracking-tight text-white">ApexDocs</span>
          </Link>

          <button 
            onClick={handleCreateNew}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white rounded-lg font-medium text-[14px] hover:shadow-[0_0_15px_var(--accent-glow)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Document
          </button>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          <SidebarLink icon={<FileText />} label="All Documents" active={activeTab === 'All Documents'} onClick={() => setActiveTab('All Documents')} />
          <SidebarLink icon={<Star />} label="Starred" active={activeTab === 'Starred'} onClick={() => setActiveTab('Starred')} />
          <SidebarLink icon={<Clock />} label="Recent" active={activeTab === 'Recent'} onClick={() => setActiveTab('Recent')} />
          <SidebarLink icon={<LayoutTemplate />} label="Templates" onClick={() => navigate('/templates')} />
        </nav>

        <div className="p-4 border-t border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[13px] text-white truncate">{user?.displayName || 'User'}</span>
              <span className="text-[11px] text-[#888] truncate">{user?.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-1.5 text-[#888] hover:text-white rounded hover:bg-[#222] transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleSignOut} className="p-1.5 text-[#888] hover:text-[#ef4444] rounded hover:bg-[#222] transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#080808] relative">
        
        {/* TOPBAR */}
        <header className="h-20 shrink-0 border-b border-[#222] px-8 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur z-10">
          <h1 className="font-serif text-[26px] text-white">{activeTab}</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161616] border border-[#222] rounded-lg pl-9 pr-4 py-2 text-[14px] text-white focus:outline-none focus:border-accent w-[200px] focus:w-[280px] transition-all duration-300"
              />
            </div>
            
            <div className="flex items-center bg-[#161616] border border-[#222] rounded-lg p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white transition-colors'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white transition-colors'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          
          {/* STATS STRIP */}
          <div className="flex items-center gap-3 mb-6">
            <StatPill icon={<FileText className="w-3.5 h-3.5" />} text={`${documents.length} Documents`} />
            <StatPill icon={<Star className="w-3.5 h-3.5 text-[#f59e0b]" />} text={`${starredCount} Starred`} />
            <StatPill icon={<Zap className="w-3.5 h-3.5 text-accent" />} text="Free Plan" />
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {['All', 'Resumes', 'Invoices', 'Reports', 'Cover Letters', 'README', 'Other'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-all duration-200 ${
                  activeFilter === filter 
                  ? 'bg-accent text-white shadow-[0_0_10px_var(--accent-glow)]' 
                  : 'bg-[#161616] border border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* DOCUMENT GRID/LIST */}
          {error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-10 h-10 text-danger mb-4" />
              <h3 className="font-sans font-bold text-white mb-2">Couldn't load your documents</h3>
              <p className="text-[#888] text-sm mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors text-sm">
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col"}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} view={viewMode} />)}
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in" : "flex flex-col border border-[#222] rounded-xl overflow-hidden animate-fade-in"}>
              {filteredDocuments.map((doc, idx) => (
                <div key={doc.id} className="animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                  <DocumentCard 
                    doc={doc} 
                    view={viewMode} 
                    onStar={handleStar} 
                    onDelete={(id) => setDocToDelete(id)} 
                    onDuplicate={handleDuplicate}
                    onExport={handleExport}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 border-2 border-dashed border-[#333] rounded-xl transform -rotate-6"></div>
                <div className="absolute inset-0 bg-[#161616] border border-[#222] rounded-xl transform rotate-3 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h2 className="font-serif text-[24px] text-white mb-2">No documents yet</h2>
              <p className="text-[#888] font-sans text-[14px] mb-8 max-w-sm">
                {searchQuery || activeFilter !== 'All' 
                  ? "We couldn't find any documents matching your filters." 
                  : "Create your first document to get started with ApexDocs."}
              </p>
              {(!searchQuery && activeFilter === 'All') && (
                <button 
                  onClick={handleCreateNew}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium transition-all shadow-[0_0_15px_var(--accent-glow)]"
                >
                  New Document
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* INLINE DELETE CONFIRM MODAL */}
      {docToDelete && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-[#161616] border border-[#222] rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="font-bold text-white mb-2">Delete document?</h3>
            <p className="text-[#888] text-sm mb-6">This action cannot be undone. Are you sure you want to delete this document?</p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#222] hover:bg-[#333] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-[#ef4444] hover:bg-[#dc2626] rounded-lg transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}



      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sidebar-slide {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-sidebar {
          animation: sidebar-slide 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 300ms ease forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        @keyframes shimmer {
          from { background-position: 0% 0; }
          to { background-position: -200% 0; }
        }
      `}} />
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-sans transition-all duration-200 relative ${
        active 
        ? 'text-accent bg-accent/10' 
        : 'text-[#888] hover:text-white hover:bg-[#222]'
      }`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-accent rounded-r-full"></div>}
      <span className={active ? "text-accent" : ""}>{icon}</span>
      {label}
    </button>
  );
}

function StatPill({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161616] border border-[#222] rounded-full text-[12px] font-mono text-[#888]">
      {icon}
      <span>{text}</span>
    </div>
  );
}
