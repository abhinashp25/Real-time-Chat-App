export default function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-3 py-4">
      {[false,true,false,true,false,true,false].map((mine, i) => (
        <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
          <div
            className="h-10 rounded-2xl shimmer"
            style={{ width: `${90 + (i * 37) % 130}px` }}
          />
        </div>
      ))}
    </div>
  );
}
