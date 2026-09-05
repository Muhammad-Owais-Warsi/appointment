export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatFullDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatTime(time) {
  const [h, m] = time.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

export function groupTimes(times) {
  const morning = times.filter(t => { const h = parseInt(t.split(':')[0]); return h >= 6 && h < 12; });
  const afternoon = times.filter(t => { const h = parseInt(t.split(':')[0]); return h >= 12 && h < 17; });
  const evening = times.filter(t => { const h = parseInt(t.split(':')[0]); return h >= 17 || h < 6; });
  return [
    { label: 'Morning', times: morning },
    { label: 'Afternoon', times: afternoon },
    { label: 'Evening', times: evening },
  ].filter(g => g.times.length > 0);
}
