import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', action = null) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, isLeaving: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200); // Wait for exit animation
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            {...toast} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ message, type, isLeaving, action, onClose }) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-success" />,
    error: <AlertCircle className="w-4 h-4 text-danger" />,
    info: <Info className="w-4 h-4 text-accent" />
  };

  const borderColors = {
    success: 'border-l-success',
    error: 'border-l-danger',
    info: 'border-l-accent'
  };

  return (
    <div 
      className={`pointer-events-auto flex items-center justify-between gap-3 min-w-[280px] p-4 rounded-lg bg-[#1a1a1a] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#333] border-l-[4px] ${borderColors[type]} ${isLeaving ? 'animate-toast-out' : 'animate-toast-in'}`}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-[14px] font-sans text-white">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <button 
            onClick={() => { action.onClick(); onClose(); }}
            className="text-[13px] font-bold text-accent hover:text-accent-hover transition-colors whitespace-nowrap px-2"
          >
            {action.label}
          </button>
        )}
        <button 
          onClick={onClose}
          className="p-1 text-[#888] hover:text-white rounded-full transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
