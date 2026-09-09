export default function LibrarySkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse border border-[#ECE8E2] bg-white"
        >
          <div className="min-h-[220px] bg-[#F3F0EA] sm:min-h-[240px]" />
          <div className="space-y-3 p-5 sm:p-6">
            <div className="h-3 w-24 bg-[#F3F0EA]" />
            <div className="h-6 w-3/4 bg-[#F3F0EA]" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full bg-[#F3F0EA]" />
              <div className="h-3 w-full bg-[#F3F0EA]" />
              <div className="h-3 w-2/3 bg-[#F3F0EA]" />
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <div className="h-11 w-full bg-[#F3F0EA]" />
              <div className="h-10 w-full bg-[#F3F0EA]" />
              <div className="h-10 w-full bg-[#F3F0EA]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
