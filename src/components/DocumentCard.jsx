import { Link, useNavigate } from 'react-router-dom';
import { Star, Edit2, Copy, Download, Trash2, FileText } from 'lucide-react';

function getRelativeTime(date) {
  if (!date) return 'Just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((date - new Date()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((date - new Date()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((date - new Date()) / (1000 * 60));

  if (Math.abs(daysDifference) > 0) return rtf.format(daysDifference, 'day');
  if (Math.abs(hoursDifference) > 0) return rtf.format(hoursDifference, 'hour');
  if (Math.abs(minutesDifference) > 0) return rtf.format(minutesDifference, 'minute');
  return 'Just now';
}

export default function DocumentCard({ doc, view = 'grid', onDelete, onStar, onDuplicate, onExport }) {
  const navigate = useNavigate();
  const dateObj = doc.updatedAt?.toDate() || new Date();
  const relativeTime = getRelativeTime(dateObj);
  const wordCount = doc.content ? doc.content.trim().split(/\s+/).filter(Boolean).length : 0;
  
  const templateName = doc.templateId || 'blank';
  let badgeColor = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  let templateLabel = 'Other';

  if (templateName.includes('resume')) {
    badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    templateLabel = 'Resume';
  } else if (templateName.includes('invoice')) {
    badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
    templateLabel = 'Invoice';
  } else if (templateName.includes('report') || templateName.includes('proposal') || templateName.includes('case-study')) {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    templateLabel = 'Report';
  } else if (templateName.includes('readme') || templateName.includes('api')) {
    badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    templateLabel = 'README';
  } else if (templateName === 'blank') {
    badgeColor = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    templateLabel = 'Blank';
  }

  const previewLines = doc.content ? doc.content.split('\n').filter(l => l.trim().length > 0).slice(0, 3) : [];

  if (view === 'list') {
    return (
      <div className="group flex items-center gap-4 py-3 px-4 border-b border-[#222] hover:bg-[#111111] transition-colors cursor-pointer" onClick={() => navigate(`/editor/${doc.id}`)}>
        <button 
          onClick={(e) => { e.stopPropagation(); onStar(doc.id, doc.isStarred); }}
          className="p-1 focus:outline-none shrink-0"
        >
          <Star className={`w-5 h-5 transition-colors ${doc.isStarred ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#444] hover:text-[#f59e0b]"}`} />
        </button>
        
        <div className="w-10 h-10 rounded bg-[#fafafa] flex items-center justify-center shrink-0 border border-gray-200">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-sans font-bold text-[14px] text-white truncate">{doc.name || 'Untitled Document'}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeColor}`}>
                {templateLabel}
              </span>
              <span className="text-[#888] text-[11px] font-mono">{wordCount} words</span>
              <span className="text-[#888] text-[11px] font-mono hidden sm:inline">Last edited {relativeTime}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); navigate(`/editor/${doc.id}`); }} className="p-1.5 text-[#888] hover:text-white rounded hover:bg-[#222] transition-colors" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(doc); }} className="p-1.5 text-[#888] hover:text-white rounded hover:bg-[#222] transition-colors" title="Duplicate">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onExport(doc); }} className="p-1.5 text-[#888] hover:text-white rounded hover:bg-[#222] transition-colors" title="Export PDF">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} className="p-1.5 text-[#888] hover:text-[#ef4444] rounded hover:bg-[#222] transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-[#161616] border border-[#222] rounded-xl flex flex-col h-[260px] transition-all duration-300 hover:-translate-y-1 hover:border-[#333] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] cursor-pointer" onClick={() => navigate(`/editor/${doc.id}`)}>
      <button 
        onClick={(e) => { e.stopPropagation(); onStar(doc.id, doc.isStarred); }}
        className="absolute top-3 right-3 p-1 z-10 focus:outline-none"
      >
        <Star className={`w-5 h-5 transition-colors ${doc.isStarred ? "text-[#f59e0b] fill-[#f59e0b]" : "text-gray-400 hover:text-[#f59e0b]"}`} />
      </button>

      <div className="relative h-[160px] bg-[#fafafa] rounded-t-xl overflow-hidden p-4 border-b border-[#222]">
        <div className="text-[10px] font-mono text-gray-500 break-words opacity-70">
          {previewLines.map((line, i) => (
            <p key={i} className="mb-1 truncate">{line}</p>
          ))}
          {previewLines.length === 0 && <p className="italic text-gray-400">Empty document...</p>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fafafa] to-transparent pointer-events-none"></div>
      </div>

      <div className="p-4 flex-1 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${badgeColor}`}>
            {templateLabel}
          </span>
        </div>
        <h3 className="font-sans font-bold text-[14px] text-white truncate mb-1 pr-2">{doc.name || 'Untitled Document'}</h3>
        <div className="flex items-center gap-2 text-[#888] text-[11px] font-mono mt-auto">
          <span>{relativeTime}</span>
          <span>&bull;</span>
          <span>{wordCount} words</span>
        </div>

        {/* Hover Actions */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#161616] via-[#161616] to-transparent opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/editor/${doc.id}`); }} className="h-7 px-2 flex items-center gap-1.5 text-[12px] font-medium text-[#ccc] hover:text-white rounded hover:bg-[#333] transition-colors bg-[#222]">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(doc); }} className="h-7 w-7 flex items-center justify-center text-[#ccc] hover:text-white rounded hover:bg-[#333] transition-colors bg-[#222]" title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onExport(doc); }} className="h-7 w-7 flex items-center justify-center text-[#ccc] hover:text-white rounded hover:bg-[#333] transition-colors bg-[#222]" title="Export">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} className="h-7 w-7 flex items-center justify-center text-[#ccc] hover:text-[#ef4444] rounded hover:bg-[#ef4444]/10 transition-colors bg-[#222]" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
