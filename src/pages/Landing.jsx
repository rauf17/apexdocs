import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight, CheckCircle2, MonitorPlay, FileText, DownloadCloud, Palette, Share2, SaveAll } from 'lucide-react';
import Logo from '../components/Logo';
import clsx from 'clsx';
import { templates } from '../data/templates';

export default function Landing() {
  const observerRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState("All");
  const [displayedFeature, setDisplayedFeature] = useState("All");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleFeatureTabClick = (tab) => {
    if (tab === activeFeature) return;
    setIsTransitioning(true);
    setActiveFeature(tab);
    setTimeout(() => {
      setDisplayedFeature(tab);
      setIsTransitioning(false);
    }, 150);
  };

  useEffect(() => {
    // Parallax mouse effect for hero cards
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.parallax-card');
      const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
      
      cards.forEach(card => {
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Intersection observer for scroll animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observerRef.current.observe(el);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (
    <div className="bg-bg-primary min-h-screen page-root">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[55%_45%] gap-12 items-center w-full z-10">
          <div className="flex flex-col items-start pt-12 md:pt-0">
            <div className="animate-in delay-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-card/50 backdrop-blur-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow"></span>
                <span className="text-xs font-mono text-text-secondary tracking-wide">Free Forever · No watermarks</span>
              </div>
            </div>
            
            <h1 className="font-serif text-6xl md:text-[68px] leading-[1.1] mb-6">
              <div className="animate-in delay-2 text-white">Write in Markdown.</div>
              <div className="animate-in delay-3 bg-gradient-to-r from-accent to-[#818cf8] bg-clip-text text-transparent">Export Anything.</div>
            </h1>
            
            <p className="animate-in delay-4 text-lg text-text-muted font-sans mb-8 max-w-lg">
              Create stunning resumes, invoices, reports and proposals. Write once, export as a beautiful PDF instantly.
            </p>
            
            <div className="animate-in delay-5 flex flex-col gap-4 mb-8">
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/editor')} className="magnetic-btn primary-gold-btn flex items-center gap-2 px-6 py-3.5 rounded-xl">
                  Start Writing Free <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/templates" className="px-6 py-3.5 rounded-xl border border-border hover:border-text-primary text-text-primary font-medium transition-all hover:bg-bg-secondary active:scale-95">
                  Browse Templates
                </Link>
              </div>
              <div className="text-sm font-mono text-text-secondary mt-2">
                No account needed to start
              </div>
            </div>
            
            <div className="animate-in delay-5 flex flex-wrap gap-4 text-sm font-mono text-text-secondary">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> No watermarks</span>
            </div>
          </div>
          
          <div className="relative h-[400px] md:h-[600px] perspective-1000 mt-12 md:mt-0">
            <div className="absolute inset-0 flex items-center justify-center animate-float">
              {/* Stacked Cards */}
              <div className="relative w-[320px] md:w-[400px] h-[450px] md:h-[550px] transform-style-3d">
                {/* Back card */}
                <div className="parallax-card absolute inset-0 bg-bg-card border border-border rounded-xl shadow-2xl origin-bottom transition-transform duration-200 ease-out z-0" style={{ transform: 'translateZ(-100px) translateY(20px) rotate(-4deg)', opacity: 0.6 }}></div>
                {/* Middle card */}
                <div className="parallax-card absolute inset-0 bg-bg-secondary border border-border rounded-xl shadow-2xl origin-bottom transition-transform duration-200 ease-out z-10" style={{ transform: 'translateZ(-50px) translateY(10px) rotate(2deg)', opacity: 0.8 }}></div>
                {/* Front card (Paper Mockup) */}
                <div className="parallax-card absolute inset-0 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] origin-bottom transition-transform duration-200 ease-out z-20 p-8 flex flex-col gap-4 overflow-hidden border border-gray-200">
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-100 rounded mt-4"></div>
                  <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                  <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
                  <div className="h-32 w-full bg-gray-50 border border-gray-200 rounded mt-4 flex items-center justify-center">
                    <span className="text-gray-400 font-mono text-sm">Image / Chart placeholder</span>
                  </div>
                  <div className="h-4 w-full bg-gray-100 rounded mt-4"></div>
                  <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-bg-primary relative border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-block text-xs font-mono text-text-muted tracking-[0.2em] uppercase mb-4">Why ApexDocs</span>
            <h2 className="font-serif text-4xl md:text-[42px] text-text-primary">Everything you need, nothing you don't.</h2>
          </div>
          
          <div className="flex justify-center mb-12 relative">
            <div className="flex gap-2 p-1 bg-bg-card border border-border rounded-full relative">
              {['All', 'Writing', 'Export', 'Templates'].map(tab => (
                <button
                  key={tab}
                  onClick={() => handleFeatureTabClick(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative z-10 ${activeFeature === tab ? 'text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {tab}
                </button>
              ))}
              <div 
                className="absolute top-1 bottom-1 bg-accent rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_15px_var(--accent-glow)] z-0"
                style={{
                  width: activeFeature === 'All' ? '64px' : activeFeature === 'Writing' ? '88px' : activeFeature === 'Export' ? '82px' : '106px',
                  left: activeFeature === 'All' ? '4px' : activeFeature === 'Writing' ? '76px' : activeFeature === 'Export' ? '172px' : '262px'
                }}
              />
            </div>
          </div>
          
          <div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-150"
            style={{ opacity: isTransitioning ? 0 : 1, transform: isTransitioning ? 'scale(0.95)' : 'scale(1)' }}
          >
            <FeatureCard 
              icon={<MonitorPlay />} title="Live Preview" category="Writing" activeFeature={displayedFeature}
              desc="Real-time rendering as you type. What you see is exactly what you get in the final PDF." 
              delay="0ms" 
            />
            <FeatureCard 
              icon={<FileText />} title="10+ Templates" category="Templates" activeFeature={displayedFeature}
              desc="Start instantly with professional templates for resumes, invoices, proposals, and more." 
              delay="60ms" 
            />
            <FeatureCard 
              icon={<DownloadCloud />} title="Instant Export" category="Export" activeFeature={displayedFeature}
              desc="One click to generate a beautiful, print-ready PDF. Zero watermarks, ever." 
              delay="120ms" 
            />
            <FeatureCard 
              icon={<Palette />} title="Multiple Themes" category="Writing" activeFeature={displayedFeature}
              desc="Customize your writing environment with meticulously crafted syntax themes." 
              delay="180ms" 
            />
            <FeatureCard 
              icon={<Share2 />} title="Share Anywhere" category="Export" activeFeature={displayedFeature}
              desc="Generate a public link instantly to share your document securely with anyone." 
              delay="240ms" 
            />
            <FeatureCard 
              icon={<SaveAll />} title="Auto-Save" category="Writing" activeFeature={displayedFeature}
              desc="Never lose a word. Your work is automatically saved to the cloud securely." 
              delay="300ms" 
            />
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section className="py-24 bg-bg-secondary border-y border-border/50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-12 animate-on-scroll">
            <span className="inline-block text-xs font-mono text-text-muted tracking-[0.2em] uppercase mb-2">Templates</span>
            <h2 className="font-serif text-4xl text-text-primary">Start from something beautiful.</h2>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-12 pt-4 snap-x custom-scrollbar">
            {templates.slice(1, 6).map((template, idx) => {
              const rotations = [-2, 0, 1, -1, 2];
              return (
                <div key={template.id} className="snap-center shrink-0 w-[280px] group relative animate-on-scroll" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div 
                    className="h-[320px] bg-white rounded-xl shadow-xl border border-gray-200 p-6 overflow-hidden transition-all duration-300 group-hover:!transform-none group-hover:shadow-2xl"
                    style={{ transform: `rotate(${rotations[idx]}deg)` }}
                  >
                    {/* Dummy content mimicking template */}
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                    <div className="h-2 w-5/6 bg-gray-100 rounded mb-2"></div>
                    <div className="h-2 w-4/6 bg-gray-100 rounded mb-6"></div>
                    <div className="h-20 w-full bg-gray-50 rounded mb-4"></div>
                    <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                    
                    <div className="absolute inset-0 bg-bg-primary/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link to="/templates" className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        Use Template
                      </Link>
                    </div>
                  </div>
                  <h3 className="mt-4 font-serif text-lg text-text-primary text-center group-hover:text-accent transition-colors">{template.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-bg-primary relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px border-t-2 border-dashed border-border z-0"></div>
            
            <Step number="1" title="Write in Markdown" desc="Focus on your content without distractions using our powerful editor." delay="0ms" />
            <Step number="2" title="Choose a Template" desc="Apply professional styling instantly with our curated templates." delay="200ms" />
            <Step number="3" title="Export to PDF" desc="Generate beautiful, print-ready documents with a single click." delay="400ms" />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-accent to-[#4f46e5] rounded-[2rem] p-12 md:p-16 text-center shadow-[0_20px_50px_var(--accent-glow)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl mix-blend-overlay"></div>
          
          <h2 className="font-serif text-4xl md:text-[42px] text-white mb-4 relative z-10">Ready to create your first document?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">Join thousands of writers, developers and professionals who trust ApexDocs for their important documents.</p>
          <button onClick={() => navigate('/editor')} className="magnetic-btn primary-gold-btn inline-flex items-center gap-2 px-8 py-4 rounded-xl shadow-xl relative z-10">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-indigo-200 text-sm mt-6 font-mono relative z-10">No account needed to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo theme="dark" className="mb-4" />
            <p className="text-sm text-text-muted max-w-xs">The modern way to write, design, and share markdown documents.</p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-3">
              <Link to="/templates" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Templates</Link>
              <Link to="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">GitHub</Link>
              <Link to="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="md:text-right flex flex-col justify-end">
            <p className="text-sm text-text-muted mb-2">Made with <span className="text-danger">❤️</span></p>
            <p className="text-xs text-text-muted">© 2025 ApexDocs. Free forever.</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        
        @keyframes hero-entrance {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-hero {
          opacity: 0;
          animation: hero-entrance 600ms ease forwards;
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}} />
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay, category, activeFeature }) {
  const isVisible = activeFeature === 'All' || activeFeature === category;
  
  if (!isVisible) return null;

  return (
    <div 
      className="feature-card animate-in bg-bg-elevated border border-border rounded-xl p-6 hover:border-border-hover transition-all"
      style={{ animationDelay: delay }}
    >
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent border border-accent/20 glow-pulse">
        {icon}
      </div>
      <h3 className="font-sans font-bold text-lg text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc, delay }) {
  return (
    <div className="animate-on-scroll relative z-10 flex flex-col items-center text-center" style={{ animationDelay: delay }}>
      <div className="w-16 h-16 rounded-full bg-bg-card border-4 border-bg-primary flex items-center justify-center mb-6 shadow-xl relative">
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-20"></div>
        <span className="font-serif text-2xl text-accent relative z-10">{number}</span>
      </div>
      <h3 className="font-sans font-bold text-xl text-text-primary mb-3">{title}</h3>
      <p className="text-text-muted max-w-xs">{desc}</p>
    </div>
  );
}
