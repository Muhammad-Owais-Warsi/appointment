import { formatFullDate, formatTime } from '../lib/dateUtils';
import { EASE_OUT } from '../lib/constants';
import { CheckCircle2, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BookingConfirmationModal({ visible, mounted, details, onClose }) {
  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-[400ms]",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{ transitionTimingFunction: EASE_OUT }}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-card rounded-2xl p-8 w-full max-w-sm shadow-2xl transition-[opacity,transform] duration-[400ms] border border-border",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{ transitionTimingFunction: EASE_OUT }}
        onClick={e => e.stopPropagation()}
      >
        <div className={cn(
          "w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-[opacity,transform] duration-300",
          visible ? "opacity-100 scale-100 delay-[200ms]" : "opacity-0 scale-50 delay-0"
        )} style={{ transitionTimingFunction: EASE_OUT }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className={cn(
          "text-xl font-bold text-foreground text-center transition-[opacity,transform] duration-300",
          visible ? "opacity-100 translate-y-0 delay-[300ms]" : "opacity-0 translate-y-2 delay-0"
        )} style={{ transitionTimingFunction: EASE_OUT }}>
          You're booked!
        </h3>
        <p className={cn(
          "text-sm text-muted-foreground text-center mt-2 transition-[opacity,transform] duration-300",
          visible ? "opacity-100 translate-y-0 delay-[350ms]" : "opacity-0 translate-y-2 delay-0"
        )} style={{ transitionTimingFunction: EASE_OUT }}>
          Your appointment has been confirmed
        </p>

        {details && (
          <div className={cn(
            "mt-6 p-4 bg-muted/50 rounded-xl transition-[opacity,transform] duration-300",
            visible ? "opacity-100 translate-y-0 delay-[400ms]" : "opacity-0 translate-y-2 delay-0"
          )} style={{ transitionTimingFunction: EASE_OUT }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{formatFullDate(details.date)}</p>
                <p className="text-xs text-muted-foreground">{formatTime(details.time)} · {details.name}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className={cn(
            "mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-[opacity,transform] duration-300",
            "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
            visible ? "opacity-100 delay-[500ms]" : "opacity-0 delay-0"
          )}
          style={{ transitionTimingFunction: EASE_OUT }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
