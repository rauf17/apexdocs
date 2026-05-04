import { Link } from 'react-router-dom';
import { FileText, Star, Clock, MoreVertical, Trash2, Share2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function DocumentCard({ doc, onStar, onDelete, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dateStr = doc.updatedAt?.toDate().toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  }) || 'Just now';

  return (
    <div className="group relative bg-bg-card border border-border hover:border-border-hover rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center border border-border">
          <FileText className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
        </div>
        <div className="relative">
          <button 
            onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
            className="p-1 text-text-muted hover:text-text-primary transition-colors rounded"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 z-10" onMouseLeave={() => setMenuOpen(false)}>
              <button 
                onClick={(e) => { e.preventDefault(); onShare(doc); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-primary flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share Link
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); onDelete(doc.id); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-bg-primary flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Link to={`/editor/${doc.id}`} className="block focus:outline-none">
        <h3 className="font-serif text-xl font-medium text-text-primary mb-1 truncate group-hover:text-accent transition-colors">
          {doc.name || 'Untitled Document'}
        </h3>
        <div className="flex items-center gap-3 text-sm font-mono text-text-muted">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {dateStr}</span>
          {doc.shareSlug && (
            <span className="flex items-center gap-1 text-accent" title="Public Link Active">
              <Share2 className="w-3.5 h-3.5" /> Public
            </span>
          )}
        </div>
      </Link>
      
      <button 
        onClick={(e) => { e.preventDefault(); onStar(doc.id, doc.isStarred); }}
        className="absolute bottom-5 right-5 p-1 rounded-full hover:bg-bg-secondary transition-colors"
      >
        <Star className={clsx("w-5 h-5 transition-colors", doc.isStarred ? "text-warning fill-warning" : "text-text-muted hover:text-warning")} />
      </button>
    </div>
  );
}
