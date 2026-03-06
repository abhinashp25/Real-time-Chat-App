export default function UsersLoadingSkeleton() {
  return (
    <div className="px-2 py-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="w-12 h-12 rounded-full shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded-full shimmer" style={{ width: `${50 + (i * 13) % 35}%` }} />
            <div className="h-2.5 rounded-full shimmer" style={{ width: `${35 + (i * 17) % 30}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
