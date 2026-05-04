export default function SkeletonCard({ view = 'grid' }) {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #161616 25%, #1f1f1f 50%, #161616 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear'
  };

  if (view === 'list') {
    return (
      <div className="flex items-center gap-4 py-3 px-4 border-b border-[#222]">
        <div className="w-5 h-5 rounded bg-[#161616]" style={shimmerStyle}></div>
        <div className="w-10 h-10 rounded bg-[#161616]" style={shimmerStyle}></div>
        <div className="flex-1">
          <div className="h-4 w-1/3 rounded mb-2 bg-[#161616]" style={shimmerStyle}></div>
          <div className="h-3 w-1/4 rounded bg-[#161616]" style={shimmerStyle}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden flex flex-col h-[260px]">
      <div className="h-[160px] bg-[#161616]" style={shimmerStyle}></div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-3 w-16 rounded bg-[#161616]" style={shimmerStyle}></div>
        <div className="h-4 w-3/4 rounded bg-[#161616]" style={shimmerStyle}></div>
        <div className="h-3 w-1/2 rounded mt-auto bg-[#161616]" style={shimmerStyle}></div>
      </div>
    </div>
  );
}
