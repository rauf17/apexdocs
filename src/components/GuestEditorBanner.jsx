import { Link } from 'react-router-dom';

export default function GuestEditorBanner({ user }) {
  if (user) return null;

  return (
    <div className="h-10 bg-[#1a1500] border-b border-[#f59e0b]/30 flex items-center justify-between px-4 shrink-0 animate-in">
      <div className="text-[13px] font-sans text-amber-500 flex items-center gap-2">
        <span className="text-lg">💾</span>
        You are writing as a guest. Sign in to save and export your documents.
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-[13px] text-white hover:text-accent transition-colors font-medium">
          Sign In
        </Link>
        <Link to="/register" className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium rounded transition-colors shadow-[0_0_10px_var(--accent-glow)]">
          Create Free Account
        </Link>
      </div>
    </div>
  );
}
