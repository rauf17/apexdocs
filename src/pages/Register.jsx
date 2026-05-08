import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import Logo from '../components/Logo';
import { useToast } from '../components/Toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();


  // Password strength checks
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  
  const score = Object.values(criteria).filter(Boolean).length;
  
  let strengthColor = '#222';
  let strengthWidth = '0%';
  let strengthLabel = '';
  
  if (password.length > 0) {
    if (score === 3) {
      strengthColor = '#22c55e'; // Strong
      strengthWidth = '100%';
      strengthLabel = 'Strong';
    } else if (score === 2) {
      strengthColor = '#f59e0b'; // Fair
      strengthWidth = '66%';
      strengthLabel = 'Fair';
    } else {
      strengthColor = '#ef4444'; // Weak
      strengthWidth = '33%';
      strengthLabel = 'Weak';
    }
  }

  const handleConfirmBlur = () => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    
    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to create account.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Google sign in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080808] font-sans page-root">
      
      {/* LEFT PANEL - FORM (Mirrored from Login) */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 py-12 bg-[#080808] order-2 md:order-1 relative z-10">
        <Logo theme="dark" className="md:hidden mb-12 self-start" />

        <div className="w-full max-w-[400px] mx-auto animate-in delay-1">
          <div className="mb-8">
            <h1 className="font-serif text-[32px] text-text-primary mb-2">Create an account</h1>
            <p className="text-[15px] font-sans text-text-muted">Start creating beautiful documents today.</p>
          </div>



          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#161616] border border-[#222] rounded-lg text-[15px] font-medium text-text-primary hover:bg-[#1a1a1a] hover:border-[#333] transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#222]"></div>
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">or register with email</span>
            <div className="flex-1 h-px bg-[#222]"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block font-mono text-[12px] text-text-muted uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-[#161616] border border-[#222] rounded-lg px-4 py-3 text-[15px] font-sans text-text-primary focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all placeholder:text-[#444] disabled:opacity-50"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[12px] text-text-muted uppercase tracking-wider mb-2">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-[#161616] border border-[#222] rounded-lg px-4 py-3 text-[15px] font-sans text-text-primary focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all placeholder:text-[#444] disabled:opacity-50"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[12px] text-text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#161616] border border-[#222] rounded-lg pl-4 pr-12 py-3 text-[15px] font-sans text-text-primary focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all placeholder:text-[#444] disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-3">
                <div className="w-full h-[3px] bg-[#222] rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: strengthWidth, backgroundColor: strengthColor }}
                  ></div>
                </div>
                {password.length > 0 && (
                  <div className="font-mono text-[11px]" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </div>
                )}
                
                <div className="flex flex-col gap-1 mt-3">
                  <div className="flex items-center gap-2 text-[12px] font-sans">
                    {criteria.length ? <Check className="w-3.5 h-3.5 text-success transition-all duration-200" /> : <X className="w-3.5 h-3.5 text-text-muted transition-all duration-200" />}
                    <span className={criteria.length ? "text-text-primary" : "text-text-muted"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-sans">
                    {criteria.uppercase ? <Check className="w-3.5 h-3.5 text-success transition-all duration-200" /> : <X className="w-3.5 h-3.5 text-text-muted transition-all duration-200" />}
                    <span className={criteria.uppercase ? "text-text-primary" : "text-text-muted"}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-sans">
                    {criteria.number ? <Check className="w-3.5 h-3.5 text-success transition-all duration-200" /> : <X className="w-3.5 h-3.5 text-text-muted transition-all duration-200" />}
                    <span className={criteria.number ? "text-text-primary" : "text-text-muted"}>One number</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[12px] text-text-muted uppercase tracking-wider mb-2">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordMismatch) setPasswordMismatch(false);
                }}
                onBlur={handleConfirmBlur}
                disabled={loading}
                className={`w-full bg-[#161616] border ${passwordMismatch ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : 'border-[#222] focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-glow)]'} rounded-lg px-4 py-3 text-[15px] font-sans text-text-primary focus:outline-none transition-all placeholder:text-[#444] disabled:opacity-50`}
                placeholder="••••••••"
                required
              />
              {passwordMismatch && (
                <p className="mt-2 text-[12px] text-danger font-sans">Passwords do not match.</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || passwordMismatch}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4f46e5] py-[14px] text-[15px] font-bold text-white transition-all hover:shadow-[0_0_20px_var(--accent-glow)] disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <>
                  <span className="relative z-10">Create Free Account</span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[14px] font-sans text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
              Sign in &rarr;
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - PREVIEW (Mirrored from Login) */}
      <div className="hidden md:flex md:w-[48%] bg-[#111111] relative flex-col items-center justify-center overflow-hidden border-l border-[#222] order-1 md:order-2">
        <Logo theme="dark" className="absolute top-8 left-8 z-20" />

        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Document Mockup (Resume Style) */}
        <div className="relative z-10 w-full max-w-[340px] bg-white rounded-xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-[2deg] hover:rotate-0 transition-transform duration-500 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-line" style={{ animationDelay: '150ms' }}></div>
          </div>
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="animate-line h-4 w-[60%] bg-indigo-500/20 rounded border border-indigo-500/30" style={{ animationDelay: '300ms' }}></div>
            <div className="animate-line h-2 w-[40%] bg-gray-300 rounded" style={{ animationDelay: '450ms' }}></div>
          </div>
          <hr className="animate-line border-gray-100 my-4" style={{ animationDelay: '600ms' }} />
          <div className="flex flex-col gap-3">
            <div className="animate-line h-2.5 w-[30%] bg-gray-300 rounded" style={{ animationDelay: '750ms' }}></div>
            <div className="animate-line h-2.5 w-[90%] bg-gray-100 rounded" style={{ animationDelay: '900ms' }}></div>
            <div className="animate-line h-2.5 w-[85%] bg-gray-100 rounded" style={{ animationDelay: '1050ms' }}></div>
            <div className="animate-line h-2.5 w-[60%] bg-gray-100 rounded" style={{ animationDelay: '1200ms' }}></div>
          </div>
        </div>

        <p className="relative z-10 mt-12 font-serif italic text-xl text-[#888888]">
          "Your ideas, perfectly presented."
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes line-reveal {
          from { opacity: 0; transform: scaleX(0); transform-origin: left; }
          to { opacity: 1; transform: scaleX(1); transform-origin: left; }
        }
        .animate-line {
          opacity: 0;
          animation: line-reveal 0.6s ease forwards;
        }
      `}} />
    </div>
  );
}
