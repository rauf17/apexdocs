import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-sans overflow-hidden page-enter">
      <Navbar />

      <main className="flex-1 flex items-center justify-center relative px-6">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Floating document background decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-1000">
          <div className="relative w-[300px] h-[400px] transform-style-3d animate-float opacity-10">
            <div className="absolute inset-0 bg-white rounded-xl shadow-2xl p-8 flex flex-col gap-4 border border-gray-200" style={{ transform: 'rotate(-10deg) translateZ(-50px)' }}>
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-100 rounded mt-4"></div>
              <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
              <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
            </div>
            <div className="absolute inset-0 bg-white rounded-xl shadow-2xl p-8 flex flex-col gap-4 border border-gray-200" style={{ transform: 'rotate(5deg) translateZ(50px)' }}>
              <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-100 rounded mt-4"></div>
              <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="font-serif text-[120px] text-accent opacity-30 leading-none mb-4 select-none">404</h1>
          <h2 className="font-serif text-[32px] text-text-primary mb-3">Page not found</h2>
          <p className="font-sans text-[16px] text-text-muted mb-8">Looks like this page got lost in the markdown.</p>
          
          <Link 
            to="/" 
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-all hover:-translate-x-1 shadow-[0_0_15px_var(--accent-glow)]"
          >
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
