import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export default function Toast({ type = 'info', message, onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow CSS animation to trigger on mount
    const mountTimer = setTimeout(() => setIsVisible(true), 10);
    
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // wait for fade out before unmounting
    }, duration);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-accent" />
  };

  const borders = {
    success: 'border-success/30',
    error: 'border-danger/30',
    info: 'border-accent/30'
  };

  return (
    <div className={clsx(
      'fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-bg-card shadow-2xl border transition-all duration-300',
      borders[type],
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    )}>
      {icons[type]}
      <p className="text-sm font-medium text-text-primary pr-4">{message}</p>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
        className="text-text-muted hover:text-text-primary transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
