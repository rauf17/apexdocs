import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-bg-secondary flex items-center justify-center mb-8 border border-border shadow-2xl relative">
          <FileQuestion className="w-10 h-10 text-text-muted" />
          <div className="absolute inset-0 border border-accent/20 rounded-3xl animate-ping opacity-20"></div>
        </div>
        
        <h1 className="font-serif text-6xl text-text-primary mb-4">404</h1>
        <h2 className="text-xl text-text-secondary font-medium mb-8 max-w-md">The document or page you're looking for doesn't exist or has been moved.</h2>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-bg-card hover:bg-bg-secondary border border-border hover:border-border-hover text-text-primary font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go back home
        </Link>
      </div>
    </div>
  );
}
