import { formatTime } from '../lib/dateUtils';
import { cn } from '../lib/utils';
import { CalendarDays, Search, ArrowRight, X, Loader2 } from 'lucide-react';

export default function MyBookingsView({
  searchInput,
  setSearchInput,
  onSearch,
  onKeyDown,
  loading,
  searched,
  email,
  upcoming,
  past,
  onCancel,
  onSwitchToBook,
}) {
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Search bar */}
      <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-sm border border-border">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground/40"
          />
          <button
            onClick={onSearch}
            disabled={!searchInput.trim() || loading}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5",
              searchInput.trim() && !loading
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-3.5 h-3.5" /> Search</>}
          </button>
        </div>
      </div>

      {/* Upcoming */}
      {!loading && searched && email && upcoming.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Upcoming</h3>
          <div className="space-y-2">
            {upcoming.map(a => (
              <div key={a.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-semibold text-emerald-600 leading-none uppercase">
                    {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-emerald-700 leading-none mt-0.5">
                    {new Date(a.date + 'T00:00:00').getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{formatTime(a.time)}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.client_name}</p>
                </div>
                <button
                  onClick={() => onCancel(a.id)}
                  className="text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {!loading && searched && email && past.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Past</h3>
          <div className="space-y-2">
            {past.map(a => (
              <div key={a.id} className="bg-card/60 rounded-2xl p-4 border border-border flex items-center gap-3 opacity-50">
                <div className="w-12 h-12 bg-muted rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-semibold text-muted-foreground leading-none uppercase">
                    {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-muted-foreground leading-none mt-0.5">
                    {new Date(a.date + 'T00:00:00').getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-muted-foreground text-sm line-through">{formatTime(a.time)}</p>
                    {a.status === 'cancelled' && (
                      <span className="text-[10px] font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Cancelled</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.client_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && searched && email && upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CalendarDays className="w-6 h-6 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-semibold text-foreground">No bookings found</p>
          <p className="text-xs text-muted-foreground mt-1">Book your first appointment to get started</p>
          <button onClick={onSwitchToBook} className="mt-3 text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            Book now <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Pre-search state */}
      {!searched && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-primary/30" />
          </div>
          <p className="text-sm font-semibold text-foreground">Look up your bookings</p>
          <p className="text-xs text-muted-foreground mt-1">Enter your email and press Search</p>
        </div>
      )}
    </div>
  );
}
