import { Link } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function AuthGate({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in">
      <div 
        className="bg-[#161616] border border-[#222] rounded-2xl p-8 max-w-[420px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
        style={{ animation: 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-amber-500" />
        </div>
        
        <h2 className="font-serif text-[28px] text-white mb-3">Unlock Exports</h2>
        <p className="text-[#888] font-sans text-[15px] leading-relaxed mb-8">
          Create a free account to export PDFs, share documents and sync across all your devices.
        </p>
        
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3 text-[14px] text-white font-sans">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            Unlimited PDF exports
          </div>
          <div className="flex items-center gap-3 text-[14px] text-white font-sans">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            Shareable document links
          </div>
          <div className="flex items-center gap-3 text-[14px] text-white font-sans">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            Sync across all devices
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            to="/register" 
            className="w-full flex items-center justify-center py-3.5 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white rounded-xl font-medium shadow-[0_0_20px_var(--accent-glow)] transition-all hover:scale-[1.02] active:scale-95"
          >
            Create Free Account
          </Link>
          
          <div className="flex items-center justify-between text-[13px] font-sans">
            <span className="text-[#888]">
              Already have an account? <Link to="/login" className="text-white hover:underline">Sign In</Link>
            </span>
            <button onClick={onClose} className="text-[#888] hover:text-white transition-colors underline decoration-[#444] underline-offset-4">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
