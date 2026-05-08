import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Check, X, ChevronDown, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, loading, success
  const navigate = useNavigate();

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setCheckoutStatus('loading');
    setTimeout(() => {
      setCheckoutStatus('success');
    }, 1500);
  };

  return (
    <div className="bg-bg-primary min-h-screen page-root text-text-primary">
      <Navbar />

      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-in delay-1">
            <h1 className="font-serif text-[52px] leading-tight mb-4 text-text-primary">Simple Pricing</h1>
            <p className="text-[18px] text-text-muted font-sans max-w-xl mx-auto">
              Start free. Upgrade when you need more.
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-12">
              <span className={`text-[15px] font-medium transition-colors ${!yearly ? 'text-text-primary' : 'text-text-muted'}`}>Monthly</span>
              <button 
                onClick={() => setYearly(!yearly)}
                className="w-14 h-7 bg-bg-card border border-border rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-accent transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${yearly ? 'translate-x-7' : ''}`}></div>
              </button>
              <span className={`text-[15px] font-medium transition-colors flex items-center gap-2 ${yearly ? 'text-text-primary' : 'text-text-muted'}`}>
                Yearly <span className="px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 text-[10px] font-bold uppercase tracking-wider">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-16">
            {/* FREE PLAN */}
            <div className="card-hover bg-bg-secondary border border-border rounded-2xl p-10 flex flex-col relative z-10 animate-in delay-2">
              <h2 className="font-serif text-[28px] text-text-primary mb-2">Free</h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[48px] font-serif text-text-primary leading-none">$0</span>
                <span className="text-text-muted text-sm">/forever</span>
              </div>
              <p className="text-text-secondary text-[15px] mb-8">Perfect for getting started</p>
              
              <hr className="border-border mb-8" />

              <div className="flex flex-col gap-4 mb-10 flex-1">
                <Feature check text="3 documents" />
                <Feature check text="All 10 templates" />
                <Feature check text="PDF export" />
                <Feature check text="Guest mode — no signup needed" />
                <Feature cross text="Sync across devices" />
                <Feature cross text="Unlimited documents" />
                <Feature cross text="Version history" />
                <Feature cross text="Custom fonts in PDF" />
                <Feature cross text="Remove ApexDocs branding from PDF" />
                <Feature cross text="Priority support" />
              </div>

              <Link to="/register" className="w-full py-4 bg-transparent border border-border hover:border-text-secondary hover:text-white text-text-primary rounded-xl font-bold transition-all text-center">
                Get Started Free
              </Link>
            </div>

            {/* PRO PLAN */}
            <div className="card-hover relative bg-bg-card rounded-2xl p-[1px] animate-in delay-3" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--bg-card) 50%, var(--accent-hover) 100%)' }}>
              <div className="absolute -top-3 right-8 px-3 py-1 bg-accent text-bg-primary text-[11px] font-bold uppercase tracking-wider rounded-full shadow-[0_4px_20px_var(--accent-glow)] z-20">
                Most Popular
              </div>
              
              <div className="bg-bg-card rounded-2xl p-10 flex flex-col h-full relative z-10 overflow-hidden">
                {/* Subtle gold overlay */}
                <div className="absolute inset-0 bg-accent/[0.03] pointer-events-none"></div>

                <h2 className="font-serif text-[28px] text-accent mb-2">Pro</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[48px] font-serif text-text-primary leading-none">{yearly ? '$38' : '$4'}</span>
                  <span className="text-text-muted text-sm">/month</span>
                </div>
                {yearly && <p className="text-text-muted text-[13px] mb-1">$3.17/mo, billed $38/year</p>}
                {!yearly && <div className="h-[20px] mb-1"></div>}
                
                <p className="text-text-secondary text-[15px] mb-8">For writers and professionals</p>
                
                <hr className="border-border mb-8" />

                <div className="flex flex-col gap-4 mb-10 flex-1">
                  <Feature check gold text="Unlimited documents" />
                  <Feature check gold text="All templates + future templates" />
                  <Feature check gold text="Unlimited PDF exports" />
                  <Feature check gold text="Sync across all devices" />
                  <Feature check gold text="Full version history (last 30 versions)" />
                  <Feature check gold text="All premium fonts in PDF export" />
                  <Feature check gold text="Remove ApexDocs branding from PDF" />
                  <Feature check gold text="Priority email support" />
                  <Feature check gold text="Early access to new features" />
                </div>

                <button onClick={() => setCheckoutOpen(true)} className="primary-gold-btn w-full py-4 rounded-xl font-bold text-center mb-4">
                  Upgrade to Pro
                </button>
                <div className="flex flex-col items-center gap-1.5 opacity-80">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
                    <Lock className="w-3 h-3" /> Secure payment via Stripe
                  </div>
                  <span className="text-[11px] text-text-muted">Cancel anytime · No hidden fees</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-text-muted animate-in delay-4">
            <span>30-day money back guarantee</span>
            <span>·</span>
            <span>Secure checkout</span>
            <span>·</span>
            <span>Cancel anytime</span>
          </div>

          {/* FAQ SECTION */}
          <div className="mt-32 max-w-3xl mx-auto animate-in delay-5">
            <h3 className="font-serif text-[32px] text-center mb-12 text-text-primary">Frequently Asked Questions</h3>
            <div className="flex flex-col gap-4">
              <FaqItem 
                question="Can I really use ApexDocs for free forever?" 
                answer="Yes. The free plan never expires and never needs a credit card." 
              />
              <FaqItem 
                question="How does billing work?" 
                answer="You are billed monthly or yearly depending on your choice. You can cancel anytime from your account settings." 
              />
              <FaqItem 
                question="What payment methods do you accept?" 
                answer="All major credit cards and debit cards via Stripe. Fully secure." 
              />
              <FaqItem 
                question="Can I switch between plans?" 
                answer="Yes, upgrade or downgrade anytime. Changes take effect immediately." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* STRIPE CHECKOUT MODAL */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => checkoutStatus === 'idle' && setCheckoutOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-in">
            {checkoutStatus !== 'success' ? (
              <form onSubmit={handleCheckoutSubmit} className="flex flex-col">
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Logo theme="light" className="scale-75 origin-left" />
                  </div>
                  <span className="font-sans font-medium text-gray-900 text-lg">Subscribe to Pro</span>
                </div>
                
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">ApexDocs Pro</span>
                    <span className="text-gray-900 font-bold">{yearly ? '$38.00 / year' : '$4.00 / month'}</span>
                  </div>
                  <p className="text-sm text-gray-500">Billed {yearly ? 'yearly' : 'monthly'}</p>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/50 focus:border-[#635BFF]" placeholder="you@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
                    <div className="border border-gray-300 rounded-md overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-[#635BFF]/50 focus-within:border-[#635BFF]">
                      <div className="relative border-b border-gray-300">
                        <input type="text" required className="w-full px-3 py-2 text-gray-900 focus:outline-none placeholder:text-gray-400" placeholder="Card number" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <div className="w-8 h-5 bg-gray-200 rounded shrink-0"></div>
                        </div>
                      </div>
                      <div className="flex">
                        <input type="text" required className="w-1/2 px-3 py-2 text-gray-900 focus:outline-none border-r border-gray-300 placeholder:text-gray-400" placeholder="MM / YY" />
                        <input type="text" required className="w-1/2 px-3 py-2 text-gray-900 focus:outline-none placeholder:text-gray-400" placeholder="CVC" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on card</label>
                    <input type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/50 focus:border-[#635BFF]" placeholder="Name on card" />
                  </div>
                </div>

                <div className="p-6 pt-0 mt-4">
                  <button 
                    type="submit" 
                    disabled={checkoutStatus === 'loading'}
                    className="w-full bg-[#635BFF] hover:bg-[#5851e5] text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center min-h-[48px]"
                  >
                    {checkoutStatus === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `Subscribe — ${yearly ? '$38.00' : '$4.00'}`
                    )}
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <Lock className="w-3 h-3" /> Powered by Stripe
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-1">Your payment info is encrypted and secure.</p>
                </div>
              </form>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600 animate-[scaleIn_0.5s_cubic-bezier(0.16,1,0.3,1)]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ApexDocs Pro! 🎉</h3>
                <p className="text-gray-600 mb-8">Your account has been upgraded successfully.</p>
                <button 
                  onClick={() => {
                    setCheckoutOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full bg-[#111] hover:bg-[#222] text-white font-medium py-3 rounded-md transition-colors"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}
            
            {checkoutStatus === 'idle' && (
              <button onClick={() => setCheckoutOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Feature({ check, cross, gold, text }) {
  return (
    <div className={`flex items-start gap-3 text-[15px] ${cross ? 'text-text-muted' : 'text-text-primary'}`}>
      {check && <Check className={`w-5 h-5 shrink-0 ${gold ? 'text-accent' : 'text-success'}`} />}
      {cross && <X className="w-5 h-5 text-text-muted shrink-0" />}
      <span className={cross ? 'line-through opacity-70' : ''}>{text}</span>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="font-serif text-xl text-text-primary group-hover:text-accent transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${open ? 'rotate-180 text-accent' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        <p className="text-text-secondary text-lg font-sans leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
