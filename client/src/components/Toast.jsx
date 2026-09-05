import { useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm font-medium z-[60] transition-all duration-300",
      type === 'success' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
    )}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}
