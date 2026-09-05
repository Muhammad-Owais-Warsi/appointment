import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MiniCalendar({ selectedDate, onSelectDate, slots, focusedMonth, onNavigateMonth }) {
  const year = focusedMonth.getFullYear();
  const month = focusedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startPad = firstDay.getDay();
  const today = new Date().toISOString().split('T')[0];
  const monthLabel = focusedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const availableCount = useMemo(() => {
    return Object.keys(slots).filter(d => {
      const [y, m] = d.split('-').map(Number);
      return y === year && m - 1 === month && slots[d].remaining > 0;
    }).length;
  }, [slots, year, month]);

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onNavigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors duration-150">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
          {availableCount > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{availableCount} days available</p>
          )}
        </div>
        <button onClick={() => onNavigateMonth(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors duration-150">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/50 uppercase py-1.5">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const slotInfo = slots[dateStr];
          const isAvailable = slotInfo && slotInfo.remaining > 0;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const isPast = dateStr < today;
          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              disabled={!isAvailable || isPast}
              className={cn(
                "relative w-full aspect-square rounded-lg flex items-center justify-center text-sm transition-all duration-100 outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isSelected && "bg-primary text-primary-foreground font-semibold shadow-sm",
                !isSelected && isAvailable && !isPast && "hover:bg-muted cursor-pointer text-foreground font-medium",
                (!isAvailable || isPast) && "text-muted-foreground/25 cursor-not-allowed",
                isToday && !isSelected && "font-semibold text-primary ring-1 ring-primary/30",
              )}
            >
              {day}
              {isAvailable && !isSelected && !isPast && (
                <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/40" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
