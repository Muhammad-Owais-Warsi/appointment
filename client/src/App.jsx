import { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarDays, Clock, Check, Loader2 } from 'lucide-react';
import { cn } from './lib/utils';
import { API } from './lib/constants';
import { getGreeting, groupTimes, formatFullDate, formatTime } from './lib/dateUtils';

import MiniCalendar from './components/MiniCalendar';
import TimeSlotSkeleton from './components/TimeSlotSkeleton';
import MyBookingsView from './components/MyBookingsView';
import CancelModal from './components/CancelModal';
import BookingConfirmationModal from './components/BookingConfirmationModal';
import Toast from './components/Toast';

export default function App() {
  const [view, setView] = useState('book');
  const [slots, setSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [email, setEmail] = useState(localStorage.getItem('appt_email') || '');
  const [name, setName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [focusedMonth, setFocusedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const cancelOpeningRef = useRef(false);
  const cancelMounted = cancelTargetId !== null || cancelVisible;

  const [bookedDetails, setBookedDetails] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const confirmOpeningRef = useRef(false);
  const confirmMounted = bookedDetails !== null || confirmVisible;

  const formRef = useRef(null);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`${API}/slots`);
      const data = await res.json();
      setSlots(data);
      const d = Object.keys(data).sort();
      if (d.length > 0 && (!selectedDate || !data[selectedDate])) {
        setSelectedDate(d[0]);
      }
    } catch {
      setToast({ message: 'Failed to load slots', type: 'error' });
    }
    setSlotsLoaded(true);
  }, [selectedDate]);

  const fetchAppointments = useCallback(async (emailToFetch) => {
    if (!emailToFetch) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/appointments?email=${encodeURIComponent(emailToFetch)}`);
      const data = await res.json();
      setAppointments(data);
      setEmail(emailToFetch);
      setSearched(true);
    } catch {
      setToast({ message: 'Failed to load appointments', type: 'error' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSlots(); }, []);

  useEffect(() => {
    if (cancelTargetId && cancelOpeningRef.current) {
      cancelOpeningRef.current = false;
      const raf = requestAnimationFrame(() => setCancelVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [cancelTargetId]);

  useEffect(() => {
    if (bookedDetails && confirmOpeningRef.current) {
      confirmOpeningRef.current = false;
      const raf = requestAnimationFrame(() => setConfirmVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [bookedDetails]);

  useEffect(() => {
    if (selectedTime && formRef.current) {
      const t = setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      return () => clearTimeout(t);
    }
  }, [selectedTime]);

  function navigateMonth(delta) {
    setFocusedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function openCancelModal(id) {
    cancelOpeningRef.current = true;
    setCancelTargetId(id);
  }

  function closeCancelModal() {
    setCancelVisible(false);
    setTimeout(() => setCancelTargetId(null), 250);
  }

  function closeBookingConfirmation() {
    setConfirmVisible(false);
    setTimeout(() => {
      setBookedDetails(null);
      fetchSlots();
    }, 400);
  }

  async function handleBook() {
    if (!selectedDate || !selectedTime || !name || !email) return;
    setBooking(true);
    try {
      const res = await fetch(`${API}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: selectedTime, name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || 'Booking failed', type: 'error' });
        await fetchSlots();
        setSelectedTime(null);
        setBooking(false);
        return;
      }
      localStorage.setItem('appt_email', email);
      confirmOpeningRef.current = true;
      setBookedDetails({ date: selectedDate, time: selectedTime, name });
      setSelectedTime(null);
      setName('');
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    }
    setBooking(false);
  }

  async function handleCancel() {
    if (!cancelTargetId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/appointments/${cancelTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setToast({ message: 'Appointment cancelled', type: 'success' });
      if (searched && email) {
        await fetchAppointments(email);
      }
      await fetchSlots();
    } catch {
      setToast({ message: 'Failed to cancel', type: 'error' });
    }
    closeCancelModal();
    setLoading(false);
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') fetchAppointments(searchInput);
  }

  const slotData = selectedDate ? slots[selectedDate] : null;
  const times = slotData?.available ?? [];
  const remaining = slotData?.remaining ?? 0;
  const groupedTimes = groupTimes(times);
  const now = new Date().toISOString().split('T')[0];
  const upcoming = (appointments ?? []).filter(a => a.date >= now && a.status === 'booked');
  const past = (appointments ?? []).filter(a => a.date < now || a.status === 'cancelled');
  const canBook = name.trim() && email.trim() && selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{getGreeting()}</h1>
          <p className="text-muted-foreground text-sm mt-2">Pick a date and time that works for you</p>
        </header>

        <div className="flex bg-muted p-1.5 rounded-xl mb-6 sm:mb-8 gap-1 max-w-xs mx-auto">
          {[
            { id: 'book', label: 'Book', icon: CalendarDays },
            { id: 'my', label: 'My Bookings', icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                view === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {view === 'book' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left column — calendar + form */}
            <div className="lg:col-span-4 space-y-4">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                slots={slots}
                focusedMonth={focusedMonth}
                onNavigateMonth={navigateMonth}
              />
              <div ref={formRef}>
                {selectedDate && selectedTime ? (
                  <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-sm border border-border">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Complete booking</h2>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground/40"
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground/40"
                      />
                    </div>
                    <button
                      onClick={handleBook}
                      disabled={!canBook || booking}
                      className={cn(
                        "mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                        canBook && !booking
                          ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-lg"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Confirm Booking</>}
                    </button>
                  </div>
                ) : selectedDate ? (
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Pick a time</p>
                    <p className="text-xs text-muted-foreground mt-1">Select a slot from the right</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right column — time slots */}
            <div className="lg:col-span-8">
              {selectedDate ? (
                <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{formatFullDate(selectedDate)}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose an available time</p>
                    </div>
                    {remaining > 0 && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{remaining} left</span>
                    )}
                  </div>
                  {!slotsLoaded ? (
                    <div className="mt-4"><TimeSlotSkeleton /></div>
                  ) : times.length > 0 ? (
                    <div className="mt-4 space-y-5">
                      {groupedTimes.map(group => (
                        <div key={group.label}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">{group.label}</p>
                            <div className="flex-1 h-px bg-border/60" />
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {group.times.map(t => {
                              const isSelected = selectedTime === t;
                              return (
                                <button
                                  key={t}
                                  onClick={() => setSelectedTime(t)}
                                  className={cn(
                                    "relative py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-100 border-2 outline-none",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-muted/50 text-foreground border-transparent hover:bg-muted hover:border-border/50"
                                  )}
                                >
                                  <span className={cn("transition-opacity duration-100", isSelected ? "opacity-0" : "opacity-100")}>
                                    {formatTime(t)}
                                  </span>
                                  <span className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-100", isSelected ? "opacity-100" : "opacity-0")}>
                                    <Check className="w-4 h-4" />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No available slots on this day</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-8 sm:p-12 shadow-sm border border-border flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center mb-4">
                    <CalendarDays className="w-7 h-7 text-primary/30" />
                  </div>
                  <p className="text-base font-semibold text-foreground">Choose a date</p>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">Select an available date from the calendar to view open time slots</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'my' && (
          <MyBookingsView
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearch={() => fetchAppointments(searchInput)}
            onKeyDown={handleSearchKeyDown}
            loading={loading}
            searched={searched}
            email={email}
            upcoming={upcoming}
            past={past}
            onCancel={openCancelModal}
            onSwitchToBook={() => setView('book')}
          />
        )}
      </div>

      <CancelModal
        visible={cancelVisible}
        mounted={cancelMounted}
        loading={loading}
        onClose={closeCancelModal}
        onConfirm={handleCancel}
      />
      <BookingConfirmationModal
        visible={confirmVisible}
        mounted={confirmMounted}
        details={bookedDetails}
        onClose={closeBookingConfirmation}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
