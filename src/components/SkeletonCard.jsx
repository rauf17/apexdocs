export default function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-bg-secondary"></div>
        <div className="w-6 h-6 rounded bg-bg-secondary"></div>
      </div>
      <div className="h-6 w-3/4 bg-bg-secondary rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-bg-secondary rounded"></div>
    </div>
  );
}
