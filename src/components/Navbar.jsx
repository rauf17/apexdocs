import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className={clsx(
      'fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b',
      isScrolled ? 'bg-bg-primary/90 backdrop-blur-md border-border' : 'bg-transparent border-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition-colors">
            <Zap className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-serif text-2xl tracking-tight text-text-primary">ApexDocs</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <Link to="/templates" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Templates
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={signOut}
                  className="text-sm font-medium text-text-muted hover:text-danger transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium shadow-[0_0_20px_var(--accent-glow)] transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-bg-card border-b border-border shadow-2xl flex flex-col p-6 gap-6">
          <Link to="/templates" className="text-base font-medium text-text-primary" onClick={closeMenu}>Templates</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-base font-medium text-text-primary" onClick={closeMenu}>Dashboard</Link>
              <button 
                onClick={() => { signOut(); closeMenu(); }}
                className="text-base font-medium text-danger text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-base font-medium text-text-primary" onClick={closeMenu}>Sign In</Link>
              <Link 
                to="/register" 
                className="w-full py-3 rounded-lg bg-accent text-white text-center text-base font-medium"
                onClick={closeMenu}
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
