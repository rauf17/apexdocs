import { Loader2 } from 'lucide-react';

export default function LoadingBar({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
      <span className="font-mono text-sm text-text-secondary tracking-wide">{message}</span>
    </div>
  );
}
