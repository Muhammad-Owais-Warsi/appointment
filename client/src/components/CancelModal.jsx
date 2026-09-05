import { EASE_OUT } from '../lib/constants';
import { X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CancelModal({ visible, mounted, loading, onClose, onConfirm }) {
  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-250",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{ transitionTimingFunction: EASE_OUT }}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-card rounded-2xl p-6 w-full max-w-sm shadow-2xl transition-[opacity,transform] duration-250 border border-border",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{ transitionTimingFunction: EASE_OUT }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <X className="w-5 h-5 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground text-center">Cancel appointment?</h3>
        <p className="text-sm text-muted-foreground text-center mt-2">This action cannot be undone. The slot will open for others.</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-muted text-foreground hover:bg-accent transition-colors duration-150">
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:opacity-90 transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
