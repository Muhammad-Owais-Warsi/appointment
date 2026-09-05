export default function TimeSlotSkeleton() {
  return (
    <div className="space-y-5">
      {['Morning', 'Afternoon', 'Evening'].map((section, si) => (
        <div key={section}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-2.5 w-16 bg-muted rounded-full animate-pulse" style={{ animationDelay: `${si * 100}ms` }} />
            <div className="flex-1 h-px bg-muted" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" style={{ animationDelay: `${si * 100 + i * 50}ms` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
