import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight, CheckCircle2, MonitorPlay, FileText, DownloadCloud, Palette, Share2, SaveAll, Zap, Lock } from 'lucide-react';
import Logo from '../components/Logo';
import { templates } from '../data/templates';

// ─── Scroll-driven Book component ──────────────────────────────────────────
function ScrollBook() {
  const sectionRef = useRef(null);
  const [openAngle, setOpenAngle] = useState(0); // 0 = closed, 1 = fully open

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Start opening when section enters viewport, finish when it leaves top
      const progress = 1 - (rect.top / windowH);
      setOpenAngle(Math.min(1, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Left page rotates from -160deg (closed) to 0deg (open flat)
  const leftDeg = -160 + openAngle * 160;
  // Right page rotates from 160deg (closed) to 0deg (open flat)
  const rightDeg = 160 - openAngle * 160;

  const opacity = Math.min(1, openAngle * 1.5);

  return (
    <div ref={sectionRef} className="relative flex items-center justify-center" style={{ height: '420px' }}>
      {/* Glow underneath */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[320px] h-[40px] rounded-full blur-2xl transition-all duration-300"
        style={{ background: `rgba(212,168,67,${openAngle * 0.35})` }}
      />

      {/* Book container */}
      <div style={{ perspective: '900px', width: '340px', height: '380px', position: 'relative' }}>
        {/* Spine */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 rounded-sm"
          style={{
            width: '18px',
            height: '340px',
            background: 'linear-gradient(to bottom, #d4a843, #a07830)',
            zIndex: 10,
            boxShadow: '0 0 20px rgba(212,168,67,0.4)',
            transformOrigin: 'bottom center',
          }}
        />

        {/* LEFT PAGE */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - 9px)',
            bottom: 0,
            width: '155px',
            height: '340px',
            transformOrigin: 'right bottom',
            transform: `rotateY(${leftDeg}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.05s linear',
            zIndex: 5,
          }}
        >
          {/* Front face of left page */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fafaf8',
              borderRadius: '4px 0 0 4px',
              border: '1px solid #e0ddd5',
              padding: '20px 16px 20px 20px',
              backfaceVisibility: 'hidden',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            <div style={{ opacity }} className="flex flex-col gap-2">
              <div className="h-3 rounded" style={{ width: '70%', background: '#d4a843', opacity: 0.7 }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '90%' }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '80%' }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '85%' }} />
              <div className="h-px bg-gray-200 my-2" />
              <div className="h-2 rounded bg-gray-100" style={{ width: '75%' }} />
              <div className="h-2 rounded bg-gray-100" style={{ width: '90%' }} />
              <div className="h-2 rounded bg-gray-100" style={{ width: '60%' }} />
              <div className="h-16 rounded bg-gray-100 mt-2" style={{ width: '100%' }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '85%' }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '70%' }} />
            </div>
          </div>
          {/* Back face (inside of left page when open) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#f5f3ee',
              borderRadius: '4px 0 0 4px',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          />
        </div>

        {/* RIGHT PAGE */}
        <div
          style={{
            position: 'absolute',
            right: 'calc(50% - 9px)',
            bottom: 0,
            width: '155px',
            height: '340px',
            transformOrigin: 'left bottom',
            transform: `rotateY(${rightDeg}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.05s linear',
            zIndex: 5,
          }}
        >
          {/* Front face of right page */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fafaf8',
              borderRadius: '0 4px 4px 0',
              border: '1px solid #e0ddd5',
              padding: '20px 20px 20px 16px',
              backfaceVisibility: 'hidden',
              boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            <div style={{ opacity }} className="flex flex-col gap-2">
              <div className="h-2 rounded bg-gray-200" style={{ width: '80%' }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '95%' }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '70%' }} />
              <div className="h-px bg-gray-200 my-2" />
              <div className="h-2 rounded bg-gray-100" style={{ width: '88%' }} />
              <div className="h-2 rounded bg-gray-100" style={{ width: '75%' }} />
              <div className="h-2 rounded bg-gray-100" style={{ width: '90%' }} />
              <div className="h-2 rounded bg-gray-100" style={{ width: '65%' }} />
              <div className="h-px bg-gray-200 my-2" />
              <div className="h-3 rounded mt-1" style={{ width: '50%', background: '#d4a843', opacity: 0.5 }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '85%' }} />
              <div className="h-2 rounded bg-gray-200" style={{ width: '75%' }} />
            </div>
          </div>
          {/* Back face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#f5f3ee',
              borderRadius: '0 4px 4px 0',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          />
        </div>
      </div>

      {/* Label */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest uppercase"
        style={{ color: `rgba(212,168,67,${openAngle * 0.8})`, transition: 'color 0.1s' }}
      >
        {openAngle < 0.3 ? 'Scroll to open' : openAngle < 0.7 ? 'Opening…' : 'Your story begins here'}
      </div>
    </div>
  );
}

// ─── Feature card (fixed — no broken pixel math) ────────────────────────────
const ALL_FEATURES = [
  { icon: <MonitorPlay className="w-5 h-5" />, title: 'Live Preview', category: 'Writing', desc: 'Real-time rendering as you type. What you see is exactly what you get in the final PDF.' },
  { icon: <FileText className="w-5 h-5" />, title: '10+ Templates', category: 'Templates', desc: 'Start instantly with professional templates for resumes, invoices, proposals, and more.' },
  { icon: <DownloadCloud className="w-5 h-5" />, title: 'Instant Export', category: 'Export', desc: 'One click to generate a beautiful, print-ready PDF. Zero watermarks, ever.' },
  { icon: <Palette className="w-5 h-5" />, title: 'Multiple Themes', category: 'Writing', desc: 'Customize your writing environment with meticulously crafted syntax themes.' },
  { icon: <Share2 className="w-5 h-5" />, title: 'Share Anywhere', category: 'Export', desc: 'Generate a public link instantly to share your document securely with anyone.' },
  { icon: <SaveAll className="w-5 h-5" />, title: 'Auto-Save', category: 'Writing', desc: 'Never lose a word. Your work is automatically saved to the cloud securely.' },
  { icon: <Zap className="w-5 h-5" />, title: 'Keyboard Shortcuts', category: 'Writing', desc: 'Power-user shortcuts for bold, italic, save, export and more — stay in flow.' },
  { icon: <Lock className="w-5 h-5" />, title: 'Secure & Private', category: 'Export', desc: 'Your documents are private by default. Share only when you choose to.' },
];

const TABS = ['All', 'Writing', 'Export', 'Templates'];

function FeaturesSection() {
  const [active, setActive] = useState('All');
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const filtered = active === 'All' ? ALL_FEATURES : ALL_FEATURES.filter(f => f.category === active);

  return (
    <section ref={ref} className="py-28 bg-bg-primary relative border-t border-border/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-[11px] font-mono tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--accent)' }}>Why ApexDocs</span>
          <h2 className="font-serif text-4xl md:text-[44px] text-text-primary leading-tight">
            Everything you need,<br />
            <span className="text-text-muted font-normal italic">nothing you don't.</span>
          </h2>
        </div>

        {/* Tabs — width is auto, no hardcoded pixel math */}
        <div className={`flex justify-center mb-12 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex gap-1 p-1 rounded-xl border border-border" style={{ background: 'var(--bg-card)' }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className="relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none"
                style={{
                  color: active === tab ? '#0c0a08' : 'var(--text-secondary)',
                  background: active === tab ? 'var(--accent)' : 'transparent',
                  boxShadow: active === tab ? '0 0 16px var(--accent-glow-strong)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl p-6 border border-border hover:border-accent/40 transition-all duration-300 cursor-default overflow-hidden"
              style={{
                background: 'var(--bg-elevated)',
                transitionDelay: `${i * 50}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms, border-color 0.2s, box-shadow 0.2s`,
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 70%)' }} />

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', color: 'var(--accent)' }}>
                {f.icon}
              </div>

              {/* Category pill */}
              <span className="inline-block text-[10px] font-mono tracking-widest uppercase mb-3 px-2 py-0.5 rounded-full border"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                {f.category}
              </span>

              <h3 className="font-sans font-bold text-base text-text-primary mb-2 group-hover:text-accent transition-colors duration-200">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Landing ────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mouse parallax on hero cards
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.parallax-card');
      const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
      cards.forEach(card => {
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll reveal
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      obs.disconnect();
    };
  }, []);

  return (
    <div className="bg-bg-primary min-h-screen page-root overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen pt-20 flex items-center overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 65%)', transform: `translateY(${scrollY * 0.2}px)` }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)' }} />

        {/* Floating grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[55%_45%] gap-12 items-center w-full z-10">
          <div className="flex flex-col items-start pt-12 md:pt-0">

            {/* Badge */}
            <div className="animate-in delay-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-card/50 backdrop-blur-sm mb-8">
                <span className="w-2 h-2 rounded-full bg-success" style={{ animation: 'pulseGreen 2s ease-in-out infinite' }} />
                <span className="text-xs font-mono text-text-secondary tracking-wide">Free Forever · No watermarks</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-serif leading-[1.1] mb-6" style={{ fontSize: 'clamp(42px, 6vw, 68px)' }}>
              <div className="animate-in delay-2 text-white">Write in Markdown.</div>
              <div className="animate-in delay-3" style={{ background: 'linear-gradient(135deg, #d4a843 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Export Anything.
              </div>
            </h1>

            <p className="animate-in delay-4 text-lg font-sans mb-10 max-w-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Craft stunning resumes, invoices, reports and proposals.<br />Write once, export as a beautiful PDF instantly.
            </p>

            {/* CTAs */}
            <div className="animate-in delay-5 flex flex-wrap gap-4 mb-8">
              <button onClick={() => navigate('/editor')}
                className="magnetic-btn primary-gold-btn flex items-center gap-2 px-7 py-4 rounded-xl text-base font-bold">
                Start Writing Free <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/templates"
                className="flex items-center gap-2 px-7 py-4 rounded-xl border font-medium text-base transition-all hover:bg-bg-secondary active:scale-95"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                Browse Templates
              </Link>
            </div>

            {/* Social proof row */}
            <div className="animate-in delay-5 flex flex-wrap items-center gap-6 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> No watermarks</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> 10+ templates</span>
            </div>
          </div>

          {/* Hero visual — 3D stacked cards */}
          <div className="relative h-[400px] md:h-[560px] mt-12 md:mt-0" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'floatY 6s ease-in-out infinite' }}>
              <div className="relative w-[320px] md:w-[380px] h-[440px] md:h-[520px]" style={{ transformStyle: 'preserve-3d' }}>
                <div className="parallax-card absolute inset-0 rounded-2xl border border-border transition-transform duration-200 ease-out"
                  style={{ background: 'var(--bg-card)', transform: 'translateZ(-80px) translateY(18px) rotate(-4deg)', opacity: 0.5 }} />
                <div className="parallax-card absolute inset-0 rounded-2xl border border-border transition-transform duration-200 ease-out"
                  style={{ background: 'var(--bg-secondary)', transform: 'translateZ(-40px) translateY(9px) rotate(2deg)', opacity: 0.75 }} />
                <div className="parallax-card absolute inset-0 bg-white rounded-2xl transition-transform duration-200 ease-out p-8 flex flex-col gap-3 overflow-hidden border border-gray-200"
                  style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
                  {/* Simulated document */}
                  <div className="h-5 w-2/3 rounded" style={{ background: 'linear-gradient(90deg, #d4a843 0%, #e8c876 100%)' }} />
                  <div className="h-px bg-gray-100 my-1" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded" />
                  <div className="h-3 w-4/6 bg-gray-100 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-24 w-full rounded mt-2 border border-gray-100 flex items-center justify-center" style={{ background: '#f9f9f9' }}>
                    <span className="text-gray-300 font-mono text-xs">chart placeholder</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded" />
                  {/* Cursor blink */}
                  <div className="flex items-center gap-1 mt-2">
                    <div className="h-3 w-1/3 bg-gray-100 rounded" />
                    <div className="w-0.5 h-4 rounded" style={{ background: '#d4a843', animation: 'blink 1.1s step-end infinite' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-in delay-5">
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border flex items-start justify-center pt-2" style={{ borderColor: 'var(--border)' }}>
            <div className="w-1 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'scrollDot 1.8s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── BOOK OPENING SECTION ─────────────────────────────── */}
      <section className="py-24 relative overflow-hidden border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="scroll-reveal text-center mb-16">
            <span className="inline-block text-[11px] font-mono tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--accent)' }}>How it works</span>
            <h2 className="font-serif text-4xl md:text-[44px] text-text-primary mb-4">Your document journey</h2>
            <p className="text-text-muted font-sans text-lg max-w-xl mx-auto">From blank page to polished PDF — scroll to see it unfold.</p>
          </div>

          <ScrollBook />

          {/* Steps below the book */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 relative">
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px border-t border-dashed" style={{ borderColor: 'var(--border)' }} />
            {[
              { n: '01', title: 'Write', desc: 'Open the editor and write in plain Markdown. No formatting headaches — just focus on your words.' },
              { n: '02', title: 'Style', desc: 'Pick a template and theme. Watch the live preview update in real time as you type.' },
              { n: '03', title: 'Export', desc: 'Hit Export PDF. Your browser opens a beautiful, print-ready document in seconds.' },
            ].map((s, i) => (
              <div key={s.n} className="scroll-reveal relative z-10 flex flex-col items-center text-center" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 relative" style={{ background: 'var(--bg-card)', border: '2px solid var(--border)' }}>
                  <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(212,168,67,0.15)', animation: 'ping 2s ease-in-out infinite', animationDelay: `${i * 300}ms` }} />
                  <span className="font-mono text-lg font-bold relative z-10" style={{ color: 'var(--accent)' }}>{s.n}</span>
                </div>
                <h3 className="font-serif text-xl text-text-primary mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── TEMPLATES SHOWCASE ───────────────────────────────── */}
      <section className="py-24 border-y overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-12 scroll-reveal flex items-end justify-between">
            <div>
              <span className="inline-block text-[11px] font-mono tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--accent)' }}>Templates</span>
              <h2 className="font-serif text-4xl text-text-primary">Start from something beautiful.</h2>
            </div>
            <Link to="/templates" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors" style={{ color: 'var(--text-secondary)' }}>
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x" style={{ scrollbarWidth: 'none' }}>
            {templates.slice(0, 7).map((template, idx) => {
              const rots = [-3, 1, -1, 2, -2, 1, -1];
              return (
                <div key={template.id} className="snap-center shrink-0 w-[260px] group relative scroll-reveal" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div
                    className="h-[300px] rounded-xl shadow-xl border border-gray-200 p-6 overflow-hidden transition-all duration-500 group-hover:rotate-0 group-hover:shadow-2xl relative"
                    style={{ background: '#fafaf8', transform: `rotate(${rots[idx]}deg)` }}
                  >
                    <div className="text-2xl mb-3">{template.icon}</div>
                    <div className="h-3 w-1/2 rounded mb-3" style={{ background: '#e8e0d0' }} />
                    <div className="h-2 w-full bg-gray-100 rounded mb-2" />
                    <div className="h-2 w-5/6 bg-gray-100 rounded mb-2" />
                    <div className="h-2 w-4/6 bg-gray-100 rounded mb-4" />
                    <div className="h-16 w-full rounded mb-4" style={{ background: '#f0ede8' }} />
                    <div className="h-2 w-full bg-gray-100 rounded mb-2" />
                    <div className="h-2 w-3/4 bg-gray-100 rounded" />

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
                      style={{ background: 'rgba(12,10,8,0.5)', backdropFilter: 'blur(4px)' }}>
                      <Link to="/templates"
                        className="px-5 py-2 rounded-lg text-sm font-bold text-bg-primary translate-y-3 group-hover:translate-y-0 transition-transform duration-300"
                        style={{ background: 'var(--accent)' }}>
                        Use Template
                      </Link>
                    </div>
                  </div>
                  <h3 className="mt-4 font-serif text-base text-text-primary text-center group-hover:text-accent transition-colors">{template.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────── */}
      <section className="py-16 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10+', label: 'Templates' },
            { value: '∞', label: 'Free exports' },
            { value: '0', label: 'Watermarks' },
            { value: '1-click', label: 'PDF export' },
          ].map((s, i) => (
            <div key={s.label} className="scroll-reveal text-center" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="font-serif text-4xl mb-1" style={{ color: 'var(--accent)' }}>{s.value}</div>
              <div className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div
          className="max-w-5xl mx-auto rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden scroll-reveal"
          style={{ background: 'linear-gradient(135deg, #d4a843 0%, #6366f1 100%)', boxShadow: '0 30px 80px rgba(212,168,67,0.2)' }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,0,0,0.1)' }} />

          <p className="text-xs font-mono tracking-widest uppercase mb-6 relative z-10" style={{ color: 'rgba(255,255,255,0.7)' }}>Get started today</p>
          <h2 className="font-serif text-4xl md:text-[48px] text-white mb-5 leading-tight relative z-10">
            Ready to write something<br />worth reading?
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto relative z-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Join thousands of writers, developers and professionals who trust ApexDocs for their important documents.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => navigate('/editor')}
              className="magnetic-btn flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: '#0c0a08', color: '#d4a843' }}
            >
              Start Writing Free <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/templates"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all hover:bg-white/20"
              style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white' }}>
              Browse Templates
            </Link>
          </div>
          <p className="text-sm mt-6 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>No account needed to start · Free forever</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t py-14" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Logo theme="dark" className="mb-4" />
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>The modern way to write, design, and share markdown documents — beautifully.</p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Product</p>
              <Link to="/templates" className="text-sm transition-colors hover:text-accent" style={{ color: 'var(--text-secondary)' }}>Templates</Link>
              <Link to="/pricing" className="text-sm transition-colors hover:text-accent" style={{ color: 'var(--text-secondary)' }}>Pricing</Link>
              <Link to="/editor" className="text-sm transition-colors hover:text-accent" style={{ color: 'var(--text-secondary)' }}>Editor</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Company</p>
              <Link to="#" className="text-sm transition-colors hover:text-accent" style={{ color: 'var(--text-secondary)' }}>GitHub</Link>
              <Link to="#" className="text-sm transition-colors hover:text-accent" style={{ color: 'var(--text-secondary)' }}>Privacy</Link>
            </div>
          </div>
          <div className="md:text-right flex flex-col justify-end gap-2">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Made with <span style={{ color: 'var(--danger)' }}>❤️</span></p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2025 ApexDocs. Free forever.</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-16px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes scrollDot {
          0%   { transform: translateY(0); opacity: 1; }
          80%  { transform: translateY(14px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
        }
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .scroll-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1);
        }
        .scroll-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}} />
    </div>
  );
}